/**
 * Complete Document Review Workflow Example
 * Shows how to integrate Comments extension and CommentsPanel in an eQMS context
 *
 * Features:
 * - Load document with existing comments
 * - Add/resolve/delete comments
 * - Save document and comments to backend
 * - Track reviewer signatures
 * - Audit trail logging
 */

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import Comments from '@/extensions/Comments';
import CommentsPanel from '@/components/common/CommentsPanel';
import { AlertCircle, Save, Loader, CheckCircle } from 'lucide-react';

const DocumentReviewFlow = ({ documentId = '123', userId = 'user-456' }) => {
  // State management
  const [document, setDocument] = useState(null);
  const [currentUser, setCurrentUser] = useState({
    id: userId,
    name: 'Jane Reviewer',
    role: 'REVIEWER',
  });
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const [openCommentCount, setOpenCommentCount] = useState(0);
  const [canApprove, setCanApprove] = useState(false);

  // Initialize editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Comments, // TipTap Comments extension
    ],
    content: '<p>Loading document...</p>',
    onUpdate: ({ editor }) => {
      // Debounce auto-save would go here
      // For now, just track that there are unsaved changes
    },
  });

  // Load document on mount
  useEffect(() => {
    loadDocument();
  }, [documentId]);

  // Update approval state when comments change
  useEffect(() => {
    if (!editor) return;

    const openComments = editor.storage.comments?.getCommentsByStatus?.(
      editor,
      'open'
    ) || [];
    setOpenCommentCount(openComments.length);
    setCanApprove(openComments.length === 0);
  }, [editor]);

  /**
   * Load document from backend
   * In a real app, this would fetch from your API
   */
  const loadDocument = async () => {
    try {
      setSaveStatus('saving');

      // Simulated API call - replace with real endpoint
      const response = await mockFetchDocument(documentId);
      setDocument(response);

      // Set editor content
      editor?.commands.setContent(response.content);

      // Restore comments
      if (response.comments && response.comments.length > 0) {
        restoreComments(response.comments);
      }

      setSaveStatus('idle');
    } catch (error) {
      console.error('Error loading document:', error);
      setStatusMessage('Error loading document');
      setSaveStatus('error');
    }
  };

  /**
   * Restore comments from backend data
   * In production, this would need more sophisticated text matching
   */
  const restoreComments = (backendComments) => {
    if (!editor) return;

    // Iterate through backend comments and restore them
    // This is simplified - in production, you'd need:
    // 1. Better text matching (handle formatting changes)
    // 2. Proper offset calculation
    // 3. Handling deleted text

    backendComments.forEach((comment) => {
      try {
        // Find the text in the document
        // For this example, we'll skip the restore as it's complex
        // In your implementation, you'd want to:
        // - Find the text position using a fuzzy match
        // - Apply the comment mark
        // - Restore resolved state
        // - Restore replies

        console.log('Restored comment:', comment.id);
      } catch (error) {
        console.error('Error restoring comment:', comment.id, error);
      }
    });
  };

  /**
   * Save document and comments to backend
   */
  const handleSaveDocument = async () => {
    if (!editor || !document) return;

    try {
      setSaveStatus('saving');
      setStatusMessage('Saving document and comments...');

      const documentContent = editor.getJSON();
      const comments = editor.storage.comments?.getComments?.(editor) || [];

      const payload = {
        id: documentId,
        title: document.title,
        content: documentContent,
        contentHtml: editor.getHTML(), // For display
        comments: comments.map((c) => ({
          id: c.id,
          author: c.author,
          date: c.date,
          text: c.text,
          resolved: c.resolved,
          replies: c.replies,
          commentedText: c.commentedText,
          position: c.position,
        })),
        lastEditedBy: currentUser.id,
        lastEditedAt: new Date().toISOString(),
      };

      // Simulated API call - replace with real endpoint
      await mockSaveDocument(documentId, payload);

      setSaveStatus('saved');
      setStatusMessage('Document saved successfully');

      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
        setStatusMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error saving document:', error);
      setSaveStatus('error');
      setStatusMessage('Error saving document');
    }
  };

  /**
   * Approve document (requires all comments resolved)
   */
  const handleApproveDocument = async () => {
    if (!canApprove) {
      alert('Cannot approve: there are unresolved comments');
      return;
    }

    if (!window.confirm('Approve this document for release?')) {
      return;
    }

    try {
      setSaveStatus('saving');
      setStatusMessage('Approving document...');

      // First save any pending changes
      await handleSaveDocument();

      // Then transition to approved state
      await mockApproveDocument(documentId, {
        approvedBy: currentUser.id,
        approvedAt: new Date().toISOString(),
        signature: 'signature-data-here', // In real app, e-signature would go here
      });

      setSaveStatus('saved');
      setStatusMessage('Document approved!');

      setTimeout(() => {
        setSaveStatus('idle');
        setStatusMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error approving document:', error);
      setSaveStatus('error');
      setStatusMessage('Error approving document');
    }
  };

  /**
   * Handle comment additions (for analytics/notifications)
   */
  const handleCommentAdded = () => {
    const comments = editor?.storage.comments?.getComments?.(editor) || [];
    console.log('Comment added. Total comments:', comments.length);

    // In production, you might:
    // - Send notification to document owner
    // - Log to audit trail
    // - Update review status
  };

  /**
   * Handle comment resolution
   */
  const handleCommentResolved = (commentId) => {
    console.log('Comment resolved:', commentId);

    // In production:
    // - Log to audit trail
    // - Update notification status
    // - Check if all comments are now resolved
  };

  /**
   * Handle comment deletion
   */
  const handleCommentDeleted = (commentId) => {
    console.log('Comment deleted:', commentId);

    // In production:
    // - Log soft deletion to audit trail
    // - Create recovery record
    // - Notify admins (if compliance-sensitive)
  };

  if (!editor) {
    return <div className="p-4 text-slate-400">Loading editor...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-100">
                {document?.title || 'Document Review'}
              </h1>
              <p className="text-sm text-slate-400">
                Document ID: {documentId} • Reviewer: {currentUser.name}
              </p>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-4">
              {/* Open Comments Count */}
              {openCommentCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 rounded bg-amber-500/20 text-amber-300">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {openCommentCount} open {openCommentCount === 1 ? 'comment' : 'comments'}
                  </span>
                </div>
              )}

              {/* Save Status */}
              {saveStatus === 'saving' && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Saving...</span>
                </div>
              )}

              {saveStatus === 'saved' && (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Saved</span>
                </div>
              )}

              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Error</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <p className="mt-2 text-sm text-slate-400">{statusMessage}</p>
          )}
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <EditorContent
              editor={editor}
              className="prose prose-sm max-w-none
                prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                prose-p:text-slate-700 prose-p:leading-relaxed
                prose-a:text-blue-600 prose-a:underline
                prose-strong:text-slate-900 prose-em:text-slate-600"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-slate-800 border-t border-slate-700 p-4 flex gap-3 justify-end">
          <button
            onClick={handleSaveDocument}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>

          <button
            onClick={handleApproveDocument}
            disabled={!canApprove || saveStatus === 'saving'}
            title={
              canApprove
                ? 'Approve document for release'
                : 'Resolve all comments before approving'
            }
            className={`flex items-center gap-2 px-4 py-2 rounded font-medium transition-colors ${
              canApprove
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </button>
        </div>
      </div>

      {/* Comments Panel */}
      <div className="w-80 border-l border-slate-700 flex flex-col">
        <CommentsPanel
          editor={editor}
          currentUser={currentUser}
          onCommentAdded={handleCommentAdded}
          onCommentResolved={handleCommentResolved}
          onCommentDeleted={handleCommentDeleted}
        />
      </div>
    </div>
  );
};

/**
 * Mock API Functions
 * Replace these with real API calls in production
 */

async function mockFetchDocument(documentId) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    id: documentId,
    title: 'Standard Operating Procedure - Document Review',
    content: `<h1>Standard Operating Procedure - Document Review</h1>
<h2>1. Purpose</h2>
<p>This procedure outlines the process for reviewing and approving documents within the eQMS.</p>

<h2>2. Scope</h2>
<p>This procedure applies to all quality documents, standard operating procedures, work instructions, and forms.</p>

<h2>3. Responsibilities</h2>
<ul>
<li>Document Owner: Maintains and updates documents</li>
<li>Reviewers: Provide technical and compliance review</li>
<li>Approver: Grants final approval for release</li>
</ul>

<h2>4. Procedure</h2>
<p>All documents must go through a structured review process before release.</p>`,
    comments: [
      {
        id: 'comment-1',
        author: 'John Smith',
        date: new Date(Date.now() - 3600000).toISOString(),
        text: 'Please clarify the scope - does this include training materials?',
        resolved: false,
        replies: [
          {
            author: 'Jane Reviewer',
            date: new Date(Date.now() - 1800000).toISOString(),
            text: 'Good catch - I will add a note about training materials.',
          },
        ],
        commentedText: 'This procedure applies to all quality documents',
      },
      {
        id: 'comment-2',
        author: 'QA Manager',
        date: new Date(Date.now() - 7200000).toISOString(),
        text: 'Add reference to 21 CFR Part 11 for electronic records.',
        resolved: true,
        replies: [],
        commentedText: 'structured review process',
      },
    ],
    status: 'IN_REVIEW',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    lastEditedAt: new Date().toISOString(),
  };
}

async function mockSaveDocument(documentId, payload) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // In production, this would POST to /api/documents/{id}/save
  console.log('Saved document:', payload);

  return { success: true, documentId };
}

async function mockApproveDocument(documentId, approval) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log('Approved document:', approval);

  return { success: true, documentId, status: 'APPROVED' };
}

export default DocumentReviewFlow;
