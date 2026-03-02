# Comments Extension & Panel - Import Reference

Copy these imports into your files.

## In Your Editor Setup File

```jsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// Import the Comments extension
import Comments from '@/extensions/Comments';

// Import the CommentsPanel component
import CommentsPanel from '@/components/common/CommentsPanel';

export default function DocumentEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Comments, // Add this line
    ],
    content: '<p>Your document content here...</p>',
  });

  const [currentUser] = useState({
    id: 'user-123',
    name: 'Current User',
  });

  return (
    <div className="flex gap-4 h-screen">
      {/* Editor */}
      <div className="flex-1">
        <EditorContent editor={editor} />
      </div>

      {/* Comments sidebar */}
      <div className="w-80 border-l">
        <CommentsPanel
          editor={editor}
          currentUser={currentUser}
          onCommentAdded={() => console.log('Comment added')}
          onCommentResolved={(id) => console.log('Comment resolved:', id)}
          onCommentDeleted={(id) => console.log('Comment deleted:', id)}
        />
      </div>
    </div>
  );
}
```

## Dependencies to Install

```bash
# Core TipTap packages (likely already installed)
npm install @tiptap/core @tiptap/react @tiptap/starter-kit

# For comments
npm install uuid lucide-react

# Already have these?
npm install tailwindcss react

# Full installation command
npm install @tiptap/core @tiptap/react @tiptap/starter-kit uuid lucide-react tailwindcss
```

## Verify Dependencies

Check your `package.json` has these:

```json
{
  "dependencies": {
    "@tiptap/core": "^3.0.0",
    "@tiptap/react": "^3.0.0",
    "@tiptap/starter-kit": "^3.0.0",
    "uuid": "^9.0.0",
    "lucide-react": "^0.263.0",
    "tailwindcss": "^3.0.0",
    "react": "^18.0.0"
  }
}
```

## File Paths (Absolute)

```
Extension: /tmp/eqms-frontend/src/extensions/Comments.js
Component: /tmp/eqms-frontend/src/components/common/CommentsPanel.jsx
```

## Import Aliases

If using path aliases (recommended):

```jsx
// Option 1: Using @ alias (recommended)
import Comments from '@/extensions/Comments';
import CommentsPanel from '@/components/common/CommentsPanel';

// Option 2: Using relative paths
import Comments from '../extensions/Comments';
import CommentsPanel from '../components/common/CommentsPanel';

// Option 3: Using full paths
import Comments from '/src/extensions/Comments';
import CommentsPanel from '/src/components/common/CommentsPanel';
```

Configure path aliases in `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## TypeScript Configuration

If using TypeScript, add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## CSS/Tailwind Configuration

Ensure Tailwind is properly configured. Check `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          // These are default, but ensure they exist
          800: '#1e293b',
          700: '#334155',
          200: '#e2e8f0',
        },
        amber: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
    },
  },
  plugins: [],
};
```

## Global CSS

Add to your global CSS file (e.g., `src/index.css` or `src/App.css`):

```css
/* Comment mark styles */
.comment-mark {
  background-color: rgba(251, 191, 36, 0.3);
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: 0 2px;
  border-radius: 2px;
}

.comment-mark:hover {
  background-color: rgba(251, 191, 36, 0.5);
  outline: 1px solid rgba(251, 191, 36, 0.6);
}

.comment-mark[data-comment-resolved="true"] {
  background-color: rgba(100, 100, 100, 0.2);
  opacity: 0.6;
}

.comment-mark[data-comment-resolved="true"]:hover {
  background-color: rgba(100, 100, 100, 0.3);
  outline: 1px solid rgba(100, 100, 100, 0.4);
}

/* Optional: Add a small indicator for commented text */
.comment-mark::before {
  content: '';
  position: absolute;
  width: 2px;
  height: 100%;
  background: rgba(251, 191, 36, 0.5);
  left: 0;
  top: 0;
}
```

## Editor Content CSS

Style the actual editor content area:

```css
.ProseMirror {
  padding: 1rem;
  outline: none;
  min-height: 400px;
}

.ProseMirror h1 {
  font-size: 2em;
  font-weight: bold;
  margin: 1.5rem 0 1rem 0;
}

.ProseMirror h2 {
  font-size: 1.5em;
  font-weight: bold;
  margin: 1.5rem 0 1rem 0;
}

.ProseMirror p {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.ProseMirror ul,
.ProseMirror ol {
  margin: 1rem 0;
  padding-left: 2rem;
}

.ProseMirror li {
  margin: 0.25rem 0;
}
```

## React Component Usage

```jsx
import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Comments from '@/extensions/Comments';
import CommentsPanel from '@/components/common/CommentsPanel';

function MyDocument() {
  const [user] = useState({
    id: 'user-123',
    name: 'John Reviewer',
  });

  const editor = useEditor({
    extensions: [StarterKit, Comments],
    content: '<h1>Document Title</h1><p>Content here...</p>',
  });

  return (
    <div className="flex h-screen bg-white">
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} className="prose" />
      </div>
      <CommentsPanel editor={editor} currentUser={user} />
    </div>
  );
}

export default MyDocument;
```

## Quick Test

After importing, test with this code:

```jsx
// In your component
const testComments = () => {
  // Add a comment
  editor.chain().focus().setTextSelection({ from: 1, to: 5 }).run();
  editor.chain().focus().addComment({
    author: 'Test User',
    text: 'This is a test comment',
  }).run();

  // Get all comments
  const comments = editor.storage.comments.getComments(editor);
  console.log('Comments:', comments);

  // Resolve first comment
  if (comments.length > 0) {
    editor.chain().focus().resolveComment(comments[0].id).run();
  }
};

return (
  <>
    <button onClick={testComments}>Test Comments</button>
    {/* ... rest of component */}
  </>
);
```

## Troubleshooting Imports

### Error: "Cannot find module '@/extensions/Comments'"

1. Check path alias is configured in `vite.config.js`
2. Verify file exists at `/src/extensions/Comments.js`
3. Try using relative path: `import Comments from '../extensions/Comments'`
4. Check file name is exactly `Comments.js` (case-sensitive)

### Error: "UUID is not defined"

```bash
npm install uuid
# or
yarn add uuid
```

### Error: "lucide-react not found"

```bash
npm install lucide-react
# or
yarn add lucide-react
```

### Error: "@tiptap/core is not installed"

```bash
npm install @tiptap/core @tiptap/react
```

### CommentsPanel not rendering

1. Verify `editor` prop is passed and not null
2. Check editor is initialized before rendering CommentsPanel
3. Look at browser console for errors
4. Ensure Tailwind CSS is loaded (check browser dev tools)

## Complete Package Installation

For a fresh project:

```bash
npm install \
  @tiptap/core \
  @tiptap/react \
  @tiptap/starter-kit \
  @tiptap/extension-heading \
  uuid \
  lucide-react \
  tailwindcss \
  react \
  react-dom
```

## Next Steps

1. Copy both files to your project
2. Update imports in your editor component
3. Add the Comments extension to your editor
4. Add the CommentsPanel component to your layout
5. Test with the code above
6. Read `COMMENTS_INTEGRATION_GUIDE.md` for advanced usage
7. Review `examples/DocumentReviewFlow.jsx` for full workflow

## Support Files

- **Extension:** `/tmp/eqms-frontend/src/extensions/Comments.js`
- **Component:** `/tmp/eqms-frontend/src/components/common/CommentsPanel.jsx`
- **Guide:** `/tmp/eqms-frontend/COMMENTS_INTEGRATION_GUIDE.md`
- **README:** `/tmp/eqms-frontend/COMMENTS_README.md`
- **Example:** `/tmp/eqms-frontend/examples/DocumentReviewFlow.jsx`
