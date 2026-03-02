import React, { useState, useEffect } from 'react'
import { List, RefreshCw, X } from 'lucide-react'

const TOCPanel = ({ editor, isOpen, onClose }) => {
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!editor) return

    // Initial load
    const tocItems = editor.commands.getTOC?.()
    if (tocItems) {
      setItems(tocItems)
    }

    // Listen for updates
    const handleUpdate = () => {
      const updatedItems = editor.commands.getTOC?.()
      if (updatedItems) {
        setItems(updatedItems)
      }
    }

    editor.on('update', handleUpdate)
    editor.on('selectionUpdate', handleUpdate)

    return () => {
      editor.off('update', handleUpdate)
      editor.off('selectionUpdate', handleUpdate)
    }
  }, [editor])

  const handleRefresh = () => {
    if (editor) {
      editor.commands.generateTOC()
      const updatedItems = editor.commands.getTOC?.()
      if (updatedItems) {
        setItems(updatedItems)
      }
    }
  }

  const handleHeadingClick = (pos) => {
    if (editor) {
      editor.commands.goToHeading(pos)
      editor.view.focus()
    }
  }

  const getHeadingIndent = (level) => {
    switch (level) {
      case 1:
        return 'pl-0'
      case 2:
        return 'pl-4'
      case 3:
        return 'pl-8'
      default:
        return 'pl-0'
    }
  }

  const getHeadingStyle = (level) => {
    switch (level) {
      case 1:
        return 'font-bold text-slate-100'
      case 2:
        return 'font-semibold text-slate-200'
      case 3:
        return 'font-normal text-slate-300'
      default:
        return 'text-slate-300'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-slate-800 border-l border-slate-700 shadow-xl z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <List size={20} className="text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-100">
            Table of Contents
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-700 rounded transition-colors"
          aria-label="Close table of contents"
        >
          <X size={20} className="text-slate-400 hover:text-slate-200" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-slate-400 text-sm">
              No headings found. Add headings to generate a table of contents.
            </p>
          </div>
        ) : (
          <nav className="p-4 space-y-1">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleHeadingClick(item.pos)}
                className={`
                  w-full text-left px-3 py-2 rounded transition-colors
                  hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${getHeadingIndent(item.level)} ${getHeadingStyle(item.level)}
                `}
              >
                <span className="inline-flex items-center gap-2 w-full">
                  {item.level > 1 && (
                    <ChevronRight size={16} className="text-slate-500 flex-shrink-0" />
                  )}
                  <span className="truncate">{item.text}</span>
                </span>
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Footer with Refresh */}
      <div className="border-t border-slate-700 p-4">
        <button
          onClick={handleRefresh}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <RefreshCw size={16} />
          Refresh TOC
        </button>
      </div>
    </div>
  )
}

// Import ChevronRight for the component
const ChevronRight = ({ size, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
)

export default TOCPanel
