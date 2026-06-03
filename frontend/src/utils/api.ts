import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pi_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pi_token')
      localStorage.removeItem('pi_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (email: string, password: string) =>
    api.post('/auth/login',    { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  me:       () => api.get('/auth/me'),
}

// ─── Properties ───────────────────────────────────────────────────────────────
export const propertiesAPI = {
  list:   () => api.get('/properties'),
  create: (data: object) => api.post('/properties', data),
  update: (id: string, data: object) => api.put(`/properties/${id}`, data),
  delete: (id: string) => api.delete(`/properties/${id}`),
}

// ─── Units ────────────────────────────────────────────────────────────────────
export const unitsAPI = {
  byProperty: (propertyId: string) => api.get(`/units?propertyId=${propertyId}`),
}

// ─── Inspections ──────────────────────────────────────────────────────────────
export const inspectionsAPI = {
  get:    (unitId: string) => api.get(`/inspections/${unitId}`),
  upsert: (data: object)   => api.post('/inspections', data),
  byProperty: (propertyId: string) => api.get(`/inspections?propertyId=${propertyId}`),
}

// ─── Sync ──────────────────────────────────────────────────────────────────────
export const syncAPI = {
  push: (changes: object[]) => api.post('/sync/push', { changes }),
  pull: (since: number)     => api.get(`/sync/pull?since=${since}`),
}
