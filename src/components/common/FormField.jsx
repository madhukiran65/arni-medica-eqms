import React, { useId } from 'react'

export default function FormField({ label, error, required, children, helpText, name }) {
  const autoId = useId()
  const fieldId = name || autoId
  const errorId = `${fieldId}-error`
  const helpId = `${fieldId}-help`

  return (
    <div role="group" aria-labelledby={`${fieldId}-label`}>
      <label id={`${fieldId}-label`} className="block text-sm font-medium text-slate-300 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-1" aria-hidden="true">*</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {children}
      {helpText && !error && (
        <p id={helpId} className="mt-1 text-xs text-slate-500">{helpText}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-red-400 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
