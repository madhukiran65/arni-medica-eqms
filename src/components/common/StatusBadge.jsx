import React from 'react'

const STATUS_STYLES = {
  // Document statuses
  draft: { bg: 'bg-slate-500/10', text: 'text-slate-400', label: 'Draft' },
  under_review: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'In Review' },
  approved: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Approved' },
  effective: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Effective' },
  obsolete: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Obsolete' },
  // CAPA / Quality Event statuses
  open: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Open' },
  investigation: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Investigation' },
  action_plan: { bg: 'bg-purple-500/10', text: 'text-purple-400', label: 'Action Plan' },
  implementation: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', label: 'Implementation' },
  verification: { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'Verification' },
  effectiveness: { bg: 'bg-teal-500/10', text: 'text-teal-400', label: 'Effectiveness' },
  closed: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Closed' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Rejected' },
  // Production
  in_production: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'In Production' },
  qa_review: { bg: 'bg-purple-500/10', text: 'text-purple-400', label: 'QA Review' },
  released: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Released' },
  on_hold: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'On Hold' },
  // Supplier
  qualified: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Qualified' },
  probation: { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'Probation' },
  disqualified: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Disqualified' },
  // Generic
  active: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Active' },
  pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Pending' },
  completed: { bg: 'bg-green-500/10', text: 'text-green-400', label: 'Completed' },
  overdue: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Overdue' },
  cancelled: { bg: 'bg-slate-500/10', text: 'text-slate-400', label: 'Cancelled' },
}

export default function StatusBadge({ status, className = '' }) {
  const style = STATUS_STYLES[status] || { bg: 'bg-slate-500/10', text: 'text-slate-400', label: status?.replace(/_/g, ' ') }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${style.bg} ${style.text} ${className}`}>
      {style.label}
    </span>
  )
}
