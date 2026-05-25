import api from './client'

export const register = (email, password, fullName) =>
  api.post('/auth/register', { email, password, full_name: fullName })

export const login = (email, password) =>
  api.post('/auth/login', { email, password })

export const getMe = () =>
  api.get('/auth/me')
