import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pages = await prisma.cheatsheetPage.findMany({
      include: {
        _count: {
          select: { entries: true }
        },
        author: {
          select: { name: true, email: true }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error('Error fetching cheatsheets:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, topic, color } = body

    if (!title || !topic) {
      return NextResponse.json({ error: 'Title and topic are required' }, { status: 400 })
    }

    // Get the highest order number and increment
    const lastPage = await prisma.cheatsheetPage.findFirst({
      orderBy: { order: 'desc' }
    })
    const nextOrder = (lastPage?.order || 0) + 1

    const page = await prisma.cheatsheetPage.create({
      data: {
        title,
        description,
        topic,
        color: color || '#6366f1',
        order: nextOrder,
        authorId: session.user.id
      },
      include: {
        _count: {
          select: { entries: true }
        },
        author: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    console.error('Error creating cheatsheet:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { pages } = body

    if (!Array.isArray(pages)) {
      return NextResponse.json({ error: 'Pages array is required' }, { status: 400 })
    }

    // Update the order of multiple pages (for drag and drop reordering)
    await Promise.all(
      pages.map((page: { id: string; order: number }) =>
        prisma.cheatsheetPage.update({
          where: { id: page.id },
          data: { order: page.order }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating page order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}