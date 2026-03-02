import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

const VARIABLES = [
  { label: '{page}', value: '{page}', description: 'Current page number' },
  { label: '{pages}', value: '{pages}', description: 'Total pages' },
  { label: '{date}', value: '{date}', description: 'Current date' },
  { label: '{author}', value: '{author}', description: 'Document author' },
];

const POSITIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

const HeaderFooterPanel = ({ editor, isOpen, onClose }) => {
  const [headerContent, setHeaderContent] = useState('');
  const [footerContent, setFooterContent] = useState('');
  const [showPageNumbers, setShowPageNumbers] = useState(false);
  const [pageNumberPosition, setPageNumberPosition] = useState('center');
  const [firstPageDifferent, setFirstPageDifferent] = useState(false);

  useEffect(() => {
    if (editor && isOpen) {
      const settings = editor.storage.headerFooter;
      setHeaderContent(settings.headerContent || '');
      setFooterContent(settings.footerContent || '');
      setShowPageNumbers(settings.showPageNumbers || false);
      setPageNumberPosition(settings.pageNumberPosition || 'center');
      setFirstPageDifferent(settings.firstPageDifferent || false);
    }
  }, [editor, isOpen]);

  const handleHeaderChange = (e) => {
    const html = e.target.value;
    setHeaderContent(html);
    editor?.commands.setHeaderContent(html);
  };

  const handleFooterChange = (e) => {
    const html = e.target.value;
    setFooterContent(html);
    editor?.commands.setFooterContent(html);
  };

  const handleTogglePageNumbers = () => {
    setShowPageNumbers(!showPageNumbers);
    editor?.commands.togglePageNumbers();
  };

  const handlePageNumberPositionChange = (pos) => {
    setPageNumberPosition(pos);
    editor?.commands.setPageNumberPosition(pos);
  };

  const handleToggleFirstPageDifferent = () => {
    setFirstPageDifferent(!firstPageDifferent);
    editor?.commands.toggleFirstPageDifferent();
  };

  const insertVariable = (variable, target) => {
    const textareaId = `${target}-content`;
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = target === 'header' ? headerContent : footerContent;
    const newText = text.slice(0, start) + variable + text.slice(end);

    if (target === 'header') {
      setHeaderContent(newText);
      editor?.commands.setHeaderContent(newText);
    } else {
      setFooterContent(newText);
      editor?.commands.setFooterContent(newText);
    }

    // Restore cursor position
    setTimeout(() => {
      textarea.selectionStart = start + variable.length;
      textarea.selectionEnd = start + variable.length;
      textarea.focus();
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
          <h2 className="text-xl font-semibold text-slate-200">Header & Footer Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* HEADER SECTION */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Header Content
            </label>
            <textarea
              id="header-content"
              value={headerContent}
              onChange={handleHeaderChange}
              placeholder="Enter header HTML or text with variables {page}, {pages}, {date}, {author}"
              rows={4}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {VARIABLES.map((variable) => (
                <button
                  key={variable.value}
                  onClick={() => insertVariable(variable.value, 'header')}
                  type="button"
                  className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs transition-colors"
                  title={variable.description}
                >
                  <Plus className="w-3 h-3" />
                  {variable.label}
                </button>
              ))}
            </div>
          </div>

          {/* FOOTER SECTION */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Footer Content
            </label>
            <textarea
              id="footer-content"
              value={footerContent}
              onChange={handleFooterChange}
              placeholder="Enter footer HTML or text with variables {page}, {pages}, {date}, {author}"
              rows={4}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {VARIABLES.map((variable) => (
                <button
                  key={variable.value}
                  onClick={() => insertVariable(variable.value, 'footer')}
                  type="button"
                  className="flex items-center gap-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs transition-colors"
                  title={variable.description}
                >
                  <Plus className="w-3 h-3" />
                  {variable.label}
                </button>
              ))}
            </div>
          </div>

          {/* PAGE NUMBERS */}
          <div className="border-t border-slate-700 pt-4">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-slate-200">Show Page Numbers</label>
              <button
                onClick={handleTogglePageNumbers}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showPageNumbers ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showPageNumbers ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {showPageNumbers && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Page Number Position
                </label>
                <div className="flex gap-2">
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos.value}
                      onClick={() => handlePageNumberPositionChange(pos.value)}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                        pageNumberPosition === pos.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* FIRST PAGE DIFFERENT */}
          <div className="border-t border-slate-700 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-200">
                First Page Different
              </label>
              <button
                onClick={handleToggleFirstPageDifferent}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  firstPageDifferent ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    firstPageDifferent ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              When enabled, the first page will not show header/footer
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-700 justify-end bg-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeaderFooterPanel;
