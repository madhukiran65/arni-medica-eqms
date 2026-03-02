import React, { useState, useEffect } from 'react'
import { Plus, Search, Eye, Target } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { riskAPI } from '../../api'
import { riskAssessmentSchema } from '../../validation/schemas'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import FormField from '../../components/common/FormField'

export default function Risk() {
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => { fetchAssessments() }, [page, search])

  const fetchAssessments = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await riskAPI.assessments?.list({ page, ...(search && { search }) })
      setAssessments(data?.results || data || [])
      setTotalCount(data?.count || 0)
    } catch (err) {
      console.error('Failed to load risk assessments:', err)
      setError(err.message || 'Failed to load risk assessments')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    try {
      await riskAPI.assessments?.create(formData)
      setShowCreate(false)
      fetchAssessments()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create assessment')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Risk Management</h1>
        <p className="text-slate-400">ISO 14971 risk assessments, design control, FMEA</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchAssessments} className="text-red-300 hover:text-red-200 underline ml-4">Retry</button>
        </div>
      )}

      <div className="card p-6 mb-6">
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 relative min-w-[250px]">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search risk assessments..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Assessment
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : !assessments.length ? (
          <EmptyState icon={Target} title="No risk assessments" message="Create your first risk assessment" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-eqms-border">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Assessment ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Risk Level</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((a) => (
                    <tr key={a.id} className="border-b border-eqms-border hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono text-blue-400">{a.assessment_id || a.id}</td>
                      <td className="py-3 px-4 font-medium">{a.title}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold px-2 py-1 rounded text-xs ${
                          a.overall_risk_level === 'unacceptable' ? 'bg-red-500/20 text-red-400' :
                          a.overall_risk_level === 'alarp' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {a.overall_risk_level || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{a.product_name || '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{a.created_at?.slice(0,10) || '—'}</td>
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
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Risk Assessment" size="lg">
        <CreateRiskForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.title || 'Risk Assessment Detail'} size="lg">
        {selected && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-500">Assessment ID</span>
              <p className="font-mono text-blue-400">{selected.assessment_id || selected.id}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Status</span>
              <p><StatusBadge status={selected.status} /></p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Risk Level</span>
              <p className="font-semibold">{selected.overall_risk_level || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Product</span>
              <p className="text-sm">{selected.product_name || '—'}</p>
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

function CreateRiskForm({ onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(riskAssessmentSchema),
    defaultValues: { title: '', description: '', risk_category: '', product: '' },
    mode: 'onBlur',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Title" error={errors.title?.message} required>
        <input {...register('title')} className={`input-field ${errors.title ? 'border-red-500/50' : ''}`} placeholder="Enter risk assessment title" />
      </FormField>
      <FormField label="Description" error={errors.description?.message} required>
        <textarea {...register('description')} className={`input-field h-32 ${errors.description ? 'border-red-500/50' : ''}`} placeholder="Describe the risk assessment" />
      </FormField>
      <FormField label="Risk Category" error={errors.risk_category?.message} required>
        <input {...register('risk_category')} className={`input-field ${errors.risk_category ? 'border-red-500/50' : ''}`} placeholder="Enter risk category" />
      </FormField>
      <FormField label="Product" error={errors.product?.message}>
        <input {...register('product')} className={`input-field ${errors.product ? 'border-red-500/50' : ''}`} placeholder="Enter product (optional)" />
      </FormField>
      <div className="flex justify-end gap-2 pt-4 border-t border-eqms-border">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">Create Assessment</button>
      </div>
    </form>
  )
}
