import client from './client'

const usersAPI = {
  departments: {
    list: () => client.get('/users/departments/'),
    get: (id) => client.get(`/users/departments/${id}/`),
    create: (data) => client.post('/users/departments/', data),
    update: (id, data) => client.patch(`/users/departments/${id}/`, data),
    delete: (id) => client.delete(`/users/departments/${id}/`),
  },
  roles: {
    list: () => client.get('/users/roles/'),
    get: (id) => client.get(`/users/roles/${id}/`),
    create: (data) => client.post('/users/roles/', data),
    update: (id, data) => client.patch(`/users/roles/${id}/`, data),
    delete: (id) => client.delete(`/users/roles/${id}/`),
  },
  profiles: {
    list: () => client.get('/users/profiles/'),
    get: (id) => client.get(`/users/profiles/${id}/`),
    current: () => client.get('/users/profiles/current_user/'),
    register: (data) => client.post('/users/profiles/register/', data),
    update: (id, data) => client.patch(`/users/profiles/${id}/`, data),
    delete: (id) => client.delete(`/users/profiles/${id}/`),
  },
}

export default usersAPI
