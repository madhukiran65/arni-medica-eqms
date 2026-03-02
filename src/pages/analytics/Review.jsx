import React, { useState } from 'react'
import { Plus, Search, Filter, FileBarChart } from 'lucide-react'

export default function ManagementReview() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Management Review</h1>
        <p className="text-slate-400">Conduct periodic management reviews and performance evaluations</p>
      </div>

      <div className="card p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search reviews..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Filter size={18} />
            Filter
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            New Review
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-eqms-border">
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Review ID</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Participants</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Actions</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Next Review</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-eqms-border hover:bg-eqms-input transition-colors">
                <td colSpan="6" className="py-12 px-4 text-center">
                  <FileBarChart size={48} className="mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-500">No reviews found. Schedule your first management review to get started.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
