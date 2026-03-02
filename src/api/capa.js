import client from './client'

const capaAPI = {
  list: (params = {}) => client.get('/capa/capas/', { params }),
  get: (id) => client.get(`/capa/capas/${id}/`),
  create: (data) => client.post('/capa/capas/', data),
  update: (id, data) => client.patch(`/capa/capas/${id}/`, data),
  delete: (id) => client.delete(`/capa/capas/${id}/`),
  transition: (id, data) => client.post(`/capa/capas/${id}/phase_transition/`, data),
  comments: (id) => client.get(`/capa/capas/${id}/comments/`),
  addComment: (id, data) => client.post(`/capa/capas/${id}/comments/`, data),
  documents: (id) => client.get(`/capa/capas/${id}/documents/`),
  addDocument: (id, data) => client.post(`/capa/capas/${id}/add_document/`, data),
  approvals: (id) => client.get(`/capa/capas/${id}/approvals/`),
  respondApproval: (id, data) => client.post(`/capa/capas/${id}/respond_approval/`, data),
  timeline: (id) => client.get(`/capa/capas/${id}/timeline/`),
  auditTrail: (id) => client.get(`/capa/capas/${id}/timeline/`),
  updateFiveW: (id, data) => client.post(`/capa/capas/${id}/update_five_w/`, data),
  updateRiskMatrix: (id, data) => client.post(`/capa/capas/${id}/update_risk_matrix/`, data),
  requestExtension: (id, data) => client.post(`/capa/capas/${id}/request_extension/`, data),
  stats: () => client.get('/capa/capas/capa_stats/'),
  overdue: () => client.get('/capa/capas/overdue/'),
}

export default capaAPI
