import React, { useState, useEffect } from 'react'
import { Plus, Search, Eye, Wrench, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { equipmentAPI } from '../../api'
import { equipmentCreateSchema } from '../../validation/schemas'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import FormField from '../../components/common/FormField'

export default function Equipment() {
  const [items, setItems] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => { fetchData() }, [page, search])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [eqRes, dashRes] = await Promise.allSettled([
        equipmentAPI.equipment?.list({ page, ...(search && { search }) }),
        equipmentAPI.dashboard?.(),
      ])
      if (eqRes.status === 'fulfilled') {
        setItems(eqRes.value.data?.results || eqRes.value.data || [])
        setTotalCount(eqRes.value.data?.count || 0)
      } else if (eqRes.status === 'rejected') {
        console.error('Failed to load equipment:', eqRes.reason)
      }
      if (dashRes.status === 'fulfilled' && dashRes.value) {
        setDashboard(dashRes.value.data)
      }
    } catch (err) {
      console.error('Failed to load equipment:', err)
      setError(err.message || 'Failed to load equipment data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    try {
      await equipmentAPI.equipment?.create(formData)
      setShowCreate(false)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create equipment')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Equipment & Calibration</h1>
        <p className="text-slate-400">Equipment management, calibration tracking, environmental monitoring</p>
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
              <Wrench size={16} className="text-blue-400" />
              <span className="text-xs text-slate-500">Total Equipment</span>
            </div>
            <p className="text-2xl font-bold">{dashboard.total_equipment ?? '—'}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-xs text-slate-500">Active</span>
            </div>
            <p className="text-2xl font-bold">{dashboard.active ?? '—'}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-yellow-400" />
              <span className="text-xs text-slate-500">Due Calibration</span>
            </div>
            <p className="text-2xl font-bold">{dashboard.calibration_due ?? '—'}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={16} className="text-red-400" />
              <span className="text-xs text-slate-500">Overdue</span>
            </div>
            <p className="text-2xl font-bold">{dashboard.calibration_overdue ?? '—'}</p>
          </div>
        </div>
      )}

      <div className="card p-6 mb-6">
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 relative min-w-[250px]">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search equipment..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Equipment
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : !items.length ? (
          <EmptyState icon={Wrench} title="No equipment found" message="Add your first piece of equipment" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-eqms-border">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Equipment ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Location</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Next Calibration</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((eq) => (
                    <tr key={eq.id} className="border-b border-eqms-border hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono text-blue-400">{eq.equipment_id || eq.id}</td>
                      <td className="py-3 px-4 font-medium">{eq.name}</td>
                      <td className="py-3 px-4 text-slate-400">{eq.equipment_type || '—'}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={eq.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-400">{eq.location || '—'}</td>
                      <td className="py-3 px-4 text-slate-400">{eq.next_calibration_date || '—'}</td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => setSelectedItem(eq)}
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
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Equipment" size="lg">
        <CreateEquipmentForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title={selectedItem?.name || 'Equipment Detail'} size="lg">
        {selectedItem && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-500">Equipment ID</span>
              <p className="font-mono text-blue-400">{selectedItem.equipment_id || selectedItem.id}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Status</span>
              <p><StatusBadge status={selectedItem.status} /></p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Type</span>
              <p className="text-sm">{selectedItem.equipment_type || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Location</span>
              <p className="text-sm">{selectedItem.location || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Next Calibration</span>
              <p className="text-sm">{selectedItem.next_calibration_date || '—'}</p>
            </div>
            {selectedItem.description && (
              <div className="col-span-2">
                <span className="text-xs text-slate-500">Description</span>
                <p className="text-sm text-slate-300 mt-1">{selectedItem.description}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

function CreateEquipmentForm({ onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(equipmentCreateSchema),
    defaultValues: { name: '', equipment_type: '', serial_number: '', location: '' },
    mode: 'onBlur',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Equipment Name" error={errors.name?.message} required>
        <input {...register('name')} className={`input-field ${errors.name ? 'border-red-500/50' : ''}`} placeholder="Enter equipment name" />
      </FormField>
      <FormField label="Equipment Type" error={errors.equipment_type?.message} required>
        <input {...register('equipment_type')} className={`input-field ${errors.equipment_type ? 'border-red-500/50' : ''}`} placeholder="Enter equipment type" />
      </FormField>
      <FormField label="Serial Number" error={errors.serial_number?.message} required>
        <input {...register('serial_number')} className={`input-field ${errors.serial_number ? 'border-red-500/50' : ''}`} placeholder="Enter serial number" />
      </FormField>
      <FormField label="Location" error={errors.location?.message} required>
        <input {...register('location')} className={`input-field ${errors.location ? 'border-red-500/50' : ''}`} placeholder="Enter equipment location" />
      </FormField>
      <div className="flex justify-end gap-2 pt-4 border-t border-eqms-border">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">Add Equipment</button>
      </div>
    </form>
  )
}
