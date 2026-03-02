import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { documentsAPI } from '../../api'
import { documentCreateSchema } from '../../validation/schemas'
import RichTextEditor from '../../components/common/RichTextEditor'
import FormField from '../../components/common/FormField'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { Save, Send, AlertCircle, Calendar, FileText, Tag, Folder, Layers } from 'lucide-react'
import toast from 'react-hot-toast'

const DOCUMENT_CATEGORIES = [
  { value: 'SOP', label: 'SOP (Standard Operating Procedure)' },
  { value: 'WI', label: 'WI (Work Instruction)' },
  { value: 'Form', label: 'Form' },
  { value: 'Policy', label: 'Policy' },
  { value: 'Specification', label: 'Specification' },
  { value: 'Protocol', label: 'Protocol' },
  { value: 'Report', label: 'Report' },
  { value: 'Record', label: 'Record' },
]

const DEPARTMENTS = [
  'Quality Assurance',
  'Manufacturing',
  'Regulatory Affairs',
  'Engineering',
  'Research & Development',
  'Operations',
  'Compliance',
  'Training',
]

export default function DocumentCreate() {
  const navigate = useNavigate()
  const editorRef = useRef(null)
  const [editorContent, setEditorContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [generatedDocId, setGeneratedDocId] = useState('')

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(documentCreateSchema),
    defaultValues: {
      title: '',
      document_id: '',
      category: 'SOP',
      department: 'Quality Assurance',
      review_cycle_months: 12,
      effective_date: new Date().toISOString().split('T')[0],
      description: '',
    },
  })

  const title = watch('title')
  const category = watch('category')

  // Auto-generate document ID based on title and category
  React.useEffect(() => {
    if (title && category) {
      const timestamp = Date.now().toString().slice(-5)
      const categoryCode = category.substring(0, 3).toUpperCase()
      const titleCode = title.substring(0, 2).toUpperCase()
      const generated = `${categoryCode}-${titleCode}-${timestamp}`
      setGeneratedDocId(generated)
    }
  }, [title, category])

  const handleEditorChange = (content) => {
    setEditorContent(content)
  }

  const onSubmit = async (formData) => {
    // Validate editor content
    if (!editorContent.trim() || editorContent === '<p></p>') {
      toast.error('Document content is required')
      return
    }

    const payload = {
      ...formData,
      document_id: formData.document_id || generatedDocId,
      content_html: editorContent,
      review_cycle_days: parseInt(formData.review_cycle_months) * 30,
    }

    delete payload.review_cycle_months

    return payload
  }

  const handleSaveDraft = async (formData) => {
    setSaving(true)
    try {
      const payload = await onSubmit(formData)
      if (!payload) return

      const { data } = await documentsAPI.create({
        ...payload,
        status: 'draft',
      })

      toast.success('Document saved as draft')
      navigate(`/documents/${data.id}`)
    } catch (err) {
      console.error('Failed to save draft:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to save draft'
      toast.error(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitForReview = async (formData) => {
    setSubmitting(true)
    try {
      const payload = await onSubmit(formData)
      if (!payload) return

      // Create document first
      const { data } = await documentsAPI.create({
        ...payload,
        status: 'draft',
      })

      // Submit for review
      await documentsAPI.submitForReview(data.id, {
        comment: 'Document submitted for review',
      })

      toast.success('Document submitted for review')
      navigate(`/documents/${data.id}`)
    } catch (err) {
      console.error('Failed to submit for review:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to submit for review'
      toast.error(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText size={32} className="text-blue-400" />
            <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Create New Document
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Fill in the document details and content to create a new controlled document in the EQMS.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <form onSubmit={handleSubmit(handleSaveDraft)} className="space-y-8">
          {/* Left Column: Form Fields + Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title Section */}
              <div
                className="card p-6 space-y-6"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Basic Information
                </h2>

                {/* Title */}
                <FormField
                  label="Document Title *"
                  error={errors.title?.message}
                  helpText="Enter a clear, descriptive title for the document"
                >
                  <input
                    type="text"
                    {...register('title')}
                    placeholder="e.g., Quality Management System Procedure"
                    className="input-field w-full"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                  />
                </FormField>

                {/* Document ID */}
                <FormField
                  label="Document ID *"
                  error={errors.document_id?.message}
                  helpText={
                    generatedDocId && !watch('document_id')
                      ? `Auto-generated: ${generatedDocId}`
                      : 'Leave blank to auto-generate based on title and category'
                  }
                >
                  <input
                    type="text"
                    {...register('document_id')}
                    placeholder={generatedDocId || 'e.g., SOP-QM-00123'}
                    className="input-field w-full"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                  />
                </FormField>

                {/* Category and Department */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Category *" error={errors.category?.message}>
                    <select
                      {...register('category')}
                      className="input-field w-full"
                      style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                    >
                      {DOCUMENT_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Department" error={errors.department?.message}>
                    <select
                      {...register('department')}
                      className="input-field w-full"
                      style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                {/* Description */}
                <FormField
                  label="Description *"
                  error={errors.description?.message}
                  helpText="Brief summary of the document purpose and scope"
                >
                  <textarea
                    {...register('description')}
                    placeholder="Enter a brief description of the document..."
                    rows={4}
                    className="input-field w-full resize-none"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                  />
                </FormField>
              </div>

              {/* Content Editor Section */}
              <div
                className="card p-6 space-y-4"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-blue-400" />
                  <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Document Content *
                  </h2>
                </div>
                <p style={{ color: 'var(--text-muted)' }} className="text-sm">
                  Use the rich text editor to format your document content. Supports headings, lists, tables, links, and more.
                </p>

                <RichTextEditor
                  ref={editorRef}
                  value={editorContent}
                  onChange={handleEditorChange}
                  placeholder="Enter your document content here..."
                  minHeight="400px"
                />
              </div>
            </div>

            {/* Right Sidebar: Metadata Panel */}
            <div className="space-y-6">
              {/* Review Schedule */}
              <div
                className="card p-6 space-y-4"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={18} className="text-green-400" />
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Review Schedule
                  </h3>
                </div>

                <FormField label="Effective Date *" error={errors.effective_date?.message}>
                  <input
                    type="date"
                    {...register('effective_date')}
                    className="input-field w-full"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                  />
                </FormField>

                <FormField
                  label="Review Cycle (Months) *"
                  error={errors.review_cycle_months?.message}
                  helpText="How often to review this document"
                >
                  <input
                    type="number"
                    {...register('review_cycle_months')}
                    min="1"
                    max="60"
                    className="input-field w-full"
                    style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                  />
                </FormField>

                {/* Quick Reference */}
                <div
                  className="rounded p-3 space-y-2"
                  style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-color)' }}
                >
                  <p style={{ color: 'var(--text-muted)' }} className="text-xs font-semibold">
                    QUICK INFO
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Category:</span>
                      <span style={{ color: 'var(--text-primary)' }} className="font-medium">
                        {category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                      <span style={{ color: 'var(--text-primary)' }} className="font-medium">
                        Draft
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Doc ID:</span>
                      <span style={{ color: 'var(--text-primary)' }} className="font-medium truncate">
                        {watch('document_id') || generatedDocId || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Info */}
              <div
                className="card p-4 space-y-3"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  borderLeft: '4px solid #3b82f6',
                }}
              >
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Compliance Notes
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Documents require review before publication</li>
                      <li>All changes are tracked in audit trail</li>
                      <li>Effective dates trigger training notifications</li>
                      <li>Complies with ISO 13485 & 21 CFR Part 11</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className="flex gap-4 pt-6 border-t"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <button
              type="submit"
              disabled={saving || submitting}
              className="btn-primary flex items-center gap-2"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>

            <button
              type="button"
              onClick={handleSubmit(handleSubmitForReview)}
              disabled={saving || submitting}
              className="btn-primary flex items-center gap-2"
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                color: '#4ade80',
                border: '1px solid rgba(34, 197, 94, 0.3)',
              }}
            >
              <Send size={18} />
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/documents')}
              disabled={saving || submitting}
              className="btn-secondary ml-auto"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
