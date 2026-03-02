import React, { useState, useEffect } from 'react'
import { Plus, Search, Eye, Package, Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { productionAPI } from '../../api'
import { batchRecordSchema } from '../../validation/schemas'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import FormField from '../../components/common/FormField'

export default function Production() {
  const [batches, setBatches] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => { fetchData() }, [page, search])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [batchRes, dashRes] = await Promise.allSettled([
        productionAPI.batches?.list({ page, ...(search && { search }) }),
        productionAPI.dashboard?.(),
      ])
      if (batchRes.status === 'fulfilled') {
        setBatches(batchRes.value.data?.results || batchRes.value.data || [])
        setTotalCount(batchRes.value.data?.count || 0)
      } else if (batchRes.status === 'rejected') {
        console.error('Failed to load batches:', batchRes.reason)
      }
      if (dashRes.status === 'fulfilled' && dashRes.value) {
        setDashboard(dashRes.value.data)
      }
    } catch (err) {
      console.error('Failed to load production:', err)
      setError(err.message || 'Failed to load production data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    try {
      await productionAPI.batches?.create(formData)
      setShowCreate(false)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create batch')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Production & QA</h1>
        <p className="text-slate-400">Batch records, inspections, stability studies, and returns</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchData} className="text-red-300 hover:text-red-200 underline ml-4">Retry</button>
        </div>
      )}

      {/* Dashboard KPIs */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Package size={16} className="text-blue-400" />
              <span className="text-xs text-slate-500">Active Batches</span>
            </div>
            <p className="text-2xl font-bold">{dashboard.active_batches ?? '—'}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-green-400" />
              <span className="text-xs text-slate-500">Production Yield</span>
            </div>
            <p className="text-2xl font-bold">{dashboard.production_yield ? `${dashboard.production_yield}%` : '—'}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-purple-400" />
              <span className="text-xs text-slate-500">Pending Inspections</span>
            </div>
            <p className="text-2xl font-bold">{dashboard.pending_inspections ?? '—'}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-yellow-400" />
              <span className="text-xs text-slate-500">Stability Studies</span>
            </div>
            <p className="text-2xl font-bold">{dashboard.active_stability_studies ?? '—'}</p>
          </div>
        </div>
      )}

      <div className="card p-6 mb-6">
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 relative min-w-[250px]">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search batch records..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Batch
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : !batches.length ? (
          <EmptyState icon={Package} title="No batch records" message="Create your first batch record" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-eqms-border">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Batch ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Stage</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Batch Size</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Yield</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Start Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b) => (
                    <tr key={b.id} className="border-b border-eqms-border hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono text-blue-400">{b.batch_id || b.id}</td>
                      <td className="py-3 px-4 font-medium">{b.product_name || b.title}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={b.stage || b.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-400">{b.batch_size || '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{b.yield_percentage ? `${b.yield_percentage}%` : '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{b.production_start_date || b.created_at?.slice(0,10) || '—'}</td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => setSelected(b)}
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
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Batch Record" size="lg">
        <CreateBatchForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.product_name || 'Batch Detail'} size="lg">
        {selected && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-500">Batch ID</span>
              <p className="font-mono text-blue-400">{selected.batch_id || selected.id}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Stage</span>
              <p><StatusBadge status={selected.stage || selected.status} /></p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Product</span>
              <p className="text-sm">{selected.product_name || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Batch Size</span>
              <p className="text-sm">{selected.batch_size || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Yield</span>
              <p className="text-sm">{selected.yield_percentage ? `${selected.yield_percentage}%` : '—'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Start Date</span>
              <p className="text-sm">{selected.production_start_date || '—'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function CreateBatchForm({ onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(batchRecordSchema),
    defaultValues: { batch_number: '', product: '', planned_quantity: '', planned_start_date: '' },
    mode: 'onBlur',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Batch Number" error={errors.batch_number?.message} required>
        <input {...register('batch_number')} className={`input-field ${errors.batch_number ? 'border-red-500/50' : ''}`} placeholder="Enter batch number" />
      </FormField>
      <FormField label="Product" error={errors.product?.message} required>
        <input {...register('product')} className={`input-field ${errors.product ? 'border-red-500/50' : ''}`} placeholder="Enter product name" />
      </FormField>
      <FormField label="Planned Quantity" error={errors.planned_quantity?.message} required>
        <input type="number" {...register('planned_quantity')} className={`input-field ${errors.planned_quantity ? 'border-red-500/50' : ''}`} placeholder="Enter planned quantity" />
      </FormField>
      <FormField label="Planned Start Date" error={errors.planned_start_date?.message} required>
        <input type="date" {...register('planned_start_date')} className={`input-field ${errors.planned_start_date ? 'border-red-500/50' : ''}`} />
      </FormField>
      <div className="flex justify-end gap-2 pt-4 border-t border-eqms-border">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">Create Batch</button>
      </div>
    </form>
  )
}
