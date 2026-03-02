import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, AlertCircle, User, Calendar, Package, Shield, Clock,
  FileText, MessageSquare, Eye, CheckCircle, XCircle, ChevronRight
} from 'lucide-react'
import { complaintsAPI } from '../../api'
import StatusBadge from '../../components/common/StatusBadge'
import RichTextEditor from '../../components/common/RichTextEditor'
import RichTextViewer from '../../components/common/RichTextViewer'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import ESignatureDialog from '../../components/common/ESignatureDialog'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'investigation', label: 'Investigation', icon: FileText },
  { id: 'mdr', label: 'MDR Reporting', icon: AlertCircle },
  { id: 'audit', label: 'Audit Trail', icon: Shield },
]

const WORKFLOW_PROGRESS = {
  received: 0,
  assigned: 25,
  investigation: 50,
  reportability_review: 75,
  closed: 100,
}

export default function ComplaintDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [transitions, setTransitions] = useState([])
  const [auditTrail, setAuditTrail] = useState([])
  const [comments, setComments] = useState([])

  // Investigation tab state
  const [investigationNotes, setInvestigationNotes] = useState('')
  const [rootCause, setRootCause] = useState('')
  const [determination, setDetermination] = useState('')
  const [savingInvestigation, setSavingInvestigation] = useState(false)

  // MDR tab state
  const [reportable, setReportable] = useState(null)
  const [mdrNumber, setMdrNumber] = useState('')
  const [reportingDate, setReportingDate] = useState('')
  const [regulatoryBody, setRegulatoryBody] = useState('')

  // Workflow state
  const [showEsig, setShowEsig] = useState(null)
  const [esigLoading, setEsigLoading] = useState(false)
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    fetchComplaint()
  }, [id])

  useEffect(() => {
    if (complaint) {
      if (activeTab === 'audit') fetchAuditTrail()
      if (activeTab === 'overview') fetchComments()
    }
  }, [activeTab, complaint?.id])

  const fetchComplaint = async () => {
    setLoading(true)
    try {
      const { data } = await complaintsAPI.get(id)
      setComplaint(data)
      setInvestigationNotes(data.investigation_notes || '')
      setRootCause(data.root_cause || '')
      setDetermination(data.determination || '')
      setReportable(data.reportable)
      setMdrNumber(data.mdr_number || '')
      setReportingDate(data.reporting_date || '')
      setRegulatoryBody(data.regulatory_body || '')
      // Fetch transitions (available actions)
      fetchTransitions()
    } catch (err) {
      console.error('Failed to load complaint:', err)
      toast.error('Failed to load complaint')
      navigate('/complaints')
    } finally {
      setLoading(false)
    }
  }

  const fetchTransitions = async () => {
    try {
      const { data } = await complaintsAPI.get(id)
      const available = data.available_transitions || []
      setTransitions(available)
    } catch {
      setTransitions([])
    }
  }

  const fetchAuditTrail = async () => {
    try {
      const { data } = await complaintsAPI.auditTrail(id)
      setAuditTrail(data.results || data || [])
    } catch {
      setAuditTrail([])
    }
  }

  const fetchComments = async () => {
    try {
      const { data } = await complaintsAPI.comments({ complaint: id })
      setComments(data.results || data || [])
    } catch {
      setComments([])
    }
  }

  const handleSaveInvestigation = async () => {
    setSavingInvestigation(true)
    try {
      await complaintsAPI.update(id, {
        investigation_notes: investigationNotes,
        root_cause: rootCause,
        determination: determination,
      })
      toast.success('Investigation notes saved')
      fetchComplaint()
    } catch (err) {
      toast.error('Failed to save investigation notes')
    } finally {
      setSavingInvestigation(false)
    }
  }

  const handleDetermineReportability = async () => {
    if (reportable === null) {
      toast.error('Please select reportability determination')
      return
    }
    setShowEsig('determineReportability')
  }

  const handleWorkflowAction = async (action) => {
    const requiresEsig = ['assign', 'startInvestigation', 'completeInvestigation', 'determineReportability', 'close']
    if (requiresEsig.includes(action)) {
      setShowEsig(action)
      return
    }
    await executeAction(action, {})
  }

  const handleEsigSubmit = async (esigData) => {
    await executeAction(showEsig, esigData)
  }

  const executeAction = async (action, esigData) => {
    setEsigLoading(true)
    try {
      const actionMap = {
        assign: complaintsAPI.assign,
        startInvestigation: complaintsAPI.startInvestigation,
        completeInvestigation: complaintsAPI.completeInvestigation,
        determineReportability: complaintsAPI.determineReportability,
        close: complaintsAPI.close,
      }

      const apiMethod = actionMap[action]
      if (!apiMethod) {
        toast.error(`Unknown action: ${action}`)
        return
      }

      const payload = {
        ...esigData,
        ...(action === 'determineReportability' && {
          reportable: reportable,
          mdr_number: mdrNumber,
          reporting_date: reportingDate,
          regulatory_body: regulatoryBody,
        }),
      }

      await apiMethod(id, payload)
      toast.success(`Complaint ${action.replace(/([A-Z])/g, ' $1').toLowerCase()} successful`)
      setShowEsig(null)
      fetchComplaint()
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || `Failed to ${action}`
      toast.error(msg)
    } finally {
      setEsigLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    try {
      await complaintsAPI.addComment({
        complaint: id,
        content: newComment,
      })
      toast.success('Comment added')
      setNewComment('')
      fetchComments()
    } catch (err) {
      toast.error('Failed to add comment')
    }
  }

  if (loading) return <LoadingSpinner message="Loading complaint..." />
  if (!complaint) return null

  const progressPercent = WORKFLOW_PROGRESS[complaint.status] || 0
  const TRANSITION_CONFIG = {
    assign: { label: 'Assign', icon: User, color: 'blue', esig: true },
    startInvestigation: { label: 'Start Investigation', icon: FileText, color: 'cyan', esig: true },
    completeInvestigation: { label: 'Complete Investigation', icon: CheckCircle, color: 'purple', esig: true },
    determineReportability: { label: 'Determine Reportability', icon: AlertCircle, color: 'orange', esig: true },
    close: { label: 'Close Complaint', icon: CheckCircle, color: 'green', esig: true },
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button onClick={() => navigate('/complaints')} className="flex items-center gap-1 text-sm text-slate-400 hover:text-blue-400 mb-2 transition-colors">
            <ArrowLeft size={14} /> Back to Complaints
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="font-mono text-blue-400 text-lg">{complaint.complaint_id || `C-${complaint.id}`}</span>
            <span>{complaint.title || 'Complaint'}</span>
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <StatusBadge status={complaint.status} />
            <span className="text-xs text-slate-500">Severity: {complaint.severity || 'Not Set'}</span>
            <span className="text-xs text-slate-500">Source: {complaint.source || 'Unknown'}</span>
          </div>
        </div>
      </div>

      {/* Workflow Progress Bar */}
      <div className="mb-6 p-4 bg-eqms-card rounded-lg border border-eqms-border">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-slate-300">Workflow Progress</p>
          <span className="text-xs text-slate-500">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Status: {complaint.status?.replace(/_/g, ' ') || 'Received'}
        </p>
      </div>

      {/* Available Actions */}
      {transitions.length > 0 && (
        <div className="mb-6 p-4 bg-eqms-card rounded-lg border border-eqms-border">
          <p className="text-xs text-slate-500 mb-2">Available Actions</p>
          <div className="flex gap-2 flex-wrap">
            {transitions.map((action) => {
              const config = TRANSITION_CONFIG[action] || { label: action, icon: ChevronRight, color: 'slate', esig: false }
              const Icon = config.icon
              return (
                <button
                  key={action}
                  onClick={() => handleWorkflowAction(action)}
                  disabled={esigLoading}
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
        {activeTab === 'overview' && <OverviewTab complaint={complaint} comments={comments} newComment={newComment} setNewComment={setNewComment} onAddComment={handleAddComment} />}
        {activeTab === 'investigation' && (
          <InvestigationTab
            notes={investigationNotes}
            setNotes={setInvestigationNotes}
            rootCause={rootCause}
            setRootCause={setRootCause}
            determination={determination}
            setDetermination={setDetermination}
            onSave={handleSaveInvestigation}
            saving={savingInvestigation}
          />
        )}
        {activeTab === 'mdr' && (
          <MDRTab
            reportable={reportable}
            setReportable={setReportable}
            mdrNumber={mdrNumber}
            setMdrNumber={setMdrNumber}
            reportingDate={reportingDate}
            setReportingDate={setReportingDate}
            regulatoryBody={regulatoryBody}
            setRegulatoryBody={setRegulatoryBody}
            onDetermine={handleDetermineReportability}
          />
        )}
        {activeTab === 'audit' && <AuditTrailTab trail={auditTrail} />}
      </div>

      {/* E-Signature Modal */}
      <ESignatureDialog
        isOpen={!!showEsig}
        onClose={() => setShowEsig(null)}
        onSign={handleEsigSubmit}
        title={`Confirm ${showEsig?.replace(/([A-Z])/g, ' $1') || 'Action'}`}
        action={showEsig === 'determineReportability' ? 'approval' : 'review'}
        loading={esigLoading}
      />
    </div>
  )
}

/* ─── Tab Components ─── */

function OverviewTab({ complaint, comments, newComment, setNewComment, onAddComment }) {
  const fields = [
    { label: 'Complaint ID', value: complaint.complaint_id || `C-${complaint.id}`, mono: true },
    { label: 'Title', value: complaint.title },
    { label: 'Status', value: <StatusBadge status={complaint.status} /> },
    { label: 'Severity', value: complaint.severity || 'Not Set' },
    { label: 'Source', value: complaint.source || 'Unknown' },
    { label: 'Product', value: complaint.product_name || complaint.product || '-' },
    { label: 'Received Date', value: complaint.received_date ? new Date(complaint.received_date).toLocaleDateString() : '-' },
    { label: 'Assigned To', value: complaint.assigned_to_name || '-' },
  ]

  return (
    <div className="space-y-6">
      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fields.map((f, i) => (
          <div key={i} className="py-2">
            <span className="text-xs text-slate-500 block mb-0.5">{f.label}</span>
            <span className={`text-sm ${f.mono ? 'font-mono text-blue-400' : 'text-slate-200'}`}>
              {f.value}
            </span>
          </div>
        ))}
      </div>

      {complaint.description && (
        <div className="border-t border-eqms-border pt-4">
          <span className="text-xs text-slate-500 block mb-2">Description</span>
          <p className="text-sm text-slate-300">{complaint.description}</p>
        </div>
      )}

      {/* Comments Section */}
      <div className="border-t border-eqms-border pt-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <MessageSquare size={14} className="text-blue-400" />
          Comments
        </h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="input-field flex-1 h-20 resize-none"
              placeholder="Add a comment..."
            />
            <button onClick={onAddComment} disabled={!newComment.trim()} className="btn-primary self-end">
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
                    <span className="text-sm font-medium">{c.created_by_name || c.author || 'User'}</span>
                    <span className="text-xs text-slate-500">{c.created_at ? new Date(c.created_at).toLocaleString() : ''}</span>
                  </div>
                  <p className="text-sm text-slate-300">{c.content || c.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InvestigationTab({ notes, setNotes, rootCause, setRootCause, determination, setDetermination, onSave, saving }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2 text-slate-200">Investigation Notes</label>
        <RichTextEditor value={notes} onChange={setNotes} placeholder="Document investigation findings..." />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2 text-slate-200">Root Cause Analysis</label>
        <textarea
          value={rootCause}
          onChange={(e) => setRootCause(e.target.value)}
          className="input-field w-full h-24 resize-none"
          placeholder="Identify root cause..."
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-2 text-slate-200">Determination</label>
        <textarea
          value={determination}
          onChange={(e) => setDetermination(e.target.value)}
          className="input-field w-full h-24 resize-none"
          placeholder="Final determination and conclusions..."
        />
      </div>
      <div className="flex justify-end pt-4 border-t border-eqms-border">
        <button onClick={onSave} disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Save Investigation'}
        </button>
      </div>
    </div>
  )
}

function MDRTab({ reportable, setReportable, mdrNumber, setMdrNumber, reportingDate, setReportingDate, regulatoryBody, setRegulatoryBody, onDetermine }) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
        <AlertCircle size={14} className="inline mr-2 mb-0.5" />
        <strong>Critical for FDA/EU IVDR Compliance:</strong> MDR reporting timelines vary by regulatory body. US FDA: 30 days. EU IVDR: 15 days.
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 text-slate-200">Is This Reportable? *</label>
        <div className="flex gap-4">
          {[
            { value: true, label: 'Yes, Reportable' },
            { value: false, label: 'No, Not Reportable' },
            { value: null, label: 'Undetermined' },
          ].map((opt) => (
            <label key={String(opt.value)} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="reportable"
                value={String(opt.value)}
                checked={reportable === opt.value}
                onChange={() => setReportable(opt.value)}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-300">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {reportable && (
        <>
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-200">MDR Report Number</label>
            <input
              type="text"
              value={mdrNumber}
              onChange={(e) => setMdrNumber(e.target.value)}
              className="input-field w-full"
              placeholder="e.g., FDA-MDR-2024-123456"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-200">Reporting Date</label>
            <input
              type="date"
              value={reportingDate}
              onChange={(e) => setReportingDate(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-200">Regulatory Body</label>
            <select
              value={regulatoryBody}
              onChange={(e) => setRegulatoryBody(e.target.value)}
              className="input-field w-full"
            >
              <option value="">Select...</option>
              <option value="FDA">FDA (USA)</option>
              <option value="EMA">EMA (EU)</option>
              <option value="CDSCO">CDSCO (India)</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </>
      )}

      <div className="flex justify-end pt-4 border-t border-eqms-border">
        <button onClick={onDetermine} className="btn-primary flex items-center gap-2">
          <AlertCircle size={14} />
          Determine Reportability
        </button>
      </div>
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
