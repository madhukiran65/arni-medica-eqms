import React, { useState, useEffect } from 'react'
import { Plus, Search, Eye, GitBranch } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { changeControlsAPI } from '../../api'
import { changeControlCreateSchema } from '../../validation/schemas'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import FormField from '../../components/common/FormField'
import RichTextEditor from '../../components/common/RichTextEditor'
import RichTextViewer from '../../components/common/RichTextViewer'

export default function ChangeControls() {
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
      const { data } = await changeControlsAPI.list(params)
      setItems(data.results || data || [])
      setTotalCount(data.count || 0)
    } catch (err) {
      console.error('Failed to load change controls:', err)
      setError(err.message || 'Failed to load change controls')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    setCreating(true)
    try {
      await changeControlsAPI.create(formData)
      setShowCreate(false)
      fetchItems()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create change control')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Change Control</h1>
        <p className="text-slate-400">Manage product, process, and system changes</p>
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
              placeholder="Search change controls..."
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
            <option value="initiation">Initiation</option>
            <option value="draft">Draft</option>
            <option value="impact_assessment">Impact Assessment</option>
            <option value="approval">Approval</option>
            <option value="implementation_planning">Implementation Planning</option>
            <option value="implementation">Implementation</option>
            <option value="verification">Verification</option>
            <option value="effectiveness">Effectiveness</option>
            <option value="closure">Closure</option>
            <option value="closed">Closed</option>
          </select>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Change
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : !items.length ? (
          <EmptyState icon={GitBranch} title="No change controls found" message="Create your first change control record" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-eqms-border">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Change ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Stage</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Initiator</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Target Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-eqms-border hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono text-blue-400">{item.change_control_id || item.id}</td>
                      <td className="py-3 px-4 font-medium">{item.title}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.status || item.stage} />
                      </td>
                      <td className="py-3 px-4 text-slate-400">{item.change_type || item.type || '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{item.initiator_name || '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{item.target_date || '—'}</td>
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
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Change Control" size="lg">
        <CreateChangeForm onSubmit={handleCreate} loading={creating} onCancel={() => setShowCreate(false)} />
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title={selectedItem?.title || 'Change Control Detail'} size="lg">
        {selectedItem && <ChangeDetail change={selectedItem} onClose={() => setSelectedItem(null)} onRefresh={fetchItems} />}
      </Modal>
    </div>
  )
}

function CreateChangeForm({ onSubmit, loading, onCancel }) {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: yupResolver(changeControlCreateSchema),
    defaultValues: { title: '', description: '', change_type: 'product', justification: '' },
    mode: 'onBlur',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Title" error={errors.title?.message} required>
        <input {...register('title')} className={`input-field ${errors.title ? 'border-red-500/50' : ''}`} placeholder="Enter change title" />
      </FormField>
      <FormField label="Description" error={errors.description?.message} required helpText="Minimum 20 characters — use rich text for detailed descriptions">
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              placeholder="Describe the change details..."
              minHeight="180px"
              error={!!errors.description}
            />
          )}
        />
      </FormField>
      <FormField label="Change Type" error={errors.change_type?.message} required>
        <select {...register('change_type')} className="input-field">
          <option value="">Select type</option>
          <option value="product">Product</option>
          <option value="process">Process</option>
          <option value="system">System</option>
          <option value="documentation">Documentation</option>
          <option value="facility">Facility</option>
        </select>
      </FormField>
      <FormField label="Justification" error={errors.justification?.message} required>
        <textarea {...register('justification')} className={`input-field h-32 ${errors.justification ? 'border-red-500/50' : ''}`} placeholder="Provide justification for this change" />
      </FormField>
      <div className="flex justify-end gap-2 pt-4 border-t border-eqms-border">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Creating...' : 'Create Change'}</button>
      </div>
    </form>
  )
}

function ChangeDetail({ change, onClose, onRefresh }) {
  const [auditTrail, setAuditTrail] = useState([])
  const [tab, setTab] = useState('details')

  useEffect(() => {
    if (change.id && changeControlsAPI.auditTrail) {
      changeControlsAPI.auditTrail(change.id).then(r => setAuditTrail(r.data || [])).catch(() => {})
    }
  }, [change.id])

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
            <span className="text-xs text-slate-500">Change ID</span>
            <p className="font-mono text-blue-400">{change.change_control_id || change.id}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Stage</span>
            <p><StatusBadge status={change.status || change.stage} /></p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Type</span>
            <p className="text-sm">{change.change_type || change.type || '—'}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Target Date</span>
            <p className="text-sm">{change.target_date || '—'}</p>
          </div>
          {change.description && (
            <div className="col-span-2">
              <span className="text-xs text-slate-500">Description</span>
              <RichTextViewer content={change.description} className="mt-1" />
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

