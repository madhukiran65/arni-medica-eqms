import client from './client'

const analyticsAPI = {
  dashboard: () => client.get('/ai/dashboard/'),
  insights: {
    list: (params = {}) => client.get('/ai/insights/', { params }),
    get: (id) => client.get(`/ai/insights/${id}/`),
    markActedUpon: (id, data) => client.post(`/ai/insights/${id}/mark_acted_upon/`, data),
    highPriority: () => client.get('/ai/insights/?priority=high'),
    byType: (type) => client.get('/ai/insights/', { params: { type } }),
  },
  kpis: () => client.get('/ai/kpis/'),
  trends: {
    capa: () => client.get('/ai/trends/capa/'),
    complaints: () => client.get('/ai/trends/complaints/'),
    deviations: () => client.get('/ai/trends/deviations/'),
  },
  qualityScore: () => client.get('/ai/quality-score/'),
  compliance: () => client.get('/ai/compliance/'),
  predictions: () => client.get('/ai/predictions/'),
  riskMatrix: () => client.get('/ai/risk-matrix/'),
}

export default analyticsAPI
