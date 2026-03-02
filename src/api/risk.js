import client from './client'

const riskAPI = {
  assessments: {
    list: (params = {}) => client.get('/risk-management/assessments/', { params }),
    get: (id) => client.get(`/risk-management/assessments/${id}/`),
    create: (data) => client.post('/risk-management/assessments/', data),
    update: (id, data) => client.patch(`/risk-management/assessments/${id}/`, data),
    delete: (id) => client.delete(`/risk-management/assessments/${id}/`),
    transition: (id, data) => client.post(`/risk-management/assessments/${id}/transition/`, data),
    hazards: (id) => client.get(`/risk-management/assessments/${id}/hazards/`),
    addHazard: (id, data) => client.post(`/risk-management/assessments/${id}/add_hazard/`, data),
    auditTrail: (id) => client.get(`/risk-management/assessments/${id}/audit_trail/`),
    allowedTransitions: (id) => client.get(`/risk-management/assessments/${id}/allowed_transitions/`),
  },
  categories: {
    list: (params = {}) => client.get('/risk-management/categories/', { params }),
    get: (id) => client.get(`/risk-management/categories/${id}/`),
  },
  hazards: {
    list: (params = {}) => client.get('/risk-management/hazards/', { params }),
    get: (id) => client.get(`/risk-management/hazards/${id}/`),
  },
  mitigations: {
    list: (params = {}) => client.get('/risk-management/mitigations/', { params }),
    get: (id) => client.get(`/risk-management/mitigations/${id}/`),
  },
  fmea: {
    worksheets: (params = {}) => client.get('/risk-management/fmea-worksheets/', { params }),
    records: (params = {}) => client.get('/risk-management/fmea-records/', { params }),
  },
}

export default riskAPI
