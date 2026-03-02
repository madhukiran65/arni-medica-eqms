import { Extension } from '@tiptap/core'
import { TextSelection } from '@tiptap/pm/state'

export const TableOfContents = Extension.create({
  name: 'tableOfContents',

  addStorage() {
    return {
      items: [],
    }
  },

  addCommands() {
    return {
      generateTOC:
        () =>
        ({ editor }) => {
          const items = []
          const headingLevels = [1, 2, 3]
          let headingCounts = { 1: 0, 2: 0, 3: 0 }

          editor.state.doc.forEach((node, pos) => {
            if (
              node.type.name === 'heading' &&
              headingLevels.includes(node.attrs.level)
            ) {
              const text = node.textContent
              const level = node.attrs.level

              // Generate unique ID based on text and index
              const sanitizedText = text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')

              headingCounts[level]++
              const id = `heading-${level}-${sanitizedText}-${headingCounts[level]}`

              items.push({
                id,
                level,
                text: text || `Heading ${level}`,
                pos,
              })
            }
          })

          this.storage.items = items
          return true
        },

      getTOC:
        () =>
        ({ editor }) => {
          return this.storage.items
        },

      goToHeading:
        (pos) =>
        ({ editor }) => {
          const tr = editor.state.tr
          const selection = TextSelection.create(editor.state.doc, pos)
          tr.setSelection(selection)
          editor.view.dispatch(tr)

          // Scroll the selection into view
          setTimeout(() => {
            editor.view.dispatch(tr)
            const element = editor.view.domAtPos(pos)
            element.node?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 0)

          return true
        },
    }
  },

  addKeyboardShortcuts() {
    return {}
  },

  onUpdate() {
    // Auto-generate TOC on every document change
    this.editor.commands.generateTOC()
  },
})
