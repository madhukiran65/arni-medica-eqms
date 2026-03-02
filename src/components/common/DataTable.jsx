import React from 'react'
import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'

export default function DataTable({ columns, data, loading, onRowClick, emptyTitle, emptyMessage }) {
  if (loading) return <LoadingSpinner />
  if (!data?.length) return <EmptyState title={emptyTitle} message={emptyMessage} />

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-eqms-border">
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-eqms-border">
          {data.map((row, ri) => (
            <tr
              key={row.id || ri}
              onClick={() => onRowClick?.(row)}
              className={`hover:bg-eqms-input transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col, ci) => (
                <td key={ci} className="px-4 py-3 text-sm text-slate-300">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
