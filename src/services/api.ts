import axios from 'axios'

// Base API configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// API Endpoints
export const API = {
  getAgents: () => api.get('/agents'),
  runAgent: (payload: AgentRunRequest) => api.post('/run', payload),
  runAgentStream: (payload: AgentRunRequest) => api.post('/run_sse', payload, {
    responseType: 'stream',
  }),
  getHealth: () => api.get('/health'),
  // ... other endpoints
}

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Type definitions
export interface AgentRunRequest {
  appName: string
  userId: string
  sessionId?: string
  newMessage?: {
    role: string
    parts: { text: string }[]
  }
  streaming?: boolean
}