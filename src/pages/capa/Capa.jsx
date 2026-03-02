import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, Eye, Edit3, ChevronRight, Target } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { capaCreateSchema } from '../../validation/schemas'
import { capaAPI } from '../../api'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import FormField from '../../components/common/FormField'
import RichTextEditor from '../../components/common/RichTextEditor'
import RichTextViewer from '../../components/common/RichTextViewer'

export default function Capa() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedItem, setSelectedItem] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetchItems() }, [page, search, statusFilter])

  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = { page, ...(search && { search }), ...(statusFilter && { status: statusFilter }) }
      const { data } = await capaAPI.list(params)
      setItems(data.results || data || [])
      setTotalCount(data.count || 0)
    } catch (err) {
      console.error('Failed to load CAPA records:', err)
      setError(err.message || 'Failed to load CAPA records')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    setCreating(true)
    try {
      await capaAPI.create(formData)
      setShowCreate(false)
      fetchItems()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create CAPA')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CAPA (Corrective & Preventive Actions)</h1>
        <p className="text-slate-400">Manage corrective and preventive action records with 9-stage lifecycle</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchItems} className="text-red-300 hover:text-red-200 underline ml-4">Retry</button>
        </div>
      )}

      <div className="card p-6 mb-6">
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 relative min-w-[250px]">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search CAPA records..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} 
            className="input-field w-auto"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigation">Investigation</option>
            <option value="root_cause">Root Cause</option>
            <option value="action_plan">Action Plan</option>
            <option value="implementation">Implementation</option>
            <option value="verification">Verification</option>
            <option value="closure">Closure</option>
            <option value="closed">Closed</option>
          </select>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New CAPA
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : !items.length ? (
          <EmptyState icon={Target} title="No CAPA records found" message="Create your first CAPA record" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-eqms-border">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">CAPA ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Stage</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Priority</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Assigned To</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Due Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-eqms-border hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono text-blue-400">{item.capa_id || item.id}</td>
                      <td className="py-3 px-4 font-medium">{item.title}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.status || item.stage} />
                      </td>
                      <td className="py-3 px-4 text-slate-400">{item.priority || '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{item.assigned_to_name || '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{item.due_date || '—'}</td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => setSelectedItem(item)}
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
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New CAPA" size="lg">
        <CreateCapaForm onSubmit={handleCreate} loading={creating} onCancel={() => setShowCreate(false)} />
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title={selectedItem?.title || 'CAPA Detail'} size="lg">
        {selectedItem && <CapaDetail capa={selectedItem} onClose={() => setSelectedItem(null)} onRefresh={fetchItems} />}
      </Modal>
    </div>
  )
}

function CreateCapaForm({ onSubmit, loading, onCancel }) {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: yupResolver(capaCreateSchema),
    defaultValues: { title: '', description: '', priority: 'medium', source: '' },
    mode: 'onBlur',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Title" error={errors.title?.message} required>
        <input {...register('title')} className={`input-field ${errors.title ? 'border-red-500/50' : ''}`} placeholder="Enter CAPA title (min 5 characters)" />
      </FormField>

      <FormField label="Priority" error={errors.priority?.message} required>
        <select {...register('priority')} className="input-field">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </FormField>

      <FormField label="Source" error={errors.source?.message}>
        <select {...register('source')} className="input-field">
          <option value="">Select source...</option>
          <option value="audit">Audit Finding</option>
          <option value="complaint">Customer Complaint</option>
          <option value="deviation">Deviation</option>
          <option value="inspection">Regulatory Inspection</option>
          <option value="management_review">Management Review</option>
          <option value="other">Other</option>
        </select>
      </FormField>

      <FormField label="Description" error={errors.description?.message} required helpText="Minimum 20 characters — use rich text for detailed descriptions">
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              placeholder="Describe the corrective/preventive action needed..."
              minHeight="180px"
              error={!!errors.description}
            />
          )}
        />
      </FormField>

      <div className="flex justify-end gap-2 pt-4 border-t border-eqms-border">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Creating...' : 'Create CAPA'}</button>
      </div>
    </form>
  )
}

function CapaDetail({ capa, onClose, onRefresh }) {
  const [auditTrail, setAuditTrail] = useState([])
  const [tab, setTab] = useState('details')

  useEffect(() => {
    if (capa.id && capaAPI.auditTrail) {
      capaAPI.auditTrail(capa.id).then(r => setAuditTrail(r.data || [])).catch(() => {})
    }
  }, [capa.id])

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-eqms-border pb-2">
        {['details', 'audit_trail'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 text-sm rounded ${tab === t ? 'bg-blue-500/10 text-blue-400 font-medium' : 'text-slate-400 hover:text-slate-300'}`}>
            {t === 'details' ? 'Details' : 'Audit Trail'}
          </button>
        ))}
      </div>

      {tab === 'details' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-slate-500">CAPA ID</span>
            <p className="font-mono text-blue-400">{capa.capa_id || capa.id}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Stage</span>
            <p><StatusBadge status={capa.status || capa.stage} /></p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Priority</span>
            <p className="text-sm">{capa.priority || '—'}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Due Date</span>
            <p className="text-sm">{capa.due_date || '—'}</p>
          </div>
          {capa.description && (
            <div className="col-span-2">
              <span className="text-xs text-slate-500">Description</span>
              <RichTextViewer content={capa.description} className="mt-1" />
            </div>
          )}
        </div>
      )}

      {tab === 'audit_trail' && (
        <div className="space-y-2">
          {auditTrail.length ? auditTrail.map((entry, i) => (
            <div key={i} className="p-3 bg-slate-800 rounded text-sm border border-slate-700">
              <div className="flex justify-between mb-1">
                <span className="font-medium">{entry.action}</span>
                <span className="text-xs text-slate-500">{new Date(entry.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-slate-400 text-xs">{entry.user} — {entry.details}</p>
            </div>
          )) : <p className="text-sm text-slate-500">No audit trail entries</p>}
        </div>
      )}
    </div>
  )
}

