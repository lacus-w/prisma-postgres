import { NextRequest, NextResponse } from 'next/server'
import { 
  withApiHandler, 
  createApiResponse, 
  prisma, 
  CreateEntrySchema,
  parsePagination,
  parseSearch,
  requireAuth,
  requireOwnership
} from '@/lib/api-utils'

// GET /api/v1/cheatsheets/[id]/entries - List entries for a cheatsheet
export const GET = withApiHandler(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const session = await requireAuth(request)
    const { page, limit, skip } = parsePagination(request)
    const { query, type } = parseSearch(request)

    // Check if user can access this cheatsheet
    const cheatsheetPage = await prisma.cheatsheetPage.findFirst({
      where: { 
        id: params.id,
        OR: [
          { isPublic: true },
          { authorId: session.user.id },
          // Admin can access all
          ...(session.user.isAdmin ? [{}] : [])
        ]
      }
    })

    if (!cheatsheetPage) {
      throw new Error('Resource not found or access denied')
    }

    // Build search filters
    const where: any = { pageId: params.id }

    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query] } }
      ]
    }

    if (type) {
      where.type = type
    }

    // Get total count for pagination
    const total = await prisma.cheatsheetEntry.count({ where })

    // Get paginated results
    const entries = await prisma.cheatsheetEntry.findMany({
      where,
      orderBy: { order: 'asc' },
      skip,
      take: limit,
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json(
      createApiResponse(entries, undefined, {
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        cheatsheet: {
          id: cheatsheetPage.id,
          title: cheatsheetPage.title,
          topic: cheatsheetPage.topic,
        }
      })
    )
  },
  { 
    requireAuth: true,
    rateLimit: { maxRequests: 200, windowMs: 60000 }
  }
)

// POST /api/v1/cheatsheets/[id]/entries - Create new entry
export const POST = withApiHandler(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const session = await requireAuth(request)
    const validatedData = await CreateEntrySchema.parseAsync(await request.json())

    // Check ownership of the cheatsheet page
    if (!session.user.isAdmin) {
      await requireOwnership(session.user.id, params.id, 'page')
    }

    // Verify page exists
    const page = await prisma.cheatsheetPage.findUnique({
      where: { id: params.id }
    })

    if (!page) {
      throw new Error('Cheatsheet page not found')
    }

    // Get the highest order number and increment
    const lastEntry = await prisma.cheatsheetEntry.findFirst({
      where: { pageId: params.id },
      orderBy: { order: 'desc' }
    })
    const nextOrder = (lastEntry?.order || 0) + 1

    const entry = await prisma.cheatsheetEntry.create({
      data: {
        ...validatedData,
        order: nextOrder,
        isCodeSnippet: validatedData.type === 'CODE_SNIPPET',
        pageId: params.id
      }
    })

    return NextResponse.json(
      createApiResponse(entry),
      { status: 201 }
    )
  },
  { 
    requireAuth: true,
    validateBody: CreateEntrySchema,
    rateLimit: { maxRequests: 30, windowMs: 60000 }
  }
)