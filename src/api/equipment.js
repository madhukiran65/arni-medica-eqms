import client from './client'

const equipmentAPI = {
  equipment: {
    list: (params = {}) => client.get('/equipment/equipment/', { params }),
    get: (id) => client.get(`/equipment/equipment/${id}/`),
    create: (data) => client.post('/equipment/equipment/', data),
    update: (id, data) => client.patch(`/equipment/equipment/${id}/`, data),
    delete: (id) => client.delete(`/equipment/equipment/${id}/`),
    changeStatus: (id, data) => client.post(`/equipment/equipment/${id}/change_status/`, data),
    calibrationStatus: (id) => client.get(`/equipment/equipment/${id}/calibration_status/`),
    maintenanceStatus: (id) => client.get(`/equipment/equipment/${id}/maintenance_status/`),
    auditTrail: (id) => client.get(`/equipment/equipment/${id}/audit_trail/`),
  },
  calibrations: {
    list: (params = {}) => client.get('/equipment/calibration-records/', { params }),
    get: (id) => client.get(`/equipment/calibration-records/${id}/`),
    create: (data) => client.post('/equipment/calibration-records/', data),
    update: (id, data) => client.patch(`/equipment/calibration-records/${id}/`, data),
    delete: (id) => client.delete(`/equipment/calibration-records/${id}/`),
    approve: (id, data) => client.post(`/equipment/calibration-records/${id}/approve_record/`, data),
    failed: () => client.get('/equipment/calibration-records/failed_records/'),
    auditTrail: (id) => client.get(`/equipment/calibration-records/${id}/audit_trail/`),
  },
  calibrationSchedules: {
    list: (params = {}) => client.get('/equipment/calibration-schedules/', { params }),
    get: (id) => client.get(`/equipment/calibration-schedules/${id}/`),
    overdue: (id) => client.get(`/equipment/calibration-schedules/${id}/overdue_equipment/`),
  },
  maintenance: {
    list: (params = {}) => client.get('/equipment/maintenance-records/', { params }),
    get: (id) => client.get(`/equipment/maintenance-records/${id}/`),
    create: (data) => client.post('/equipment/maintenance-records/', data),
    complete: (id, data) => client.post(`/equipment/maintenance-records/${id}/complete_record/`, data),
    pending: () => client.get('/equipment/maintenance-records/pending_maintenance/'),
  },
  qualifications: {
    list: (params = {}) => client.get('/equipment/qualifications/', { params }),
    get: (id) => client.get(`/equipment/qualifications/${id}/`),
    approve: (id, data) => client.post(`/equipment/qualifications/${id}/mark_approved/`, data),
  },
  documents: {
    list: (params = {}) => client.get('/equipment/documents/', { params }),
    expiring: () => client.get('/equipment/documents/expiring_documents/'),
  },
  dashboard: () => client.get('/equipment/equipment/'),
}

export default equipmentAPI
