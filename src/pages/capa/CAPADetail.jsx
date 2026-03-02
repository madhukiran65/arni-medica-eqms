import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Clock, User, Shield, Send, CheckCircle, AlertTriangle,
  MessageSquare, FileText, BarChart3, History, ChevronRight, MapPin,
  Calendar, Target, Zap, TrendingDown, Edit2, RefreshCw
} from 'lucide-react'
import { capaAPI } from '../../api'
import StatusBadge from '../../components/common/StatusBadge'
import RichTextViewer from '../../components/common/RichTextViewer'
import RichTextEditor from '../../components/common/RichTextEditor'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import FormField from '../../components/common/FormField'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'overview', label: 'Overview', icon: Target },
  { id: 'five_w', label: '5W Analysis', icon: AlertTriangle },
  { id: 'risk_matrix', label: 'Risk Matrix', icon: BarChart3 },
  { id: 'comments', label: 'Comments & Documents', icon: MessageSquare },
  { id: 'audit', label: 'Audit Trail', icon: Shield },
]

const PHASES = [
  'initiation',
  'investigation',
  'root_cause',
  'risk_affirmation',
  'capa_plan',
  'implementation',
  'effectiveness',
  'closure'
]

const PHASE_LABELS = {
  initiation: 'Initiation',
  investigation: 'Investigation',
  root_cause: 'Root Cause',
  risk_affirmation: 'Risk Affirmation',
  capa_plan: 'CAPA Plan',
  implementation: 'Implementation',
  effectiveness: 'Effectiveness',
  closure: 'Closure',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
  reopened: 'Reopened',
}

export default function CAPADetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [capa, setCapa] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [transitions, setTransitions] = useState([])
  const [comments, setComments] = useState([])
  const [documents, setDocuments] = useState([])
  const [auditTrail, setAuditTrail] = useState([])
  const [newComment, setNewComment] = useState('')
  const [transitioning, setTransitioning] = useState(false)
  const [showEsig, setShowEsig] = useState(null)
  const [esigData, setEsigData] = useState({ password: '', meaning: 'approval', comment: '' })
  const [fiveWEditing, setFiveWEditing] = useState(false)
  const [fiveWData, setFiveWData] = useState({})
  const [riskEditing, setRiskEditing] = useState(false)
  const [riskData, setRiskData] = useState({})

  useEffect(() => {
    fetchCapa()
  }, [id])

  useEffect(() => {
    if (capa) {
      if (activeTab === 'comments') fetchComments()
      if (activeTab === 'audit') fetchAuditTrail()
    }
  }, [activeTab, capa?.id])

  const fetchCapa = async () => {
    setLoading(true)
    try {
      const [capaRes] = await Promise.all([
        capaAPI.get(id),
      ])
      setCapa(capaRes.data)
      setFiveWData({
        what_happened: capaRes.data.what_happened || '',
        when_happened: capaRes.data.when_happened || '',
        where_happened: capaRes.data.where_happened || '',
        who_affected: capaRes.data.who_affected || '',
        why_happened: capaRes.data.why_happened || '',
      })
      setRiskData({
        severity: capaRes.data.risk_severity || 1,
        probability: capaRes.data.risk_occurrence || 1,
        detection: capaRes.data.risk_detection || 1,
      })
    } catch (err) {
      console.error('Failed to load CAPA:', err)
      toast.error('Failed to load CAPA record')
      navigate('/capa')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const { data } = await capaAPI.comments(id)
      setComments(data.results || data || [])
    } catch { setComments([]) }
  }

  const fetchDocuments = async () => {
    try {
      const { data } = await capaAPI.documents(id)
      setDocuments(data.results || data || [])
    } catch { setDocuments([]) }
  }

  const fetchAuditTrail = async () => {
    try {
      const { data } = await capaAPI.timeline(id)
      setAuditTrail(data.results || data || [])
    } catch { setAuditTrail([]) }
  }

  const handlePhaseTransition = async (nextPhase) => {
    setShowEsig(nextPhase)
  }

  const executeTransition = async () => {
    if (!esigData.password) {
      toast.error('Password required for electronic signature')
      return
    }

    setTransitioning(true)
    try {
      await capaAPI.transition(id, {
        next_phase: showEsig,
        password: esigData.password,
        signing_meaning: esigData.meaning,
        comment: esigData.comment,
      })
      toast.success(`CAPA phase advanced to ${PHASE_LABELS[showEsig] || showEsig}`)
      setShowEsig(null)
      setEsigData({ password: '', meaning: 'approval', comment: '' })
      await fetchCapa()
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to advance phase'
      toast.error(msg)
    } finally {
      setTransitioning(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    try {
      await capaAPI.addComment(id, { content: newComment })
      toast.success('Comment added')
      setNewComment('')
      fetchComments()
    } catch (err) {
      toast.error('Failed to add comment')
    }
  }

  const handleSaveFiveW = async () => {
    setTransitioning(true)
    try {
      await capaAPI.updateFiveW(id, fiveWData)
      toast.success('5W Analysis saved')
      setFiveWEditing(false)
      fetchCapa()
    } catch (err) {
      toast.error('Failed to save 5W Analysis')
    } finally {
      setTransitioning(false)
    }
  }

  const handleSaveRiskMatrix = async () => {
    setTransitioning(true)
    try {
      await capaAPI.updateRiskMatrix(id, {
        risk_severity: riskData.severity,
        risk_occurrence: riskData.probability,
        risk_detection: riskData.detection,
      })
      toast.success('Risk Matrix saved')
      setRiskEditing(false)
      fetchCapa()
    } catch (err) {
      toast.error('Failed to save Risk Matrix')
    } finally {
      setTransitioning(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading CAPA record..." />
  if (!capa) return null

  const currentPhaseIndex = PHASES.indexOf(capa.current_phase || capa.status || 'initiation')
  const riskScore = (riskData.severity || 1) * (riskData.probability || 1)
  const getRiskColor = (score) => {
    if (score <= 4) return 'green'
    if (score <= 9) return 'yellow'
    if (score <= 15) return 'orange'
    return 'red'
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/capa')}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-blue-400 mb-2 transition-colors"
          >
            <ArrowLeft size={14} /> Back to CAPA
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="font-mono text-blue-400 text-lg">{capa.capa_id || capa.id}</span>
            <span>{capa.title}</span>
          </h1>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <StatusBadge status={capa.current_phase || capa.status} />
            <span className={`px-2 py-1 rounded text-xs font-medium bg-${capa.priority === 'critical' ? 'red' : capa.priority === 'high' ? 'orange' : capa.priority === 'medium' ? 'yellow' : 'green'}-500/20 text-${capa.priority === 'critical' ? 'red' : capa.priority === 'high' ? 'orange' : capa.priority === 'medium' ? 'yellow' : 'green'}-400`}>
              {capa.priority?.toUpperCase() || 'MEDIUM'}
            </span>
            {capa.created_at && (
              <span className="text-xs text-slate-500">
                Created {new Date(capa.created_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap justify-end">
          <button
            onClick={() => navigate(`/capa/edit/${capa.id}`)}
            className="btn-secondary text-xs flex items-center gap-1"
          >
            <Edit2 size={14} /> Edit
          </button>
        </div>
      </div>

      {/* Phase Progress Bar */}
      <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <p className="text-xs text-slate-500 mb-3">CAPA Lifecycle Progress</p>
        <div className="flex gap-1">
          {PHASES.map((phase, idx) => (
            <div key={phase} className="flex-1">
              <div className={`h-2 rounded-full transition-colors ${
                idx < currentPhaseIndex
                  ? 'bg-green-500'
                  : idx === currentPhaseIndex
                    ? 'bg-blue-500'
                    : 'bg-slate-700'
              }`} />
              <p className="text-xs mt-1.5 text-center text-slate-400 truncate">
                {PHASE_LABELS[phase]?.split(' ')[0]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow Transition Buttons */}
      {currentPhaseIndex < PHASES.length - 1 && (
        <div className="mb-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <p className="text-xs text-slate-400 mb-2">Available Actions</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handlePhaseTransition(PHASES[currentPhaseIndex + 1])}
              disabled={transitioning}
              className="text-xs px-4 py-2 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <CheckCircle size={14} />
              Advance to {PHASE_LABELS[PHASES[currentPhaseIndex + 1]]}
              <Shield size={10} className="opacity-60" />
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-700 mb-6">
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
        {activeTab === 'overview' && <OverviewTab capa={capa} />}
        {activeTab === 'five_w' && (
          <FiveWTab
            data={fiveWData}
            editing={fiveWEditing}
            onEdit={() => setFiveWEditing(true)}
            onCancel={() => setFiveWEditing(false)}
            onChange={setFiveWData}
            onSave={handleSaveFiveW}
            saving={transitioning}
          />
        )}
        {activeTab === 'risk_matrix' && (
          <RiskMatrixTab
            data={riskData}
            editing={riskEditing}
            onEdit={() => setRiskEditing(true)}
            onCancel={() => setRiskEditing(false)}
            onChange={setRiskData}
            onSave={handleSaveRiskMatrix}
            saving={transitioning}
          />
        )}
        {activeTab === 'comments' && (
          <CommentsTab
            comments={comments}
            documents={documents}
            newComment={newComment}
            setNewComment={setNewComment}
            onAddComment={handleAddComment}
            onFetchDocuments={fetchDocuments}
            capaId={id}
          />
        )}
        {activeTab === 'audit' && <AuditTrailTab trail={auditTrail} onFetch={fetchAuditTrail} />}
      </div>

      {/* E-Signature Modal */}
      <Modal
        isOpen={!!showEsig}
        onClose={() => {
          setShowEsig(null)
          setEsigData({ password: '', meaning: 'approval', comment: '' })
        }}
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
              value={esigData.password}
              onChange={(e) => setEsigData({ ...esigData, password: e.target.value })}
              className="input-field w-full"
              placeholder="Re-enter your password"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-200">Signing Meaning</label>
            <select
              value={esigData.meaning}
              onChange={(e) => setEsigData({ ...esigData, meaning: e.target.value })}
              className="input-field w-full"
            >
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
              value={esigData.comment}
              onChange={(e) => setEsigData({ ...esigData, comment: e.target.value })}
              className="input-field w-full h-20 resize-none"
              placeholder="Optional comment..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={executeTransition}
              disabled={transitioning || !esigData.password}
              className="btn-primary flex-1"
            >
              {transitioning ? 'Signing...' : 'Sign & Confirm'}
            </button>
            <button
              onClick={() => {
                setShowEsig(null)
                setEsigData({ password: '', meaning: 'approval', comment: '' })
              }}
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

function OverviewTab({ capa }) {
  const fields = [
    { label: 'CAPA ID', value: capa.capa_id || capa.id, mono: true },
    { label: 'Title', value: capa.title, wide: true },
    { label: 'Status', value: <StatusBadge status={capa.current_phase || capa.status} /> },
    { label: 'Priority', value: capa.priority?.toUpperCase() || 'MEDIUM' },
    { label: 'Type', value: capa.capa_type?.replace(/_/g, ' ').toUpperCase() || 'BOTH' },
    { label: 'Category', value: capa.category?.replace(/_/g, ' ').toUpperCase() || '-' },
    { label: 'Source', value: capa.source?.replace(/_/g, ' ').toUpperCase() || '-' },
    { label: 'Assigned To', value: capa.assigned_to_name || '-' },
    { label: 'Created By', value: capa.created_by_name || '-' },
    { label: 'Created Date', value: capa.created_at ? new Date(capa.created_at).toLocaleString() : '-' },
    { label: 'Due Date', value: capa.due_date ? new Date(capa.due_date).toLocaleDateString() : '-' },
    { label: 'Phase Entered', value: capa.phase_entered_at ? new Date(capa.phase_entered_at).toLocaleString() : '-' },
    { label: 'Root Cause Verified', value: capa.root_cause_verified ? 'Yes' : 'No' },
    { label: 'Root Cause Method', value: capa.root_cause_analysis_method?.replace(/_/g, ' ').toUpperCase() || '-' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.filter(f => !f.wide).map((f, i) => (
          <div key={i} className="py-2">
            <span className="text-xs text-slate-500 block mb-0.5">{f.label}</span>
            <span className={`text-sm ${f.mono ? 'font-mono text-blue-400' : 'text-slate-200'}`}>
              {f.value}
            </span>
          </div>
        ))}
      </div>

      {fields.filter(f => f.wide).map((f, i) => (
        <div key={`wide-${i}`} className="py-2">
          <span className="text-xs text-slate-500 block mb-0.5">{f.label}</span>
          <p className="text-sm text-slate-200">{f.value}</p>
        </div>
      ))}

      {capa.description && (
        <div className="py-2 border-t border-slate-700 pt-4">
          <span className="text-xs text-slate-500 block mb-2">Description</span>
          <RichTextViewer content={capa.description} />
        </div>
      )}

      {capa.root_cause && (
        <div className="py-2 border-t border-slate-700 pt-4">
          <span className="text-xs text-slate-500 block mb-2">Root Cause</span>
          <p className="text-sm text-slate-300">{capa.root_cause}</p>
        </div>
      )}

      {capa.contributing_factors && capa.contributing_factors.length > 0 && (
        <div className="py-2 border-t border-slate-700 pt-4">
          <span className="text-xs text-slate-500 block mb-2">Contributing Factors</span>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
            {capa.contributing_factors.map((factor, i) => (
              <li key={i}>{factor}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function FiveWTab({ data, editing, onEdit, onCancel, onChange, onSave, saving }) {
  if (!editing) {
    return (
      <div className="space-y-4">
        <button
          onClick={onEdit}
          className="btn-secondary text-xs flex items-center gap-1"
        >
          <Edit2 size={14} /> Edit 5W Analysis
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-500 block mb-1">What Happened?</span>
            <p className="text-sm text-slate-300">{data.what_happened || '-'}</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-500 block mb-1">When?</span>
            <p className="text-sm text-slate-300">
              {data.when_happened ? new Date(data.when_happened).toLocaleString() : '-'}
            </p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-500 block mb-1">Where?</span>
            <p className="text-sm text-slate-300">{data.where_happened || '-'}</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-500 block mb-1">Who Affected?</span>
            <p className="text-sm text-slate-300">{data.who_affected || '-'}</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 md:col-span-2">
            <span className="text-xs text-slate-500 block mb-1">Why Happened?</span>
            <p className="text-sm text-slate-300">{data.why_happened || '-'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave() }} className="space-y-4">
      <FormField label="What Happened?" required>
        <textarea
          value={data.what_happened}
          onChange={(e) => onChange({ ...data, what_happened: e.target.value })}
          className="input-field w-full h-20 resize-none"
          placeholder="Describe what happened..."
        />
      </FormField>

      <FormField label="When Did It Happen?" required>
        <input
          type="datetime-local"
          value={data.when_happened ? new Date(data.when_happened).toISOString().slice(0, 16) : ''}
          onChange={(e) => onChange({ ...data, when_happened: e.target.value })}
          className="input-field w-full"
        />
      </FormField>

      <FormField label="Where Did It Happen?" required>
        <textarea
          value={data.where_happened}
          onChange={(e) => onChange({ ...data, where_happened: e.target.value })}
          className="input-field w-full h-16 resize-none"
          placeholder="Location, department, equipment..."
        />
      </FormField>

      <FormField label="Who Was Affected?" required>
        <textarea
          value={data.who_affected}
          onChange={(e) => onChange({ ...data, who_affected: e.target.value })}
          className="input-field w-full h-16 resize-none"
          placeholder="Customers, employees, products..."
        />
      </FormField>

      <FormField label="Why Did It Happen?" required>
        <textarea
          value={data.why_happened}
          onChange={(e) => onChange({ ...data, why_happened: e.target.value })}
          className="input-field w-full h-24 resize-none"
          placeholder="Root cause and reasons..."
        />
      </FormField>

      <div className="flex gap-3 pt-4 border-t border-slate-700">
        <button type="submit" disabled={saving} className="btn-primary flex-1">
          {saving ? 'Saving...' : 'Save 5W Analysis'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}

function RiskMatrixTab({ data, editing, onEdit, onCancel, onChange, onSave, saving }) {
  const riskScore = data.severity * data.probability
  const getRiskColor = (score) => {
    if (score <= 4) return 'green'
    if (score <= 9) return 'yellow'
    if (score <= 15) return 'orange'
    return 'red'
  }

  if (!editing) {
    return (
      <div className="space-y-6">
        <button
          onClick={onEdit}
          className="btn-secondary text-xs flex items-center gap-1"
        >
          <Edit2 size={14} /> Edit Risk Matrix
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-xs text-slate-500 mb-1">Severity (1-5)</p>
            <p className="text-2xl font-bold text-blue-400">{data.severity}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-xs text-slate-500 mb-1">Probability (1-5)</p>
            <p className="text-2xl font-bold text-purple-400">{data.probability}</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
            <p className="text-xs text-slate-500 mb-1">Detection (1-5)</p>
            <p className="text-2xl font-bold text-amber-400">{data.detection}</p>
          </div>
        </div>

        <div className={`p-4 rounded-lg bg-${getRiskColor(riskScore)}-500/10 border border-${getRiskColor(riskScore)}-500/20`}>
          <p className="text-xs text-slate-400 mb-1">Risk Score (Severity × Probability)</p>
          <p className={`text-3xl font-bold text-${getRiskColor(riskScore)}-400`}>{riskScore}</p>
          <p className="text-xs text-slate-500 mt-2">
            {riskScore <= 4 && 'Low risk - routine monitoring'}
            {riskScore > 4 && riskScore <= 9 && 'Moderate risk - enhanced monitoring required'}
            {riskScore > 9 && riskScore <= 15 && 'High risk - immediate action recommended'}
            {riskScore > 15 && 'Critical risk - urgent action required'}
          </p>
        </div>

        <RiskMatrixGrid severity={data.severity} probability={data.probability} />
      </div>
    )
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave() }} className="space-y-4">
      <FormField label="Severity (1-5)" required helpText="1 = Low impact, 5 = Catastrophic">
        <input
          type="range"
          min="1"
          max="5"
          value={data.severity}
          onChange={(e) => onChange({ ...data, severity: parseInt(e.target.value) })}
          className="input-field w-full"
        />
        <div className="mt-2 text-center text-lg font-bold text-blue-400">{data.severity}</div>
      </FormField>

      <FormField label="Probability / Occurrence (1-5)" required helpText="1 = Rare, 5 = Very frequent">
        <input
          type="range"
          min="1"
          max="5"
          value={data.probability}
          onChange={(e) => onChange({ ...data, probability: parseInt(e.target.value) })}
          className="input-field w-full"
        />
        <div className="mt-2 text-center text-lg font-bold text-purple-400">{data.probability}</div>
      </FormField>

      <FormField label="Detection Difficulty (1-5)" required helpText="1 = Easy to detect, 5 = Hard to detect">
        <input
          type="range"
          min="1"
          max="5"
          value={data.detection}
          onChange={(e) => onChange({ ...data, detection: parseInt(e.target.value) })}
          className="input-field w-full"
        />
        <div className="mt-2 text-center text-lg font-bold text-amber-400">{data.detection}</div>
      </FormField>

      <div className={`p-4 rounded-lg bg-${getRiskColor(riskScore)}-500/10 border border-${getRiskColor(riskScore)}-500/20`}>
        <p className="text-sm font-semibold text-slate-300 mb-1">Risk Score Preview</p>
        <p className={`text-2xl font-bold text-${getRiskColor(riskScore)}-400`}>{riskScore}</p>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-700">
        <button type="submit" disabled={saving} className="btn-primary flex-1">
          {saving ? 'Saving...' : 'Save Risk Matrix'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}

function RiskMatrixGrid({ severity, probability }) {
  return (
    <div className="border border-slate-700 rounded-lg overflow-hidden">
      <div className="grid grid-cols-6 gap-0">
        <div className="col-span-1 row-span-1 bg-slate-800 p-2" />
        {[1, 2, 3, 4, 5].map((p) => (
          <div key={`p-${p}`} className="bg-slate-800 p-2 text-center text-xs font-semibold text-slate-300">
            P{p}
          </div>
        ))}
        {[5, 4, 3, 2, 1].map((s) => (
          <React.Fragment key={`s-${s}`}>
            <div className="bg-slate-800 p-2 text-center text-xs font-semibold text-slate-300">S{s}</div>
            {[1, 2, 3, 4, 5].map((p) => {
              const score = s * p
              let bgColor = 'bg-green-500/10'
              if (score > 4 && score <= 9) bgColor = 'bg-yellow-500/10'
              if (score > 9 && score <= 15) bgColor = 'bg-orange-500/10'
              if (score > 15) bgColor = 'bg-red-500/10'
              const isSelected = s === severity && p === probability
              return (
                <div
                  key={`risk-${s}-${p}`}
                  className={`${bgColor} p-2 flex items-center justify-center text-center border ${isSelected ? 'border-blue-500 border-2' : 'border-slate-700'}`}
                >
                  <span className="text-xs font-semibold text-slate-300">{score}</span>
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

function CommentsTab({ comments, documents, newComment, setNewComment, onAddComment, onFetchDocuments, capaId }) {
  useEffect(() => {
    onFetchDocuments()
  }, [])

  return (
    <div className="space-y-6">
      {/* Comments Section */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Comments</h3>
        <div className="flex gap-3 mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="input-field flex-1 h-20 resize-none"
            placeholder="Add a comment..."
          />
          <button
            onClick={onAddComment}
            disabled={!newComment.trim()}
            className="btn-primary self-end"
          >
            <Send size={14} />
          </button>
        </div>

        {!comments.length ? (
          <p className="text-slate-500 text-sm">No comments yet.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((c, i) => (
              <div key={c.id || i} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-2 mb-1">
                  <User size={14} className="text-slate-400" />
                  <span className="text-sm font-medium">{c.author_name || c.created_by_name || 'User'}</span>
                  <span className="text-xs text-slate-500">
                    {c.created_at ? new Date(c.created_at).toLocaleString() : ''}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{c.content || c.text || c.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documents Section */}
      <div className="border-t border-slate-700 pt-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Documents</h3>
        {!documents.length ? (
          <p className="text-slate-500 text-sm">No documents attached yet.</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc, i) => (
              <a
                key={doc.id || i}
                href={doc.file_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-blue-500/30 transition-colors"
              >
                <FileText size={14} className="text-blue-400 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm font-medium">{doc.filename || doc.name || 'Document'}</span>
                  {doc.file_size && <span className="text-xs text-slate-500 ml-2">({(doc.file_size / 1024).toFixed(1)}KB)</span>}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AuditTrailTab({ trail, onFetch }) {
  useEffect(() => {
    onFetch()
  }, [])

  if (!trail.length) {
    return <p className="text-slate-500 text-sm">No audit trail entries yet.</p>
  }

  return (
    <div className="space-y-2">
      {trail.map((entry, i) => (
        <div key={entry.id || i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-sm">
          <Clock size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-medium text-slate-200">{entry.action || entry.event_type || 'Action'}</span>
            {entry.details && (
              <span className="text-slate-400 ml-2 text-xs">
                {typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details)}
              </span>
            )}
            <div className="text-xs text-slate-500 mt-0.5">
              {entry.user_name || entry.performed_by_name || 'System'} &middot;{' '}
              {entry.timestamp || entry.created_at ? new Date(entry.timestamp || entry.created_at).toLocaleString() : '-'}
              {entry.ip_address && <span className="ml-2">IP: {entry.ip_address}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
