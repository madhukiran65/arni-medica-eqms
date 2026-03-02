import client from './client'

const changeControlsAPI = {
  list: (params = {}) => client.get('/change-controls/change-controls/', { params }),
  get: (id) => client.get(`/change-controls/change-controls/${id}/`),
  create: (data) => client.post('/change-controls/change-controls/', data),
  update: (id, data) => client.patch(`/change-controls/change-controls/${id}/`, data),
  delete: (id) => client.delete(`/change-controls/change-controls/${id}/`),
  transition: (id, data) => client.post(`/change-controls/change-controls/${id}/stage_transition/`, data),
  comments: (id) => client.get(`/change-controls/change-controls/${id}/comments/`),
  addComment: (id, data) => client.post(`/change-controls/change-controls/${id}/comments/`, data),
  attachments: (id) => client.get(`/change-controls/change-controls/${id}/attachments/`),
  approvals: (id) => client.get(`/change-controls/change-controls/${id}/approvals/`),
  respondApproval: (id, data) => client.post(`/change-controls/change-controls/${id}/respond_approval/`, data),
  tasks: (id) => client.get(`/change-controls/change-controls/${id}/tasks/`),
  completeTask: (id, taskId) => client.post(`/change-controls/change-controls/${id}/tasks/${taskId}/complete/`),
  impactSummary: (id) => client.get(`/change-controls/change-controls/${id}/impact_summary/`),
  timeline: (id) => client.get(`/change-controls/change-controls/${id}/timeline/`),
  auditTrail: (id) => client.get(`/change-controls/change-controls/${id}/timeline/`),
  stats: () => client.get('/change-controls/change-controls/change_control_stats/'),
  overdue: () => client.get('/change-controls/change-controls/overdue/'),
}

export default changeControlsAPI
