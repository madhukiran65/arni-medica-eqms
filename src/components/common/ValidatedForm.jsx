import React from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

export default function ValidatedForm({ schema, defaultValues, onSubmit, children, className = 'space-y-4' }) {
  const methods = useForm({
    resolver: schema ? yupResolver(schema) : undefined,
    defaultValues,
    mode: 'onBlur',
  })

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={className} noValidate>
        {typeof children === 'function' ? children(methods) : children}
      </form>
    </FormProvider>
  )
}
