import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; entryId: string } }
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

    const entry = await prisma.cheatsheetEntry.update({
      where: { id: params.entryId },
      data: {
        title,
        content,
        type,
        language: language || null,
        tags: tags || '',
        isCodeSnippet: type === 'CODE_SNIPPET'
      }
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error updating entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; entryId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.cheatsheetEntry.delete({
      where: { id: params.entryId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting entry:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}