import axios from 'axios'
import { getToken, removeToken } from './storage'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

// Quizzes endpoints
export const quizzesApi = {
  getAvailable: () => api.get('/quiz/available'),
  getById: (id: string) => api.get(`/quiz/${id}`),
  submit: (quizId: string, answers: Record<string, string>) =>
    api.post(`/quiz/${quizId}/submit`, { answers }),
  getMySubmissions: () => api.get('/quiz/submissions'),
}

// Sports endpoints
export const sportsApi = {
  getMatches: () => api.get('/sports/matches'),
  getMatchById: (id: string) => api.get(`/sports/matches/${id}`),
}

// Sessions endpoints
export const sessionsApi = {
  getActive: () => api.get('/attendance/sessions'),
  scanQr: (code: string) => api.post('/attendance/scan', { code }),
}

// Publications endpoints
export const publicationsApi = {
  getAll: () => api.get('/publications'),
  getById: (id: string) => api.get(`/publications/${id}`),
}

// XP endpoints
export const xpApi = {
  getHistory: () => api.get('/xp/history'),
  getLeaderboard: () => api.get('/xp/leaderboard'),
}

// Profile endpoints
export const profileApi = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data: Record<string, any>) =>
    api.put('/profile', data),
}

export default api
