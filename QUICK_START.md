# Quick Start Guide — TipTap Document Editor

## Features Now Available

### Document List Page (`/documents`)
- View all documents with status, version, and creation date
- **Search** documents by title
- **Filter** by status (Draft, Submitted for Review, Approved, etc.)
- **View** document details in modal (includes rendered rich content)
- **Edit** document via button
- **Delete** document with confirmation

### Create Document (`/documents/create`)
- Form with all required fields
- Rich text editor for document content
- Real-time HTML formatting
- Full validation with error messages
- Auto-save on blur (ready for implementation)

### Edit Document (`/documents/edit/:id`)
- Pre-populates all fields from database
- Rich text editor with current content
- All validation applies
- Update document with single click

### Document Detail Modal
- Read-only view of all fields
- Rich text content displayed with proper styling
- Edit button to modify document
- Professional dark theme styling

## Using the Rich Text Editor

### Toolbar Buttons (Left to Right)

**Text Formatting**
- **B** (Bold) — Make text bold
- **I** (Italic) — Make text italic
- **U** (Underline) — Underline text
- **S** (Strikethrough) — Strike through text

**Headings**
- **H1** — Large heading (title level)
- **H2** — Medium heading (section level)
- **H3** — Small heading (subsection level)

**Lists**
- **•** (Bullets) — Unordered list
- **1.** (Numbers) — Ordered/numbered list

**Alignment**
- **⬅** (Left) — Align left
- **⬇** (Center) — Align center
- **➡** (Right) — Align right

**Advanced Features**
- **Link** — Add hyperlink (prompts for URL)
- **Table** — Insert 3x3 table (resizable, addable rows/cols)
- **🗑** (Delete) — Delete entire table

**Highlighting**
- **🖍** (Highlighter) — Highlight text with yellow background

**History**
- **↶** (Undo) — Undo last change
- **↷** (Redo) — Redo last undone change

### Keyboard Shortcuts
- **Ctrl+B** (or Cmd+B) — Bold
- **Ctrl+I** (or Cmd+I) — Italic
- **Ctrl+U** (or Cmd+U) — Underline
- **Ctrl+Z** — Undo
- **Ctrl+Shift+Z** — Redo
- **Tab** — Indent in lists
- **Shift+Tab** — Outdent in lists

## Form Fields Explained

### Document Title (Required)
- The name of the document
- Example: "Quality Management System Procedure"
- Displayed in document list

### Document ID (Required)
- Unique identifier for the document
- Should follow company naming convention
- Example: "DOC-2026-001" or "QMS-001-A"
- Must be unique across all documents

### Description (Required)
- Brief summary of the document purpose
- Shows in list and detail views
- Helps users quickly understand document intent

### Category (Optional)
- Type of document: Procedure, Work Instruction, Form, Specification, Drawing, etc.
- Helps organize and filter documents

### Effective Date (Required)
- When the document becomes active
- Controls document lifecycle in eQMS
- Must be in YYYY-MM-DD format

### Review Cycle (Days) (Required)
- How often the document must be reviewed
- Typical values: 365 (annual), 730 (biennial)
- Minimum: 1 day

### Document Content (Required)
- Main body of the document
- Use rich text editor to format
- Supports complex formatting: headings, lists, tables, etc.
- Must not be empty

## Workflow

### Creating a Document
1. Navigate to Documents module
2. Click "New Document" button
3. Fill in all required fields:
   - Title: "QMS Procedure v2"
   - Document ID: "DOC-QMS-001"
   - Description: "Main quality management procedure"
   - Effective Date: Select date (today or future)
   - Review Cycle: 365 days
   - Content: Use editor to write procedure
4. Click "Create Document"
5. Document created → redirects to Documents list
6. Document starts in "Draft" status

### Editing a Document
1. On Documents page, find the document
2. Click Edit icon (pencil) on the row
3. Update any fields
4. Modify content in rich editor
5. Click "Update Document"
6. Changes saved → redirects to Documents list

### Viewing a Document
1. Click View icon (eye) on the document row
2. Modal opens showing:
   - All document metadata (ID, status, version, etc.)
   - Document content rendered with proper formatting
3. Click "Edit Document" to modify
4. Click outside modal or close button to dismiss

### Deleting a Document
1. Click Delete icon (trash) on the document row
2. Confirm deletion in dialog
3. Document deleted from system
4. List refreshed automatically

## Form Validation

### Errors Shown For:
- **Title:** Missing or blank
- **Document ID:** Missing or blank
- **Description:** Missing or blank
- **Effective Date:** Not selected
- **Review Cycle:** Less than 1 day
- **Content:** Empty or only whitespace

### Error Display:
- Red border around field
- Error message below field with icon
- Form cannot be submitted until all errors fixed

## Keyboard Navigation

- **Tab** — Move to next field
- **Shift+Tab** — Move to previous field
- **Enter** (in textarea/editor) — Add line break
- **Escape** (in modal) — Close modal

## Tips & Tricks

### Working with Tables
1. Click "Table" button to insert
2. Header row created automatically
3. Right-click cell to see options (add/delete rows/columns)
4. Drag table border to resize
5. Click anywhere in table, then "Delete Table" to remove

### Working with Links
1. Type or select text
2. Click "Link" button
3. Paste or type URL (with https://)
4. Link created

### Copying Formatted Content
1. Select text in editor
2. Ctrl+C (or Cmd+C)
3. Paste in Word, email, etc. — formatting preserved

### Undoing Mistakes
1. Made a mistake? Click "Undo" or press Ctrl+Z
2. Can undo all the way to document creation
3. Use "Redo" to restore if you over-undid

## Troubleshooting

### Form Won't Submit
- Check for red error borders
- Ensure all required fields are filled
- Verify effective date is selected
- Ensure content is not empty

### Content Lost
- TipTap maintains full undo history
- Click Undo to recover
- Close without saving loses changes

### Styling Not Showing
- Try refreshing the page (Ctrl+R)
- Check browser console for errors (F12)
- Ensure you're using the official TipTap toolbar buttons

### Can't Edit Document
- Check you have Edit permission for Documents module
- Verify document is not in Read-Only status
- Try logging out and back in

## Next Steps

1. **Create a test document** to familiarize yourself with the editor
2. **Try different formatting** — headings, lists, tables
3. **Edit the document** to verify changes are saved
4. **View the rendered content** in the detail modal
5. **Explore validation** — try submitting with empty fields

## Support

For issues or feature requests:
1. Check TIPTAP_INTEGRATION.md for detailed documentation
2. Review browser console (F12) for error messages
3. Contact development team with error messages
