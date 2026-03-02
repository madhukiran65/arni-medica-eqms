import React, { useState } from 'react'
import { Plus, Trash2, X, BookOpen } from 'lucide-react'

/**
 * FootnotesPanel - Displays and manages footnotes in the document
 * Shows all footnotes with editable text and delete functionality
 */
const FootnotesPanel = ({ editor, isOpen, onClose }) => {
  const [footnotes, setFootnotes] = useState([])
  const [newFootnoteText, setNewFootnoteText] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  // Sync footnotes from storage whenever panel opens
  React.useEffect(() => {
    if (isOpen && editor) {
      const stored = editor.commands.getFootnotes()
      setFootnotes(stored || [])
    }
  }, [isOpen, editor])

  if (!isOpen) {
    return null
  }

  const handleAddFootnote = () => {
    if (!newFootnoteText.trim()) {
      return
    }

    editor.chain().focus().insertFootnote(newFootnoteText).run()
    setNewFootnoteText('')
    setShowAddForm(false)

    // Refresh footnotes list
    const updated = editor.commands.getFootnotes()
    setFootnotes(updated || [])
  }

  const handleDeleteFootnote = (id) => {
    editor.commands.removeFootnote(id)

    // Refresh footnotes list
    const updated = editor.commands.getFootnotes()
    setFootnotes(updated || [])
  }

  const handleUpdateFootnote = (id, text) => {
    editor.commands.updateFootnote(id, text)

    // Update local state
    setFootnotes(
      footnotes.map(fn => (fn.id === id ? { ...fn, text } : fn))
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-slate-800 w-full md:w-96 h-96 md:h-auto md:max-h-96 flex flex-col rounded-t-lg md:rounded-lg shadow-2xl overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-200">Footnotes</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-200"
            title="Close footnotes panel"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {footnotes.length === 0 && !showAddForm && (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">No footnotes yet</p>
            </div>
          )}

          {/* Footnotes List */}
          <div className="space-y-3">
            {footnotes.map(footnote => (
              <div
                key={footnote.id}
                className="bg-slate-700 p-3 rounded border border-slate-600 hover:border-slate-500 transition-colors"
              >
                {/* Footnote Header */}
                <div className="flex items-start justify-between mb-2">
                  <span className="text-slate-200 font-bold text-sm">
                    [{footnote.number}]
                  </span>
                  <button
                    onClick={() => handleDeleteFootnote(footnote.id)}
                    className="p-1 hover:bg-slate-600 rounded transition-colors text-slate-400 hover:text-red-400"
                    title="Delete footnote"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Footnote Text */}
                <textarea
                  value={footnote.text}
                  onChange={e => handleUpdateFootnote(footnote.id, e.target.value)}
                  placeholder="Footnote text..."
                  className="w-full bg-slate-600 text-slate-100 placeholder-slate-500 rounded px-2 py-1 text-xs border border-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
                  rows="2"
                />
              </div>
            ))}
          </div>

          {/* Add Footnote Form */}
          {showAddForm && (
            <div className="bg-slate-700 p-3 rounded border border-slate-600 mt-3">
              <label className="block text-slate-300 text-xs font-semibold mb-2">
                New Footnote
              </label>
              <textarea
                value={newFootnoteText}
                onChange={e => setNewFootnoteText(e.target.value)}
                placeholder="Enter footnote text..."
                className="w-full bg-slate-600 text-slate-100 placeholder-slate-500 rounded px-2 py-1 text-xs border border-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none mb-2"
                rows="3"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddFootnote}
                  disabled={!newFootnoteText.trim()}
                  className="flex-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:text-slate-500 text-slate-200 text-xs font-medium rounded transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNewFootnoteText('')
                  }}
                  className="flex-1 px-3 py-1 bg-slate-600 hover:bg-slate-500 text-slate-200 text-xs font-medium rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Add Button */}
        {!showAddForm && (
          <div className="p-4 border-t border-slate-700 bg-slate-900">
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-slate-100 font-medium rounded transition-colors"
            >
              <Plus size={18} />
              Add Footnote
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default FootnotesPanel
