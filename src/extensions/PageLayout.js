import { Extension, Node, Command } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

// Page size presets (width x height in inches)
const PAGE_SIZES = {
  letter: { width: 8.5, height: 11 },
  a4: { width: 8.27, height: 11.69 },
  legal: { width: 8.5, height: 14 },
  a3: { width: 11.69, height: 16.54 },
};

// Margin presets
const MARGIN_PRESETS = {
  normal: { top: 1, right: 1, bottom: 1, left: 1 },
  narrow: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
  moderate: { top: 1, right: 0.75, bottom: 1, left: 0.75 },
  wide: { top: 1, right: 1.5, bottom: 1, left: 1.5 },
};

// PageBreak Node
export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,

  parseHTML() {
    return [{ tag: 'div[data-page-break]' }];
  },

  renderHTML() {
    return ['div', { 'data-page-break': true, class: 'page-break' }];
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': ({ editor }) => {
        return editor.commands.insertPageBreak();
      },
    };
  },
});

// PageLayout Extension
export const PageLayout = Extension.create({
  name: 'pageLayout',

  addStorage() {
    return {
      margins: { top: 1, right: 1, bottom: 1, left: 1 },
      orientation: 'portrait',
      pageSize: 'letter',
      columns: 1,
    };
  },

  addCommands() {
    return {
      setPageMargins:
        (margins) =>
        ({ commands, editor }) => {
          editor.storage.pageLayout.margins = {
            top: margins.top ?? 1,
            right: margins.right ?? 1,
            bottom: margins.bottom ?? 1,
            left: margins.left ?? 1,
          };
          this.updatePageLayout(editor);
          return true;
        },

      setPageOrientation:
        (orientation) =>
        ({ editor }) => {
          if (!['portrait', 'landscape'].includes(orientation)) {
            return false;
          }
          editor.storage.pageLayout.orientation = orientation;
          this.updatePageLayout(editor);
          return true;
        },

      setPageSize:
        (size) =>
        ({ editor }) => {
          if (!Object.keys(PAGE_SIZES).includes(size)) {
            return false;
          }
          editor.storage.pageLayout.pageSize = size;
          this.updatePageLayout(editor);
          return true;
        },

      setPageColumns:
        (columns) =>
        ({ editor }) => {
          if (![1, 2, 3].includes(columns)) {
            return false;
          }
          editor.storage.pageLayout.columns = columns;
          this.updatePageLayout(editor);
          return true;
        },

      insertPageBreak:
        () =>
        ({ commands }) => {
          return commands.insertContent({ type: 'pageBreak' });
        },

      getPageLayout: () => ({ editor }) => {
        return editor.storage.pageLayout;
      },

      setMarginPreset:
        (preset) =>
        ({ editor }) => {
          if (!Object.keys(MARGIN_PRESETS).includes(preset)) {
            return false;
          }
          editor.storage.pageLayout.margins = MARGIN_PRESETS[preset];
          this.updatePageLayout(editor);
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin({
        key: new PluginKey('pageLayout'),
        view() {
          return {
            update(view) {
              extension.updatePageLayout(view.state.doc);
            },
          };
        },
      }),
    ];
  },

  updatePageLayout(editorOrState) {
    // Handle both editor instance and state
    const storage =
      editorOrState.storage?.pageLayout || editorOrState.pageLayout;

    if (!storage) return;

    const { margins, orientation, pageSize, columns } = storage;
    const sizes = PAGE_SIZES[pageSize] || PAGE_SIZES.letter;

    // Get the editor DOM element
    const editorElement = document.querySelector('.tiptap-editor .ProseMirror');
    if (!editorElement) return;

    // Set CSS custom properties
    editorElement.style.setProperty('--page-margin-top', `${margins.top}in`);
    editorElement.style.setProperty('--page-margin-right', `${margins.right}in`);
    editorElement.style.setProperty(
      '--page-margin-bottom',
      `${margins.bottom}in`
    );
    editorElement.style.setProperty('--page-margin-left', `${margins.left}in`);

    // Calculate effective width based on orientation
    let width = sizes.width;
    let height = sizes.height;

    if (orientation === 'landscape') {
      [width, height] = [height, width];
    }

    // Subtract margins from width/height
    const effectiveWidth =
      width - margins.left - margins.right;
    const effectiveHeight =
      height - margins.top - margins.bottom;

    editorElement.style.setProperty('--page-width', `${effectiveWidth}in`);
    editorElement.style.setProperty('--page-height', `${effectiveHeight}in`);
    editorElement.style.setProperty('--page-columns', columns);

    // Apply orientation
    editorElement.style.setProperty('--page-orientation', orientation);
  },
});

export const PAGE_SIZES_EXPORT = PAGE_SIZES;
export const MARGIN_PRESETS_EXPORT = MARGIN_PRESETS;
