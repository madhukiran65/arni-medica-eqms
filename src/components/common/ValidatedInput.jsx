import React from 'react'
import { useFormContext } from 'react-hook-form'
import FormField from './FormField'

export function ValidatedInput({ name, label, type = 'text', required, placeholder, helpText, ...props }) {
  const { register, formState: { errors } } = useFormContext()
  const error = errors[name]?.message

  return (
    <FormField label={label} error={error} required={required} helpText={helpText}>
      {type === 'textarea' ? (
        <textarea
          {...register(name)}
          className={`input-field ${props.className || 'h-24'}`}
          placeholder={placeholder}
          {...props}
        />
      ) : (
        <input
          type={type}
          {...register(name)}
          className={`input-field ${props.className || ''}`}
          placeholder={placeholder}
          {...props}
        />
      )}
    </FormField>
  )
}

export function ValidatedSelect({ name, label, required, options = [], placeholder, helpText, ...props }) {
  const { register, formState: { errors } } = useFormContext()
  const error = errors[name]?.message

  return (
    <FormField label={label} error={error} required={required} helpText={helpText}>
      <select {...register(name)} className="input-field" {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </FormField>
  )
}

export function ValidatedDate({ name, label, required, helpText, ...props }) {
  const { register, formState: { errors } } = useFormContext()
  const error = errors[name]?.message

  return (
    <FormField label={label} error={error} required={required} helpText={helpText}>
      <input
        type="date"
        {...register(name)}
        className="input-field"
        {...props}
      />
    </FormField>
  )
}
