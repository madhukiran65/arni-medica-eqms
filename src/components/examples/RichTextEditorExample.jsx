import React, { useState } from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import RichTextEditor from '../common/RichTextEditor'
import RichTextViewer from '../common/RichTextViewer'
import FormField from '../common/FormField'

// Example validation schema
const documentSchema = yup.object().shape({
  title: yup.string().required('Title is required').min(3),
  description: yup.string().required('Description is required').min(10),
  notes: yup.string().optional(),
})

/**
 * Example component showing how to use RichTextEditor with React Hook Form
 * This demonstrates:
 * - Form validation with yup
 * - Rich text editor integration
 * - Displaying saved content with RichTextViewer
 */
export function DocumentEditForm({ onSubmit = null, initialData = null }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [savedContent, setSavedContent] = useState(null)

  const methods = useForm({
    resolver: yupResolver(documentSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      notes: '',
    },
  })

  const { control, formState: { errors }, watch } = methods
  const watchDescription = watch('description')
  const watchNotes = watch('notes')

  const handleSubmit = async (data) => {
    try {
      setIsSubmitting(true)
      if (onSubmit) {
        await onSubmit(data)
      }
      // Simulate save and show preview
      setSavedContent(data)
      setShowPreview(true)
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {showPreview && savedContent ? (
        // Preview Mode
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-100">Document Preview</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="btn-secondary"
            >
              Back to Edit
            </button>
          </div>

          <div className="card p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Title</h3>
              <p className="text-slate-300">{savedContent.title}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Description</h3>
              <RichTextViewer content={savedContent.description} className="mt-2" />
            </div>

            {savedContent.notes && (
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Additional Notes</h3>
                <RichTextViewer content={savedContent.notes} className="mt-2" />
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-eqms-border">
              <button className="btn-primary" onClick={() => setShowPreview(false)}>
                Continue Editing
              </button>
              <button className="btn-secondary" onClick={() => console.log('Save document', savedContent)}>
                Confirm and Save
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Edit Mode
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 mb-6">Edit Document</h2>
            </div>

            {/* Title Field */}
            <FormField
              label="Document Title"
              error={errors.title?.message}
              required
            >
              <input
                type="text"
                {...methods.register('title')}
                className="input-field"
                placeholder="Enter document title"
              />
            </FormField>

            {/* Description Field with Rich Text Editor */}
            <FormField
              label="Description"
              error={errors.description?.message}
              required
              helpText="Use formatting options to structure your content"
            >
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    {...field}
                    placeholder="Enter document description (required)..."
                    minHeight="400px"
                    error={!!errors.description}
                  />
                )}
              />
            </FormField>

            {/* Notes Field with Rich Text Editor */}
            <FormField
              label="Additional Notes"
              error={errors.notes?.message}
              helpText="Optional - add any additional information"
            >
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    {...field}
                    placeholder="Add optional notes..."
                    minHeight="250px"
                  />
                )}
              />
            </FormField>

            {/* Content Preview in Real-time */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Content Preview</h3>
              <div className="space-y-4">
                {watchDescription && (
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Description Preview:</p>
                    <div className="bg-eqms-dark p-4 rounded border border-eqms-border">
                      <RichTextViewer content={watchDescription} />
                    </div>
                  </div>
                )}
                {watchNotes && (
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Notes Preview:</p>
                    <div className="bg-eqms-dark p-4 rounded border border-eqms-border">
                      <RichTextViewer content={watchNotes} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t border-eqms-border">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save & Preview'}
              </button>
              <button
                type="reset"
                className="btn-secondary"
              >
                Reset Form
              </button>
            </div>
          </form>
        </FormProvider>
      )}
    </div>
  )
}

/**
 * Example showing standalone editor usage without React Hook Form
 */
export function SimpleRichTextExample() {
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState('')

  const handleSave = () => {
    setSaved(content)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Editor</h3>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Type or paste content..."
          minHeight="300px"
        />
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave} className="btn-primary">
          Save Content
        </button>
        <button onClick={() => setContent('')} className="btn-secondary">
          Clear
        </button>
      </div>

      {saved && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Saved Content</h3>
          <RichTextViewer content={saved} />
        </div>
      )}
    </div>
  )
}

export default DocumentEditForm
