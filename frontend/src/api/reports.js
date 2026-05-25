import api from './client'

export const generateReport = (sessionId) =>
  api.post(`/reports/${sessionId}/generate`)

export const getReport = (sessionId) =>
  api.get(`/reports/${sessionId}`)

export const listReports = () =>
  api.get('/reports/')
