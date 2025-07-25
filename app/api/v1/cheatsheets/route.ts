import { NextRequest, NextResponse } from 'next/server'
import { 
  withApiHandler, 
  createApiResponse, 
  prisma, 
  CreateCheatsheetSchema,
  parsePagination,
  parseSearch,
  requireAuth,
  requireOwnership
} from '@/lib/api-utils'

// GET /api/v1/cheatsheets - List cheatsheets with pagination and search
export const GET = withApiHandler(
  async (request: NextRequest) => {
    const session = await requireAuth(request)
    const { page, limit, skip } = parsePagination(request)
    const { query, topic, type } = parseSearch(request)

    // Build search filters
    const where: any = {}
    
    // If not admin, only show public pages or user's own pages
    if (!session.user.isAdmin) {
      where.OR = [
        { isPublic: true },
        { authorId: session.user.id }
      ]
    }

    if (query) {
      where.OR = [
        ...(where.OR || []),
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ]
    }

    if (topic) {
      where.topic = { contains: topic, mode: 'insensitive' }
    }

    // Get total count for pagination
    const total = await prisma.cheatsheetPage.count({ where })

    // Get paginated results
    const pages = await prisma.cheatsheetPage.findMany({
      where,
      include: {
        _count: {
          select: { entries: true }
        },
        author: {
          select: { 
            id: true,
            name: true, 
            email: true,
            isAdmin: true
          }
        }
      },
      orderBy: { order: 'asc' },
      skip,
      take: limit,
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json(
      createApiResponse(pages, undefined, {
        pagination: {
          page,
          limit,
          total,
          totalPages,
        }
      })
    )
  },
  { 
    requireAuth: true,
    rateLimit: { maxRequests: 100, windowMs: 60000 }
  }
)

// POST /api/v1/cheatsheets - Create new cheatsheet
export const POST = withApiHandler(
  async (request: NextRequest) => {
    const session = await requireAuth(request)
    const validatedData = await CreateCheatsheetSchema.parseAsync(await request.json())

    // Get the highest order number and increment
    const lastPage = await prisma.cheatsheetPage.findFirst({
      orderBy: { order: 'desc' }
    })
    const nextOrder = (lastPage?.order || 0) + 1

    const page = await prisma.cheatsheetPage.create({
      data: {
        ...validatedData,
        color: validatedData.color || '#6366f1',
        order: nextOrder,
        authorId: session.user.id
      },
      include: {
        _count: {
          select: { entries: true }
        },
        author: {
          select: { 
            id: true,
            name: true, 
            email: true 
          }
        }
      }
    })

    return NextResponse.json(
      createApiResponse(page),
      { status: 201 }
    )
  },
  { 
    requireAuth: true,
    validateBody: CreateCheatsheetSchema,
    rateLimit: { maxRequests: 20, windowMs: 60000 }
  }
)

// PUT /api/v1/cheatsheets - Bulk update page order
export const PUT = withApiHandler(
  async (request: NextRequest) => {
    const session = await requireAuth(request)
    const body = await request.json()

    if (!Array.isArray(body.pages)) {
      throw new Error('Validation error: pages array is required')
    }

    // Validate each page update
    for (const pageUpdate of body.pages) {
      if (!pageUpdate.id || typeof pageUpdate.order !== 'number') {
        throw new Error('Validation error: each page must have id and order')
      }
      
      // Check ownership for non-admin users
      if (!session.user.isAdmin) {
        await requireOwnership(session.user.id, pageUpdate.id, 'page')
      }
    }

    // Update the order of multiple pages (for drag and drop reordering)
    await Promise.all(
      body.pages.map((page: { id: string; order: number }) =>
        prisma.cheatsheetPage.update({
          where: { id: page.id },
          data: { order: page.order }
        })
      )
    )

    return NextResponse.json(
      createApiResponse({ updated: body.pages.length })
    )
  },
  { 
    requireAuth: true,
    rateLimit: { maxRequests: 50, windowMs: 60000 }
  }
)