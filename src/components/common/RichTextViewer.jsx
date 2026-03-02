import React from 'react'
import sanitizeHtml from 'sanitize-html'
import '../../styles/tiptap.css'

const RichTextViewer = ({ content = '', className = '' }) => {
  const sanitized = React.useMemo(() => {
    return sanitizeHtml(content, {
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
  }, [content])

  return (
    <div
      className={`prose prose-invert max-w-none break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}

export default RichTextViewer
