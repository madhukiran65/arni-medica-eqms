import React, { Suspense, lazy } from 'react'

const RichTextViewer = lazy(() => import('./RichTextViewer'))

export default function LazyRichTextViewer(props) {
  return (
    <Suspense
      fallback={<div className="text-slate-400 text-sm p-2">Loading content...</div>}
    >
      <RichTextViewer {...props} />
    </Suspense>
  )
}
