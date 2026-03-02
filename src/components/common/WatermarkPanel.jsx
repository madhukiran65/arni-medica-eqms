import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { WATERMARK_PRESETS } from '../../extensions/Watermark';

const COLOR_PRESETS = [
  { label: 'Slate', value: '#94a3b8' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Cyan', value: '#0ea5e9' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Pink', value: '#ec4899' },
];

const WatermarkPanel = ({ editor, isOpen, onClose, documentStatus = 'DRAFT' }) => {
  const [text, setText] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [opacity, setOpacity] = useState(15);
  const [color, setColor] = useState('#94a3b8');
  const [rotation, setRotation] = useState(-45);
  const [useCustom, setUseCustom] = useState(false);

  useEffect(() => {
    if (editor && isOpen) {
      const watermark = editor.storage.watermark;
      setText(watermark.text || '');
      setEnabled(watermark.enabled || false);
      setOpacity(Math.round((watermark.opacity || 0.15) * 100));
      setColor(watermark.color || '#94a3b8');
      setRotation(watermark.rotation || -45);
      setUseCustom(true);
    }
  }, [editor, isOpen]);

  const applyPreset = (presetKey) => {
    const preset = WATERMARK_PRESETS[presetKey];
    if (!preset) return;

    setText(preset.text);
    setOpacity(Math.round(preset.opacity * 100));
    setColor(preset.color);
    setRotation(preset.rotation);
    setEnabled(true);
    setUseCustom(false);

    editor?.commands.applyWatermarkPreset(presetKey);
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    editor?.commands.setWatermark({
      text: newText,
      enabled: newText.length > 0 ? enabled : false,
    });
  };

  const handleToggleEnabled = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    editor?.commands.setWatermark({ enabled: newEnabled });
  };

  const handleOpacityChange = (e) => {
    const newOpacity = parseInt(e.target.value, 10);
    setOpacity(newOpacity);
    editor?.commands.setWatermark({ opacity: newOpacity / 100 });
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    editor?.commands.setWatermark({ color: newColor });
  };

  const handleRotationChange = (e) => {
    const newRotation = parseInt(e.target.value, 10);
    setRotation(newRotation);
    editor?.commands.setWatermark({ rotation: newRotation });
  };

  const handleClear = () => {
    setText('');
    setEnabled(false);
    setOpacity(15);
    setColor('#94a3b8');
    setRotation(-45);
    editor?.commands.clearWatermark();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
          <h2 className="text-xl font-semibold text-slate-200">Watermark Settings</h2>
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
          {/* ENABLE/DISABLE */}
          <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700">
            <label className="text-sm font-medium text-slate-200">Enable Watermark</label>
            <button
              onClick={handleToggleEnabled}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                enabled ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* PRESET BUTTONS */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-3">
              Status Presets (for eQMS document lifecycle)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(WATERMARK_PRESETS).map((preset) => (
                <button
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  className={`px-4 py-3 rounded font-medium text-sm transition-colors ${
                    text === WATERMARK_PRESETS[preset].text && enabled
                      ? 'bg-blue-600 text-white border-2 border-blue-400'
                      : 'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* CUSTOM TEXT */}
          <div className="border-t border-slate-700 pt-4">
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Custom Text
            </label>
            <input
              type="text"
              value={text}
              onChange={handleTextChange}
              placeholder="Enter custom watermark text"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* OPACITY SLIDER */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-200">Opacity</label>
              <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-slate-400">
                {opacity}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={handleOpacityChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${opacity}%, #475569 ${opacity}%, #475569 100%)`,
              }}
            />
            <p className="text-xs text-slate-400 mt-2">
              Lower opacity is more subtle. APPROVED documents use ~8%, DRAFT uses ~15%
            </p>
          </div>

          {/* COLOR PICKER */}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-3">Color</label>
            <div className="flex gap-2 flex-wrap mb-3">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handleColorChange({ target: { value: preset.value } })}
                  className={`w-8 h-8 rounded border-2 transition-colors ${
                    color === preset.value ? 'border-white' : 'border-slate-600'
                  }`}
                  style={{ backgroundColor: preset.value }}
                  title={preset.label}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="color"
                value={color}
                onChange={handleColorChange}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={handleColorChange}
                placeholder="#94a3b8"
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
          </div>

          {/* ROTATION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-200">Rotation</label>
              <span className="text-xs font-mono bg-slate-900 px-2 py-1 rounded text-slate-400">
                {rotation}°
              </span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={rotation}
              onChange={handleRotationChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  setRotation(-45);
                  handleRotationChange({ target: { value: '-45' } });
                }}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  rotation === -45 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              >
                -45° (Default)
              </button>
              <button
                onClick={() => {
                  setRotation(0);
                  handleRotationChange({ target: { value: '0' } });
                }}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  rotation === 0 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              >
                0° (Horizontal)
              </button>
            </div>
          </div>

          {/* PREVIEW */}
          {enabled && text && (
            <div className="border-t border-slate-700 pt-4">
              <label className="block text-sm font-medium text-slate-200 mb-3">Preview</label>
              <div className="relative w-full h-32 bg-slate-900 rounded border border-slate-700 overflow-hidden flex items-center justify-center">
                <div
                  style={{
                    color: color,
                    opacity: opacity / 100,
                    transform: `rotate(${rotation}deg)`,
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    letterSpacing: '0.1em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {text}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-700 justify-between bg-slate-800">
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-900 hover:bg-red-800 text-red-100 rounded font-medium transition-colors"
          >
            Clear Watermark
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default WatermarkPanel;
