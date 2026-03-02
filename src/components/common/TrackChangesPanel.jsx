/**
 * TrackChangesPanel Component
 *
 * Sidebar panel for managing track changes in document workflows.
 * FDA-compliant audit trail: reviewers accept/reject changes with full history.
 *
 * Features:
 * - Enable/disable track changes toggle
 * - List all insertions and deletions
 * - Accept/reject individual changes
 * - Accept all / reject all bulk actions
 * - Dark theme for eQMS UI consistency
 * - Responsive panel layout
 */

import React, { useEffect, useState } from 'react';
import {
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  CheckSquare,
  XSquare,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react';

/**
 * TrackChangesPanel
 *
 * @param {Object} props
 * @param {Object} props.editor - TipTap editor instance
 * @param {string} [props.author='Anonymous'] - Current user name
 * @param {boolean} [props.isOpen=true] - Panel visibility
 * @param {Function} [props.onToggle] - Callback when panel is toggled
 * @returns {React.ReactNode}
 */
function TrackChangesPanel({
  editor,
  author = 'Anonymous',
  isOpen = true,
  onToggle = () => {},
}) {
  const [trackChangesEnabled, setTrackChangesEnabled] = useState(false);
  const [changes, setChanges] = useState([]);
  const [panelOpen, setPanelOpen] = useState(isOpen);
  const [expandedChangeId, setExpandedChangeId] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'insertion', 'deletion'

  /**
   * Initialize track changes and set author
   */
  useEffect(() => {
    if (!editor) return;

    // Set the author
    editor.commands.setTrackChangesUser(author);

    // Load initial state
    const ext = editor.extensionManager.extensions.find((e) => e.name === 'trackChanges');
    if (ext) {
      setTrackChangesEnabled(ext.storage.enabled);
      updateChanges();
    }
  }, [editor, author]);

  /**
   * Update the changes list from the editor
   */
  const updateChanges = () => {
    if (!editor) return;

    const allChanges = editor.commands.getChanges();
    setChanges(allChanges || []);
  };

  /**
   * Toggle track changes mode
   */
  const handleToggleTrackChanges = () => {
    if (!editor) return;

    editor.commands.toggleTrackChanges();
    const ext = editor.extensionManager.extensions.find((e) => e.name === 'trackChanges');
    const newState = ext?.storage.enabled || false;
    setTrackChangesEnabled(newState);
  };

  /**
   * Accept a specific change
   */
  const handleAcceptChange = (changeId) => {
    if (!editor) return;

    editor.commands.acceptChange(changeId);
    updateChanges();
  };

  /**
   * Reject a specific change
   */
  const handleRejectChange = (changeId) => {
    if (!editor) return;

    editor.commands.rejectChange(changeId);
    updateChanges();
  };

  /**
   * Accept all changes
   */
  const handleAcceptAll = () => {
    if (!editor || changes.length === 0) return;

    if (
      !window.confirm(
        `Accept all ${changes.length} change(s)? This action cannot be undone.`,
      )
    ) {
      return;
    }

    editor.commands.acceptAllChanges();
    updateChanges();
  };

  /**
   * Reject all changes
   */
  const handleRejectAll = () => {
    if (!editor || changes.length === 0) return;

    if (
      !window.confirm(
        `Reject all ${changes.length} change(s)? This action cannot be undone.`,
      )
    ) {
      return;
    }

    editor.commands.rejectAllChanges();
    updateChanges();
  };

  /**
   * Filter changes by type
   */
  const filteredChanges =
    filterType === 'all'
      ? changes
      : changes.filter((c) => c.type === filterType);

  /**
   * Format date for display
   */
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  /**
   * Truncate text for display
   */
  const truncateText = (text, maxLength = 50) => {
    if (!text) return '[empty]';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (!editor) {
    return (
      <div className="bg-slate-800 border-l border-slate-700 p-4 text-slate-400">
        <AlertCircle className="w-5 h-5 inline mr-2" />
        Editor not available
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-800 border-l border-slate-700">
      {/* Header: Toggle Panel */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          Track Changes
        </h2>
        <button
          onClick={() => {
            setPanelOpen(!panelOpen);
            onToggle(!panelOpen);
          }}
          className="text-slate-400 hover:text-slate-200 transition"
          aria-label="Toggle panel"
        >
          {panelOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
      </div>

      {!panelOpen ? null : (
        <>
          {/* Track Changes Toggle */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Enable Tracking
              </span>
              <button
                onClick={handleToggleTrackChanges}
                className={`transition ${
                  trackChangesEnabled
                    ? 'text-green-400'
                    : 'text-slate-500'
                }`}
                aria-label="Toggle track changes"
              >
                {trackChangesEnabled ? (
                  <ToggleRight className="w-6 h-6" />
                ) : (
                  <ToggleLeft className="w-6 h-6" />
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              {trackChangesEnabled ? (
                <span className="text-green-400">• Track changes: ON</span>
              ) : (
                <span className="text-slate-500">• Track changes: OFF</span>
              )}
            </p>
          </div>

          {/* Summary & Filter */}
          {changes.length > 0 && (
            <div className="p-4 border-b border-slate-700">
              <div className="text-xs text-slate-300 mb-3">
                <span className="font-semibold">{changes.length}</span> change
                {changes.length !== 1 ? 's' : ''} found
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 mb-3">
                {['all', 'insertion', 'deletion'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-2 py-1 text-xs rounded font-medium transition ${
                      filterType === type
                        ? type === 'insertion'
                          ? 'bg-green-900 text-green-200'
                          : type === 'deletion'
                            ? 'bg-red-900 text-red-200'
                            : 'bg-blue-900 text-blue-200'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {type === 'all'
                      ? 'All'
                      : type === 'insertion'
                        ? `+ Added (${changes.filter((c) => c.type === 'insertion').length})`
                        : `- Deleted (${changes.filter((c) => c.type === 'deletion').length})`}
                  </button>
                ))}
              </div>

              {/* Bulk Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-700 hover:bg-green-600 text-green-100 text-xs font-medium rounded transition"
                >
                  <Check className="w-3 h-3" />
                  Accept All
                </button>
                <button
                  onClick={handleRejectAll}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-700 hover:bg-red-600 text-red-100 text-xs font-medium rounded transition"
                >
                  <X className="w-3 h-3" />
                  Reject All
                </button>
              </div>
            </div>
          )}

          {/* Changes List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChanges.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                {changes.length === 0
                  ? trackChangesEnabled
                    ? 'No changes yet. Start editing to track changes.'
                    : 'Enable track changes to monitor edits.'
                  : 'No changes match the selected filter.'}
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {filteredChanges.map((change) => (
                  <div
                    key={change.id}
                    className={`p-3 transition border-l-4 ${
                      change.type === 'insertion'
                        ? 'border-l-green-500 hover:bg-slate-700'
                        : 'border-l-red-500 hover:bg-slate-700'
                    }`}
                  >
                    {/* Change Header */}
                    <button
                      onClick={() =>
                        setExpandedChangeId(
                          expandedChangeId === change.id ? null : change.id,
                        )
                      }
                      className="w-full text-left flex items-start justify-between gap-2 mb-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {change.type === 'insertion' ? (
                            <Plus className="w-3 h-3 text-green-400 flex-shrink-0" />
                          ) : (
                            <Trash2 className="w-3 h-3 text-red-400 flex-shrink-0" />
                          )}
                          <span
                            className={`text-xs font-semibold ${
                              change.type === 'insertion'
                                ? 'text-green-300'
                                : 'text-red-300'
                            }`}
                          >
                            {change.type === 'insertion' ? 'Added' : 'Deleted'}
                          </span>
                        </div>
                        <p
                          className="text-xs text-slate-300 truncate"
                          title={change.text}
                        >
                          {truncateText(change.text, 40)}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 flex-shrink-0 transition ${
                          expandedChangeId === change.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Change Details (Expanded) */}
                    {expandedChangeId === change.id && (
                      <div className="mt-2 pt-2 border-t border-slate-600 text-xs space-y-2">
                        <div>
                          <span className="text-slate-500">Author:</span>
                          <span className="text-slate-200 ml-2">{change.author}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Date:</span>
                          <span className="text-slate-200 ml-2">
                            {formatDate(change.date)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Text:</span>
                          <div className="mt-1 p-2 bg-slate-700 rounded text-slate-200 break-words max-h-20 overflow-y-auto">
                            {change.text || '[empty]'}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleAcceptChange(change.id)}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-green-700 hover:bg-green-600 text-green-100 text-xs font-medium rounded transition"
                          >
                            <Check className="w-3 h-3" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectChange(change.id)}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-red-700 hover:bg-red-600 text-red-100 text-xs font-medium rounded transition"
                          >
                            <X className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer: Info */}
          <div className="p-3 border-t border-slate-700 bg-slate-850 text-xs text-slate-400 space-y-1">
            <p>
              <strong>Current User:</strong> {author}
            </p>
            <p className="text-slate-500">
              Keyboard: <code className="bg-slate-700 px-1 rounded">Ctrl+Shift+E</code> to toggle
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Icon component for file/document
 */
function FileText({ className = '' }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

export default TrackChangesPanel;
