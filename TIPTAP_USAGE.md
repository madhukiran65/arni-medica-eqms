# TipTap Rich Text Editor Components

This document describes the TipTap rich text editor components created for the Arni Medica eQMS frontend.

## Files Created

1. **`src/components/common/RichTextEditor.jsx`** - Editable rich text editor component
2. **`src/components/common/RichTextViewer.jsx`** - Read-only HTML viewer component
3. **`src/styles/tiptap.css`** - Dark theme styles for both components

## Features

### RichTextEditor
- **Toolbar with 20+ formatting options:**
  - Text formatting: Bold, Italic, Underline, Strikethrough
  - Headings: H1, H2, H3
  - Lists: Bullet list, Ordered list
  - Text alignment: Left, Center, Right
  - Links: Add/edit hyperlinks
  - Tables: Insert and delete tables
  - Highlight: Yellow text background
  - History: Undo/Redo
- **Dark theme styling** - Matches eQMS dark UI (bg-slate-800, border-slate-700, text-slate-200)
- **React Hook Form integration** - Use with `value` and `onChange` props
- **HTML sanitization** - Uses sanitize-html to prevent XSS attacks
- **Accessible toolbar** - Keyboard shortcuts and visual feedback for active states
- **Customizable** - Props for placeholder, minHeight, disabled state, and error styling

### RichTextViewer
- **Safe HTML rendering** - Sanitizes content before displaying
- **Dark theme prose styling** - Proper spacing and typography for headings, lists, tables
- **Read-only display** - Perfect for displaying saved content

## Installation

All dependencies are already installed in `package.json`:
- `@tiptap/react` - React integration
- `@tiptap/starter-kit` - Core formatting extensions
- `@tiptap/extension-*` - Additional formatting extensions
- `sanitize-html` - HTML sanitization
- `lucide-react` - Toolbar icons

## Usage Examples

### Basic Usage with React Hook Form

```jsx
import { useForm, FormProvider } from 'react-hook-form'
import RichTextEditor from '@/components/common/RichTextEditor'
import RichTextViewer from '@/components/common/RichTextViewer'

export function DocumentForm() {
  const methods = useForm({
    defaultValues: {
      description: '<p>Initial content</p>'
    }
  })

  const { watch, setValue } = methods

  const onSubmit = (data) => {
    console.log('Form data:', data)
    // Submit to API
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <RichTextEditor
          value={watch('description')}
          onChange={(html) => setValue('description', html)}
          placeholder="Enter document description..."
          minHeight="300px"
          error={!!methods.formState.errors.description}
        />
        <button type="submit">Save</button>
      </form>
    </FormProvider>
  )
}
```

### Standalone Usage (without React Hook Form)

```jsx
import { useState } from 'react'
import RichTextEditor from '@/components/common/RichTextEditor'

export function SimpleEditor() {
  const [content, setContent] = useState('')

  const handleSave = () => {
    console.log('Content:', content)
    // Send to API
  }

  return (
    <div>
      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Start typing..."
        minHeight="200px"
      />
      <button onClick={handleSave}>Save</button>
    </div>
  )
}
```

### Using the Ref for Programmatic Control

```jsx
import { useRef } from 'react'
import RichTextEditor from '@/components/common/RichTextEditor'

export function AdvancedEditor() {
  const editorRef = useRef(null)

  const insertText = () => {
    const editor = editorRef.current?.getEditor()
    editor?.commands.insertContent('Inserted text')
  }

  const getContent = () => {
    const html = editorRef.current?.getHTML()
    console.log('Editor content:', html)
  }

  const focus = () => {
    editorRef.current?.focus()
  }

  return (
    <div>
      <RichTextEditor
        ref={editorRef}
        placeholder="Edit me..."
      />
      <div className="flex gap-2 mt-4">
        <button onClick={insertText}>Insert Text</button>
        <button onClick={getContent}>Get Content</button>
        <button onClick={focus}>Focus Editor</button>
      </div>
    </div>
  )
}
```

### Displaying Saved Content

```jsx
import RichTextViewer from '@/components/common/RichTextViewer'

export function DocumentDetail({ document }) {
  return (
    <div className="card p-6">
      <h2>{document.title}</h2>
      <RichTextViewer
        content={document.description}
        className="mt-4"
      />
    </div>
  )
}
```

## Props Reference

### RichTextEditor

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | string | '' | Current HTML content |
| `onChange` | function | undefined | Callback when content changes, receives sanitized HTML |
| `placeholder` | string | 'Start typing...' | Placeholder text |
| `minHeight` | string | '150px' | Minimum editor height (CSS value) |
| `disabled` | boolean | false | Disable editing |
| `error` | boolean | false | Show error state (red border) |
| `ref` | React.Ref | undefined | Access editor via ref.current |

### RichTextEditor Ref Methods

```javascript
const editorRef = useRef(null)

// Get editor instance
const editor = editorRef.current?.getEditor()

// Get HTML content
const html = editorRef.current?.getHTML()

// Set HTML content
editorRef.current?.setHTML('<p>New content</p>')

// Focus editor
editorRef.current?.focus()
```

### RichTextViewer

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | string | '' | HTML content to display |
| `className` | string | '' | Additional CSS classes |

## Styling & Customization

### Dark Theme Colors

The components use the eQMS color palette:
- `bg-eqms-dark: #0B0F1A` - Primary background
- `bg-eqms-card: #141B2D` - Card background
- `bg-eqms-input: #1A2235` - Input background
- `border-eqms-border: #1F2A40` - Border color
- `text-slate-200: #e2e8f0` - Primary text
- `blue-500: #3b82f6` - Accent/focus color

### Customizing Toolbar Appearance

Edit `src/styles/tiptap.css` to customize:
- Toolbar button colors and hover states (`.tiptap-editor .ProseMirror`)
- Editor text styles (`.tiptap-editor .ProseMirror p`, `h1`, `h2`, etc.)
- Table styling
- Link colors
- Highlight colors

### Customizing Editor Extensions

Modify `RichTextEditor.jsx` to add/remove extensions:

```javascript
const editor = useEditor({
  extensions: [
    StarterKit,
    // Add extensions here
    CodeBlock, // Example: add code blocks
    Youtube,   // Example: embed YouTube videos
  ],
  // ...
})
```

## Integration with API

### Saving to Backend

```javascript
async function saveDocument(data) {
  const response = await fetch('/api/documents/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: data.title,
      content: data.richText, // HTML string from editor
      // ...
    })
  })
  return response.json()
}
```

### Displaying from Backend

```javascript
useEffect(() => {
  fetchDocument(id).then(doc => {
    setContent(doc.content) // Pass HTML to editor
  })
}, [id])
```

## Security Considerations

1. **HTML Sanitization** - Both components sanitize HTML input using `sanitize-html`
2. **Allowed Tags** - Only safe HTML tags are permitted:
   - Text: `p`, `br`, `strong`, `em`, `u`, `s`
   - Structure: `h1`, `h2`, `h3`, `ul`, `ol`, `li`
   - Links: `a` (with href, target attributes)
   - Tables: `table`, `thead`, `tbody`, `tr`, `th`, `td`
   - Formatting: `mark` (highlight)
3. **XSS Prevention** - Dangerous scripts and event handlers are stripped
4. **Content Validation** - Consider validating on the backend as well

## Keyboard Shortcuts

The editor supports standard shortcuts:
- `Ctrl+B` / `Cmd+B` - Bold
- `Ctrl+I` / `Cmd+I` - Italic
- `Ctrl+U` / `Cmd+U` - Underline
- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Shift+Z` / `Cmd+Shift+Z` - Redo

Additional shortcuts can be found in the TipTap documentation.

## Accessibility

- Toolbar buttons have proper `title` attributes for tooltips
- Form fields integrate with FormField for ARIA labels
- Error states are properly marked
- Read-only viewer uses semantic HTML

## Performance Notes

- Editor initialization is memoized using `useEditor`
- Content updates are debounced automatically
- HTML sanitization is memoized in the viewer
- Ref-based programmatic control is available for batch operations

## Troubleshooting

### Editor not showing
- Ensure `src/styles/tiptap.css` is imported
- Check that minHeight is sufficient (default is 150px)
- Verify all TipTap extensions are properly imported

### Content not persisting
- Make sure to call `onChange` callback with the sanitized HTML
- Check that the value prop is being updated from state
- Verify API endpoint is receiving the HTML content

### Styling issues
- Check for Tailwind CSS conflicts
- Verify dark theme colors are applied
- Ensure `prose` class is applied to viewer for proper spacing

### Form validation not working
- Use FormField wrapper for consistent error styling
- Pass `error` prop to show error state
- Ensure form submission properly validates

## References

- [TipTap Documentation](https://tiptap.dev/)
- [TipTap React Guide](https://tiptap.dev/guide/install-react)
- [sanitize-html Documentation](https://github.com/apostrophecms/sanitize-html)
- [Lucide React Icons](https://lucide.dev/)
- [React Hook Form](https://react-hook-form.com/)
