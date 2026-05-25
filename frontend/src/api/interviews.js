import api from './client'

export const startInterview = (config) =>
  api.post('/interviews/start', config)

export const submitAnswer = (sessionId, answer) =>
  api.post(`/interviews/${sessionId}/answer`, { answer })

export const listSessions = () =>
  api.get('/interviews/')

export const getSession = (sessionId) =>
  api.get(`/interviews/${sessionId}`)

export const deleteSession = (sessionId) =>
  api.delete(`/interviews/${sessionId}`)
