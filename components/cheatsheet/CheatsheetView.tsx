'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheatsheetPage, CheatsheetEntry, User } from '@prisma/client'
import { EntryCard } from './EntryCard'
import { AddEntryButton } from './AddEntryButton'
import { FontSizeControls } from './FontSizeControls'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface CheatsheetViewProps {
  page: CheatsheetPage & {
    entries: CheatsheetEntry[]
    author: Pick<User, 'name' | 'email'>
  }
  session: any
}

export function CheatsheetView({ page, session }: CheatsheetViewProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [fontSize, setFontSize] = useState('font-size-base')
  const [codeWrap, setCodeWrap] = useState(false)
  const [entries, setEntries] = useState(page.entries)

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

  const handlePrint = () => {
    window.print()
  }

  const refreshEntries = async () => {
    try {
      const response = await fetch(`/api/cheatsheets/${page.id}/entries`)
      const data = await response.json()
      setEntries(data)
    } catch (error) {
      console.error('Error refreshing entries:', error)
    }
  }

  return (
    <div className={`${fontSize} ${isPreviewMode ? 'print-compact' : ''}`}>
      {/* Header */}
      <header className={`glass sticky top-0 z-50 backdrop-blur-xl border-b border-white/20 ${isPreviewMode ? 'no-print' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/cheatsheets" className="text-gray-600 hover:text-gray-900 transition-colors">
                ← Back
              </Link>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl"
                style={{ background: page.color }}
              >
                {getTopicIcon(page.topic)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {page.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {page.topic} • {entries.length} entries
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <FontSizeControls fontSize={fontSize} setFontSize={setFontSize} />
              
              <button
                onClick={() => setCodeWrap(!codeWrap)}
                className={`p-2 rounded-lg border transition-all duration-200 ${
                  codeWrap 
                    ? 'bg-purple-100 border-purple-300 text-purple-700' 
                    : 'bg-white/20 border-white/30 text-gray-600'
                }`}
                title="Toggle code wrap"
              >
                📄
              </button>
              
              <button
                onClick={handlePrint}
                className="p-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-200"
                title="Print"
              >
                🖨️
              </button>
              
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`px-3 py-2 rounded-lg border transition-all duration-200 ${
                  isPreviewMode 
                    ? 'bg-green-100 border-green-300 text-green-700' 
                    : 'bg-white/20 border-white/30 text-gray-600'
                }`}
              >
                {isPreviewMode ? '📖 Preview' : '✏️ Edit'}
              </button>
              
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {page.title}
              </h2>
              {page.description && (
                <p className="text-gray-600 dark:text-gray-300">
                  {page.description}
                </p>
              )}
            </div>
            
            {!isPreviewMode && (
              <AddEntryButton pageId={page.id} onEntryAdded={refreshEntries} />
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Created by {page.author.name || page.author.email}</span>
            <span>•</span>
            <span>Last updated {new Date(page.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Entries Grid */}
        <div className="space-y-6">
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No entries yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Start building your cheatsheet by adding your first entry!
              </p>
              {!isPreviewMode && (
                <AddEntryButton pageId={page.id} onEntryAdded={refreshEntries} />
              )}
            </div>
          ) : (
            entries.map((entry, index) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                isPreviewMode={isPreviewMode}
                codeWrap={codeWrap}
                onEntryUpdated={refreshEntries}
                onEntryDeleted={refreshEntries}
              />
            ))
          )}
        </div>
      </main>
    </div>
  )
}