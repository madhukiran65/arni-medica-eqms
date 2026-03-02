import React, { useState, useEffect } from 'react'
import { Plus, Search, Eye, Truck, Star } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { suppliersAPI } from '../../api'
import { supplierCreateSchema } from '../../validation/schemas'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import FormField from '../../components/common/FormField'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => { fetchSuppliers() }, [page, search])

  const fetchSuppliers = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await suppliersAPI.list({ page, ...(search && { search }) })
      setSuppliers(data.results || data || [])
      setTotalCount(data.count || 0)
    } catch (err) {
      console.error('Failed to load suppliers:', err)
      setError(err.message || 'Failed to load suppliers')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (formData) => {
    try {
      await suppliersAPI.create(formData)
      setShowCreate(false)
      fetchSuppliers()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create supplier')
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Supplier Management</h1>
        <p className="text-slate-400">Approved supplier list, evaluations, and supply chain intelligence</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchSuppliers} className="text-red-300 hover:text-red-200 underline ml-4">Retry</button>
        </div>
      )}

      <div className="card p-6 mb-6">
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 relative min-w-[250px]">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search suppliers..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Supplier
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : !suppliers.length ? (
          <EmptyState icon={Truck} title="No suppliers found" message="Add your first supplier to the approved list" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-eqms-border">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Supplier ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Rating</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Location</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s.id} className="border-b border-eqms-border hover:bg-slate-800/50 transition">
                      <td className="py-3 px-4 font-mono text-blue-400">{s.supplier_id || s.id}</td>
                      <td className="py-3 px-4 font-medium">{s.name || s.company_name}</td>
                      <td className="py-3 px-4 text-slate-400">{s.category || s.supplier_type || '—'}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          <span className="font-medium">{s.rating || s.overall_score || '—'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{s.location || s.city || '—'}</td>
                      <td className="py-3 px-4">
                        <button 
                          onClick={() => setSelected(s)}
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
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Supplier" size="lg">
        <CreateSupplierForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} />
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name || 'Supplier Detail'} size="lg">
        {selected && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-slate-500">Supplier ID</span>
              <p className="font-mono text-blue-400">{selected.supplier_id || selected.id}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Status</span>
              <p><StatusBadge status={selected.status} /></p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Category</span>
              <p className="text-sm">{selected.category || selected.supplier_type || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Rating</span>
              <p className="text-sm font-medium">{selected.rating || selected.overall_score || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Location</span>
              <p className="text-sm">{selected.location || selected.city || '—'}</p>
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

function CreateSupplierForm({ onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(supplierCreateSchema),
    defaultValues: { name: '', supplier_type: '', contact_email: '', contact_phone: '' },
    mode: 'onBlur',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Supplier Name" error={errors.name?.message} required>
        <input {...register('name')} className={`input-field ${errors.name ? 'border-red-500/50' : ''}`} placeholder="Enter supplier name" />
      </FormField>
      <FormField label="Supplier Type" error={errors.supplier_type?.message} required>
        <input {...register('supplier_type')} className={`input-field ${errors.supplier_type ? 'border-red-500/50' : ''}`} placeholder="Enter supplier type" />
      </FormField>
      <FormField label="Contact Email" error={errors.contact_email?.message}>
        <input type="email" {...register('contact_email')} className={`input-field ${errors.contact_email ? 'border-red-500/50' : ''}`} placeholder="Enter email address" />
      </FormField>
      <FormField label="Contact Phone" error={errors.contact_phone?.message}>
        <input {...register('contact_phone')} className={`input-field ${errors.contact_phone ? 'border-red-500/50' : ''}`} placeholder="Enter phone number" />
      </FormField>
      <div className="flex justify-end gap-2 pt-4 border-t border-eqms-border">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" className="btn-primary">Add Supplier</button>
      </div>
    </form>
  )
}
