import client from './client'

const suppliersAPI = {
  list: (params = {}) => client.get('/suppliers/suppliers/', { params }),
  get: (id) => client.get(`/suppliers/suppliers/${id}/`),
  create: (data) => client.post('/suppliers/suppliers/', data),
  update: (id, data) => client.patch(`/suppliers/suppliers/${id}/`, data),
  delete: (id) => client.delete(`/suppliers/suppliers/${id}/`),
  qualify: (id, data) => client.post(`/suppliers/suppliers/${id}/qualify/`, data),
  suspend: (id, data) => client.post(`/suppliers/suppliers/${id}/suspend/`, data),
  disqualify: (id, data) => client.post(`/suppliers/suppliers/${id}/disqualify/`, data),
  transition: (id, data) => {
    const action = data?.action || data?.transition
    if (action === 'qualify') return client.post(`/suppliers/suppliers/${id}/qualify/`, data)
    if (action === 'suspend') return client.post(`/suppliers/suppliers/${id}/suspend/`, data)
    if (action === 'disqualify') return client.post(`/suppliers/suppliers/${id}/disqualify/`, data)
    return client.post(`/suppliers/suppliers/${id}/qualify/`, data)
  },
  evaluations: (id) => client.get(`/suppliers/suppliers/${id}/evaluations/`),
  addEvaluation: (id, data) => client.post(`/suppliers/evaluations/`, { ...data, supplier: id }),
  correctiveActions: (id) => client.get(`/suppliers/suppliers/${id}/corrective_actions/`),
  documents: (id) => client.get(`/suppliers/suppliers/${id}/documents/`),
  timeline: (id) => client.get(`/suppliers/suppliers/${id}/timeline/`),
  auditTrail: (id) => client.get(`/suppliers/suppliers/${id}/timeline/`),
  stats: () => client.get('/suppliers/suppliers/supplier_stats/'),
  pendingQualification: () => client.get('/suppliers/suppliers/pending_qualification/'),
  dueForRequalification: () => client.get('/suppliers/suppliers/due_for_requalification/'),
}

export default suppliersAPI
