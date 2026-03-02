import React, { useState, useEffect } from 'react';
import {
  PAGE_SIZES_EXPORT,
  MARGIN_PRESETS_EXPORT,
} from '../../extensions/PageLayout';

export function PageLayoutPanel({ editor, isOpen, onClose }) {
  const [margins, setMargins] = useState({ top: 1, right: 1, bottom: 1, left: 1 });
  const [orientation, setOrientation] = useState('portrait');
  const [pageSize, setPageSize] = useState('letter');
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    if (editor && isOpen) {
      const layout = editor.storage.pageLayout;
      setMargins(layout.margins);
      setOrientation(layout.orientation);
      setPageSize(layout.pageSize);
      setColumns(layout.columns);
    }
  }, [editor, isOpen]);

  const handleMarginChange = (side, value) => {
    const updated = { ...margins, [side]: parseFloat(value) || 0 };
    setMargins(updated);
    editor?.commands.setPageMargins(updated);
  };

  const applyMarginPreset = (presetName) => {
    editor?.commands.setMarginPreset(presetName);
    setMargins(MARGIN_PRESETS_EXPORT[presetName]);
  };

  const handleOrientationChange = (orient) => {
    setOrientation(orient);
    editor?.commands.setPageOrientation(orient);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    editor?.commands.setPageSize(size);
  };

  const handleColumnsChange = (cols) => {
    setColumns(cols);
    editor?.commands.setPageColumns(cols);
  };

  const handlePageBreak = () => {
    editor?.commands.insertPageBreak();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 p-4 space-y-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-200"
      >
        ✕
      </button>

      {/* Margins Section */}
      <div className="space-y-3 pb-3 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-200">Margins</h3>

        {/* Preset Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(MARGIN_PRESETS_EXPORT).map((preset) => (
            <button
              key={preset}
              onClick={() => applyMarginPreset(preset)}
              className="px-3 py-2 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-colors"
            >
              {preset.charAt(0).toUpperCase() + preset.slice(1)}
            </button>
          ))}
        </div>

        {/* Custom Margin Inputs */}
        <div className="grid grid-cols-2 gap-3">
          {['top', 'right', 'bottom', 'left'].map((side) => (
            <div key={side}>
              <label className="text-xs text-slate-400 block mb-1 capitalize">
                {side} (")
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={margins[side]}
                onChange={(e) => handleMarginChange(side, e.target.value)}
                className="w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Orientation Section */}
      <div className="space-y-3 pb-3 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-200">Orientation</h3>
        <div className="flex gap-3">
          <button
            onClick={() => handleOrientationChange('portrait')}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
              orientation === 'portrait'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <div className="w-6 h-8 border-2 border-current rounded"></div>
            Portrait
          </button>
          <button
            onClick={() => handleOrientationChange('landscape')}
            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
              orientation === 'landscape'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <div className="w-8 h-6 border-2 border-current rounded"></div>
            Landscape
          </button>
        </div>
      </div>

      {/* Page Size Section */}
      <div className="space-y-3 pb-3 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-200">Page Size</h3>
        <select
          value={pageSize}
          onChange={(e) => handlePageSizeChange(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-slate-200 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="letter">Letter (8.5" × 11")</option>
          <option value="a4">A4 (8.27" × 11.69")</option>
          <option value="legal">Legal (8.5" × 14")</option>
          <option value="a3">A3 (11.69" × 16.54")</option>
        </select>
      </div>

      {/* Columns Section */}
      <div className="space-y-3 pb-3 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-slate-200">Columns</h3>
        <div className="flex gap-2">
          {[1, 2, 3].map((col) => (
            <button
              key={col}
              onClick={() => handleColumnsChange(col)}
              className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
                columns === col
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <div className="flex items-center justify-center gap-0.5">
                {Array(col)
                  .fill(null)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-6 bg-current rounded-sm opacity-75"
                    ></div>
                  ))}
              </div>
              {col} Col
            </button>
          ))}
        </div>
      </div>

      {/* Page Break Button */}
      <button
        onClick={handlePageBreak}
        className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded transition-colors"
      >
        Insert Page Break
      </button>
    </div>
  );
}
