import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { eSignatureSchema } from '../../validation/schemas'
import { ShieldCheck, AlertTriangle } from 'lucide-react'
import FormField from './FormField'
import Modal from './Modal'

export default function ESignatureDialog({ isOpen, onClose, onSign, title, action = 'approval', loading }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(eSignatureSchema),
    defaultValues: { signing_meaning: action, comment: '' }
  })

  const onSubmitSign = (data) => {
    onSign(data)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title || 'Electronic Signature Required'} size="md">
      <div className="space-y-4">
        {/* 21 CFR Part 11 Notice */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex gap-3">
          <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-300">
            <p className="font-semibold mb-1">21 CFR Part 11 — Electronic Signature</p>
            <p>By signing below, you are applying your electronic signature which is legally binding and equivalent to a handwritten signature per §11.50 and §11.200.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmitSign)} className="space-y-4">
          <FormField label="Signing Meaning" error={errors.signing_meaning?.message} required>
            <select {...register('signing_meaning')} className="input-field">
              <option value="">Select signing reason...</option>
              <option value="approval">Approval</option>
              <option value="rejection">Rejection</option>
              <option value="review">Review</option>
              <option value="authorship">Authorship</option>
              <option value="verification">Verification</option>
            </select>
          </FormField>

          <FormField label="Password" error={errors.password?.message} required helpText="Re-enter your password to confirm identity">
            <input
              type="password"
              {...register('password')}
              className="input-field"
              placeholder="Re-enter your password"
              autoComplete="current-password"
            />
          </FormField>

          <FormField label="Comment" error={errors.comment?.message}>
            <textarea
              {...register('comment')}
              className="input-field h-20"
              placeholder="Optional comment..."
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2 border-t border-eqms-border">
            <button type="button" onClick={handleClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <ShieldCheck size={16} />
              {loading ? 'Signing...' : 'Apply Signature'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
