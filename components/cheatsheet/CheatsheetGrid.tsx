'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheatsheetPage } from '@prisma/client'

interface CheatsheetPageWithCount extends CheatsheetPage {
  _count: {
    entries: number
  }
}

export function CheatsheetGrid() {
  const [pages, setPages] = useState<CheatsheetPageWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const response = await fetch('/api/cheatsheets')
      const data = await response.json()
      setPages(data)
    } catch (error) {
      console.error('Error fetching pages:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getGradientClass = (index: number) => {
    const gradients = ['bg-acid-1', 'bg-acid-2', 'bg-acid-3', 'bg-acid-4']
    return gradients[index % gradients.length]
  }

  const getTopicIcon = (topic: string) => {
    const icons: { [key: string]: string } = {
      'Programming': '💻',
      'Mathematics': '🔢',
      'Web Development': '🌐',
      'Database': '🗄️',
      'Science': '🔬',
      'Language': '🗣️',
      'Design': '🎨',
      'Business': '💼'
    }
    return icons[topic] || '📚'
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="watercolor-card p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search cheatsheets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 pl-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-gray-700 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          🔍
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPages.map((page, index) => (
          <Link
            key={page.id}
            href={`/cheatsheets/${page.id}`}
            className="block transform transition-all duration-200 hover:scale-105"
          >
            <div className="watercolor-card p-6 h-full">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${getGradientClass(index)} rounded-xl flex items-center justify-center text-white text-xl`}>
                  {getTopicIcon(page.topic)}
                </div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {page._count.entries} entries
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {page.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                {page.description || 'No description available'}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  {page.topic}
                </span>
                <span>
                  {new Date(page.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredPages.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {searchTerm ? 'No matching cheatsheets found' : 'No cheatsheets yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Create your first cheatsheet to get started!'
            }
          </p>
        </div>
      )}
    </div>
  )
}