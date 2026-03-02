import client from './client'

const trainingAPI = {
  // Courses (primary training entity)
  list: (params = {}) => client.get('/training/courses/', { params }),
  get: (id) => client.get(`/training/courses/${id}/`),
  create: (data) => client.post('/training/courses/', data),
  update: (id, data) => client.patch(`/training/courses/${id}/`, data),
  delete: (id) => client.delete(`/training/courses/${id}/`),
  publish: (id, data) => client.post(`/training/courses/${id}/publish/`, data),
  archive: (id, data) => client.post(`/training/courses/${id}/archive/`, data),
  assignUsers: (id, data) => client.post(`/training/courses/${id}/assign_users/`, data),
  autoAssign: (id, data) => client.post(`/training/courses/${id}/auto_assign/`, data),
  courseStats: (id) => client.get(`/training/courses/${id}/course_stats/`),
  assessment: (id) => client.get(`/training/courses/${id}/assessment/`),
  auditTrail: (id) => client.get(`/training/courses/${id}/course_stats/`),
  // Assignments (training records per user)
  assignments: {
    list: (params = {}) => client.get('/training/assignments/', { params }),
    get: (id) => client.get(`/training/assignments/${id}/`),
    complete: (id, data) => client.post(`/training/assignments/${id}/complete/`, data),
    submitAssessment: (id, data) => client.post(`/training/assignments/${id}/submit_assessment/`, data),
    bulkAssign: (data) => client.post('/training/assignments/bulk_assign/', data),
    myTraining: () => client.get('/training/assignments/my_training/'),
    overdue: () => client.get('/training/assignments/overdue/'),
  },
  // Dashboard & compliance
  dashboard: () => client.get('/training/dashboard/'),
  compliance: () => client.get('/training/compliance/'),
  complianceByDept: () => client.get('/training/compliance/by_department/'),
  complianceOverdue: () => client.get('/training/compliance/overdue/'),
  // Competencies
  competencies: {
    list: (params = {}) => client.get('/training/competencies/', { params }),
    get: (id) => client.get(`/training/competencies/${id}/`),
  },
  // Job functions
  jobFunctions: {
    list: (params = {}) => client.get('/training/job-functions/', { params }),
    get: (id) => client.get(`/training/job-functions/${id}/`),
  },
  // Generic transition alias for UI compatibility
  transition: (id, data) => {
    const action = data?.action || data?.transition
    if (action === 'publish') return client.post(`/training/courses/${id}/publish/`, data)
    if (action === 'archive') return client.post(`/training/courses/${id}/archive/`, data)
    return client.post(`/training/courses/${id}/publish/`, data)
  },
}

export default trainingAPI
