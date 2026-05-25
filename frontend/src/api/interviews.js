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

export const getTTSAudio = async (text, voice = 'M1') => {
  const response = await api.post(
    '/interviews/tts',
    { text, voice },
    { responseType: 'blob' }
  )
  return URL.createObjectURL(response.data)
}

