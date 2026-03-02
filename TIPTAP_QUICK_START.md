# TipTap Rich Text Editor - Quick Start Guide

## Installation (Already Done)

All dependencies are installed. No additional npm install needed.

## 3-Minute Setup

### 1. Import the Components

```jsx
import RichTextEditor from '@/components/common/RichTextEditor'
import RichTextViewer from '@/components/common/RichTextViewer'
```

### 2. Basic Usage (Standalone)

```jsx
import { useState } from 'react'
import RichTextEditor from '@/components/common/RichTextEditor'

export function MyForm() {
  const [content, setContent] = useState('')

  return (
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Start typing..."
      minHeight="300px"
    />
  )
}
```

### 3. With React Hook Form

```jsx
import { useForm, FormProvider, Controller } from 'react-hook-form'
import RichTextEditor from '@/components/common/RichTextEditor'

export function MyForm() {
  const methods = useForm()
  const { control } = methods

  return (
    <FormProvider {...methods}>
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <RichTextEditor {...field} minHeight="300px" />
        )}
      />
    </FormProvider>
  )
}
```

### 4. Display Content

```jsx
import RichTextViewer from '@/components/common/RichTextViewer'

export function DocumentDetail({ content }) {
  return <RichTextViewer content={content} />
}
```

## Toolbar Features

| Icon | Function |
|------|----------|
| **B** I U S | Bold, Italic, Underline, Strikethrough |
| H1 H2 H3 | Headings (3 levels) |
| • # | Bullet list, Ordered list |
| ← → | Text alignment (left, center, right) |
| 🔗 | Add links |
| 📊 | Insert/delete tables |
| 🖍 | Highlight text (yellow) |
| ↶ ↷ | Undo, Redo |

## Common Props

```jsx
<RichTextEditor
  value={htmlString}           // Current HTML content
  onChange={handler}           // (html) => void
  placeholder="Type..."        // Placeholder text
  minHeight="300px"           // Min editor height
  disabled={false}            // Read-only mode
  error={false}               // Show error border (red)
/>
```

## Keyboard Shortcuts

- `Ctrl+B` / `Cmd+B` → Bold
- `Ctrl+I` / `Cmd+I` → Italic
- `Ctrl+U` / `Cmd+U` → Underline
- `Ctrl+Z` / `Cmd+Z` → Undo
- `Ctrl+Y` / `Cmd+Y` → Redo

## Real-World Examples

### Documents Module
```jsx
<RichTextEditor
  value={document.content}
  onChange={(html) => updateDocument({ content: html })}
  placeholder="Document content..."
  minHeight="400px"
/>
```

### CAPA Module
```jsx
<RichTextEditor
  value={capa.rootCauseAnalysis}
  onChange={(html) => setCapa({ rootCauseAnalysis: html })}
  placeholder="Describe root cause..."
/>
```

### Training Module
```jsx
<RichTextEditor
  value={training.materials}
  onChange={(html) => setTraining({ materials: html })}
  placeholder="Training materials..."
  minHeight="500px"
/>
```

## Styling

All components automatically use the eQMS dark theme. Colors are defined in `src/styles/tiptap.css`:
- Background: `#1A2235` (eqms-input)
- Border: `#1F2A40` (eqms-border)
- Text: `#e2e8f0` (slate-200)
- Active/Focus: `#3b82f6` (blue-500)

## Error States

Show error styling with the `error` prop:

```jsx
<RichTextEditor
  value={content}
  onChange={setContent}
  error={!!formError}  // Red border when true
/>
```

## Accessing Editor Instance (Advanced)

```jsx
import { useRef } from 'react'

function MyComponent() {
  const editorRef = useRef(null)

  const insertText = () => {
    const editor = editorRef.current?.getEditor()
    editor?.commands.insertContent('Your text here')
  }

  const getHTML = () => {
    const html = editorRef.current?.getHTML()
    console.log(html)
  }

  return (
    <>
      <RichTextEditor ref={editorRef} />
      <button onClick={insertText}>Insert</button>
      <button onClick={getHTML}>Get HTML</button>
    </>
  )
}
```

## API Integration

```jsx
// Saving to backend
async function saveDocument(data) {
  const response = await fetch('/api/documents/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: data.title,
      content: data.richTextContent,
    })
  })
  return response.json()
}

// Loading from backend
async function loadDocument(id) {
  const response = await fetch(`/api/documents/${id}/`)
  const data = await response.json()
  return data.content  // Pass to RichTextViewer
}
```

## Security (Built-in)

HTML is automatically sanitized to prevent XSS attacks. Only safe tags are allowed:
- Text: `<p>`, `<strong>`, `<em>`, `<u>`, `<s>`
- Structure: `<h1>`, `<h2>`, `<h3>`, `<ul>`, `<ol>`, `<li>`
- Tables: `<table>`, `<tr>`, `<td>`, `<th>`
- Other: `<a>` (links), `<mark>` (highlights)

No inline scripts or dangerous attributes can be injected.

## Troubleshooting

### Editor not showing?
- Check minHeight is set (default 150px)
- Verify `src/styles/tiptap.css` is loaded
- Check browser console for errors

### Content not saving?
- Ensure `onChange` is being called
- Check that value prop is updated from state
- Verify API endpoint is receiving the HTML

### Styling looks wrong?
- Clear browser cache
- Check Tailwind CSS is loaded
- Verify eQMS color variables in tailwind.config.js

## Examples

See `/src/components/examples/RichTextEditorExample.jsx` for:
- Full form integration with validation
- Preview mode
- Error handling
- Real-time preview

## Full Documentation

See `TIPTAP_USAGE.md` for comprehensive documentation including:
- All props and methods
- Advanced customization
- Adding new extensions
- Performance optimization
- Accessibility details

## Files

- **Editor:** `/src/components/common/RichTextEditor.jsx`
- **Viewer:** `/src/components/common/RichTextViewer.jsx`
- **Styles:** `/src/styles/tiptap.css`
- **Examples:** `/src/components/examples/RichTextEditorExample.jsx`
- **Docs:** `TIPTAP_USAGE.md` and `TIPTAP_QUICK_START.md`
