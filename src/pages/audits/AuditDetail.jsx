import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, AlertTriangle, User, Calendar, CheckCircle, XCircle, Shield,
  Clock, FileText, Eye, PlayCircle, Plus, Link2, ChevronRight, AlertCircle
} from 'lucide-react'
import { auditsAPI } from '../../api'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import ESignatureDialog from '../../components/common/ESignatureDialog'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'findings', label: 'Findings', icon: AlertTriangle },
  { id: 'checklist', label: 'Checklist', icon: CheckCircle },
  { id: 'audit', label: 'Audit Trail', icon: Shield },
]

const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Critical' },
  major: { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'Major' },
  minor: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Minor' },
  observation: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Observation' },
}

export default function AuditDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [audit, setAudit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [auditTrail, setAuditTrail] = useState([])
  const [findings, setFindings] = useState([])

  // Findings modal state
  const [showAddFinding, setShowAddFinding] = useState(false)
  const [newFinding, setNewFinding] = useState({
    description: '',
    severity: 'minor',
    classification: '',
    corrective_action: '',
  })

  // Checklist state
  const [checklist, setChecklist] = useState([])
  const [editingChecklistId, setEditingChecklistId] = useState(null)

  // Workflow state
  const [showEsig, setShowEsig] = useState(null)
  const [esigLoading, setEsigLoading] = useState(false)

  useEffect(() => {
    fetchAudit()
  }, [id])

  useEffect(() => {
    if (audit) {
      if (activeTab === 'audit') fetchAuditTrail()
      if (activeTab === 'findings') fetchFindings()
    }
  }, [activeTab, audit?.id])

  const fetchAudit = async () => {
    setLoading(true)
    try {
      const { data } = await auditsAPI.get(id)
      setAudit(data)
      setChecklist(data.checklist || [])
    } catch (err) {
      console.error('Failed to load audit:', err)
      toast.error('Failed to load audit')
      navigate('/audits')
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditTrail = async () => {
    try {
      const { data } = await auditsAPI.auditTrail(id)
      setAuditTrail(data.results || data || [])
    } catch {
      setAuditTrail([])
    }
  }

  const fetchFindings = async () => {
    try {
      const { data } = await auditsAPI.findings(id)
      setFindings(data.results || data || [])
    } catch {
      setFindings([])
    }
  }

  const handleAddFinding = async () => {
    if (!newFinding.description.trim()) {
      toast.error('Finding description is required')
      return
    }
    try {
      await auditsAPI.addFinding(id, newFinding)
      toast.success('Finding added')
      setNewFinding({ description: '', severity: 'minor', classification: '', corrective_action: '' })
      setShowAddFinding(false)
      fetchFindings()
    } catch (err) {
      toast.error('Failed to add finding')
    }
  }

  const handleLinkCapa = async (findingId) => {
    const capaId = prompt('Enter CAPA ID to link:')
    if (!capaId) return
    try {
      await auditsAPI.findingLinkCapa(findingId, { capa_id: capaId })
      toast.success('Finding linked to CAPA')
      fetchFindings()
    } catch (err) {
      toast.error('Failed to link CAPA')
    }
  }

  const handleWorkflowAction = async (action) => {
    setShowEsig(action)
  }

  const handleEsigSubmit = async (esigData) => {
    setEsigLoading(true)
    try {
      const actionMap = {
        start: auditsAPI.start,
        complete: auditsAPI.complete,
        close: auditsAPI.close,
      }

      const apiMethod = actionMap[showEsig]
      if (!apiMethod) {
        toast.error(`Unknown action: ${showEsig}`)
        return
      }

      await apiMethod(id, esigData)
      toast.success(`Audit ${showEsig} successful`)
      setShowEsig(null)
      fetchAudit()
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || `Failed to ${showEsig}`
      toast.error(msg)
    } finally {
      setEsigLoading(false)
    }
  }

  const handleUpdateChecklistItem = async (index, field, value) => {
    const updated = [...checklist]
    updated[index] = { ...updated[index], [field]: value }
    setChecklist(updated)
    // Auto-save to backend
    try {
      await auditsAPI.update(id, { checklist: updated })
    } catch (err) {
      toast.error('Failed to update checklist')
    }
  }

  const handleAddChecklistItem = () => {
    const newItem = { question: '', response: null, notes: '' }
    setChecklist([...checklist, newItem])
  }

  if (loading) return <LoadingSpinner message="Loading audit..." />
  if (!audit) return null

  const getAvailableTransitions = () => {
    const status = audit.status
    if (status === 'planned') return ['start']
    if (status === 'in_progress') return ['complete']
    if (status === 'completed') return ['close']
    return []
  }

  const availableTransitions = getAvailableTransitions()

  const TRANSITION_CONFIG = {
    start: { label: 'Start Audit', icon: PlayCircle, color: 'blue', esig: true },
    complete: { label: 'Complete Audit', icon: CheckCircle, color: 'green', esig: true },
    close: { label: 'Close Audit', icon: CheckCircle, color: 'emerald', esig: true },
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button onClick={() => navigate('/audits')} className="flex items-center gap-1 text-sm text-slate-400 hover:text-blue-400 mb-2 transition-colors">
            <ArrowLeft size={14} /> Back to Audits
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="font-mono text-blue-400 text-lg">{audit.audit_id || `A-${audit.id}`}</span>
            <span>{audit.title || 'Audit'}</span>
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <StatusBadge status={audit.status} />
            <span className="text-xs text-slate-500">Type: {audit.audit_type || 'Not Set'}</span>
            <span className="text-xs text-slate-500">Lead: {audit.lead_auditor_name || '-'}</span>
          </div>
        </div>
      </div>

      {/* Audit Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <span className="text-xs text-slate-500 block mb-1">Planned Start</span>
          <span className="text-sm font-semibold text-slate-200">
            {audit.planned_start_date ? new Date(audit.planned_start_date).toLocaleDateString() : '-'}
          </span>
        </div>
        <div className="card p-4">
          <span className="text-xs text-slate-500 block mb-1">Planned End</span>
          <span className="text-sm font-semibold text-slate-200">
            {audit.planned_end_date ? new Date(audit.planned_end_date).toLocaleDateString() : '-'}
          </span>
        </div>
        <div className="card p-4">
          <span className="text-xs text-slate-500 block mb-1">Actual Start</span>
          <span className="text-sm font-semibold text-slate-200">
            {audit.actual_start_date ? new Date(audit.actual_start_date).toLocaleDateString() : '-'}
          </span>
        </div>
        <div className="card p-4">
          <span className="text-xs text-slate-500 block mb-1">Actual End</span>
          <span className="text-sm font-semibold text-slate-200">
            {audit.actual_end_date ? new Date(audit.actual_end_date).toLocaleDateString() : '-'}
          </span>
        </div>
      </div>

      {/* Available Actions */}
      {availableTransitions.length > 0 && (
        <div className="mb-6 p-4 bg-eqms-card rounded-lg border border-eqms-border">
          <p className="text-xs text-slate-500 mb-2">Available Actions</p>
          <div className="flex gap-2 flex-wrap">
            {availableTransitions.map((action) => {
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
        {activeTab === 'overview' && <OverviewTab audit={audit} />}
        {activeTab === 'findings' && (
          <FindingsTab
            findings={findings}
            showAddFinding={showAddFinding}
            setShowAddFinding={setShowAddFinding}
            newFinding={newFinding}
            setNewFinding={setNewFinding}
            onAddFinding={handleAddFinding}
            onLinkCapa={handleLinkCapa}
          />
        )}
        {activeTab === 'checklist' && (
          <ChecklistTab
            checklist={checklist}
            onUpdateItem={handleUpdateChecklistItem}
            onAddItem={handleAddChecklistItem}
          />
        )}
        {activeTab === 'audit' && <AuditTrailTab trail={auditTrail} />}
      </div>

      {/* E-Signature Modal */}
      <ESignatureDialog
        isOpen={!!showEsig}
        onClose={() => setShowEsig(null)}
        onSign={handleEsigSubmit}
        title={`Confirm ${showEsig ? showEsig.charAt(0).toUpperCase() + showEsig.slice(1) : 'Action'}`}
        action="approval"
        loading={esigLoading}
      />
    </div>
  )
}

/* ─── Tab Components ─── */

function OverviewTab({ audit }) {
  const fields = [
    { label: 'Audit ID', value: audit.audit_id || `A-${audit.id}`, mono: true },
    { label: 'Title', value: audit.title },
    { label: 'Status', value: <StatusBadge status={audit.status} /> },
    { label: 'Type', value: audit.audit_type || 'Not Set' },
    { label: 'Scope', value: audit.scope || '-' },
    { label: 'Lead Auditor', value: audit.lead_auditor_name || '-' },
    { label: 'Department', value: audit.department_name || audit.department || '-' },
    { label: 'Planned Start', value: audit.planned_start_date ? new Date(audit.planned_start_date).toLocaleDateString() : '-' },
    { label: 'Planned End', value: audit.planned_end_date ? new Date(audit.planned_end_date).toLocaleDateString() : '-' },
    { label: 'Actual Start', value: audit.actual_start_date ? new Date(audit.actual_start_date).toLocaleDateString() : '-' },
    { label: 'Actual End', value: audit.actual_end_date ? new Date(audit.actual_end_date).toLocaleDateString() : '-' },
    { label: 'Created', value: audit.created_at ? new Date(audit.created_at).toLocaleString() : '-' },
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

      {audit.description && (
        <div className="border-t border-eqms-border pt-4">
          <span className="text-xs text-slate-500 block mb-2">Description</span>
          <p className="text-sm text-slate-300">{audit.description}</p>
        </div>
      )}
    </div>
  )
}

function FindingsTab({ findings, showAddFinding, setShowAddFinding, newFinding, setNewFinding, onAddFinding, onLinkCapa }) {
  return (
    <div className="space-y-4">
      {/* Add Finding Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle size={14} className="text-orange-400" />
          Audit Findings ({findings.length})
        </h3>
        <button onClick={() => setShowAddFinding(true)} className="btn-primary text-xs flex items-center gap-1">
          <Plus size={14} />
          Add Finding
        </button>
      </div>

      {/* Add Finding Form Modal */}
      <Modal isOpen={showAddFinding} onClose={() => setShowAddFinding(false)} title="Add Audit Finding" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-200">Finding Description *</label>
            <textarea
              value={newFinding.description}
              onChange={(e) => setNewFinding({ ...newFinding, description: e.target.value })}
              className="input-field w-full h-20 resize-none"
              placeholder="Describe the finding..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-200">Severity *</label>
            <select
              value={newFinding.severity}
              onChange={(e) => setNewFinding({ ...newFinding, severity: e.target.value })}
              className="input-field w-full"
            >
              <option value="critical">Critical</option>
              <option value="major">Major</option>
              <option value="minor">Minor</option>
              <option value="observation">Observation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-200">Classification</label>
            <input
              type="text"
              value={newFinding.classification}
              onChange={(e) => setNewFinding({ ...newFinding, classification: e.target.value })}
              className="input-field w-full"
              placeholder="e.g., Non-conformity, Improvement Opportunity"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-200">Corrective Action</label>
            <textarea
              value={newFinding.corrective_action}
              onChange={(e) => setNewFinding({ ...newFinding, corrective_action: e.target.value })}
              className="input-field w-full h-20 resize-none"
              placeholder="Proposed corrective action..."
            />
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-eqms-border">
            <button onClick={() => setShowAddFinding(false)} className="btn-secondary">Cancel</button>
            <button onClick={onAddFinding} className="btn-primary">Add Finding</button>
          </div>
        </div>
      </Modal>

      {/* Findings List */}
      {!findings.length ? (
        <p className="text-slate-500 text-sm">No findings recorded yet.</p>
      ) : (
        <div className="space-y-3">
          {findings.map((finding, i) => {
            const severityConfig = SEVERITY_COLORS[finding.severity] || SEVERITY_COLORS.observation
            return (
              <div key={finding.id || i} className="p-4 rounded-lg bg-eqms-input border border-eqms-border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${severityConfig.bg} ${severityConfig.text}`}>
                      {severityConfig.label}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">{finding.classification || 'Unclassified'}</span>
                  </div>
                  <button onClick={() => onLinkCapa(finding.id)} className="btn-secondary text-xs flex items-center gap-1">
                    <Link2 size={12} />
                    Link to CAPA
                  </button>
                </div>
                <p className="text-sm text-slate-200 mb-2">{finding.description}</p>
                {finding.corrective_action && (
                  <div className="text-xs text-slate-400 bg-slate-900/30 p-2 rounded mt-2">
                    <span className="font-semibold">Corrective Action:</span> {finding.corrective_action}
                  </div>
                )}
                <div className="text-xs text-slate-500 mt-2">
                  Status: <StatusBadge status={finding.status || 'open'} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ChecklistTab({ checklist, onUpdateItem, onAddItem }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <CheckCircle size={14} className="text-green-400" />
          Audit Checklist ({checklist.length} items)
        </h3>
        <button onClick={onAddItem} className="btn-primary text-xs flex items-center gap-1">
          <Plus size={14} />
          Add Item
        </button>
      </div>

      {!checklist.length ? (
        <p className="text-slate-500 text-sm">No checklist items yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-eqms-border">
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-400">Question</th>
                <th className="text-center px-3 py-2 text-xs font-semibold text-slate-400 w-32">Response</th>
                <th className="text-left px-3 py-2 text-xs font-semibold text-slate-400">Notes</th>
              </tr>
            </thead>
            <tbody>
              {checklist.map((item, i) => (
                <tr key={i} className="border-b border-eqms-border hover:bg-eqms-input/50 transition-colors">
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.question || ''}
                      onChange={(e) => onUpdateItem(i, 'question', e.target.value)}
                      className="input-field text-sm w-full"
                      placeholder="Audit question..."
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <select
                      value={item.response ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : e.target.value === 'true'
                        onUpdateItem(i, 'response', val)
                      }}
                      className="input-field text-sm w-full"
                    >
                      <option value="">—</option>
                      <option value="true">Pass</option>
                      <option value="false">Fail</option>
                      <option value="N/A">N/A</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={item.notes || ''}
                      onChange={(e) => onUpdateItem(i, 'notes', e.target.value)}
                      className="input-field text-sm w-full"
                      placeholder="Additional notes..."
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
