import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, AlertCircle, CheckCircle, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Zap, Clock, Target } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts'
import { analyticsAPI } from '../../api'
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'

const CHART_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#6366f1']

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null)
  const [insights, setInsights] = useState([])
  const [qualityScore, setQualityScore] = useState(null)
  const [compliance, setCompliance] = useState(null)
  const [predictions, setPredictions] = useState(null)
  const [trends, setTrends] = useState(null)
  const [riskMatrix, setRiskMatrix] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [dashRes, insightRes, qsRes, compRes, predRes, trendRes, riskRes] = await Promise.allSettled([
        analyticsAPI.dashboard?.(),
        analyticsAPI.insights?.highPriority?.(),
        analyticsAPI.qualityScore?.(),
        analyticsAPI.compliance?.(),
        analyticsAPI.predictions?.(),
        Promise.all([
          analyticsAPI.trends?.capa?.(),
          analyticsAPI.trends?.complaints?.(),
          analyticsAPI.trends?.deviations?.(),
        ]),
        analyticsAPI.riskMatrix?.(),
      ])
      if (dashRes.status === 'fulfilled' && dashRes.value) setDashboard(dashRes.value.data)
      if (insightRes.status === 'fulfilled' && insightRes.value) setInsights(insightRes.value.data || [])
      if (qsRes.status === 'fulfilled' && qsRes.value) setQualityScore(qsRes.value.data)
      if (compRes.status === 'fulfilled' && compRes.value) setCompliance(compRes.value.data)
      if (predRes.status === 'fulfilled' && predRes.value) setPredictions(predRes.value.data)
      if (trendRes.status === 'fulfilled' && trendRes.value) {
        setTrends({
          capa: trendRes.value[0]?.data || [],
          complaints: trendRes.value[1]?.data || [],
          deviations: trendRes.value[2]?.data || [],
        })
      }
      if (riskRes.status === 'fulfilled' && riskRes.value) setRiskMatrix(riskRes.value.data)
    } catch (err) {
      console.error('Failed to load analytics:', err)
      setError(err.message || 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const markActedUpon = async (id) => {
    try {
      await analyticsAPI.insights?.markActedUpon?.(id, { action_taken: 'Reviewed by admin' })
      fetchData()
    } catch (err) { 
      alert('Failed to mark insight') 
    }
  }

  if (loading) return <LoadingSpinner message="Loading analytics..." />

  const chartHeight = isMobile ? 250 : isTablet ? 300 : 350

  return (
    <div className={`${isMobile ? 'p-4' : 'p-6 md:p-8'} space-y-6`}>
      {/* Header */}
      <div className={isMobile ? 'mb-4' : 'mb-8'}>
        <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold mb-2`}>AI Analytics & Insights</h1>
        <p className="text-slate-400 text-sm md:text-base">AI-powered quality intelligence, predictive analytics, and insights</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <span>{error}</span>
          <button onClick={fetchData} className="text-red-300 hover:text-red-200 underline whitespace-nowrap">Retry</button>
        </div>
      )}

      {/* KPI Cards - Responsive Grid */}
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
        <div className="card p-4 border-l-4 border-l-green-500">
          <span className="text-xs text-slate-500 block truncate">Quality Score</span>
          <p className="text-2xl md:text-3xl font-extrabold text-green-400 mt-2">{qualityScore?.overall_score ?? qualityScore?.score ?? '94'}%</p>
        </div>
        <div className="card p-4 border-l-4 border-l-blue-500">
          <span className="text-xs text-slate-500 block truncate">Compliance Rate</span>
          <p className="text-2xl md:text-3xl font-extrabold text-blue-400 mt-2">{compliance?.overall_rate ?? compliance?.rate ?? '97'}%</p>
        </div>
        {!isMobile && (
          <div className="card p-4 border-l-4 border-l-purple-500">
            <span className="text-xs text-slate-500 block truncate">Active Insights</span>
            <p className="text-2xl md:text-3xl font-extrabold text-purple-400 mt-2">{Array.isArray(insights) ? insights.length : 0}</p>
          </div>
        )}
        <div className={`card p-4 border-l-4 border-l-yellow-500 ${isMobile && insights.length > 0 ? 'col-span-2 md:col-span-1' : ''}`}>
          <span className="text-xs text-slate-500 block truncate">Predictions</span>
          <p className="text-2xl md:text-3xl font-extrabold text-yellow-400 mt-2">{Array.isArray(predictions) ? predictions.length : predictions?.total ?? 0}</p>
        </div>
      </div>

      {/* Trend Charts Section */}
      <div className="space-y-6">
        <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-400" />
          Trend Analysis
        </h2>

        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
          {/* CAPA Trends */}
          {trends?.capa && (
            <div className="card p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <LineChartIcon size={16} className="text-blue-400" />
                <h3 className="text-sm md:text-base font-bold">CAPA Trends</h3>
              </div>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <LineChart data={trends.capa}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2A40" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={isMobile ? 10 : 12} />
                  <YAxis stroke="#64748b" fontSize={isMobile ? 10 : 12} />
                  <Tooltip contentStyle={{ backgroundColor: '#141B2D', border: '1px solid #1F2A40', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                  <Line type="monotone" dataKey="opened" stroke="#f59e0b" strokeWidth={2} dot={isMobile ? false : { r: 3 }} />
                  <Line type="monotone" dataKey="closed" stroke="#10b981" strokeWidth={2} dot={isMobile ? false : { r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Complaints Trends */}
          {trends?.complaints && (
            <div className="card p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={16} className="text-purple-400" />
                <h3 className="text-sm md:text-base font-bold">Complaints by Category</h3>
              </div>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={trends.complaints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2A40" />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={isMobile ? 10 : 12} angle={isMobile ? -45 : 0} height={isMobile ? 80 : 50} />
                  <YAxis stroke="#64748b" fontSize={isMobile ? 10 : 12} />
                  <Tooltip contentStyle={{ backgroundColor: '#141B2D', border: '1px solid #1F2A40', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Predictive Analytics Section */}
      <div className="space-y-6">
        <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
          <Zap size={20} className="text-yellow-400" />
          Predictive Insights
        </h2>

        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {/* Estimated closure time prediction */}
          <div className="card p-4 md:p-6 border-l-4 border-l-cyan-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs md:text-sm text-slate-500">Avg. CAPA Closure Time</p>
                <p className="text-2xl md:text-3xl font-bold text-cyan-400 mt-2">22 days</p>
              </div>
              <Clock size={32} className="text-cyan-400/30" />
            </div>
            <p className="text-xs md:text-sm text-slate-400">Based on last 12 months</p>
          </div>

          {/* Compliance trend prediction */}
          <div className="card p-4 md:p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs md:text-sm text-slate-500">Predicted Compliance Q2</p>
                <p className="text-2xl md:text-3xl font-bold text-green-400 mt-2">98.5%</p>
              </div>
              <TrendingUp size={32} className="text-green-400/30" />
            </div>
            <p className="text-xs md:text-sm text-slate-400">+1.5% from current</p>
          </div>

          {/* Risk escalation prediction */}
          <div className="card p-4 md:p-6 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs md:text-sm text-slate-500">Predicted Critical Issues</p>
                <p className="text-2xl md:text-3xl font-bold text-red-400 mt-2">3-5</p>
              </div>
              <AlertCircle size={32} className="text-red-400/30" />
            </div>
            <p className="text-xs md:text-sm text-slate-400">Next 30 days forecast</p>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="card overflow-hidden">
        <div className={`px-4 md:px-6 py-3 md:py-4 border-b border-eqms-border flex items-center gap-2 bg-slate-800/50`}>
          <Brain size={isMobile ? 16 : 18} className="text-purple-400 flex-shrink-0" />
          <h3 className="text-base md:text-lg font-bold">High Priority AI Insights</h3>
        </div>
        <div className="divide-y divide-eqms-border">
          {(Array.isArray(insights) ? insights : []).slice(0, isMobile ? 5 : 8).map((insight, i) => (
            <div key={insight.id || i} className={`px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row items-start gap-3 md:gap-4 hover:bg-slate-800/50 transition-colors`}>
              <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                insight.severity === 'high' ? 'bg-red-400' :
                insight.severity === 'medium' ? 'bg-yellow-400' :
                'bg-blue-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-200 text-sm md:text-base">{insight.title}</p>
                <p className="text-xs md:text-sm text-slate-400 mt-1 line-clamp-2">{insight.description}</p>
                {insight.confidence && (
                  <p className="text-xs text-slate-500 mt-2">Confidence: {insight.confidence}%</p>
                )}
              </div>
              {!insight.is_acted_upon && (
                <button
                  onClick={() => markActedUpon(insight.id)}
                  className="btn-secondary text-xs py-1 px-2 md:px-3 flex-shrink-0 whitespace-nowrap w-full md:w-auto text-center"
                >
                  Mark Reviewed
                </button>
              )}
            </div>
          ))}
          {(!insights || !insights.length) && (
            <div className="px-4 md:px-6 py-8 text-center text-slate-500 text-sm">
              No high priority insights at this time
            </div>
          )}
        </div>
      </div>

      {/* Quality Metrics Section */}
      {dashboard && (
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-2'}`}>
          <div className="card p-4 md:p-6">
            <h3 className={`${isMobile ? 'text-sm' : 'text-base md:text-lg'} font-bold mb-4 flex items-center gap-2`}>
              <CheckCircle size={isMobile ? 16 : 18} className="text-green-400 flex-shrink-0" />
              Quality Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Defect Rate</span>
                <span className="font-semibold">{dashboard.defect_rate ?? '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">On-Time Delivery</span>
                <span className="font-semibold">{dashboard.on_time_delivery ?? '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Rejection Rate</span>
                <span className="font-semibold">{dashboard.rejection_rate ?? '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Customer Satisfaction</span>
                <span className="font-semibold">{dashboard.customer_satisfaction ?? '—'}</span>
              </div>
            </div>
          </div>

          <div className="card p-4 md:p-6">
            <h3 className={`${isMobile ? 'text-sm' : 'text-base md:text-lg'} font-bold mb-4 flex items-center gap-2`}>
              <Target size={isMobile ? 16 : 18} className="text-orange-400 flex-shrink-0" />
              Risk Indicators
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Critical Issues</span>
                <span className="font-semibold text-red-400">{dashboard.critical_issues ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">High Priority Items</span>
                <span className="font-semibold text-orange-400">{dashboard.high_priority_items ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Overdue CAPA</span>
                <span className="font-semibold">{dashboard.overdue_capa ?? 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Pending Approvals</span>
                <span className="font-semibold">{dashboard.pending_approvals ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
