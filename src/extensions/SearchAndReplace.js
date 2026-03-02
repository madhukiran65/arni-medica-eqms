import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

const searchAndReplacePluginKey = new PluginKey('searchAndReplace')

/**
 * Walks through ProseMirror doc and builds a flat text string with position mapping.
 * Returns { text, posMap } where posMap[textIndex] = docPos
 */
function getTextWithPositions(doc) {
  const textParts = []
  const posMap = []

  doc.descendants((node, pos) => {
    if (node.isText) {
      for (let i = 0; i < node.text.length; i++) {
        posMap.push(pos + i)
        textParts.push(node.text[i])
      }
    } else if (node.isBlock && textParts.length > 0) {
      // Add a newline between blocks so searches don't match across blocks
      posMap.push(-1)
      textParts.push('\n')
    }
  })

  return { text: textParts.join(''), posMap }
}

function buildRegex(searchTerm, { matchCase, wholeWord, regex }) {
  if (!searchTerm) return null

  let flags = 'g'
  if (!matchCase) flags += 'i'

  try {
    if (regex) {
      return new RegExp(searchTerm, flags)
    }

    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = wholeWord ? `\\b${escaped}\\b` : escaped
    return new RegExp(pattern, flags)
  } catch {
    return null
  }
}

function findMatchesInDoc(doc, searchTerm, options) {
  if (!searchTerm) return []

  const pattern = buildRegex(searchTerm, options)
  if (!pattern) return []

  const { text, posMap } = getTextWithPositions(doc)
  const results = []

  let match
  while ((match = pattern.exec(text)) !== null) {
    const startIdx = match.index
    const endIdx = match.index + match[0].length

    // Map text indices to doc positions
    const from = posMap[startIdx]
    const to = posMap[endIdx - 1] + 1

    if (from >= 0 && to > from) {
      results.push({ from, to, text: match[0] })
    }

    // Prevent infinite loops with zero-length matches
    if (match[0].length === 0) pattern.lastIndex++
  }

  return results
}

function createDecorations(doc, results, currentIndex) {
  if (!results.length) return DecorationSet.empty

  const decorations = results.map((result, index) => {
    const isActive = index === currentIndex
    return Decoration.inline(result.from, result.to, {
      class: isActive ? 'search-current' : 'search-match',
      style: isActive
        ? 'background-color: #fef08a; color: #000; border-radius: 2px;'
        : 'background-color: #fed7aa; color: #000; border-radius: 2px;',
    })
  })

  return DecorationSet.create(doc, decorations)
}

export { searchAndReplacePluginKey }

export const SearchAndReplace = Extension.create({
  name: 'searchAndReplace',

  addStorage() {
    return {
      searchTerm: '',
      replaceTerm: '',
      results: [],
      currentIndex: -1,
      matchCase: false,
      wholeWord: false,
      regex: false,
      // Callbacks for the React component
      onOpenFind: null,
      onOpenReplace: null,
    }
  },

  addProseMirrorPlugins() {
    const extension = this

    return [
      new Plugin({
        key: searchAndReplacePluginKey,

        state: {
          init: () => DecorationSet.empty,
          apply: (tr, oldDecorations) => {
            const meta = tr.getMeta(searchAndReplacePluginKey)
            if (meta?.decorations !== undefined) {
              return meta.decorations
            }
            // Map decorations through document changes
            if (tr.docChanged) {
              return oldDecorations.map(tr.mapping, tr.doc)
            }
            return oldDecorations
          },
        },

        props: {
          decorations(state) {
            return searchAndReplacePluginKey.getState(state) || DecorationSet.empty
          },
        },
      }),
    ]
  },

  addCommands() {
    return {
      setSearchTerm:
        (searchTerm) =>
        ({ editor, tr, dispatch }) => {
          this.storage.searchTerm = searchTerm

          if (!searchTerm) {
            this.storage.results = []
            this.storage.currentIndex = -1
            if (dispatch) {
              tr.setMeta(searchAndReplacePluginKey, { decorations: DecorationSet.empty })
              dispatch(tr)
            }
            return true
          }

          const results = findMatchesInDoc(editor.state.doc, searchTerm, {
            matchCase: this.storage.matchCase,
            wholeWord: this.storage.wholeWord,
            regex: this.storage.regex,
          })

          this.storage.results = results
          this.storage.currentIndex = results.length > 0 ? 0 : -1

          if (dispatch) {
            const decorations = createDecorations(editor.state.doc, results, this.storage.currentIndex)
            tr.setMeta(searchAndReplacePluginKey, { decorations })
            dispatch(tr)
          }

          return true
        },

      setReplaceTerm:
        (replaceTerm) =>
        () => {
          this.storage.replaceTerm = replaceTerm
          return true
        },

      setSearchOptions:
        (options) =>
        ({ editor, tr, dispatch }) => {
          if (options.matchCase !== undefined) this.storage.matchCase = options.matchCase
          if (options.wholeWord !== undefined) this.storage.wholeWord = options.wholeWord
          if (options.regex !== undefined) this.storage.regex = options.regex

          // Re-run search with new options
          if (this.storage.searchTerm) {
            const results = findMatchesInDoc(editor.state.doc, this.storage.searchTerm, {
              matchCase: this.storage.matchCase,
              wholeWord: this.storage.wholeWord,
              regex: this.storage.regex,
            })

            this.storage.results = results
            this.storage.currentIndex = results.length > 0 ? 0 : -1

            if (dispatch) {
              const decorations = createDecorations(editor.state.doc, results, this.storage.currentIndex)
              tr.setMeta(searchAndReplacePluginKey, { decorations })
              dispatch(tr)
            }
          }

          return true
        },

      findNext:
        () =>
        ({ editor, tr, dispatch }) => {
          const { results } = this.storage
          if (results.length === 0) return false

          this.storage.currentIndex = (this.storage.currentIndex + 1) % results.length
          const result = results[this.storage.currentIndex]

          if (dispatch) {
            const decorations = createDecorations(editor.state.doc, results, this.storage.currentIndex)
            tr.setMeta(searchAndReplacePluginKey, { decorations })
            dispatch(tr)
          }

          // Scroll the match into view
          if (result) {
            editor.commands.setTextSelection(result.from)
            const dom = editor.view.domAtPos(result.from)
            if (dom?.node) {
              const element = dom.node.nodeType === 3 ? dom.node.parentElement : dom.node
              element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }

          return true
        },

      findPrevious:
        () =>
        ({ editor, tr, dispatch }) => {
          const { results } = this.storage
          if (results.length === 0) return false

          this.storage.currentIndex =
            this.storage.currentIndex <= 0 ? results.length - 1 : this.storage.currentIndex - 1
          const result = results[this.storage.currentIndex]

          if (dispatch) {
            const decorations = createDecorations(editor.state.doc, results, this.storage.currentIndex)
            tr.setMeta(searchAndReplacePluginKey, { decorations })
            dispatch(tr)
          }

          if (result) {
            editor.commands.setTextSelection(result.from)
            const dom = editor.view.domAtPos(result.from)
            if (dom?.node) {
              const element = dom.node.nodeType === 3 ? dom.node.parentElement : dom.node
              element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }

          return true
        },

      replaceMatch:
        () =>
        ({ editor, tr, dispatch }) => {
          const { results, currentIndex, replaceTerm } = this.storage
          if (results.length === 0 || currentIndex === -1) return false

          const result = results[currentIndex]
          if (!result) return false

          if (dispatch) {
            tr.insertText(replaceTerm, result.from, result.to)
            dispatch(tr)
          }

          // Re-run search after replacement
          setTimeout(() => {
            editor.commands.setSearchTerm(this.storage.searchTerm)
          }, 10)

          return true
        },

      replaceAll:
        () =>
        ({ editor, tr, dispatch }) => {
          const { results, replaceTerm } = this.storage
          if (results.length === 0) return false

          // Replace from end to start to preserve positions
          const sortedResults = [...results].sort((a, b) => b.from - a.from)

          if (dispatch) {
            sortedResults.forEach((result) => {
              tr.insertText(replaceTerm, result.from, result.to)
            })
            dispatch(tr)
          }

          // Clear search state
          this.storage.results = []
          this.storage.currentIndex = -1

          // Re-run search to confirm all replaced
          setTimeout(() => {
            editor.commands.setSearchTerm(this.storage.searchTerm)
          }, 10)

          return true
        },

      clearSearch:
        () =>
        ({ tr, dispatch }) => {
          this.storage.searchTerm = ''
          this.storage.replaceTerm = ''
          this.storage.results = []
          this.storage.currentIndex = -1

          if (dispatch) {
            tr.setMeta(searchAndReplacePluginKey, { decorations: DecorationSet.empty })
            dispatch(tr)
          }

          return true
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-f': () => {
        if (this.storage.onOpenFind) {
          this.storage.onOpenFind()
        }
        return true
      },
      'Mod-h': () => {
        if (this.storage.onOpenReplace) {
          this.storage.onOpenReplace()
        }
        return true
      },
    }
  },
})
