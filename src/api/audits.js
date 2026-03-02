import client from './client'

const auditsAPI = {
  list: (params = {}) => client.get('/audits/audit-plans/', { params }),
  get: (id) => client.get(`/audits/audit-plans/${id}/`),
  create: (data) => client.post('/audits/audit-plans/', data),
  update: (id, data) => client.patch(`/audits/audit-plans/${id}/`, data),
  delete: (id) => client.delete(`/audits/audit-plans/${id}/`),
  start: (id, data) => client.post(`/audits/audit-plans/${id}/start/`, data),
  complete: (id, data) => client.post(`/audits/audit-plans/${id}/complete/`, data),
  close: (id, data) => client.post(`/audits/audit-plans/${id}/close/`, data),
  transition: (id, data) => {
    const action = data?.action || data?.transition
    if (action === 'start') return client.post(`/audits/audit-plans/${id}/start/`, data)
    if (action === 'complete') return client.post(`/audits/audit-plans/${id}/complete/`, data)
    if (action === 'close') return client.post(`/audits/audit-plans/${id}/close/`, data)
    return client.post(`/audits/audit-plans/${id}/start/`, data)
  },
  findings: (id) => client.get(`/audits/audit-plans/${id}/findings/`),
  addFinding: (id, data) => client.post(`/audits/audit-plans/${id}/add_finding/`, data),
  timeline: (id) => client.get(`/audits/audit-plans/${id}/timeline/`),
  auditTrail: (id) => client.get(`/audits/audit-plans/${id}/timeline/`),
  stats: () => client.get('/audits/audit-plans/audit_stats/'),
  findingsList: (params = {}) => client.get('/audits/audit-findings/', { params }),
  findingResolve: (id, data) => client.post(`/audits/audit-findings/${id}/resolve/`, data),
  findingClose: (id, data) => client.post(`/audits/audit-findings/${id}/close/`, data),
  findingLinkCapa: (id, data) => client.post(`/audits/audit-findings/${id}/link_capa/`, data),
}

export default auditsAPI
