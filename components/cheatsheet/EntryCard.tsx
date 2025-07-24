'use client'

import { useState } from 'react'
import { CheatsheetEntry } from '@prisma/client'

interface EntryCardProps {
  entry: CheatsheetEntry
  isPreviewMode: boolean
  codeWrap: boolean
  onEntryUpdated: () => void
  onEntryDeleted: () => void
}

export function EntryCard({ 
  entry, 
  isPreviewMode, 
  codeWrap, 
  onEntryUpdated, 
  onEntryDeleted 
}: EntryCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: entry.title,
    content: entry.content,
    type: entry.type,
    language: entry.language || '',
    tags: entry.tags
  })

  const getTypeIcon = (type: string) => {
    const icons = {
      'TERMINOLOGY': '📖',
      'FORMULA': '🧮',
      'CODE_SNIPPET': '💻',
      'NOTE': '📝',
      'REFERENCE': '🔗'
    }
    return icons[type as keyof typeof icons] || '📄'
  }

  const getTypeColor = (type: string) => {
    const colors = {
      'TERMINOLOGY': 'bg-blue-100 text-blue-700',
      'FORMULA': 'bg-green-100 text-green-700',
      'CODE_SNIPPET': 'bg-purple-100 text-purple-700',
      'NOTE': 'bg-yellow-100 text-yellow-700',
      'REFERENCE': 'bg-gray-100 text-gray-700'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/cheatsheets/${entry.pageId}/entries/${entry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      })

      if (response.ok) {
        setIsEditing(false)
        onEntryUpdated()
      }
    } catch (error) {
      console.error('Error updating entry:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const response = await fetch(`/api/cheatsheets/${entry.pageId}/entries/${entry.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onEntryDeleted()
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const renderContent = () => {
    if (entry.isCodeSnippet) {
      return (
        <div className="relative">
          <pre className={`code-block ${codeWrap ? 'wrap' : ''}`}>
            <code>{entry.content}</code>
          </pre>
          {!isPreviewMode && (
            <button
              onClick={() => copyToClipboard(entry.content)}
              className="absolute top-2 right-2 p-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              title="Copy code"
            >
              📋
            </button>
          )}
        </div>
      )
    }

    return (
      <div className="prose prose-sm max-w-none">
        <p className="whitespace-pre-wrap">{entry.content}</p>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="watercolor-card p-6">
        <div className="space-y-4">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Entry title"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <select
              value={editData.type}
              onChange={(e) => setEditData({ ...editData, type: e.target.value as any })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="TERMINOLOGY">Terminology</option>
              <option value="FORMULA">Formula</option>
              <option value="CODE_SNIPPET">Code Snippet</option>
              <option value="NOTE">Note</option>
              <option value="REFERENCE">Reference</option>
            </select>
            
            {editData.type === 'CODE_SNIPPET' && (
              <input
                type="text"
                value={editData.language}
                onChange={(e) => setEditData({ ...editData, language: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Language (e.g., javascript)"
              />
            )}
          </div>
          
          <textarea
            value={editData.content}
            onChange={(e) => setEditData({ ...editData, content: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={6}
            placeholder="Entry content"
          />
          
          <input
            type="text"
            value={editData.tags}
            onChange={(e) => setEditData({ ...editData, tags: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Tags (comma-separated)"
          />
          
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="watercolor-card p-6 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getTypeIcon(entry.type)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {entry.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(entry.type)}`}>
                {entry.type.replace('_', ' ')}
              </span>
              {entry.language && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {entry.language}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {!isPreviewMode && (
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Edit entry"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete entry"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        {renderContent()}
      </div>
      
      {entry.tags && (
        <div className="flex flex-wrap gap-1">
          {entry.tags.split(',').filter(tag => tag.trim()).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-purple-50 text-purple-600 rounded-full"
            >
              #{tag.trim()}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}