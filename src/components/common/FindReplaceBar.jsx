import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search,
  Replace,
  X,
  ChevronUp,
  ChevronDown,
  CaseSensitive,
  WholeWord,
  Regex,
} from 'lucide-react'

const FindReplaceBar = ({ editor, isOpen, onClose, showReplaceInitially = false }) => {
  const [showReplace, setShowReplace] = useState(showReplaceInitially)
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [matchCase, setMatchCase] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const searchInputRef = useRef(null)
  const replaceInputRef = useRef(null)

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
      searchInputRef.current.select()
    }
  }, [isOpen])

  useEffect(() => {
    setShowReplace(showReplaceInitially)
  }, [showReplaceInitially])

  // Run search when term or options change
  useEffect(() => {
    if (!editor || !isOpen) return

    editor.commands.setSearchOptions({ matchCase, wholeWord, regex: useRegex })
    editor.commands.setSearchTerm(searchTerm)
  }, [editor, searchTerm, matchCase, wholeWord, useRegex, isOpen])

  // Clear on close
  useEffect(() => {
    if (!isOpen && editor) {
      editor.commands.clearSearch()
    }
  }, [isOpen, editor])

  const getStorage = useCallback(() => {
    if (!editor) return null
    const ext = editor.extensionManager.extensions.find((e) => e.name === 'searchAndReplace')
    return ext?.storage || null
  }, [editor])

  const resultCount = getStorage()?.results?.length || 0
  const currentIndex = getStorage()?.currentIndex ?? -1

  const handleFindNext = useCallback(() => {
    if (!editor) return
    editor.commands.findNext()
  }, [editor])

  const handleFindPrevious = useCallback(() => {
    if (!editor) return
    editor.commands.findPrevious()
  }, [editor])

  const handleReplace = useCallback(() => {
    if (!editor) return
    editor.commands.setReplaceTerm(replaceTerm)
    editor.commands.replaceMatch()
  }, [editor, replaceTerm])

  const handleReplaceAll = useCallback(() => {
    if (!editor) return
    editor.commands.setReplaceTerm(replaceTerm)
    editor.commands.replaceAll()
  }, [editor, replaceTerm])

  const handleClose = useCallback(() => {
    if (editor) {
      editor.commands.clearSearch()
    }
    setSearchTerm('')
    setReplaceTerm('')
    onClose()
  }, [editor, onClose])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      } else if (e.key === 'Enter' && e.target === searchInputRef.current) {
        e.preventDefault()
        if (e.shiftKey) {
          handleFindPrevious()
        } else {
          handleFindNext()
        }
      } else if (e.key === 'Enter' && e.target === replaceInputRef.current) {
        e.preventDefault()
        if (e.shiftKey) {
          handleReplaceAll()
        } else {
          handleReplace()
        }
      }
    },
    [handleClose, handleFindNext, handleFindPrevious, handleReplace, handleReplaceAll]
  )

  if (!isOpen) return null

  const OptionButton = ({ active, onClick, title, icon: Icon }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
      }`}
    >
      <Icon size={16} />
    </button>
  )

  return (
    <div
      className="absolute top-0 right-4 z-50 mt-1"
      style={{ minWidth: '480px' }}
    >
      <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-2xl">
        {/* Find Row */}
        <div className="flex items-center gap-2 p-2">
          {/* Expand/collapse replace */}
          <button
            type="button"
            onClick={() => setShowReplace(!showReplace)}
            title={showReplace ? 'Hide Replace' : 'Show Replace (Ctrl+H)'}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronDown
              size={16}
              className={`transition-transform ${showReplace ? 'rotate-180' : ''}`}
            />
          </button>

          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Find..."
              className="w-full bg-slate-700 border border-slate-600 rounded pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              autoFocus
            />
          </div>

          {/* Match count */}
          <span className="text-slate-400 text-xs min-w-[60px] text-center tabular-nums">
            {searchTerm
              ? resultCount > 0
                ? `${currentIndex + 1} of ${resultCount}`
                : 'No results'
              : ''}
          </span>

          {/* Options */}
          <OptionButton
            active={matchCase}
            onClick={() => setMatchCase(!matchCase)}
            title="Match Case"
            icon={CaseSensitive}
          />
          <OptionButton
            active={wholeWord}
            onClick={() => setWholeWord(!wholeWord)}
            title="Whole Word"
            icon={WholeWord}
          />
          <OptionButton
            active={useRegex}
            onClick={() => setUseRegex(!useRegex)}
            title="Regular Expression"
            icon={Regex}
          />

          {/* Separator */}
          <div className="w-px h-5 bg-slate-600" />

          {/* Nav */}
          <button
            type="button"
            onClick={handleFindPrevious}
            disabled={resultCount === 0}
            title="Previous Match (Shift+Enter)"
            className="p-1.5 rounded hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            onClick={handleFindNext}
            disabled={resultCount === 0}
            title="Next Match (Enter)"
            className="p-1.5 rounded hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ChevronDown size={16} />
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={handleClose}
            title="Close (Esc)"
            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Replace Row */}
        {showReplace && (
          <div className="flex items-center gap-2 px-2 pb-2">
            {/* Spacer to align with find input */}
            <div className="w-7" />

            <div className="relative flex-1">
              <Replace size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                ref={replaceInputRef}
                type="text"
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Replace with..."
                className="w-full bg-slate-700 border border-slate-600 rounded pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>

            <button
              type="button"
              onClick={handleReplace}
              disabled={resultCount === 0}
              title="Replace (Enter in replace field)"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
            >
              Replace
            </button>

            <button
              type="button"
              onClick={handleReplaceAll}
              disabled={resultCount === 0}
              title="Replace All (Shift+Enter in replace field)"
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium rounded transition-colors"
            >
              All
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default FindReplaceBar
