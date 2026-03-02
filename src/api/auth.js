import client from './client'

const authAPI = {
  login: (username, password) =>
    client.post('/auth/login/', { username, password }),

  refresh: (refresh) =>
    client.post('/auth/refresh/', { refresh }),

  getCurrentUser: () =>
    client.get('/users/profiles/current_user/'),
}

export default authAPI
