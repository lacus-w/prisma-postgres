import { Suspense } from 'react'
import { CheatsheetView } from '@/components/cheatsheet/CheatsheetView'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'

const prisma = new PrismaClient()

interface PageProps {
  params: { id: string }
}

export default async function CheatsheetPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  const page = await prisma.cheatsheetPage.findUnique({
    where: { id: params.id },
    include: {
      entries: {
        orderBy: { order: 'asc' }
      },
      author: {
        select: { name: true, email: true }
      }
    }
  })

  if (!page) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="spinner"></div>
        </div>
      }>
        <CheatsheetView page={page} session={session} />
      </Suspense>
    </div>
  )
}