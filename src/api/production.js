import client from './client'

const productionAPI = {
  batches: {
    list: (params = {}) => client.get('/batch-records/batch-records/', { params }),
    get: (id) => client.get(`/batch-records/batch-records/${id}/`),
    create: (data) => client.post('/batch-records/batch-records/', data),
    update: (id, data) => client.patch(`/batch-records/batch-records/${id}/`, data),
    start: (id, data) => client.post(`/batch-records/batch-records/${id}/start/`, data),
    submitForReview: (id, data) => client.post(`/batch-records/batch-records/${id}/submit_for_review/`, data),
    complete: (id, data) => client.post(`/batch-records/batch-records/${id}/complete/`, data),
    release: (id, data) => client.post(`/batch-records/batch-records/${id}/release/`, data),
    reject: (id, data) => client.post(`/batch-records/batch-records/${id}/reject/`, data),
    quarantine: (id, data) => client.post(`/batch-records/batch-records/${id}/quarantine/`, data),
    transition: (id, data) => {
      const action = data?.action || data?.transition
      const endpoint = action || 'start'
      return client.post(`/batch-records/batch-records/${id}/${endpoint}/`, data)
    },
    auditTrail: (id) => client.get(`/batch-records/batch-records/${id}/audit_trail/`),
  },
  steps: {
    list: (params = {}) => client.get('/batch-records/batch-steps/', { params }),
    get: (id) => client.get(`/batch-records/batch-steps/${id}/`),
    start: (id) => client.post(`/batch-records/batch-steps/${id}/start/`),
    complete: (id, data) => client.post(`/batch-records/batch-steps/${id}/complete/`, data),
    verify: (id, data) => client.post(`/batch-records/batch-steps/${id}/verify/`, data),
    skip: (id, data) => client.post(`/batch-records/batch-steps/${id}/skip/`, data),
  },
  materials: {
    list: (params = {}) => client.get('/batch-records/batch-materials/', { params }),
    get: (id) => client.get(`/batch-records/batch-materials/${id}/`),
    dispense: (id, data) => client.post(`/batch-records/batch-materials/${id}/dispense/`, data),
    consume: (id, data) => client.post(`/batch-records/batch-materials/${id}/consume/`, data),
    verify: (id, data) => client.post(`/batch-records/batch-materials/${id}/verify/`, data),
  },
  batchEquipment: {
    list: (params = {}) => client.get('/batch-records/batch-equipment/', { params }),
    get: (id) => client.get(`/batch-records/batch-equipment/${id}/`),
    startUsage: (id) => client.post(`/batch-records/batch-equipment/${id}/start_usage/`),
    endUsage: (id) => client.post(`/batch-records/batch-equipment/${id}/end_usage/`),
  },
  masterBatchRecords: {
    list: (params = {}) => client.get('/batch-records/master-batch-records/', { params }),
  },
  // Validation module
  validation: {
    plans: (params = {}) => client.get('/validation/plans/', { params }),
    planGet: (id) => client.get(`/validation/plans/${id}/`),
    testCases: (params = {}) => client.get('/validation/test-cases/', { params }),
  },
  dashboard: () => client.get('/batch-records/batch-records/'),
}

export default productionAPI
