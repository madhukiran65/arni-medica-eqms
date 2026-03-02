/**
 * TipTap v3 Comments Extension
 *
 * Inline comments with threading for eQMS document review workflows.
 * FDA-compliant: author, timestamp, unique ID on every comment.
 *
 * Features:
 * - Add/resolve/delete comments on text selections
 * - Reply threads on comments
 * - Visual styling (amber highlight for active, faded for resolved)
 * - Navigate to comment positions
 */

import { Mark } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';
import { v4 as uuidv4 } from 'uuid';

const Comments = Mark.create({
  name: 'comment',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'comment-mark',
      },
    };
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-comment-id'),
        renderHTML: (attrs) => ({ 'data-comment-id': attrs.id }),
      },
      author: {
        default: 'Unknown',
        parseHTML: (el) => el.getAttribute('data-comment-author'),
        renderHTML: (attrs) => ({ 'data-comment-author': attrs.author }),
      },
      date: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-comment-date'),
        renderHTML: (attrs) => ({ 'data-comment-date': attrs.date }),
      },
      text: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-comment-text'),
        renderHTML: (attrs) => ({ 'data-comment-text': attrs.text }),
      },
      resolved: {
        default: false,
        parseHTML: (el) => el.getAttribute('data-comment-resolved') === 'true',
        renderHTML: (attrs) => ({ 'data-comment-resolved': attrs.resolved ? 'true' : 'false' }),
      },
      replies: {
        default: [],
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute('data-comment-replies') || '[]');
          } catch {
            return [];
          }
        },
        renderHTML: (attrs) => ({
          'data-comment-replies': JSON.stringify(attrs.replies || []),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-comment-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const resolved = HTMLAttributes['data-comment-resolved'] === 'true';
    return [
      'span',
      {
        ...HTMLAttributes,
        class: `comment-mark cursor-pointer transition-colors ${
          resolved
            ? 'comment-resolved opacity-50 bg-slate-400/20'
            : 'comment-active bg-amber-300/30 hover:bg-amber-300/50'
        }`,
        title: `Comment by ${HTMLAttributes['data-comment-author']}`,
      },
      0,
    ];
  },

  addCommands() {
    return {
      /**
       * Add a comment to the current selection
       */
      addComment:
        (options) =>
        ({ commands, state }) => {
          const { author = 'Unknown', text = '' } = options || {};
          if (!text?.trim()) return false;

          const { from, to } = state.selection;
          if (from === to) return false;

          return commands.setMark(this.name, {
            id: uuidv4(),
            author,
            date: new Date().toISOString(),
            text: text.trim(),
            resolved: false,
            replies: [],
          });
        },

      /**
       * Resolve a comment by ID — uses transaction to update mark at correct position
       */
      resolveComment:
        (commentId) =>
        ({ state, dispatch }) => {
          return this._updateCommentAttr(state, dispatch, commentId, { resolved: true });
        },

      /**
       * Unresolve a comment by ID
       */
      unresolveComment:
        (commentId) =>
        ({ state, dispatch }) => {
          return this._updateCommentAttr(state, dispatch, commentId, { resolved: false });
        },

      /**
       * Delete a comment entirely (remove mark from text)
       */
      deleteComment:
        (commentId) =>
        ({ state, dispatch }) => {
          const { tr } = state;
          const markType = state.schema.marks.comment;
          let found = false;

          state.doc.descendants((node, pos) => {
            const mark = node.marks.find(
              (m) => m.type.name === 'comment' && m.attrs.id === commentId
            );
            if (mark) {
              found = true;
              const end = pos + node.nodeSize;
              tr.removeMark(pos, end, markType);
            }
          });

          if (found && dispatch) {
            dispatch(tr);
          }
          return found;
        },

      /**
       * Add a reply to a comment
       */
      replyToComment:
        (commentId, replyData) =>
        ({ state, dispatch }) => {
          const { author = 'Unknown', text = '' } = replyData || {};
          if (!text?.trim()) return false;

          const newReply = {
            id: uuidv4(),
            author,
            date: new Date().toISOString(),
            text: text.trim(),
          };

          return this._updateCommentAttr(state, dispatch, commentId, (attrs) => ({
            replies: [...(attrs.replies || []), newReply],
          }));
        },

      /**
       * Delete a specific reply from a comment
       */
      deleteReply:
        (commentId, replyIndex) =>
        ({ state, dispatch }) => {
          return this._updateCommentAttr(state, dispatch, commentId, (attrs) => ({
            replies: (attrs.replies || []).filter((_, i) => i !== replyIndex),
          }));
        },

      /**
       * Get all comments from the document (returns array, does NOT dispatch)
       */
      getComments:
        () =>
        ({ state }) => {
          const comments = [];
          const seen = new Set();

          state.doc.descendants((node, pos) => {
            node.marks.forEach((mark) => {
              if (mark.type.name === 'comment' && !seen.has(mark.attrs.id)) {
                seen.add(mark.attrs.id);
                comments.push({
                  id: mark.attrs.id,
                  author: mark.attrs.author,
                  date: mark.attrs.date,
                  text: mark.attrs.text,
                  resolved: mark.attrs.resolved,
                  replies: mark.attrs.replies || [],
                  commentedText: (node.text || '').slice(0, 100),
                  position: pos,
                });
              }
            });
          });

          return comments.sort((a, b) => a.position - b.position);
        },

      /**
       * Navigate to a comment and select its text
       */
      goToComment:
        (commentId) =>
        ({ state, dispatch, view }) => {
          let found = false;

          state.doc.descendants((node, pos) => {
            if (found) return false; // stop traversal
            const mark = node.marks.find(
              (m) => m.type.name === 'comment' && m.attrs.id === commentId
            );
            if (mark) {
              found = true;
              const { tr } = state;
              const end = pos + node.nodeSize;
              tr.setSelection(TextSelection.create(state.doc, pos, end));
              tr.scrollIntoView();
              if (dispatch) dispatch(tr);
            }
          });

          return found;
        },
    };
  },

  /**
   * Internal helper: update attributes on all nodes bearing a specific comment ID.
   * `changes` can be an object of new attrs, or a function (currentAttrs) => newAttrs.
   */
  _updateCommentAttr(state, dispatch, commentId, changes) {
    const { tr } = state;
    const markType = state.schema.marks.comment;
    let found = false;

    state.doc.descendants((node, pos) => {
      const mark = node.marks.find(
        (m) => m.type.name === 'comment' && m.attrs.id === commentId
      );
      if (mark) {
        found = true;
        const end = pos + node.nodeSize;
        const newAttrs =
          typeof changes === 'function' ? { ...mark.attrs, ...changes(mark.attrs) } : { ...mark.attrs, ...changes };

        // Remove old mark, add new one with updated attrs
        tr.removeMark(pos, end, markType);
        tr.addMark(pos, end, markType.create(newAttrs));
      }
    });

    if (found && dispatch) {
      dispatch(tr);
    }
    return found;
  },
});

export default Comments;
