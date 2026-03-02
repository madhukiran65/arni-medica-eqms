import React, { useState, useEffect } from 'react'
import { FileText, X, BookOpen, Plus } from 'lucide-react'
import { COVER_PAGE_TEMPLATES } from '../../extensions/CoverPage'

const CoverPagePanel = ({ editor, isOpen, onClose, documentData }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('STANDARD')
  const [formData, setFormData] = useState({
    title: documentData?.title || '',
    subtitle: '',
    author: documentData?.author || '',
    date: new Date().toLocaleDateString(),
    documentNumber: documentData?.documentNumber || '',
    revision: documentData?.revision || '0',
    companyName: 'Arni Medica',
    department: documentData?.department || '',
  })

  const [previewHtml, setPreviewHtml] = useState('')

  // Update preview when template or form data changes
  useEffect(() => {
    const template = COVER_PAGE_TEMPLATES[selectedTemplate]
    if (template) {
      setPreviewHtml(template.generateHTML(formData))
    }
  }, [selectedTemplate, formData])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleInsertCoverPage = () => {
    if (!editor) {
      console.error('Editor not available')
      return
    }

    if (!formData.title.trim()) {
      alert('Please enter a document title')
      return
    }

    // Set cover page in extension
    editor.commands.setCoverPage(selectedTemplate, formData)

    // Insert cover page into document
    editor.commands.insertCoverPage()

    onClose()
  }

  const handleClearCoverPage = () => {
    if (!editor) return

    editor.commands.clearCoverPage()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="w-full max-w-2xl bg-slate-800 border-t border-slate-700 rounded-t-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-slate-200">Cover Page Designer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Select Template
            </label>
            <div className="grid grid-cols-1 gap-3">
              {Object.entries(COVER_PAGE_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTemplate(key)}
                  className={`p-4 rounded-lg text-left transition-all border ${
                    selectedTemplate === key
                      ? 'bg-blue-900 border-blue-500 shadow-lg'
                      : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-slate-100">{template.name}</div>
                      <div className="text-sm text-slate-400 mt-1">{template.description}</div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 ${
                        selectedTemplate === key
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-slate-500'
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Document Information
            </h3>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter document title"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Subtitle
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="Optional subtitle"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Author / Prepared By
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="Your name"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={(e) => {
                  // Convert date object back to localized string for display
                  const selected = new Date(e.target.value)
                  const dateString = selected.toLocaleDateString()
                  setFormData((prev) => ({
                    ...prev,
                    date: dateString,
                  }))
                }}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Document Number */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Document Number
              </label>
              <input
                type="text"
                name="documentNumber"
                value={formData.documentNumber}
                onChange={handleInputChange}
                placeholder="e.g., DOC-2024-001"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Revision */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Revision
              </label>
              <input
                type="text"
                name="revision"
                value={formData.revision}
                onChange={handleInputChange}
                placeholder="e.g., 1.0"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Company name"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g., Quality Assurance"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Preview</h3>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 max-h-64 overflow-y-auto">
              <div
                className="bg-white rounded text-black text-xs leading-tight"
                dangerouslySetInnerHTML={{
                  __html: previewHtml,
                }}
                style={{
                  transform: 'scale(0.6)',
                  transformOrigin: 'top left',
                  width: '166.67%',
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <button
              onClick={handleInsertCoverPage}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Insert Cover Page
            </button>
            <button
              onClick={handleClearCoverPage}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Cover Page
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default CoverPagePanel
