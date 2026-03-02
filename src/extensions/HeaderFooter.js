/**
 * TipTap v3 Header/Footer Extension
 *
 * Manages document header and footer content with page numbers and variables.
 * Stores header/footer HTML and page number settings for print/export workflows.
 *
 * For eQMS document control: supports {page}, {pages}, {date}, {author} variables.
 */

import { Extension } from '@tiptap/core';

export const HeaderFooter = Extension.create({
  name: 'headerFooter',

  addStorage() {
    return {
      headerContent: '',
      footerContent: '',
      showPageNumbers: false,
      pageNumberPosition: 'center', // 'left' | 'center' | 'right'
      firstPageDifferent: false,
    };
  },

  addCommands() {
    return {
      /**
       * Set header content (HTML string)
       * Supports {page}, {pages}, {date}, {author} variables
       */
      setHeaderContent:
        (html) =>
        ({ editor }) => {
          editor.storage.headerFooter.headerContent = html || '';
          return true;
        },

      /**
       * Set footer content (HTML string)
       * Supports {page}, {pages}, {date}, {author} variables
       */
      setFooterContent:
        (html) =>
        ({ editor }) => {
          editor.storage.headerFooter.footerContent = html || '';
          return true;
        },

      /**
       * Toggle page number display
       */
      togglePageNumbers: () => ({ editor }) => {
        editor.storage.headerFooter.showPageNumbers = !editor.storage.headerFooter.showPageNumbers;
        return true;
      },

      /**
       * Set page number position
       */
      setPageNumberPosition:
        (position) =>
        ({ editor }) => {
          if (!['left', 'center', 'right'].includes(position)) {
            return false;
          }
          editor.storage.headerFooter.pageNumberPosition = position;
          return true;
        },

      /**
       * Toggle different first page setting
       */
      toggleFirstPageDifferent: () => ({ editor }) => {
        editor.storage.headerFooter.firstPageDifferent = !editor.storage.headerFooter.firstPageDifferent;
        return true;
      },

      /**
       * Get all header/footer settings
       */
      getHeaderFooterSettings: () => ({ editor }) => {
        return editor.storage.headerFooter;
      },

      /**
       * Clear all header/footer content
       */
      clearHeaderFooter: () => ({ editor }) => {
        editor.storage.headerFooter = {
          headerContent: '',
          footerContent: '',
          showPageNumbers: false,
          pageNumberPosition: 'center',
          firstPageDifferent: false,
        };
        return true;
      },
    };
  },
});
