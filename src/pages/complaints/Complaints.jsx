import React, { useState, useEffect } from 'react'
import { Plus, Search, Eye, MessageSquare } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { complaintsAPI } from '../../api'
import { complaintCreateSchema } from '../../validation/schemas'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import FormField from '../../components/common/FormField'
import RichTextEditor from '../../components/common/RichTextEditor'
import RichTextViewer from '../../components/common/RichTextViewer'

export default function Complaints() {
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
      const { data } = await complaintsAPI.list(params)
      setItems(data.results || data || [])
      setTotalCount(data.count || 0)
    } catch (err) {
      console.error('Failed to load complaints:', err)
      setError(err.message || 'Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    setCreating(true)
    try {
      await complaintsAPI.create(formData)
      setShowCreate(false)
      fetchItems()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create complaint')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Complaints & PMS</h1>
        <p className="text-slate-400">Manage customer complaints and post-market surveillance</p>
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
              placeholder="Search complaints..."
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
            <option value="received">Received</option>
            <option value="assessment">Assessment</option>
            <option value="investigation">Investigation</option>
            <option value="action">Action</option>
            <option value="closure">Closure</option>
            <option value="closed">Closed</option>
          </select>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Complaint
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : !items.length ? (
          <EmptyState icon={MessageSquare} title="No complaints found" message="Create your first complaint record" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-eqms-border">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Complaint ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Subject</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Severity</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Received From</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Date Received</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-eqms-border hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono text-blue-400">{item.complaint_id || item.id}</td>
                      <td className="py-3 px-4 font-medium">{item.subject || item.title}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-400">{item.severity || '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{item.received_from || item.customer_name || '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{item.date_received || item.created_at?.slice(0,10) || '—'}</td>
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
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Complaint" size="lg">
        <CreateComplaintForm onSubmit={handleCreate} loading={creating} onCancel={() => setShowCreate(false)} />
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title={selectedItem?.subject || 'Complaint Detail'} size="lg">
        {selectedItem && <ComplaintDetail complaint={selectedItem} onClose={() => setSelectedItem(null)} onRefresh={fetchItems} />}
      </Modal>
    </div>
  )
}

function CreateComplaintForm({ onSubmit, loading, onCancel }) {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: yupResolver(complaintCreateSchema),
    defaultValues: { title: '', description: '', complaint_source: '', product: '', severity: 'medium', received_date: '' },
    mode: 'onBlur',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Title" error={errors.title?.message} required>
        <input {...register('title')} className={`input-field ${errors.title ? 'border-red-500/50' : ''}`} placeholder="Enter complaint title" />
      </FormField>
      <FormField label="Description" error={errors.description?.message} required helpText="Minimum 20 characters — use rich text for detailed descriptions">
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              placeholder="Describe the complaint details..."
              minHeight="180px"
              error={!!errors.description}
            />
          )}
        />
      </FormField>
      <FormField label="Complaint Source" error={errors.complaint_source?.message} required>
        <input {...register('complaint_source')} className={`input-field ${errors.complaint_source ? 'border-red-500/50' : ''}`} placeholder="Enter complaint source" />
      </FormField>
      <FormField label="Product" error={errors.product?.message} required>
        <input {...register('product')} className={`input-field ${errors.product ? 'border-red-500/50' : ''}`} placeholder="Enter product name" />
      </FormField>
      <FormField label="Severity" error={errors.severity?.message} required>
        <select {...register('severity')} className="input-field">
          <option value="">Select severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </FormField>
      <FormField label="Received Date" error={errors.received_date?.message} required>
        <input type="date" {...register('received_date')} className={`input-field ${errors.received_date ? 'border-red-500/50' : ''}`} />
      </FormField>
      <div className="flex justify-end gap-2 pt-4 border-t border-eqms-border">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Creating...' : 'Create Complaint'}</button>
      </div>
    </form>
  )
}

function ComplaintDetail({ complaint, onClose, onRefresh }) {
  const [auditTrail, setAuditTrail] = useState([])
  const [tab, setTab] = useState('details')

  useEffect(() => {
    if (complaint.id && complaintsAPI.auditTrail) {
      complaintsAPI.auditTrail(complaint.id).then(r => setAuditTrail(r.data || [])).catch(() => {})
    }
  }, [complaint.id])

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
            <span className="text-xs text-slate-500">Complaint ID</span>
            <p className="font-mono text-blue-400">{complaint.complaint_id || complaint.id}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Status</span>
            <p><StatusBadge status={complaint.status} /></p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Severity</span>
            <p className="text-sm">{complaint.severity || '—'}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Date Received</span>
            <p className="text-sm">{complaint.date_received || '—'}</p>
          </div>
          {complaint.description && (
            <div className="col-span-2">
              <span className="text-xs text-slate-500">Description</span>
              <RichTextViewer content={complaint.description} className="mt-1" />
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

