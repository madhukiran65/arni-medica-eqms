/**
 * TipTap v3 Watermark Extension
 *
 * Manages document watermarks with configurable text, opacity, color, and rotation.
 * Supports preset watermarks for eQMS document lifecycle states (DRAFT, APPROVED, etc).
 *
 * Watermark applied via CSS data attributes on editor element.
 */

import { Extension } from '@tiptap/core';

export const WATERMARK_PRESETS = {
  DRAFT: {
    text: 'DRAFT',
    color: '#94a3b8', // slate-400
    opacity: 0.15,
    rotation: -45,
  },
  'UNDER REVIEW': {
    text: 'UNDER REVIEW',
    color: '#3b82f6', // blue-500
    opacity: 0.12,
    rotation: -45,
  },
  APPROVED: {
    text: 'APPROVED',
    color: '#22c55e', // green-500
    opacity: 0.08,
    rotation: -45,
  },
  OBSOLETE: {
    text: 'OBSOLETE',
    color: '#ef4444', // red-500
    opacity: 0.2,
    rotation: -45,
  },
  CONFIDENTIAL: {
    text: 'CONFIDENTIAL',
    color: '#f97316', // orange-500
    opacity: 0.15,
    rotation: -45,
  },
  'CONTROLLED COPY': {
    text: 'CONTROLLED COPY',
    color: '#0ea5e9', // cyan-500
    opacity: 0.1,
    rotation: -45,
  },
};

export const Watermark = Extension.create({
  name: 'watermark',

  addStorage() {
    return {
      text: '',
      enabled: false,
      opacity: 0.15,
      color: '#94a3b8',
      rotation: -45,
    };
  },

  addKeyboardShortcuts() {
    return {
      // No keyboard shortcuts for watermark
    };
  },

  addCommands() {
    return {
      /**
       * Set watermark with options
       * @param {Object} options - { text, enabled, opacity, color, rotation }
       */
      setWatermark:
        (options = {}) =>
        ({ editor }) => {
          const storage = editor.storage.watermark;
          if (options.text !== undefined) storage.text = options.text;
          if (options.enabled !== undefined) storage.enabled = options.enabled;
          if (options.opacity !== undefined) {
            // Clamp opacity between 0 and 1
            storage.opacity = Math.max(0, Math.min(1, options.opacity));
          }
          if (options.color !== undefined) storage.color = options.color;
          if (options.rotation !== undefined) storage.rotation = options.rotation;

          this.updateWatermarkUI(editor);
          return true;
        },

      /**
       * Apply a preset watermark (e.g., DRAFT, APPROVED)
       * @param {string} preset - Key from WATERMARK_PRESETS
       */
      applyWatermarkPreset:
        (preset) =>
        ({ editor }) => {
          const presetSettings = WATERMARK_PRESETS[preset];
          if (!presetSettings) return false;

          return editor.commands.setWatermark({
            ...presetSettings,
            enabled: true,
          });
        },

      /**
       * Clear watermark (disable it)
       */
      clearWatermark: () => ({ editor }) => {
        editor.storage.watermark = {
          text: '',
          enabled: false,
          opacity: 0.15,
          color: '#94a3b8',
          rotation: -45,
        };
        this.updateWatermarkUI(editor);
        return true;
      },

      /**
       * Get current watermark settings
       */
      getWatermark: () => ({ editor }) => {
        return { ...editor.storage.watermark };
      },
    };
  },

  /**
   * Helper: Update watermark UI by setting CSS custom properties and data attributes
   */
  updateWatermarkUI(editor) {
    const storage = editor.storage.watermark;
    const editorElement = editor.view.dom;

    if (!editorElement) return;

    // Set CSS custom properties for watermark styling
    editorElement.style.setProperty('--watermark-text', `"${storage.text}"`);
    editorElement.style.setProperty('--watermark-opacity', storage.opacity.toString());
    editorElement.style.setProperty('--watermark-color', storage.color);
    editorElement.style.setProperty('--watermark-rotation', `${storage.rotation}deg`);

    // Set data attribute if watermark is enabled
    if (storage.enabled && storage.text) {
      editorElement.setAttribute('data-watermark', storage.text);
    } else {
      editorElement.removeAttribute('data-watermark');
    }
  },
});
