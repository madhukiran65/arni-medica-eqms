import React, { useState } from 'react'
import { Plus, Search, Filter, Barcode } from 'lucide-react'

export default function UDIManagement() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">UDI Management</h1>
        <p className="text-slate-400">Manage Unique Device Identifiers (UDI) for regulatory compliance</p>
      </div>

      <div className="card p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search UDIs..."
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
            New UDI
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-eqms-border">
                <th className="text-left py-3 px-4 font-semibold text-slate-300">UDI-DI</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Product</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">UDI-PI</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Effective Date</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-300">Date Created</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-eqms-border hover:bg-eqms-input transition-colors">
                <td colSpan="6" className="py-12 px-4 text-center">
                  <Barcode size={48} className="mx-auto mb-4 text-slate-600" />
                  <p className="text-slate-500">No UDIs found. Create your first UDI to get started.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
