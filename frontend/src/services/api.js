/**
 * API Service
 * ===========
 * Centralized Axios instance for all backend calls.
 * Base URL proxied through Vite → Flask on port 5001.
 */

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Interceptor: log errors globally ──────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API Error]', err.response?.data || err.message)
    return Promise.reject(err)
  }
)

// ── Endpoints ──────────────────────────────────────────────────────────────

/** POST /api/predict */
export const predictPrice = (payload) => api.post('/predict', payload)

/** GET /api/locations/:city */
export const getLocations = (city) => api.get(`/locations/${city}`)

/** GET /api/analytics/:city */
export const getAnalytics = (city) => api.get(`/analytics/${city}`)

/** GET /api/analytics/compare-cities */
export const compareCities = () => api.get('/analytics/compare-cities')

/** GET /api/model-performance */
export const getModelPerformance = () => api.get('/model-performance')

/** POST /api/compare */
export const compareProperties = (payload) => api.post('/compare', payload)

/** GET /api/health */
export const healthCheck = () => api.get('/health')

export default api
