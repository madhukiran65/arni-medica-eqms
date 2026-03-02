import React, { useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import sanitizeHtml from 'sanitize-html'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Table as TableIcon,
  Highlighter,
  Undo2,
  Redo2,
  Trash2,
} from 'lucide-react'
import '../../styles/tiptap.css'

const RichTextEditor = React.forwardRef(({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  minHeight = '150px',
  disabled = false,
  error = false,
}, ref) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (onChange) {
        const html = editor.getHTML()
        const sanitized = sanitizeHtml(html, {
          allowedTags: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'mark'],
          allowedAttributes: {
            a: ['href', 'target'],
            mark: ['data-color'],
            table: [],
            thead: [],
            tbody: [],
            tr: [],
            th: ['colspan', 'rowspan'],
            td: ['colspan', 'rowspan'],
          },
        })
        onChange(sanitized)
      }
    },
    editable: !disabled,
  })

  React.useImperativeHandle(ref, () => ({
    getEditor: () => editor,
    getHTML: () => editor?.getHTML() || '',
    setHTML: (html) => editor?.commands.setContent(html),
    focus: () => editor?.view.focus(),
  }))

  if (!editor) {
    return <div className="animate-pulse bg-slate-700 rounded-lg" style={{ minHeight }} />
  }

  const handleToggleBold = useCallback(() => editor.chain().focus().toggleBold().run(), [editor])
  const handleToggleItalic = useCallback(() => editor.chain().focus().toggleItalic().run(), [editor])
  const handleToggleUnderline = useCallback(() => editor.chain().focus().toggleUnderline().run(), [editor])
  const handleToggleStrike = useCallback(() => editor.chain().focus().toggleStrike().run(), [editor])
  const handleSetH1 = useCallback(() => editor.chain().focus().toggleHeading({ level: 1 }).run(), [editor])
  const handleSetH2 = useCallback(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), [editor])
  const handleSetH3 = useCallback(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), [editor])
  const handleToggleBullet = useCallback(() => editor.chain().focus().toggleBulletList().run(), [editor])
  const handleToggleOrdered = useCallback(() => editor.chain().focus().toggleOrderedList().run(), [editor])
  const handleAlignLeft = useCallback(() => editor.chain().focus().setTextAlign('left').run(), [editor])
  const handleAlignCenter = useCallback(() => editor.chain().focus().setTextAlign('center').run(), [editor])
  const handleAlignRight = useCallback(() => editor.chain().focus().setTextAlign('right').run(), [editor])
  const handleAddLink = useCallback(() => {
    const url = window.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }, [editor])
  const handleInsertTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])
  const handleDeleteTable = useCallback(() => {
    editor.chain().focus().deleteTable().run()
  }, [editor])
  const handleToggleHighlight = useCallback(() => {
    editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()
  }, [editor])
  const handleUndo = useCallback(() => editor.chain().focus().undo().run(), [editor])
  const handleRedo = useCallback(() => editor.chain().focus().redo().run(), [editor])

  const ToolbarButton = ({ onClick, isActive, icon: Icon, label, title }) => (
    <button
      onClick={onClick}
      title={title}
      type="button"
      disabled={disabled}
      className={`p-2 rounded transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {Icon ? <Icon size={18} /> : label}
    </button>
  )

  return (
    <div className={`tiptap-editor border rounded-lg overflow-hidden ${error ? 'border-red-500' : 'border-eqms-border'}`}>
      {/* Toolbar */}
      <div className="bg-slate-800 border-b border-eqms-border p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-eqms-border pr-1">
          <ToolbarButton
            onClick={handleToggleBold}
            isActive={editor.isActive('bold')}
            icon={Bold}
            title="Bold (Ctrl+B)"
          />
          <ToolbarButton
            onClick={handleToggleItalic}
            isActive={editor.isActive('italic')}
            icon={Italic}
            title="Italic (Ctrl+I)"
          />
          <ToolbarButton
            onClick={handleToggleUnderline}
            isActive={editor.isActive('underline')}
            icon={UnderlineIcon}
            title="Underline (Ctrl+U)"
          />
          <ToolbarButton
            onClick={handleToggleStrike}
            isActive={editor.isActive('strike')}
            icon={Strikethrough}
            title="Strikethrough"
          />
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-eqms-border pr-1">
          <ToolbarButton
            onClick={handleSetH1}
            isActive={editor.isActive('heading', { level: 1 })}
            icon={Heading1}
            title="Heading 1"
          />
          <ToolbarButton
            onClick={handleSetH2}
            isActive={editor.isActive('heading', { level: 2 })}
            icon={Heading2}
            title="Heading 2"
          />
          <ToolbarButton
            onClick={handleSetH3}
            isActive={editor.isActive('heading', { level: 3 })}
            icon={Heading3}
            title="Heading 3"
          />
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-eqms-border pr-1">
          <ToolbarButton
            onClick={handleToggleBullet}
            isActive={editor.isActive('bulletList')}
            icon={List}
            title="Bullet List"
          />
          <ToolbarButton
            onClick={handleToggleOrdered}
            isActive={editor.isActive('orderedList')}
            icon={ListOrdered}
            title="Ordered List"
          />
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-eqms-border pr-1">
          <ToolbarButton
            onClick={handleAlignLeft}
            isActive={editor.isActive({ textAlign: 'left' })}
            icon={AlignLeft}
            title="Align Left"
          />
          <ToolbarButton
            onClick={handleAlignCenter}
            isActive={editor.isActive({ textAlign: 'center' })}
            icon={AlignCenter}
            title="Align Center"
          />
          <ToolbarButton
            onClick={handleAlignRight}
            isActive={editor.isActive({ textAlign: 'right' })}
            icon={AlignRight}
            title="Align Right"
          />
        </div>

        {/* Link & Tables */}
        <div className="flex gap-1 border-r border-eqms-border pr-1">
          <ToolbarButton
            onClick={handleAddLink}
            isActive={editor.isActive('link')}
            icon={LinkIcon}
            title="Add Link"
          />
          <ToolbarButton
            onClick={handleInsertTable}
            icon={TableIcon}
            title="Insert Table"
          />
          <ToolbarButton
            onClick={handleDeleteTable}
            icon={Trash2}
            title="Delete Table"
          />
        </div>

        {/* Highlight */}
        <div className="flex gap-1 border-r border-eqms-border pr-1">
          <ToolbarButton
            onClick={handleToggleHighlight}
            isActive={editor.isActive('highlight')}
            icon={Highlighter}
            title="Highlight"
          />
        </div>

        {/* History */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={handleUndo}
            icon={Undo2}
            title="Undo"
          />
          <ToolbarButton
            onClick={handleRedo}
            icon={Redo2}
            title="Redo"
          />
        </div>
      </div>

      {/* Editor */}
      <div
        className="bg-eqms-input p-3 focus-within:ring-1 focus-within:ring-blue-500/30"
        style={{ minHeight }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
})

RichTextEditor.displayName = 'RichTextEditor'

export default RichTextEditor
