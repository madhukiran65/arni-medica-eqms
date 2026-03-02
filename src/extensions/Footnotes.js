import { Node, Extension } from '@tiptap/core'

/**
 * FootnoteRef - Inline node for footnote references
 * Renders as a superscript number linked to a footnote in storage
 */
export const FootnoteRef = Node.create({
  name: 'footnoteRef',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-footnote-id'),
        renderHTML: attributes => ({
          'data-footnote-id': attributes.id,
        }),
      },
      number: {
        default: 1,
        parseHTML: element => parseInt(element.getAttribute('data-footnote-number')) || 1,
        renderHTML: attributes => ({
          'data-footnote-number': attributes.number,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'sup.footnote-ref',
      },
    ]
  },

  renderHTML({ node }) {
    return [
      'sup',
      {
        class: 'footnote-ref cursor-pointer text-blue-500 hover:text-blue-400',
        'data-footnote-id': node.attrs.id,
        'data-footnote-number': node.attrs.number,
        title: `Footnote ${node.attrs.number}`,
      },
      node.attrs.number,
    ]
  },

  addCommands() {
    return {
      insertFootnote:
        (text = '') =>
        ({ commands, editor }) => {
          const footnoteExtension = editor.extensionManager.extensions.find(
            ext => ext.name === 'footnoteList'
          )

          if (!footnoteExtension) {
            console.error('FootnoteList extension not found')
            return false
          }

          // Add footnote to storage and get id + number
          const { id, number } = footnoteExtension.storage.addFootnote(text)

          // Insert footnoteRef node at current position
          return commands.insertContent({
            type: this.name,
            attrs: {
              id,
              number,
            },
          })
        },
    }
  },
})

/**
 * FootnoteList - Extension to manage footnote storage
 * Stores footnotes and provides commands to manage them
 */
export const FootnoteList = Extension.create({
  name: 'footnoteList',

  addStorage() {
    return {
      footnotes: [],

      // Generate unique footnote ID
      generateId() {
        return 'fn-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
      },

      // Add new footnote to storage
      addFootnote(text = '') {
        const id = this.generateId()
        const number = this.footnotes.length + 1

        this.footnotes.push({
          id,
          number,
          text,
        })

        return { id, number }
      },

      // Remove footnote and renumber remaining
      removeFootnote(id) {
        const index = this.footnotes.findIndex(fn => fn.id === id)
        if (index > -1) {
          this.footnotes.splice(index, 1)

          // Renumber remaining footnotes
          this.footnotes.forEach((fn, idx) => {
            fn.number = idx + 1
          })

          return true
        }
        return false
      },

      // Update footnote text
      updateFootnote(id, text) {
        const footnote = this.footnotes.find(fn => fn.id === id)
        if (footnote) {
          footnote.text = text
          return true
        }
        return false
      },

      // Get all footnotes
      getFootnotes() {
        return [...this.footnotes]
      },

      // Renumber footnotes based on document order
      renumberFootnotes(doc) {
        if (!doc) return

        const footnoteIds = []

        // Walk document to find all footnoteRef nodes in order
        doc.descendants(node => {
          if (node.type.name === 'footnoteRef' && node.attrs.id) {
            footnoteIds.push(node.attrs.id)
          }
        })

        // Create new numbered array based on document order
        const newFootnotes = []
        footnoteIds.forEach((id, idx) => {
          const footnote = this.footnotes.find(fn => fn.id === id)
          if (footnote) {
            newFootnotes.push({
              ...footnote,
              number: idx + 1,
            })
          }
        })

        this.footnotes = newFootnotes
      },
    }
  },

  addCommands() {
    return {
      addFootnote:
        (text = '') =>
        ({ editor }) => {
          const { id, number } = editor.extensionManager.extensions
            .find(ext => ext.name === 'footnoteList')
            .storage.addFootnote(text)

          return editor
            .chain()
            .insertContent({
              type: 'footnoteRef',
              attrs: {
                id,
                number,
              },
            })
            .run()
        },

      removeFootnote:
        (id) =>
        ({ editor }) => {
          const removed = editor.extensionManager.extensions
            .find(ext => ext.name === 'footnoteList')
            .storage.removeFootnote(id)

          if (removed) {
            // Remove footnoteRef nodes with this id from document
            editor
              .chain()
              .command(({ tr }) => {
                editor.state.doc.descendants((node, pos) => {
                  if (node.type.name === 'footnoteRef' && node.attrs.id === id) {
                    tr.delete(pos, pos + node.nodeSize)
                  }
                })
                return true
              })
              .run()
          }

          return removed
        },

      updateFootnote:
        (id, text) =>
        ({ editor }) => {
          return editor.extensionManager.extensions
            .find(ext => ext.name === 'footnoteList')
            .storage.updateFootnote(id, text)
        },

      getFootnotes:
        () =>
        ({ editor }) => {
          return editor.extensionManager.extensions
            .find(ext => ext.name === 'footnoteList')
            .storage.getFootnotes()
        },

      renumberFootnotes:
        () =>
        ({ editor }) => {
          editor.extensionManager.extensions
            .find(ext => ext.name === 'footnoteList')
            .storage.renumberFootnotes(editor.state.doc)

          // Trigger update of all footnoteRef nodes in document
          editor
            .chain()
            .command(({ tr }) => {
              const footnotes = editor.storage.footnoteList.footnotes
              editor.state.doc.descendants((node, pos) => {
                if (node.type.name === 'footnoteRef' && node.attrs.id) {
                  const footnote = footnotes.find(fn => fn.id === node.attrs.id)
                  if (footnote && footnote.number !== node.attrs.number) {
                    tr.setNodeMarkup(pos, null, {
                      ...node.attrs,
                      number: footnote.number,
                    })
                  }
                }
              })
              return true
            })
            .run()

          return true
        },
    }
  },
})
