import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const entries = await prisma.cheatsheetEntry.findMany({
      where: { pageId: params.id },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(entries)
  } catch (error) {
    console.error('Error fetching entries:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, type, language, tags } = body

    if (!title || !content || !type) {
      return NextResponse.json({ error: 'Title, content, and type are required' }, { status: 400 })
    }

    // Get the highest order number and increment
    const lastEntry = await prisma.cheatsheetEntry.findFirst({
      where: { pageId: params.id },
      orderBy: { order: 'desc' }
    })
    const nextOrder = (lastEntry?.order || 0) + 1

    const entry = await prisma.cheatsheetEntry.create({
      data: {
        title,
        content,
        type,
        language: language || null,
        tags: Array.isArray(tags) ? tags : [],
        order: nextOrder,
        isCodeSnippet: type === 'CODE_SNIPPET',
        pageId: params.id
      }
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Error creating entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}