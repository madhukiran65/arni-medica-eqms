import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Clock,
  Link2,
  MessageSquare,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { deviationsAPI } from '../../api'
import StatusBadge from '../../components/common/StatusBadge'
import RichTextEditor from '../../components/common/RichTextEditor'
import RichTextViewer from '../../components/common/RichTextViewer'
import ESignatureDialog from '../../components/common/ESignatureDialog'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Modal from '../../components/common/Modal'
import toast from 'react-hot-toast'

const DEVIATION_STAGES = [
  'reported',
  'assessed',
  'investigation',
  'root_cause',
  'containment',
  'corrective_action',
  'capa_link',
  'verification',
  'closure',
  'closed',
]

const SEVERITY_LEVELS = {
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Critical' },
  major: { bg: 'bg-orange-500/10', text: 'text-orange-400', label: 'Major' },
  minor: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', label: 'Minor' },
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: AlertTriangle },
  { id: 'investigation', label: 'Investigation', icon: Zap },
  { id: 'capa', label: 'CAPA Link', icon: Link2 },
  { id: 'audit', label: 'Audit Trail', icon: Shield },
]

export default function DeviationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [deviation, setDeviation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [transitions, setTransitions] = useState([])
  const [auditTrail, setAuditTrail] = useState([])
  const [showEsig, setShowEsig] = useState(null)
  const [esigLoading, setEsigLoading] = useState(false)
  const [investigationContent, setInvestigationContent] = useState('')
  const [editingInvestigation, setEditingInvestigation] = useState(false)
  const [savingInvestigation, setSavingInvestigation] = useState(false)
  const [creatingCapa, setCreatingCapa] = useState(false)
  const [showCapaDialog, setShowCapaDialog] = useState(false)

  useEffect(() => {
    fetchDeviation()
  }, [id])

  useEffect(() => {
    if (deviation) {
      if (activeTab === 'audit') fetchAuditTrail()
    }
  }, [activeTab, deviation?.id])

  const fetchDeviation = async () => {
    setLoading(true)
    try {
      const { data } = await deviationsAPI.get(id)
      setDeviation(data)
      setInvestigationContent(data.root_cause_analysis || '')

      // Fetch available transitions for current stage
      try {
        const transRes = await deviationsAPI.transition(id, { dry_run: true }).catch(() => ({
          data: [],
        }))
        setTransitions(transRes.data?.transitions || transRes.data || [])
      } catch {
        setTransitions([])
      }
    } catch (err) {
      console.error('Failed to load deviation:', err)
      toast.error('Failed to load deviation')
      navigate('/deviations')
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditTrail = async () => {
    try {
      const { data } = await deviationsAPI.auditTrail(id)
      setAuditTrail(data.results || data || [])
    } catch {
      setAuditTrail([])
    }
  }

  const getStageIndex = (stage) => {
    return DEVIATION_STAGES.indexOf(stage)
  }

  const getNextStage = (currentStage) => {
    const currentIndex = getStageIndex(currentStage)
    if (currentIndex >= 0 && currentIndex < DEVIATION_STAGES.length - 1) {
      return DEVIATION_STAGES[currentIndex + 1]
    }
    return null
  }

  const handleTransition = async (signature) => {
    setEsigLoading(true)
    try {
      const nextStage = getNextStage(deviation.current_stage)
      if (!nextStage) {
        toast.error('No next stage available')
        return
      }

      await deviationsAPI.transition(id, {
        next_stage: nextStage,
        ...signature,
      })

      toast.success(`Deviation advanced to ${nextStage}`)
      setShowEsig(null)
      fetchDeviation()
    } catch (err) {
      console.error('Failed to transition:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to advance stage'
      toast.error(errorMsg)
    } finally {
      setEsigLoading(false)
    }
  }

  const handleSaveInvestigation = async () => {
    setSavingInvestigation(true)
    try {
      await deviationsAPI.update(id, {
        root_cause_analysis: investigationContent,
      })

      toast.success('Investigation saved')
      setEditingInvestigation(false)
      fetchDeviation()
    } catch (err) {
      console.error('Failed to save investigation:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to save investigation'
      toast.error(errorMsg)
    } finally {
      setSavingInvestigation(false)
    }
  }

  const handleAutoCreateCapa = async () => {
    setCreatingCapa(true)
    try {
      const { data } = await deviationsAPI.autoCreateCapa(id, {
        title: `CAPA for Deviation: ${deviation.title}`,
        description: deviation.description,
      })

      toast.success(`CAPA created: ${data.id}`)
      setShowCapaDialog(false)
      fetchDeviation()
    } catch (err) {
      console.error('Failed to create CAPA:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to create CAPA'
      toast.error(errorMsg)
    } finally {
      setCreatingCapa(false)
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading deviation..." />
  }

  if (!deviation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
          <p style={{ color: 'var(--text-secondary)' }}>Deviation not found</p>
        </div>
      </div>
    )
  }

  const currentStageIndex = getStageIndex(deviation.current_stage)
  const severityStyle = SEVERITY_LEVELS[deviation.severity] || SEVERITY_LEVELS.minor

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/deviations')}
              className="p-2 hover:bg-slate-700/30 rounded-lg transition"
            >
              <ArrowLeft size={24} style={{ color: 'var(--text-secondary)' }} />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle size={28} className="text-orange-400" />
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {deviation.title}
                </h1>
              </div>
              <p style={{ color: 'var(--text-secondary)' }}>
                Deviation ID: <span className="font-mono font-semibold">{deviation.id}</span>
              </p>
            </div>
            <div className="text-right">
              <StatusBadge status={deviation.current_stage} />
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-2 ${severityStyle.bg} ${severityStyle.text}`}
              >
                {severityStyle.label}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar: Stage Progress */}
          <div className="lg:col-span-1">
            <div
              className="card p-6 space-y-6 sticky top-8"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
            >
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                WORKFLOW PROGRESS
              </h3>

              {/* Stage Progress Bar */}
              <div className="space-y-3">
                {DEVIATION_STAGES.map((stage, index) => (
                  <div key={stage} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        index <= currentStageIndex
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-slate-700/30 text-slate-400'
                      }`}
                    >
                      {index < currentStageIndex ? (
                        <CheckCircle size={16} />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium capitalize ${
                        index <= currentStageIndex
                          ? 'text-green-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {stage.replace(/_/g, ' ')}
                    </span>
                    {index < DEVIATION_STAGES.length - 1 && (
                      <div
                        className={`ml-4 h-6 border-l-2 ${
                          index < currentStageIndex
                            ? 'border-green-500/30'
                            : 'border-slate-700/30'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Next Action */}
              {getNextStage(deviation.current_stage) && (
                <div
                  className="rounded p-3 space-y-3"
                  style={{
                    backgroundColor: 'var(--bg-input)',
                    borderLeft: '3px solid #3b82f6',
                  }}
                >
                  <p style={{ color: 'var(--text-muted)' }} className="text-xs font-semibold">
                    NEXT STAGE
                  </p>
                  <p style={{ color: 'var(--text-primary)' }} className="text-sm font-medium">
                    {getNextStage(deviation.current_stage).replace(/_/g, ' ')}
                  </p>
                  <button
                    onClick={() =>
                      setShowEsig({
                        action: 'stage_transition',
                        nextStage: getNextStage(deviation.current_stage),
                      })
                    }
                    className="btn-primary w-full text-sm flex items-center justify-center gap-2"
                  >
                    <Zap size={14} />
                    Advance Stage
                  </button>
                </div>
              )}

              {/* Metadata */}
              <div className="space-y-3 text-xs border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div className="pt-3">
                  <p style={{ color: 'var(--text-muted)' }} className="font-semibold mb-1">
                    Department
                  </p>
                  <p style={{ color: 'var(--text-primary)' }}>{deviation.department || '—'}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)' }} className="font-semibold mb-1">
                    Detected Date
                  </p>
                  <p style={{ color: 'var(--text-primary)' }}>
                    {deviation.detected_date
                      ? new Date(deviation.detected_date).toLocaleDateString()
                      : '—'}
                  </p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)' }} className="font-semibold mb-1">
                    Reported By
                  </p>
                  <p style={{ color: 'var(--text-primary)' }}>
                    {deviation.reported_by || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tab Navigation */}
            <div
              className="flex gap-1 border-b"
              style={{ borderColor: 'var(--border-color)' }}
            >
              {TABS.map((tab) => {
                const TabIcon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <TabIcon size={16} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Tab Content */}
            <div>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Description */}
                  <div
                    className="card p-6"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                  >
                    <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                      Description
                    </h3>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      <RichTextViewer content={deviation.description} />
                    </div>
                  </div>

                  {/* Key Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className="card p-4"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-color)',
                      }}
                    >
                      <p
                        style={{ color: 'var(--text-muted)' }}
                        className="text-xs font-semibold mb-2"
                      >
                        STATUS
                      </p>
                      <StatusBadge status={deviation.current_stage} />
                    </div>

                    <div
                      className="card p-4"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-color)',
                      }}
                    >
                      <p
                        style={{ color: 'var(--text-muted)' }}
                        className="text-xs font-semibold mb-2"
                      >
                        SEVERITY
                      </p>
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${severityStyle.bg} ${severityStyle.text}`}
                      >
                        {severityStyle.label}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Investigation Tab */}
              {activeTab === 'investigation' && (
                <div className="space-y-6">
                  {/* Root Cause Analysis */}
                  <div
                    className="card p-6"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Root Cause Analysis
                      </h3>
                      {!editingInvestigation && (
                        <button
                          onClick={() => setEditingInvestigation(true)}
                          className="text-xs px-3 py-1 rounded border transition"
                          style={{
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    {editingInvestigation ? (
                      <div className="space-y-4">
                        <RichTextEditor
                          value={investigationContent}
                          onChange={setInvestigationContent}
                          placeholder="Enter root cause analysis..."
                          minHeight="300px"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              setEditingInvestigation(false)
                              setInvestigationContent(deviation.root_cause_analysis || '')
                            }}
                            className="btn-secondary text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveInvestigation}
                            disabled={savingInvestigation}
                            className="btn-primary text-sm"
                          >
                            {savingInvestigation ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-secondary)' }}>
                        {investigationContent ? (
                          <RichTextViewer content={investigationContent} />
                        ) : (
                          <p style={{ color: 'var(--text-muted)' }} className="italic">
                            No root cause analysis recorded yet
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Containment Actions */}
                  <div
                    className="card p-6"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                  >
                    <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                      Containment Actions
                    </h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {deviation.containment_actions || 'No containment actions recorded'}
                    </p>
                  </div>

                  {/* Corrective Actions */}
                  <div
                    className="card p-6"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                  >
                    <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                      Corrective Actions
                    </h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {deviation.corrective_actions || 'No corrective actions recorded'}
                    </p>
                  </div>
                </div>
              )}

              {/* CAPA Link Tab */}
              {activeTab === 'capa' && (
                <div className="space-y-6">
                  {deviation.capa_link ? (
                    <div
                      className="card p-6"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-color)',
                        borderLeft: '4px solid #10b981',
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3
                            className="font-semibold text-lg"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            Linked CAPA
                          </h3>
                          <p
                            style={{ color: 'var(--text-secondary)' }}
                            className="text-sm mt-1"
                          >
                            This deviation is linked to a CAPA for tracking corrective and
                            preventive actions
                          </p>
                        </div>
                        <StatusBadge status={deviation.capa_link?.status || 'open'} />
                      </div>

                      <div className="space-y-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--text-muted)' }} className="text-sm">
                            CAPA ID
                          </span>
                          <span style={{ color: 'var(--text-primary)' }} className="font-mono">
                            {deviation.capa_link?.id}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--text-muted)' }} className="text-sm">
                            Title
                          </span>
                          <span style={{ color: 'var(--text-primary)' }}>
                            {deviation.capa_link?.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="card p-8 text-center space-y-4"
                      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                    >
                      <AlertCircle
                        size={48}
                        className="text-slate-400 mx-auto"
                      />
                      <h3 style={{ color: 'var(--text-primary)' }} className="font-semibold">
                        No CAPA Linked
                      </h3>
                      <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                        Create a CAPA to track corrective and preventive actions for this
                        deviation
                      </p>
                      <button
                        onClick={() => setShowCapaDialog(true)}
                        className="btn-primary mx-auto flex items-center gap-2"
                      >
                        <Zap size={16} />
                        Auto-Create CAPA
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Audit Trail Tab */}
              {activeTab === 'audit' && (
                <div
                  className="card p-6 space-y-4"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                >
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Change History
                  </h3>
                  {auditTrail.length > 0 ? (
                    <div className="space-y-4">
                      {auditTrail.map((entry, index) => (
                        <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0"
                          style={{ borderColor: 'var(--border-color)' }}
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-2" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p style={{ color: 'var(--text-primary)' }} className="font-medium text-sm">
                                  {entry.action}
                                </p>
                                <p
                                  style={{ color: 'var(--text-muted)' }}
                                  className="text-xs mt-1"
                                >
                                  {entry.user} •{' '}
                                  {new Date(entry.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {entry.details && (
                              <p
                                style={{ color: 'var(--text-secondary)' }}
                                className="text-xs mt-2"
                              >
                                {entry.details}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }} className="text-sm italic">
                      No audit trail entries
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* E-Signature Dialog */}
      {showEsig && (
        <ESignatureDialog
          isOpen={!!showEsig}
          onClose={() => setShowEsig(null)}
          onSign={handleTransition}
          title={`Advance to: ${showEsig.nextStage?.replace(/_/g, ' ')}`}
          action="approval"
          loading={esigLoading}
        />
      )}

      {/* Auto-Create CAPA Dialog */}
      <Modal
        isOpen={showCapaDialog}
        onClose={() => setShowCapaDialog(false)}
        title="Create CAPA for Deviation"
        size="md"
      >
        <div className="space-y-4">
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
            Automatically create a CAPA linked to this deviation to track corrective and preventive actions.
          </p>
          <div
            className="rounded p-3 space-y-2"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-color)',
            }}
          >
            <p style={{ color: 'var(--text-muted)' }} className="text-xs font-semibold">
              CAPA WILL BE CREATED WITH:
            </p>
            <ul style={{ color: 'var(--text-secondary)' }} className="text-xs space-y-1 list-disc list-inside">
              <li>Title: CAPA for Deviation: {deviation.title}</li>
              <li>Description: {deviation.description?.substring(0, 50)}...</li>
              <li>Status: Open</li>
            </ul>
          </div>
          <div className="flex gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={() => setShowCapaDialog(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleAutoCreateCapa}
              disabled={creatingCapa}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Zap size={16} />
              {creatingCapa ? 'Creating...' : 'Create CAPA'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
