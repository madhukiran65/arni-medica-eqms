import client from './client'

const complaintsAPI = {
  list: (params = {}) => client.get('/complaints/complaints/', { params }),
  get: (id) => client.get(`/complaints/complaints/${id}/`),
  create: (data) => client.post('/complaints/complaints/', data),
  update: (id, data) => client.patch(`/complaints/complaints/${id}/`, data),
  delete: (id) => client.delete(`/complaints/complaints/${id}/`),
  // Specific workflow actions
  assign: (id, data) => client.post(`/complaints/complaints/${id}/assign/`, data),
  startInvestigation: (id, data) => client.post(`/complaints/complaints/${id}/start_investigation/`, data),
  completeInvestigation: (id, data) => client.post(`/complaints/complaints/${id}/complete_investigation/`, data),
  determineReportability: (id, data) => client.post(`/complaints/complaints/${id}/determine_reportability/`, data),
  close: (id, data) => client.post(`/complaints/complaints/${id}/close/`, data),
  // Generic transition (routes to specific action)
  transition: (id, data) => {
    const action = data?.action || data?.transition
    const actionMap = {
      assign: 'assign', start_investigation: 'start_investigation',
      complete_investigation: 'complete_investigation',
      determine_reportability: 'determine_reportability', close: 'close'
    }
    const endpoint = actionMap[action] || action
    return client.post(`/complaints/complaints/${id}/${endpoint}/`, data)
  },
  auditTrail: (id) => client.get(`/complaints/complaints/${id}/audit_trail/`),
  // Comments & attachments
  comments: (params = {}) => client.get('/complaints/complaint-comments/', { params }),
  addComment: (data) => client.post('/complaints/complaint-comments/', data),
  attachments: (params = {}) => client.get('/complaints/complaint-attachments/', { params }),
  addAttachment: (data) => client.post('/complaints/complaint-attachments/', data),
  // PMS
  pmsPlans: {
    list: (params = {}) => client.get('/complaints/pms-plans/', { params }),
    get: (id) => client.get(`/complaints/pms-plans/${id}/`),
    create: (data) => client.post('/complaints/pms-plans/', data),
    activate: (id) => client.post(`/complaints/pms-plans/${id}/activate/`),
    close: (id) => client.post(`/complaints/pms-plans/${id}/close/`),
  },
}

export default complaintsAPI
