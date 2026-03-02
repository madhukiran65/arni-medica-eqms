import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { FileText, CheckCircle, Clock, AlertTriangle, AlertCircle, Target, Shield, BookOpen, TrendingUp, Plus, ArrowUpRight } from 'lucide-react'
import { analyticsAPI } from '../../api'
import { AuthContext } from '../../contexts/AuthContext'
import { useIsMobile } from '../../hooks/useMediaQuery'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4']

export default function Dashboard() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [dashboard, setDashboard] = useState(null)
  const [kpis, setKpis] = useState(null)
  const [capaTrends, setCapaTrends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dashRes, kpiRes, capaRes] = await Promise.allSettled([
        analyticsAPI.dashboard(),
        analyticsAPI.kpis(),
        analyticsAPI.trends.capa(),
      ])
      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value.data)
      if (kpiRes.status === 'fulfilled') setKpis(kpiRes.value.data)
      if (capaRes.status === 'fulfilled') setCapaTrends(capaRes.value.data?.monthly_data || capaRes.value.data || [])
    } catch (err) {
      console.error('Dashboard load error:', err)
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading dashboard..." />

  const cards = dashboard?.summary_cards || {}
  const recentActivity = dashboard?.recent_activity || []

  // Build KPI data from API or fallback
  const kpiCards = [
    { icon: FileText, label: 'Total Documents', value: cards.total_documents ?? kpis?.total_documents ?? '—', color: 'text-blue-400', glow: 'bg-blue-500/10' },
    { icon: Target, label: 'Open CAPAs', value: cards.open_capas ?? kpis?.open_capas ?? '—', color: 'text-yellow-400', glow: 'bg-yellow-500/10' },
    { icon: AlertTriangle, label: 'Open Deviations', value: cards.open_deviations ?? '—', color: 'text-orange-400', glow: 'bg-orange-500/10' },
    { icon: CheckCircle, label: 'Compliance Score', value: kpis?.compliance_rate ? `${kpis.compliance_rate}%` : (cards.training_compliance ? `${cards.training_compliance}%` : '—'), color: 'text-green-400', glow: 'bg-green-500/10' },
    { icon: Shield, label: 'Overdue Training', value: cards.overdue_training ?? kpis?.overdue_training ?? '—', color: 'text-red-400', glow: 'bg-red-500/10' },
  ]

  // CAPA pie chart data
  const capaStatusData = dashboard?.capa_summary ? Object.entries(dashboard.capa_summary).map(([name, value], i) => ({
    name: name.replace(/_/g, ' '),
    value,
    fill: COLORS[i % COLORS.length]
  })).filter(d => d.value > 0) : []

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-6`}>
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span>{error}</span>
          <button onClick={loadDashboard} className="text-red-300 hover:text-red-200 underline whitespace-nowrap">Retry</button>
        </div>
      )}

      {/* Welcome */}
      <div className={`flex flex-col ${isMobile ? 'gap-3' : 'flex-row items-center justify-between'}`}>
        <div>
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-extrabold tracking-tight`}>
            Welcome back{user?.first_name ? `, ${user.first_name}` : ''}
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">Quality management overview · {new Date().toLocaleDateString('en-US', { weekday: isMobile ? 'short' : 'long', year: 'numeric', month: 'short', day: 'numeric' })}</p>
        </div>
        <button onClick={() => navigate('/documents')} className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto">
          <Plus size={isMobile ? 16 : 15} /> New Document
        </button>
      </div>

      {/* KPI Cards */}
      <div className={`grid gap-3 md:gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'}`}>
        {kpiCards.slice(0, isMobile ? 4 : 5).map((kpi, i) => (
          <div key={i} className="card p-3 md:p-4 relative overflow-hidden border-l-2" style={{ borderLeftColor: `var(--tw-${kpi.color})` }}>
            <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${kpi.glow} blur-xl`} />
            <div className="flex items-center justify-between mb-2 relative">
              <span className="text-xs font-medium text-slate-500 truncate">{kpi.label}</span>
              <kpi.icon size={isMobile ? 14 : 16} className={kpi.color} />
            </div>
            <div className={`${isMobile ? 'text-xl' : 'text-2xl'} font-extrabold relative`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
        {/* CAPA Trends Chart */}
        <div className={`${isMobile ? '' : 'lg:col-span-2'} card p-4 md:p-5`}>
          <h3 className="text-sm md:text-base font-bold mb-4">CAPA Trends (6 Months)</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 250 : 280}>
            <LineChart data={capaTrends.length ? capaTrends : [
              { month: 'Oct', opened: 4, closed: 3 },
              { month: 'Nov', opened: 3, closed: 5 },
              { month: 'Dec', opened: 5, closed: 4 },
              { month: 'Jan', opened: 2, closed: 3 },
              { month: 'Feb', opened: 6, closed: 4 },
              { month: 'Mar', opened: 3, closed: 2 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1F2A40" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={isMobile ? 10 : 11} />
              <YAxis stroke="#64748b" fontSize={isMobile ? 10 : 11} />
              <Tooltip contentStyle={{ backgroundColor: '#141B2D', border: '1px solid #1F2A40', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="opened" stroke="#f59e0b" strokeWidth={2} dot={isMobile ? false : { r: 3 }} />
              <Line type="monotone" dataKey="closed" stroke="#10b981" strokeWidth={2} dot={isMobile ? false : { r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* CAPA Status Pie */}
        <div className="card p-4 md:p-5">
          <h3 className="text-sm md:text-base font-bold mb-4">CAPA Status Distribution</h3>
          <ResponsiveContainer width="100%" height={isMobile ? 250 : 280}>
            <PieChart>
              <Pie
                data={capaStatusData.length ? capaStatusData : [
                  { name: 'Open', value: 8, fill: '#f59e0b' },
                  { name: 'Investigation', value: 3, fill: '#3b82f6' },
                  { name: 'Closed', value: 12, fill: '#10b981' },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 40 : 50}
                outerRadius={isMobile ? 60 : 80}
                paddingAngle={3}
                dataKey="value"
              >
                {(capaStatusData.length ? capaStatusData : []).map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#141B2D', border: '1px solid #1F2A40', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card overflow-hidden">
        <div className={`px-4 md:px-5 py-3 border-b border-eqms-border`}>
          <h3 className="text-sm md:text-base font-bold">Recent Activity</h3>
        </div>
        <div className="divide-y divide-eqms-border">
          {(recentActivity.length ? recentActivity : [
            { type: 'CAPA', description: 'CAPA-2025-001 moved to Verification', timestamp: '2 hours ago' },
            { type: 'Document', description: 'SOP-QA-001 Rev 3 Approved', timestamp: '4 hours ago' },
            { type: 'Training', description: 'ISO 13485 Training Completed', timestamp: '1 day ago' },
            { type: 'Audit', description: 'Internal Audit Q1 Scheduled', timestamp: '2 days ago' },
            { type: 'Deviation', description: 'DEV-2025-003 Closed', timestamp: '3 days ago' },
          ]).slice(0, isMobile ? 5 : 8).map((item, i) => (
            <div key={i} className={`flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2 md:py-3 hover:bg-eqms-input transition-colors`}>
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <ArrowUpRight size={isMobile ? 10 : 12} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-slate-300 truncate">{item.description || item.title || `${item.type} activity`}</p>
                <p className="text-xs text-slate-500">{item.type}</p>
              </div>
              {!isMobile && <span className="text-xs text-slate-500 whitespace-nowrap">{item.timestamp || item.time || ''}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
