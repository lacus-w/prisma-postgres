import { Suspense } from 'react'
import { CheatsheetGrid } from '@/components/cheatsheet/CheatsheetGrid'
import { CreateCheatsheetButton } from '@/components/cheatsheet/CreateCheatsheetButton'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { redirect } from 'next/navigation'

export default async function CheatsheetsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      {/* Header */}
      <header className="glass sticky top-0 z-50 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-acid-1 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">📚</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                CheatSheet Hub
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {session.user?.name || session.user?.email}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Your Personal Knowledge Hub
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Organize your learning materials, formulas, code snippets, and terminology 
            in beautiful, searchable cheatsheets with watercolor aesthetics.
          </p>
          
          <div className="flex justify-center space-x-4">
            <CreateCheatsheetButton />
            <button className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/30 transition-all duration-200 flex items-center space-x-2">
              <span>🔍</span>
              <span>Search All</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="watercolor-card p-6 text-center">
            <div className="w-12 h-12 bg-acid-1 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">📄</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Pages</h3>
            <p className="text-2xl font-bold text-purple-600">5</p>
          </div>
          
          <div className="watercolor-card p-6 text-center">
            <div className="w-12 h-12 bg-acid-2 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">📝</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Entries</h3>
            <p className="text-2xl font-bold text-blue-600">24</p>
          </div>
          
          <div className="watercolor-card p-6 text-center">
            <div className="w-12 h-12 bg-acid-3 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">🏷️</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Topics</h3>
            <p className="text-2xl font-bold text-orange-600">4</p>
          </div>
          
          <div className="watercolor-card p-6 text-center">
            <div className="w-12 h-12 bg-acid-4 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">⭐</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Favorites</h3>
            <p className="text-2xl font-bold text-green-600">3</p>
          </div>
        </div>

        {/* Cheatsheet Grid */}
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="watercolor-card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        }>
          <CheatsheetGrid />
        </Suspense>
      </main>
    </div>
  )
}