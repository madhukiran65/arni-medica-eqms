import React, { useState, useEffect } from 'react'
import { Plus, Search, Eye, Shield } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { auditsAPI } from '../../api'
import { auditCreateSchema } from '../../validation/schemas'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import FormField from '../../components/common/FormField'

export default function Audits() {
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => { fetchAudits() }, [page, search])

  const fetchAudits = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await auditsAPI.list({ page, ...(search && { search }) })
      setAudits(data.results || data || [])
      setTotalCount(data.count || 0)
    } catch (err) {
      console.error('Failed to load audits:', err)
      setError(err.message || 'Failed to load audits')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    try {
      await auditsAPI.create(formData)
      setShowCreate(false)
      fetchAudits()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create audit')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Audit Management</h1>
        <p className="text-slate-400">Internal and external audits, audit readiness</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchAudits} className="text-red-300 hover:text-red-200 underline ml-4">Retry</button>
        </div>
      )}

      <div className="card p-6 mb-6">
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 relative min-w-[250px]">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search audits..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Audit
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : !audits.length ? (
          <EmptyState icon={Shield} title="No audits found" message="Schedule your first audit" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-eqms-border">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Audit ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Lead Auditor</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map((a) => (
                    <tr key={a.id} className="border-b border-eqms-border hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono text-blue-400">{a.audit_id || a.id}</td>
                      <td className="py-3 px-4 font-medium">{a.title}</td>
                      <td className="py-3 px-4 text-slate-400">{a.audit_type || '—'}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-400">{a.lead_auditor_name || '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{a.scheduled_date || a.start_date || '—'}</td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => setSelected(a)}
                          className="p-2 rounded hover:bg-slate-700 transition"
                        >
                          <Eye size={16} className="text-slate-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalCount={totalCount} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Audit" size="lg">
        <CreateAuditForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title || 'Audit Detail'} size="lg">
        {selected && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-500">Audit ID</span>
              <p className="font-mono text-blue-400">{selected.audit_id || selected.id}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Status</span>
              <p><StatusBadge status={selected.status} /></p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Type</span>
              <p className="text-sm">{selected.audit_type || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Date</span>
              <p className="text-sm">{selected.scheduled_date || selected.start_date || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Lead Auditor</span>
              <p className="text-sm">{selected.lead_auditor_name || '—'}</p>
            </div>
            {selected.description && (
              <div className="col-span-2">
                <span className="text-xs text-slate-500">Description</span>
                <p className="text-sm text-slate-300 mt-1">{selected.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

function CreateAuditForm({ onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(auditCreateSchema),
    defaultValues: { title: '', audit_type: 'internal', scope: '', planned_start_date: '', planned_end_date: '' },
    mode: 'onBlur',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Title" error={errors.title?.message} required>
        <input {...register('title')} className={`input-field ${errors.title ? 'border-red-500/50' : ''}`} placeholder="Enter audit title" />
      </FormField>
      <FormField label="Audit Type" error={errors.audit_type?.message} required>
        <select {...register('audit_type')} className="input-field">
          <option value="">Select type</option>
          <option value="internal">Internal</option>
          <option value="external">External</option>
          <option value="supplier">Supplier</option>
          <option value="regulatory">Regulatory</option>
        </select>
      </FormField>
      <FormField label="Scope" error={errors.scope?.message} required>
        <input {...register('scope')} className={`input-field ${errors.scope ? 'border-red-500/50' : ''}`} placeholder="Enter audit scope" />
      </FormField>
      <FormField label="Planned Start Date" error={errors.planned_start_date?.message} required>
        <input type="date" {...register('planned_start_date')} className={`input-field ${errors.planned_start_date ? 'border-red-500/50' : ''}`} />
      </FormField>
      <FormField label="Planned End Date" error={errors.planned_end_date?.message} required>
        <input type="date" {...register('planned_end_date')} className={`input-field ${errors.planned_end_date ? 'border-red-500/50' : ''}`} />
      </FormField>
      <div className="flex justify-end gap-2 pt-4 border-t border-eqms-border">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">Create Audit</button>
      </div>
    </form>
  )
}
