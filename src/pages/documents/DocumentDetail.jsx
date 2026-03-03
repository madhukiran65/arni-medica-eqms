import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  FileText, Edit2, ArrowLeft, Clock, User, Shield, History,
  MessageSquare, GitBranch, Link2, CheckCircle, XCircle, AlertTriangle,
  Lock, Unlock, Send, Archive, Eye, ChevronRight, RefreshCw
} from 'lucide-react'
import { documentsAPI } from '../../api'
import StatusBadge from '../../components/common/StatusBadge'
import RichTextViewer from '../../components/common/RichTextViewer'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'history', label: 'Version History', icon: History },
  { id: 'comments', label: 'Comments', icon: MessageSquare },
  { id: 'related', label: 'Related Items', icon: Link2 },
  { id: 'audit', label: 'Audit Trail', icon: Shield },
]

export default function DocumentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [transitions, setTransitions] = useState([])
  const [comments, setComments] = useState([])
  const [auditTrail, setAuditTrail] = useState([])
  const [related, setRelated] = useState([])
  const [snapshots, setSnapshots] = useState([])
  const [newComment, setNewComment] = useState('')
  const [transitioning, setTransitioning] = useState(false)
  const [showEsig, setShowEsig] = useState(null)
  const [esigPassword, setEsigPassword] = useState('')
  const [esigMeaning, setEsigMeaning] = useState('approval')
  const [esigComment, setEsigComment] = useState('')

  useEffect(() => {
    fetchDocument()
  }, [id])

  useEffect(() => {
    if (doc) {
      if (activeTab === 'comments') fetchComments()
      if (activeTab === 'audit') fetchAuditTrail()
      if (activeTab === 'related') fetchRelated()
      if (activeTab === 'history') fetchSnapshots()
    }
  }, [activeTab, doc?.id])

  const fetchDocument = async () => {
    setLoading(true)
    try {
      const [docRes, transRes] = await Promise.all([
        documentsAPI.get(id),
        documentsAPI.availableTransitions(id).catch(() => ({ data: [] })),
      ])
      setDoc(docRes.data)
      setTransitions(transRes.data?.transitions || transRes.data || [])
    } catch (err) {
      console.error('Failed to load document:', err)
      toast.error('Failed to load document')
      navigate('/documents')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const { data } = await documentsAPI.comments(id)
      setComments(data.results || data || [])
    } catch { setComments([]) }
  }

  const fetchAuditTrail = async () => {
    try {
      const { data } = await documentsAPI.auditTrail(id)
      setAuditTrail(data.results || data || [])
    } catch { setAuditTrail([]) }
  }

  const fetchRelated = async () => {
    try {
      const { data } = await documentsAPI.relatedDocuments(id)
      setRelated(data.results || data || [])
    } catch { setRelated([]) }
  }

  const fetchSnapshots = async () => {
    try {
      const { data } = await documentsAPI.snapshots(id)
      setSnapshots(data.results || data || [])
    } catch { setSnapshots([]) }
  }

  const handleTransition = async (action) => {
    const requiresEsig = ['approve', 'finalApprove', 'makeEffective', 'makeObsolete', 'archive']
    if (requiresEsig.includes(action)) {
      setShowEsig(action)
      return
    }
    await executeTransition(action, {})
  }

  const executeTransition = async (action, esigData) => {
    setTransitioning(true)
    try {
      const apiMethod = documentsAPI[action]
      if (!apiMethod) {
        toast.error(`Unknown action: ${action}`)
        return
      }
      await apiMethod(id, esigData)
      toast.success(`Document ${action.replace(/([A-Z])/g, ' $1').toLowerCase()} successful`)
      setShowEsig(null)
      setEsigPassword('')
      setEsigComment('')
      await fetchDocument()
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || `Failed to ${action}`
      toast.error(msg)
    } finally {
      setTransitioning(false)
    }
  }

  const handleEsigSubmit = () => {
    if (!esigPassword) {
      toast.error('Password is required for electronic signature')
      return
    }
    executeTransition(showEsig, {
      password: esigPassword,
      signing_meaning: esigMeaning,
      comment: esigComment,
    })
  }

  const handleCheckout = async () => {
    try {
      await documentsAPI.checkout(id)
      toast.success('Document checked out for editing')
      fetchDocument()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to checkout')
    }
  }

  const handleCheckin = async () => {
    try {
      await documentsAPI.checkin(id, {})
      toast.success('Document checked in')
      fetchDocument()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to checkin')
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    try {
      await documentsAPI.addComment(id, { content: newComment })
      toast.success('Comment added')
      setNewComment('')
      fetchComments()
    } catch (err) {
      toast.error('Failed to add comment')
    }
  }

  if (loading) return <LoadingSpinner message="Loading document..." />
  if (!doc) return null

  const TRANSITION_CONFIG = {
    submitForReview: { label: 'Submit for Review', icon: Send, color: 'blue', esig: false },
    approve: { label: 'Approve', icon: CheckCircle, color: 'green', esig: true },
    finalApprove: { label: 'Final Approve', icon: CheckCircle, color: 'green', esig: true },
    makeEffective: { label: 'Make Effective', icon: CheckCircle, color: 'emerald', esig: true },
    makeObsolete: { label: 'Obsolete', icon: XCircle, color: 'amber', esig: true },
    archive: { label: 'Archive', icon: Archive, color: 'slate', esig: true },
    cancel: { label: 'Cancel', icon: XCircle, color: 'red', esig: false },
    initiateRevision: { label: 'New Revision', icon: RefreshCw, color: 'purple', esig: false },
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button onClick={() => navigate('/documents')} className="flex items-center gap-1 text-sm text-slate-400 hover:text-blue-400 mb-2 transition-colors">
            <ArrowLeft size={14} /> Back to Documents
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="font-mono text-blue-400 text-lg">{doc.document_id || doc.id}</span>
            <span>{doc.title}</span>
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <StatusBadge status={doc.vault_state || doc.status} />
            <span className="text-xs text-slate-500">v{doc.major_version || doc.current_version || '1'}.{doc.minor_version || '0'}</span>
            {doc.is_locked && (
              <span className="flex items-center gap-1 text-xs text-amber-400">
                <Lock size={12} /> Locked by {doc.locked_by_name || 'user'}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          {doc.vault_state === 'draft' && !doc.is_locked && (
            <button onClick={handleCheckout} className="btn-secondary text-xs flex items-center gap-1">
              <Lock size={14} /> Checkout
            </button>
          )}
          {doc.is_locked && (
            <button onClick={handleCheckin} className="btn-secondary text-xs flex items-center gap-1">
              <Unlock size={14} /> Checkin
            </button>
          )}
          {(doc.vault_state === 'draft' || doc.vault_state === 'in_review') && (
            <button onClick={() => navigate(`/documents/edit/${doc.id}`)} className="btn-primary text-xs flex items-center gap-1">
              <Edit2 size={14} /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Workflow Transition Buttons */}
      {transitions.length > 0 && (
        <div className="mb-6 p-4 bg-eqms-card rounded-lg border border-eqms-border">
          <p className="text-xs text-slate-500 mb-2">Available Actions</p>
          <div className="flex gap-2 flex-wrap">
            {transitions.map((t) => {
              const key = t.action || t.name || t
              const config = TRANSITION_CONFIG[key] || { label: key, icon: ChevronRight, color: 'slate', esig: false }
              const Icon = config.icon
              return (
                <button
                  key={key}
                  onClick={() => handleTransition(key)}
                  disabled={transitioning}
                  className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors
                    border-${config.color}-500/30 text-${config.color}-400 hover:bg-${config.color}-500/10
                    disabled:opacity-50`}
                >
                  <Icon size={14} />
                  {config.label}
                  {config.esig && <Shield size={10} className="ml-1 opacity-60" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-eqms-border mb-6">
        <div className="flex gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="card p-6">
        {activeTab === 'overview' && <OverviewTab doc={doc} />}
        {activeTab === 'content' && <ContentTab doc={doc} />}
        {activeTab === 'history' && <HistoryTab snapshots={snapshots} />}
        {activeTab === 'comments' && (
          <CommentsTab
            comments={comments}
            newComment={newComment}
            setNewComment={setNewComment}
            onAdd={handleAddComment}
          />
        )}
        {activeTab === 'related' && <RelatedTab related={related} />}
        {activeTab === 'audit' && <AuditTrailTab trail={auditTrail} />}
      </div>

      {/* E-Signature Modal */}
      <Modal
        isOpen={!!showEsig}
        onClose={() => { setShowEsig(null); setEsigPassword(''); setEsigComment('') }}
        title="Electronic Signature Required"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300">
            <Shield size={14} className="inline mr-1" />
            21 CFR Part 11 compliant electronic signature. Your password will be verified and a tamper-proof record created.
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-200">Password *</label>
            <input
              type="password"
              value={esigPassword}
              onChange={(e) => setEsigPassword(e.target.value)}
              className="input-field w-full"
              placeholder="Re-enter your password"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-200">Signing Meaning</label>
            <select value={esigMeaning} onChange={(e) => setEsigMeaning(e.target.value)} className="input-field w-full">
              <option value="approval">Approval</option>
              <option value="review">Review</option>
              <option value="verification">Verification</option>
              <option value="authorship">Authorship</option>
              <option value="rejection">Rejection</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-200">Comment</label>
            <textarea
              value={esigComment}
              onChange={(e) => setEsigComment(e.target.value)}
              className="input-field w-full h-20 resize-none"
              placeholder="Optional comment..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleEsigSubmit}
              disabled={transitioning || !esigPassword}
              className="btn-primary flex-1"
            >
              {transitioning ? 'Signing...' : 'Sign & Confirm'}
            </button>
            <button
              onClick={() => { setShowEsig(null); setEsigPassword(''); setEsigComment('') }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

/* ─── Tab Components ─── */

function OverviewTab({ doc }) {
  const fields = [
    { label: 'Document ID', value: doc.document_id || doc.id, mono: true },
    { label: 'Title', value: doc.title },
    { label: 'Status', value: <StatusBadge status={doc.vault_state || doc.status} /> },
    { label: 'Version', value: `${doc.major_version || doc.current_version || '1'}.${doc.minor_version || '0'}` },
    { label: 'Category', value: doc.category?.replace(/_/g, ' ') || doc.infocard_type_name || '-' },
    { label: 'Department', value: doc.department_name || doc.department || '-' },
    { label: 'Owner', value: doc.owner_name || '-' },
    { label: 'Effective Date', value: doc.effective_date ? new Date(doc.effective_date).toLocaleDateString() : '-' },
    { label: 'Review Cycle', value: doc.review_cycle_days ? `${doc.review_cycle_days} days` : doc.review_period_months ? `${doc.review_period_months} months` : '-' },
    { label: 'Next Review', value: doc.next_review_date ? new Date(doc.next_review_date).toLocaleDateString() : '-' },
    { label: 'Confidentiality', value: doc.confidentiality_level || '-' },
    { label: 'Regulatory', value: doc.regulatory_requirement || '-' },
    { label: 'Requires Training', value: doc.requires_training ? 'Yes' : 'No' },
    { label: 'Created', value: doc.created_at ? new Date(doc.created_at).toLocaleString() : '-' },
    { label: 'Last Modified', value: doc.updated_at ? new Date(doc.updated_at).toLocaleString() : '-' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {fields.map((f, i) => (
        <div key={i} className="py-2">
          <span className="text-xs text-slate-500 block mb-0.5">{f.label}</span>
          <span className={`text-sm ${f.mono ? 'font-mono text-blue-400' : 'text-slate-200'}`}>
            {f.value}
          </span>
        </div>
      ))}
      {doc.description && (
        <div className="col-span-full py-2">
          <span className="text-xs text-slate-500 block mb-0.5">Description</span>
          <p className="text-sm text-slate-300">{doc.description}</p>
        </div>
      )}
    </div>
  )
}

function ContentTab({ doc }) {
  const content = doc.content_html || doc.content_json
  if (!content) {
    return <p className="text-slate-500 text-sm">No content available for this document.</p>
  }
  return (
    <div className="bg-white rounded-lg p-6 min-h-[400px]">
      <RichTextViewer content={content} />
    </div>
  )
}

function HistoryTab({ snapshots }) {
  if (!snapshots.length) {
    return <p className="text-slate-500 text-sm">No version history available yet.</p>
  }
  return (
    <div className="space-y-3">
      {snapshots.map((snap, i) => (
        <div key={snap.id || i} className="flex items-start gap-3 p-3 rounded-lg bg-eqms-input border border-eqms-border">
          <History size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">v{snap.version || snap.major_version || i + 1}</span>
              <StatusBadge status={snap.vault_state || snap.state || 'snapshot'} />
            </div>
            <p className="text-xs text-slate-400 mt-1">{snap.change_summary || snap.reason || 'Version snapshot'}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {snap.created_by_name || 'System'} &middot; {snap.created_at ? new Date(snap.created_at).toLocaleString() : '-'}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function CommentsTab({ comments, newComment, setNewComment, onAdd }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="input-field flex-1 h-20 resize-none"
          placeholder="Add a comment..."
        />
        <button onClick={onAdd} disabled={!newComment.trim()} className="btn-primary self-end">
          Post
        </button>
      </div>
      {!comments.length ? (
        <p className="text-slate-500 text-sm">No comments yet.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c, i) => (
            <div key={c.id || i} className="p-3 rounded-lg bg-eqms-input border border-eqms-border">
              <div className="flex items-center gap-2 mb-1">
                <User size={14} className="text-slate-400" />
                <span className="text-sm font-medium">{c.author_name || c.created_by_name || 'User'}</span>
                <span className="text-xs text-slate-500">{c.created_at ? new Date(c.created_at).toLocaleString() : ''}</span>
              </div>
              <p className="text-sm text-slate-300">{c.content || c.text || c.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RelatedTab({ related }) {
  if (!related.length) {
    return <p className="text-slate-500 text-sm">No related items linked to this document.</p>
  }
  return (
    <div className="space-y-2">
      {related.map((r, i) => (
        <Link
          key={r.id || i}
          to={r.url || '#'}
          className="flex items-center gap-3 p-3 rounded-lg bg-eqms-input border border-eqms-border hover:border-blue-500/30 transition-colors"
        >
          <Link2 size={14} className="text-blue-400 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-medium">{r.title || r.related_document_title || r.target_title || 'Related Item'}</span>
            <span className="text-xs text-slate-500 ml-2">{r.relationship_type || r.link_type || ''}</span>
          </div>
          <StatusBadge status={r.status || r.vault_state || 'linked'} />
        </Link>
      ))}
    </div>
  )
}

function AuditTrailTab({ trail }) {
  if (!trail.length) {
    return <p className="text-slate-500 text-sm">No audit trail entries yet.</p>
  }
  return (
    <div className="space-y-2">
      {trail.map((entry, i) => (
        <div key={entry.id || i} className="flex items-start gap-3 p-3 rounded-lg bg-eqms-input border border-eqms-border text-sm">
          <Clock size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-medium">{entry.action || entry.event_type || 'Action'}</span>
            {entry.details && <span className="text-slate-400 ml-2">— {typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details)}</span>}
            <div className="text-xs text-slate-500 mt-0.5">
              {entry.user_name || entry.performed_by_name || 'System'} &middot; {entry.timestamp || entry.created_at ? new Date(entry.timestamp || entry.created_at).toLocaleString() : '-'}
              {entry.ip_address && <span className="ml-2">IP: {entry.ip_address}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
