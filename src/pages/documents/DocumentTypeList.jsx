/**
 * DocumentTypeList — Shared filtered document list component
 * Used by DMR, ValidationDocs, and Correspondence pages.
 * Filters documents by infocard_type and provides type-specific create forms.
 */
import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Plus, Search, Eye, Edit2, Trash2, FileText, Download, Filter } from 'lucide-react'
import { documentsAPI } from '../../api'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import toast from 'react-hot-toast'

const VAULT_STATES = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'in_review', label: 'In Review' },
  { value: 'review_validation', label: 'Review Validation' },
  { value: 'sign_off', label: 'Sign-Off' },
  { value: 'released', label: 'Released' },
  { value: 'effective', label: 'Effective' },
  { value: 'superseded', label: 'Superseded' },
  { value: 'obsolete', label: 'Obsolete' },
  { value: 'archived', label: 'Archived' },
]

export default function DocumentTypeList({
  title,
  subtitle,
  infocardType,       // e.g. 'DMR', 'VAL', 'COR'
  infocardTypeName,   // e.g. 'Device Master Record'
  icon: PageIcon = FileText,
  columns = [],       // extra columns specific to this type
  createPath,         // override create path
  emptyTitle,
  emptyMessage,
  statsCards = [],     // KPI cards at top
}) {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [deleting, setDeleting] = useState(null)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchDocuments()
  }, [page, searchTerm, filterStatus])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchDocuments = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        page,
        page_size: 25,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus && { vault_state: filterStatus }),
        ...(infocardType && { infocard_type__prefix: infocardType }),
        ...(infocardTypeName && !infocardType && { infocard_type__name: infocardTypeName }),
      }
      const { data } = await documentsAPI.list(params)
      setDocuments(data.results || data || [])
      setTotalCount(data.count || 0)
    } catch (err) {
      console.error(`Failed to load ${title}:`, err)
      setError(err.message || `Failed to load ${title}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { data } = await documentsAPI.stats()
      setStats(data)
    } catch { /* stats are optional */ }
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) return
    setDeleting(docId)
    try {
      await documentsAPI.delete(docId)
      toast.success('Document deleted')
      setDocuments(documents.filter((d) => d.id !== docId))
      setTotalCount((c) => c - 1)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  const handleCreate = () => {
    if (createPath) {
      navigate(createPath)
    } else {
      // Navigate to document create with pre-filled type
      navigate('/documents/create', {
        state: { infocardType, infocardTypeName }
      })
    }
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
          <PageIcon size={28} className="text-blue-400" />
          {title}
        </h1>
        <p className="text-slate-400">{subtitle}</p>
      </div>

      {/* Stats Cards */}
      {statsCards.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statsCards.map((card, i) => (
            <div key={i} className="card p-4">
              <p className="text-xs text-slate-500 mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-slate-100">{card.getValue(documents, stats)}</p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      {/* Toolbar */}
      <div className="card p-6">
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 relative min-w-[250px]">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
            className="input-field w-auto"
          >
            {VAULT_STATES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button onClick={handleCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            New {infocardTypeName || 'Document'}
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSpinner message={`Loading ${title.toLowerCase()}...`} />
        ) : !documents.length ? (
          <EmptyState
            icon={PageIcon}
            title={emptyTitle || `No ${title.toLowerCase()} found`}
            message={emptyMessage || `Create your first ${(infocardTypeName || 'document').toLowerCase()} to get started.`}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-eqms-border">
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Document ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Version</th>
                    {columns.map((col, i) => (
                      <th key={i} className="text-left py-3 px-4 font-semibold text-slate-300">{col.header}</th>
                    ))}
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Modified</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-eqms-border hover:bg-eqms-input transition-colors">
                      <td className="py-3 px-4">
                        <Link to={`/documents/${doc.id}`} className="font-mono text-blue-400 hover:underline">
                          {doc.document_id || doc.id}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        <Link to={`/documents/${doc.id}`} className="hover:text-blue-400 transition-colors">
                          {doc.title || doc.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={doc.vault_state || doc.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        v{doc.major_version || doc.current_version || '1'}.{doc.minor_version || '0'}
                      </td>
                      {columns.map((col, i) => (
                        <td key={i} className="py-3 px-4 text-slate-400 text-xs">
                          {col.render ? col.render(doc) : doc[col.field] || '-'}
                        </td>
                      ))}
                      <td className="py-3 px-4 text-slate-500 text-xs">
                        {new Date(doc.updated_at || doc.modified_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <Link to={`/documents/${doc.id}`} className="p-1.5 rounded hover:bg-slate-700 transition" title="View">
                            <Eye size={14} className="text-slate-400" />
                          </Link>
                          {(doc.vault_state === 'draft' || !doc.vault_state) && (
                            <Link to={`/documents/edit/${doc.id}`} className="p-1.5 rounded hover:bg-slate-700 transition" title="Edit">
                              <Edit2 size={14} className="text-slate-400" />
                            </Link>
                          )}
                          {(doc.vault_state === 'draft' || !doc.vault_state) && (
                            <button
                              onClick={() => handleDelete(doc.id)}
                              disabled={deleting === doc.id}
                              className="p-1.5 rounded hover:bg-red-500/20 transition"
                              title="Delete"
                            >
                              <Trash2 size={14} className="text-red-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalCount={totalCount} onPageChange={setPage} pageSize={25} />
          </>
        )}
      </div>
    </div>
  )
}
