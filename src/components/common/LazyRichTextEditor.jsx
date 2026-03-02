import React, { Suspense, lazy } from 'react'
import LoadingSpinner from './LoadingSpinner'

// Lazy-load the heavy TipTap editor (reduces initial bundle by ~400KB)
const RichTextEditor = lazy(() => import('./RichTextEditor'))

export default function LazyRichTextEditor(props) {
  return (
    <Suspense
      fallback={
        <div className="border border-eqms-border rounded-lg p-4 min-h-[200px] flex items-center justify-center bg-eqms-input">
          <LoadingSpinner message="Loading editor..." />
        </div>
      }
    >
      <RichTextEditor {...props} />
    </Suspense>
  )
}
