import React, { useState, useCallback, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  Send,
  AlertCircle,
} from 'lucide-react';

/**
 * CommentsPanel Component
 * Sidebar for managing inline comments in TipTap editor during document review
 */
const CommentsPanel = ({
  editor,
  onCommentAdded,
  onCommentResolved,
  onCommentDeleted,
  currentUser = { name: 'Current User', id: 'current' },
}) => {
  const [comments, setComments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [showAddComment, setShowAddComment] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);

  // Refresh comments from editor using the getComments command
  const refreshComments = useCallback(() => {
    if (!editor) return;
    try {
      const allComments = editor.commands.getComments() || [];
      setComments(allComments);
    } catch (error) {
      console.error('Error refreshing comments:', error);
    }
  }, [editor]);

  // Monitor editor changes
  useEffect(() => {
    if (!editor) return;

    const updateHandler = () => {
      refreshComments();
      const { selection } = editor.state;
      setHasSelection(selection.from !== selection.to);
    };

    editor.on('update', updateHandler);
    editor.on('selectionUpdate', updateHandler);
    refreshComments(); // initial load

    return () => {
      editor.off('update', updateHandler);
      editor.off('selectionUpdate', updateHandler);
    };
  }, [editor, refreshComments]);

  // Filter comments
  const filteredComments = comments.filter((comment) => {
    if (filter === 'open') return !comment.resolved;
    if (filter === 'resolved') return comment.resolved;
    return true;
  });

  // Add a new comment
  const handleAddComment = () => {
    if (!newCommentText.trim() || !hasSelection) return;
    try {
      editor.chain().focus().addComment({
        author: currentUser.name,
        text: newCommentText,
      }).run();
      setNewCommentText('');
      setShowAddComment(false);
      refreshComments();
      onCommentAdded?.();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleResolveComment = (commentId) => {
    try {
      editor.chain().focus().resolveComment(commentId).run();
      refreshComments();
      onCommentResolved?.(commentId);
    } catch (error) {
      console.error('Error resolving comment:', error);
    }
  };

  const handleUnresolveComment = (commentId) => {
    try {
      editor.chain().focus().unresolveComment(commentId).run();
      refreshComments();
    } catch (error) {
      console.error('Error unresolving comment:', error);
    }
  };

  const handleDeleteComment = (commentId) => {
    if (!window.confirm('Delete this comment and all its replies?')) return;
    try {
      editor.chain().focus().deleteComment(commentId).run();
      refreshComments();
      onCommentDeleted?.(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleAddReply = (commentId) => {
    if (!replyText.trim()) return;
    try {
      editor.chain().focus().replyToComment(commentId, {
        author: currentUser.name,
        text: replyText,
      }).run();
      setReplyText('');
      setReplyingTo(null);
      refreshComments();
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleDeleteReply = (commentId, replyIndex) => {
    if (!window.confirm('Delete this reply?')) return;
    try {
      editor.chain().focus().deleteReply(commentId, replyIndex).run();
      refreshComments();
    } catch (error) {
      console.error('Error deleting reply:', error);
    }
  };

  const handleGoToComment = (commentId) => {
    try {
      editor.chain().focus().goToComment(commentId).run();
    } catch (error) {
      console.error('Error navigating to comment:', error);
    }
  };

  const toggleExpanded = (commentId) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) newExpanded.delete(commentId);
    else newExpanded.add(commentId);
    setExpandedComments(newExpanded);
  };

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return 'unknown';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-800 text-slate-200 border-l border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          <h2 className="font-semibold text-slate-100 text-sm">Comments</h2>
          <span className="px-2 py-0.5 text-xs rounded bg-slate-700 text-slate-300">
            {filteredComments.length}
          </span>
        </div>
      </div>

      {/* Add Comment */}
      <div className="p-3 border-b border-slate-700 space-y-2">
        {!showAddComment ? (
          <button
            onClick={() => setShowAddComment(true)}
            disabled={!hasSelection}
            className={`w-full py-2 px-3 rounded text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
              hasSelection
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-900'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            Add Comment
          </button>
        ) : (
          <div className="space-y-2">
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Enter your comment..."
              className="w-full p-2 text-xs rounded bg-slate-700 text-slate-100 placeholder-slate-400 border border-slate-600 focus:border-amber-500 focus:outline-none resize-none"
              rows="3"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddComment}
                className="flex-1 py-1 px-2 text-xs rounded bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium transition-colors"
              >
                Post
              </button>
              <button
                onClick={() => { setShowAddComment(false); setNewCommentText(''); }}
                className="flex-1 py-1 px-2 text-xs rounded bg-slate-700 hover:bg-slate-600 text-slate-100 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {!hasSelection && !showAddComment && (
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Select text to add a comment
          </p>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 px-3 pt-2 border-b border-slate-700">
        {['all', 'open', 'resolved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 text-xs rounded-t font-medium transition-colors capitalize ${
              filter === tab ? 'bg-amber-500 text-slate-900' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto">
        {filteredComments.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-xs">
            {filter === 'all' ? 'No comments yet' : filter === 'open' ? 'No open comments' : 'No resolved comments'}
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filteredComments.map((comment) => (
              <div
                key={comment.id}
                className={`rounded-lg border p-3 space-y-2 cursor-pointer transition-colors ${
                  comment.resolved
                    ? 'bg-slate-700/50 border-slate-600/50 opacity-75'
                    : 'bg-slate-700/70 border-amber-500/30 hover:border-amber-500/60'
                }`}
              >
                {/* Commented text snippet */}
                <div
                  onClick={() => handleGoToComment(comment.id)}
                  className="space-y-1"
                >
                  <div className="text-xs bg-slate-600/50 text-slate-300 p-2 rounded border-l-2 border-amber-400 italic line-clamp-2">
                    "{comment.commentedText || 'Unknown text'}"
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-amber-300">{comment.author}</span>
                    <span className="text-slate-400">{formatDate(comment.date)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">{comment.text}</p>

                {/* Replies */}
                {comment.replies?.length > 0 && (
                  <div className="pt-2 border-t border-slate-600">
                    <button
                      onClick={() => toggleExpanded(comment.id)}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-300 font-medium"
                    >
                      {expandedComments.has(comment.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                    </button>
                    {expandedComments.has(comment.id) && (
                      <div className="mt-2 space-y-2 pl-3 border-l border-slate-600">
                        {comment.replies.map((reply, idx) => (
                          <div key={idx} className="bg-slate-600/30 rounded p-2 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-slate-300">{reply.author}</span>
                              <span className="text-slate-500">{formatDate(reply.date)}</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{reply.text}</p>
                            <button
                              onClick={() => handleDeleteReply(comment.id, idx)}
                              className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Reply Input */}
                {replyingTo === comment.id ? (
                  <div className="pt-2 border-t border-slate-600 space-y-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="w-full p-2 text-xs rounded bg-slate-600 text-slate-100 placeholder-slate-400 border border-slate-500 focus:border-amber-500 focus:outline-none resize-none"
                      rows="2"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddReply(comment.id)}
                        className="flex-1 py-1 px-2 text-xs rounded bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Reply
                      </button>
                      <button
                        onClick={() => { setReplyingTo(null); setReplyText(''); }}
                        className="py-1 px-2 text-xs rounded bg-slate-600 hover:bg-slate-500 text-slate-100 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="text-xs text-slate-400 hover:text-slate-300 font-medium"
                  >
                    Reply
                  </button>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-600">
                  {!comment.resolved ? (
                    <button
                      onClick={() => handleResolveComment(comment.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1 px-2 text-xs rounded bg-green-600/20 hover:bg-green-600/40 text-green-300 font-medium transition-colors border border-green-600/30"
                    >
                      <Check className="w-3 h-3" /> Resolve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnresolveComment(comment.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1 px-2 text-xs rounded bg-slate-600/30 hover:bg-slate-600/50 text-slate-300 font-medium transition-colors"
                    >
                      Reopen
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-1 px-2 text-xs rounded bg-red-600/20 hover:bg-red-600/40 text-red-300 font-medium transition-colors border border-red-600/30"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>

                {comment.resolved && (
                  <div className="text-xs text-green-400 flex items-center gap-1 font-medium">
                    <Check className="w-3 h-3" /> Resolved
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsPanel;
