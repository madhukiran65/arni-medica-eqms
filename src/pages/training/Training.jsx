import React, { useState, useEffect } from 'react'
import { Plus, Search, Eye, BookOpen, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { trainingAPI } from '../../api'
import { trainingCourseSchema } from '../../validation/schemas'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import FormField from '../../components/common/FormField'

export default function Training() {
  const [records, setRecords] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)

  useEffect(() => { fetchData() }, [page, search])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [recordsRes, dashRes] = await Promise.allSettled([
        trainingAPI.list({ page, ...(search && { search }) }),
        trainingAPI.dashboard?.(),
      ])
      if (recordsRes.status === 'fulfilled') {
        setRecords(recordsRes.value.data?.results || recordsRes.value.data || [])
        setTotalCount(recordsRes.value.data?.count || 0)
      } else if (recordsRes.status === 'rejected') {
        console.error('Failed to load training records:', recordsRes.reason)
      }
      if (dashRes.status === 'fulfilled' && dashRes.value) {
        setDashboard(dashRes.value.data)
      }
    } catch (err) {
      console.error('Failed to load training:', err)
      setError(err.message || 'Failed to load training data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    try {
      await trainingAPI.create(formData)
      setShowCreate(false)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create training')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Training Management</h1>
        <p className="text-slate-400">Track employee training and competency records</p>
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
              <BookOpen size={16} className="text-blue-400" />
              <span className="text-xs text-slate-500">Total Records</span>
            </div>
            <p className="text-2xl font-bold">{dashboard.total_records ?? '—'}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-xs text-slate-500">Completed</span>
            </div>
            <p className="text-2xl font-bold">{dashboard.completed ?? '—'}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-yellow-400" />
              <span className="text-xs text-slate-500">In Progress</span>
            </div>
            <p className="text-2xl font-bold">{dashboard.in_progress ?? '—'}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-red-400" />
              <span className="text-xs text-slate-500">Overdue</span>
            </div>
            <p className="text-2xl font-bold">{dashboard.overdue ?? '—'}</p>
          </div>
        </div>
      )}

      <div className="card p-6 mb-6">
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 relative min-w-[250px]">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search training records..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Training
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : !records.length ? (
          <EmptyState icon={BookOpen} title="No training records" message="Create your first training record" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-eqms-border">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Training ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Trainee</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Due Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-b border-eqms-border hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono text-blue-400">{r.training_id || r.id}</td>
                      <td className="py-3 px-4 font-medium">{r.title}</td>
                      <td className="py-3 px-4 text-slate-400">{r.training_type || '—'}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-400">{r.trainee_name || r.assignee_name || '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{r.due_date || '—'}</td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => setSelectedRecord(r)}
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
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Training Record" size="lg">
        <CreateTrainingForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedRecord} onClose={() => setSelectedRecord(null)} title={selectedRecord?.title || 'Training Detail'} size="lg">
        {selectedRecord && <TrainingDetail training={selectedRecord} onClose={() => setSelectedRecord(null)} onRefresh={fetchData} />}
      </Modal>
    </div>
  )
}

function CreateTrainingForm({ onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(trainingCourseSchema),
    defaultValues: { title: '', description: '', training_type: 'classroom', duration_hours: '' },
    mode: 'onBlur',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Title" error={errors.title?.message} required>
        <input {...register('title')} className={`input-field ${errors.title ? 'border-red-500/50' : ''}`} placeholder="Enter training title" />
      </FormField>
      <FormField label="Description" error={errors.description?.message} required>
        <textarea {...register('description')} className={`input-field h-32 ${errors.description ? 'border-red-500/50' : ''}`} placeholder="Describe the training course" />
      </FormField>
      <FormField label="Training Type" error={errors.training_type?.message} required>
        <select {...register('training_type')} className="input-field">
          <option value="">Select type</option>
          <option value="classroom">Classroom</option>
          <option value="online">Online</option>
          <option value="on_the_job">On-the-Job</option>
          <option value="scorm">SCORM</option>
          <option value="quiz">Quiz</option>
        </select>
      </FormField>
      <FormField label="Duration (Hours)" error={errors.duration_hours?.message} required>
        <input type="number" {...register('duration_hours')} className={`input-field ${errors.duration_hours ? 'border-red-500/50' : ''}`} placeholder="Enter duration in hours" step="0.5" />
      </FormField>
      <div className="flex justify-end gap-2 pt-4 border-t border-eqms-border">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">Create Training</button>
      </div>
    </form>
  )
}

function TrainingDetail({ training, onClose, onRefresh }) {
  const [auditTrail, setAuditTrail] = useState([])
  const [tab, setTab] = useState('details')

  useEffect(() => {
    if (training.id && trainingAPI.auditTrail) {
      trainingAPI.auditTrail(training.id).then(r => setAuditTrail(r.data || [])).catch(() => {})
    }
  }, [training.id])

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
            <span className="text-xs text-slate-500">Training ID</span>
            <p className="font-mono text-blue-400">{training.training_id || training.id}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Status</span>
            <p><StatusBadge status={training.status} /></p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Type</span>
            <p className="text-sm">{training.training_type || '—'}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500">Due Date</span>
            <p className="text-sm">{training.due_date || '—'}</p>
          </div>
          {training.description && (
            <div className="col-span-2">
              <span className="text-xs text-slate-500">Description</span>
              <p className="text-sm text-slate-300 mt-1">{training.description}</p>
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

