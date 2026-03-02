# TipTap Comments Extension - Integration Guide

## Overview

This guide shows how to integrate the Comments extension and CommentsPanel component into your eQMS document review workflow.

## Files Created

1. **`src/extensions/Comments.js`** — TipTap v3 Mark extension for inline comments
2. **`src/components/common/CommentsPanel.jsx`** — React sidebar component for comment management

## Installation & Setup

### 1. Install Dependencies

```bash
npm install uuid lucide-react
```

These are likely already installed, but verify:
- `uuid` — for generating unique comment IDs
- `lucide-react` — for icons (MessageSquare, Check, Trash2, etc.)

### 2. Create Editor with Comments Extension

```jsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Comments from '@/extensions/Comments';
import CommentsPanel from '@/components/common/CommentsPanel';

function DocumentReview() {
  const [currentUser, setCurrentUser] = useState({
    name: 'John Reviewer',
    id: 'user-123',
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Comments, // Add the Comments extension
    ],
    content: `<h1>Document Title</h1><p>This is the document content...</p>`,
    onUpdate: ({ editor }) => {
      // Save document content
      console.log('Document updated:', editor.getJSON());
    },
  });

  return (
    <div className="flex h-screen">
      {/* Editor */}
      <div className="flex-1 p-6">
        <EditorContent editor={editor} className="prose" />
      </div>

      {/* Comments Sidebar */}
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

export default DocumentReview;
```

## Features

### Adding Comments

1. User selects text in the editor
2. Clicks "Add Comment" button in the panel
3. Types comment text and clicks "Post"
4. Commented text is highlighted with amber background

### Resolving Comments

1. Click "Resolve" on any open comment
2. Comment becomes faded/grayed out
3. Can click "Reopen" to unresolve

### Replying to Comments

1. Click "Reply" on any comment
2. Type your response in the reply box
3. Click "Reply" again or press Enter
4. Replies thread under the parent comment (collapsed by default)

### Filtering

- **All**: Show all comments
- **Open**: Show only unresolved comments
- **Resolved**: Show only resolved comments

### Navigation

- Click on any comment card to jump to that comment's text in the editor
- Commented text is automatically selected

## API Reference

### Commands

All commands are chainable. Usage:

```javascript
editor.chain().focus().addComment({ author: 'John', text: 'This needs review' }).run();
editor.chain().focus().resolveComment('comment-uuid-here').run();
```

#### `addComment(options)`

Add a comment to the current text selection.

**Options:**
- `author` (string) — Name of the commenter
- `text` (string) — Comment content

**Returns:** boolean

```javascript
editor.chain().focus().addComment({
  author: 'Jane Reviewer',
  text: 'Please clarify this section',
}).run();
```

#### `resolveComment(commentId)`

Mark a comment as resolved (faded appearance).

**Parameters:**
- `commentId` (string) — UUID of the comment

```javascript
editor.chain().focus().resolveComment('abc-123-def').run();
```

#### `unresolveComment(commentId)`

Mark a resolved comment as open again.

**Parameters:**
- `commentId` (string) — UUID of the comment

#### `deleteComment(commentId)`

Delete a comment entirely (removes the mark).

**Parameters:**
- `commentId` (string) — UUID of the comment

```javascript
editor.chain().focus().deleteComment('abc-123-def').run();
```

#### `replyToComment(commentId, replyData)`

Add a reply to a comment's thread.

**Parameters:**
- `commentId` (string) — UUID of the parent comment
- `replyData` (object):
  - `author` (string) — Name of the replier
  - `text` (string) — Reply content

```javascript
editor.chain().focus().replyToComment('abc-123-def', {
  author: 'Mark Inspector',
  text: 'I concur. This needs revision.',
}).run();
```

#### `deleteReply(commentId, replyIndex)`

Delete a specific reply from a comment's thread.

**Parameters:**
- `commentId` (string) — UUID of the parent comment
- `replyIndex` (number) — Index in the replies array

### Storage Methods

Access via `editor.storage.comments`:

#### `getComments(editor)`

Get all comments in document order.

**Returns:**
```javascript
[
  {
    id: 'uuid',
    author: 'Jane',
    date: '2026-03-01T10:30:00Z',
    text: 'Please clarify',
    resolved: false,
    replies: [],
    commentedText: 'First 100 chars of text...',
    position: 42,
  },
  // ... more comments
]
```

#### `getComment(editor, commentId)`

Get a specific comment by ID.

**Returns:** Single comment object (or null if not found)

#### `getCommentsByStatus(editor, status)`

Get comments filtered by status.

**Parameters:**
- `status` (string) — `'all'`, `'open'`, or `'resolved'`

#### `goToComment(editor, commentId)`

Navigate to a comment and select its text in the editor.

## Advanced Usage

### Persisting Comments to Backend

In your document save handler, extract comments and save them:

```javascript
const handleSave = async () => {
  const documentContent = editor.getJSON();
  const comments = editor.storage.comments.getComments(editor);

  const payload = {
    content: documentContent,
    comments: comments.map(c => ({
      id: c.id,
      author: c.author,
      date: c.date,
      text: c.text,
      resolved: c.resolved,
      replies: c.replies,
      commentedText: c.commentedText,
    })),
  };

  await fetch('/api/documents/123/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};
```

### Loading Comments from Backend

After fetching document content:

```javascript
const handleLoadDocument = async () => {
  const doc = await fetch('/api/documents/123').then(r => r.json());

  // Set editor content
  editor.commands.setContent(doc.content);

  // Restore comments
  doc.comments.forEach(comment => {
    const { from, to } = findTextRange(editor, comment.commentedText);
    if (from !== undefined) {
      editor.chain()
        .focus()
        .setTextSelection({ from, to })
        .addComment({
          author: comment.author,
          text: comment.text,
        })
        .run();

      // Restore resolved state
      if (comment.resolved) {
        editor.chain().focus().resolveComment(comment.id).run();
      }

      // Restore replies
      comment.replies.forEach(reply => {
        editor.chain().focus()
          .replyToComment(comment.id, {
            author: reply.author,
            text: reply.text,
          })
          .run();
      });
    }
  });
};
```

### Custom Styling

Override the default amber highlight by modifying Tailwind config or adding custom CSS:

```css
/* In your global CSS */
.comment-mark {
  background-color: rgba(251, 191, 36, 0.3); /* Amber tint */
  transition: all 0.2s ease;
}

.comment-mark:hover {
  background-color: rgba(251, 191, 36, 0.5);
}

.comment-mark[data-comment-resolved="true"] {
  background-color: rgba(100, 100, 100, 0.2);
  opacity: 0.6;
}
```

### Permissions & Workflow

For eQMS compliance, implement authorization checks:

```jsx
function canResolveComment(comment, currentUser) {
  // Only document owner or QA manager can resolve
  return (
    currentUser.id === comment.documentOwnerId ||
    currentUser.role === 'QA_MANAGER'
  );
}

function canReplyToComment(comment, currentUser) {
  // Reviewers and document owner can reply
  return (
    comment.resolved === false &&
    (currentUser.role === 'REVIEWER' ||
     currentUser.id === comment.documentOwnerId)
  );
}
```

## eQMS Integration Points

### 1. Document Control Module

Comments are used during multi-stage document review:
- **Stage 1:** Initial review (reviewers add comments)
- **Stage 2:** Document owner resolves or updates based on comments
- **Stage 3:** Supervisor approval (checks all comments resolved)
- **Stage 4:** Release (document is finalized with immutable comment history)

### 2. Audit Trail

All comment actions are automatically audited:
- Comment added: `audit_log(action='comment_added', comment_id, author, text)`
- Comment resolved: `audit_log(action='comment_resolved', comment_id)`
- Comment deleted: `audit_log(action='comment_deleted', comment_id)`
- Reply added: `audit_log(action='reply_added', comment_id, reply_index)`

### 3. Compliance (21 CFR Part 11)

Comments must:
- Be immutable once added (no edit, only delete with audit trail)
- Include authorship and timestamp
- Be retained with the document forever
- Support full audit trail (e.g., who resolved, when, why)
- Never be lost due to accidental deletion (soft delete + recovery)

### 4. State Machine Integration

For Document Workflow state machine:
- Comments block document approval until all open comments are resolved
- Transitioning to "Approved" requires `comments_resolved_count == 0`
- Transitioning to "Released" requires supervisor sign-off + all comments closed

## Troubleshooting

### Comments Not Appearing

1. Verify Comments extension is added to `extensions` array
2. Check that `editor.storage.comments` is accessible
3. Ensure text selection is not empty before adding comment

### Comments Lost on Refresh

Comments are stored in the editor state (JSON) in the DOM. To persist:
- Save `editor.getJSON()` to backend
- Extract comments via `getComments()` and save separately
- Restore on load (see "Loading Comments from Backend" above)

### Styling Issues

If dark theme doesn't apply:
1. Ensure parent container has `bg-slate-800` and `text-slate-200`
2. Verify Tailwind CSS is configured for `slate-*` colors
3. Check that lucide-react icons are rendering

### Performance with Many Comments

For documents with 100+ comments:
1. Implement comment pagination/virtualization
2. Lazy-load replies (don't expand all by default)
3. Debounce `refreshComments()` calls
4. Consider splitting into multiple tabs by section

## Best Practices

1. **Always save comments to backend** — Never rely on DOM state alone
2. **Use author.id, not just name** — Prevents impersonation
3. **Validate permissions before resolving** — Only document owner/QA can resolve
4. **Log all comment actions** — Required for audit compliance
5. **Prevent comment editing** — Only delete + re-add is allowed
6. **Archive old comments** — Keep resolved comments for 7 years (FDA requirement)
7. **Notify stakeholders** — Email reviewers when new comments added
8. **Require sign-off** — Before releasing document, supervisor must confirm all comments resolved

## Example: Complete Document Review Workflow

See `examples/DocumentReviewFlow.jsx` for a complete production-ready example.
