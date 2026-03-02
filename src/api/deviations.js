import client from './client'

const deviationsAPI = {
  list: (params = {}) => client.get('/deviations/deviations/', { params }),
  get: (id) => client.get(`/deviations/deviations/${id}/`),
  create: (data) => client.post('/deviations/deviations/', data),
  update: (id, data) => client.patch(`/deviations/deviations/${id}/`, data),
  delete: (id) => client.delete(`/deviations/deviations/${id}/`),
  transition: (id, data) => client.post(`/deviations/deviations/${id}/stage_transition/`, data),
  comments: (id) => client.get(`/deviations/deviations/${id}/comments/`),
  addComment: (id, data) => client.post(`/deviations/deviations/${id}/comments/`, data),
  attachments: (id) => client.get(`/deviations/deviations/${id}/attachments/`),
  autoCreateCapa: (id, data) => client.post(`/deviations/deviations/${id}/auto_create_capa/`, data),
  timeline: (id) => client.get(`/deviations/deviations/${id}/timeline/`),
  auditTrail: (id) => client.get(`/deviations/deviations/${id}/audit_trail/`),
  stats: () => client.get('/deviations/deviations/deviation_stats/'),
  overdue: () => client.get('/deviations/deviations/overdue/'),
}

export default deviationsAPI
