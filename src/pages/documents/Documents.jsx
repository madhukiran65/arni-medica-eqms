import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Download, Eye, FileText, Edit2, Trash2 } from 'lucide-react'
import { documentsAPI } from '../../api'
import StatusBadge from '../../components/common/StatusBadge'
import RichTextViewer from '../../components/common/RichTextViewer'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import Pagination from '../../components/common/Pagination'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'

export default function Documents() {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    fetchDocuments()
  }, [page, searchTerm, filterStatus])

  const fetchDocuments = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        page,
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus && { vault_state: filterStatus }),
      }
      const { data } = await documentsAPI.list(params)
      setDocuments(data.results || data || [])
      setTotalCount(data.count || 0)
    } catch (err) {
      console.error('Failed to load documents:', err)
      setError(err.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handleFilterChange = (value) => {
    setFilterStatus(value)
    setPage(1)
  }

  const handleEdit = (docId) => {
    navigate(`/documents/edit/${docId}`)
  }

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return
    }

    setDeleting(docId)
    try {
      await documentsAPI.delete(docId)
      toast.success('Document deleted successfully')
      setDocuments(documents.filter((d) => d.id !== docId))
    } catch (err) {
      console.error('Failed to delete document:', err)
      toast.error('Failed to delete document')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Document Control</h1>
        <p className="text-slate-400">Manage controlled documents and correspondence</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="card p-6">
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex-1 relative min-w-[250px]">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search documents..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted_for_review">Submitted for Review</option>
            <option value="approved">Approved</option>
            <option value="final_approved">Final Approved</option>
            <option value="effective">Effective</option>
            <option value="obsolete">Obsolete</option>
            <option value="archived">Archived</option>
          </select>
          <button onClick={() => navigate('/documents/create')} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            New Document
          </button>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading documents..." />
        ) : !documents.length ? (
          <EmptyState
            icon={FileText}
            title="No documents found"
            message="Create your first document to get started"
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
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Modified</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} className="border-b border-eqms-border hover:bg-eqms-input transition-colors">
                      <td className="py-3 px-4 font-mono text-blue-400">{doc.document_id || doc.id}</td>
                      <td className="py-3 px-4 font-medium">{doc.title || doc.name}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={doc.vault_state || doc.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-400">{doc.current_version || doc.version || '1.0'}</td>
                      <td className="py-3 px-4 text-slate-500 text-xs">
                        {new Date(doc.modified_at || doc.updated_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedDoc(doc)}
                            className="p-2 rounded hover:bg-slate-700 transition"
                            title="View details"
                          >
                            <Eye size={16} className="text-slate-400" />
                          </button>
                          <button
                            onClick={() => handleEdit(doc.id)}
                            className="p-2 rounded hover:bg-slate-700 transition"
                            title="Edit document"
                          >
                            <Edit2 size={16} className="text-slate-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            disabled={deleting === doc.id}
                            className="p-2 rounded hover:bg-red-500/20 transition"
                            title="Delete document"
                          >
                            <Trash2 size={16} className="text-red-400" />
                          </button>
                        </div>
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

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title={selectedDoc?.title || 'Document Detail'}
        size="lg"
      >
        {selectedDoc && <DocumentDetail doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}
      </Modal>
    </div>
  )
}

function DocumentDetail({ doc, onClose }) {
  const [fullDoc, setFullDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (doc.id) {
      documentsAPI
        .get(doc.id)
        .then((res) => setFullDoc(res.data))
        .catch((err) => console.error('Failed to load document details:', err))
        .finally(() => setLoading(false))
    }
  }, [doc.id])

  if (loading) return <div className="p-6 text-center text-slate-400">Loading...</div>
  if (!fullDoc) return <div className="p-6 text-center text-red-400">Failed to load document</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-xs text-slate-500">Document ID</span>
          <p className="font-mono text-blue-400">{fullDoc.document_id || fullDoc.id}</p>
        </div>
        <div>
          <span className="text-xs text-slate-500">Status</span>
          <p>
            <StatusBadge status={fullDoc.vault_state || fullDoc.status} />
          </p>
        </div>
        <div>
          <span className="text-xs text-slate-500">Current Version</span>
          <p className="text-sm">{fullDoc.current_version || '1.0'}</p>
        </div>
        <div>
          <span className="text-xs text-slate-500">Created</span>
          <p className="text-sm text-slate-400">
            {new Date(fullDoc.created_at).toLocaleDateString()}
          </p>
        </div>
        {fullDoc.category && (
          <div>
            <span className="text-xs text-slate-500">Category</span>
            <p className="text-sm capitalize">{fullDoc.category.replace(/_/g, ' ')}</p>
          </div>
        )}
        {fullDoc.review_cycle_days && (
          <div>
            <span className="text-xs text-slate-500">Review Cycle</span>
            <p className="text-sm">{fullDoc.review_cycle_days} days</p>
          </div>
        )}
        {fullDoc.description && (
          <div className="col-span-2">
            <span className="text-xs text-slate-500">Description</span>
            <p className="text-sm mt-1 text-slate-300">{fullDoc.description}</p>
          </div>
        )}
      </div>

      {/* Rich Text Content Viewer */}
      {fullDoc.content_html && (
        <div>
          <span className="text-xs text-slate-500 block mb-3">Document Content</span>
          <div className="bg-slate-900/50 rounded-lg p-4 border border-eqms-border">
            <RichTextViewer content={fullDoc.content_html} />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-eqms-border">
        <button
          onClick={() => {
            onClose()
            navigate(`/documents/edit/${fullDoc.id}`)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Edit2 size={16} />
          Edit Document
        </button>
      </div>
    </div>
  )
}
