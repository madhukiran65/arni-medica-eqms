import React from 'react'
import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = 'No data found', message = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon size={48} className="text-slate-600 mb-4" />
      <h3 className="text-lg font-semibold text-slate-300 mb-1">{title}</h3>
      {message && <p className="text-sm text-slate-500 mb-4 max-w-md">{message}</p>}
      {action}
    </div>
  )
}
