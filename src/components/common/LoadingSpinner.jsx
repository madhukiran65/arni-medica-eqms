import React from 'react'

export default function LoadingSpinner({ size = 'md', message = 'Loading...' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizes[size]}`} />
      {message && <p className="mt-3 text-sm text-slate-400">{message}</p>}
    </div>
  )
}
