import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { documentsAPI } from '../../api'
import RichTextEditor from '../../components/common/RichTextEditor'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { AlertCircle, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DocumentForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const editorRef = useRef(null)

  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    title: '',
    document_id: '',
    description: '',
    category: 'procedure',
    content_html: '',
    owner_id: null,
    effective_date: '',
    review_cycle_days: 365,
  })

  const [editorContent, setEditorContent] = useState('')

  useEffect(() => {
    if (id) {
      fetchDocument()
    }
  }, [id])

  const fetchDocument = async () => {
    try {
      const { data } = await documentsAPI.get(id)
      setFormData({
        title: data.title || '',
        document_id: data.document_id || '',
        description: data.description || '',
        category: data.category || 'procedure',
        content_html: data.content_html || '',
        owner_id: data.owner_id || null,
        effective_date: data.effective_date ? data.effective_date.split('T')[0] : '',
        review_cycle_days: data.review_cycle_days || 365,
      })
      setEditorContent(data.content_html || '')
    } catch (err) {
      console.error('Failed to load document:', err)
      toast.error('Failed to load document')
      navigate('/documents')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.document_id.trim()) {
      newErrors.document_id = 'Document ID is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!editorContent.trim() || editorContent === '<p></p>') {
      newErrors.content_html = 'Content is required'
    }
    if (!formData.effective_date) {
      newErrors.effective_date = 'Effective date is required'
    }
    if (formData.review_cycle_days < 1) {
      newErrors.review_cycle_days = 'Review cycle must be at least 1 day'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handleEditorChange = (content) => {
    setEditorContent(content)
    if (errors.content_html) {
      setErrors((prev) => ({
        ...prev,
        content_html: undefined,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors below')
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...formData,
        content_html: editorContent,
      }

      if (id) {
        await documentsAPI.update(id, payload)
        toast.success('Document updated successfully')
      } else {
        const { data } = await documentsAPI.create(payload)
        toast.success('Document created successfully')
        navigate(`/documents/${data.id}`)
        return
      }

      navigate('/documents')
    } catch (err) {
      console.error('Failed to save document:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to save document'
      toast.error(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    navigate('/documents')
  }

  if (loading) {
    return <LoadingSpinner message="Loading document..." />
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {id ? 'Edit Document' : 'Create New Document'}
        </h1>
        <p className="text-slate-400">
          {id ? 'Update the document details and content' : 'Fill in the document details to create a new controlled document'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="card p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-200">
              Document Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Quality Management System Procedure"
              className={`input-field w-full ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                <AlertCircle size={16} />
                {errors.title}
              </div>
            )}
          </div>

          {/* Document ID */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-200">
              Document ID *
            </label>
            <input
              type="text"
              name="document_id"
              value={formData.document_id}
              onChange={handleInputChange}
              placeholder="e.g., DOC-2026-001"
              className={`input-field w-full ${errors.document_id ? 'border-red-500' : ''}`}
            />
            {errors.document_id && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                <AlertCircle size={16} />
                {errors.document_id}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-200">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the document purpose"
              className={`input-field w-full h-24 resize-none ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                <AlertCircle size={16} />
                {errors.description}
              </div>
            )}
          </div>

          {/* Category and Review Cycle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-200">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input-field w-full"
              >
                <option value="procedure">Procedure</option>
                <option value="work_instruction">Work Instruction</option>
                <option value="form">Form</option>
                <option value="specification">Specification</option>
                <option value="drawing">Drawing</option>
                <option value="quality_manual">Quality Manual</option>
                <option value="policy">Policy</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-200">
                Review Cycle (Days) *
              </label>
              <input
                type="number"
                name="review_cycle_days"
                value={formData.review_cycle_days}
                onChange={handleInputChange}
                min="1"
                className={`input-field w-full ${errors.review_cycle_days ? 'border-red-500' : ''}`}
              />
              {errors.review_cycle_days && (
                <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                  <AlertCircle size={16} />
                  {errors.review_cycle_days}
                </div>
              )}
            </div>
          </div>

          {/* Effective Date */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-200">
              Effective Date *
            </label>
            <input
              type="date"
              name="effective_date"
              value={formData.effective_date}
              onChange={handleInputChange}
              className={`input-field w-full ${errors.effective_date ? 'border-red-500' : ''}`}
            />
            {errors.effective_date && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                <AlertCircle size={16} />
                {errors.effective_date}
              </div>
            )}
          </div>

          {/* Rich Text Content Editor */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-200">
              Document Content *
            </label>
            <p className="text-xs text-slate-400 mb-3">
              Use the toolbar to format your document content. Support for text formatting, headings, lists, links, tables, and more.
            </p>
            <RichTextEditor
              ref={editorRef}
              value={editorContent}
              onChange={handleEditorChange}
              placeholder="Enter your document content here..."
              minHeight="300px"
              error={!!errors.content_html}
            />
            {errors.content_html && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                <AlertCircle size={16} />
                {errors.content_html}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-eqms-border">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={18} />
              {saving ? 'Saving...' : id ? 'Update Document' : 'Create Document'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="btn-secondary flex items-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
