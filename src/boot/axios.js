import { defineBoot } from '#q-app'
import axios from 'axios'
import { API_URL, isServerConfigured } from 'src/config'
import { getToken, userIdOf } from 'src/services/auth/token'
import { getLocalUser } from 'src/services/storage/local'

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  withCredentials: true,
})

/** Endpoints where a 401 means "wrong credentials", not "session expired". */
const AUTH_ENDPOINTS = ['/login', '/register']

export const SESSION_EXPIRED_EVENT = 'keyapp:session-expired'

/**
 * Error categories used by the UI:
 * config | network | timeout | unauthorized | forbidden | notFound |
 * conflict | rateLimited | validation | server | unknown
 */
function classify(error) {
  if (error?.kind) return error.kind
  if (axios.isCancel(error)) return 'cancelled'
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') return 'timeout'
  const status = error.response?.status
  if (!status) return 'network'
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'notFound'
  if (status === 409) return 'conflict'
  if (status === 429) return 'rateLimited'
  if (status === 400 || status === 422) return 'validation'
  if (status >= 500) return 'server'
  return 'unknown'
}

// Attach credentials at request time, so a login takes effect immediately
api.interceptors.request.use((config) => {
  if (!isServerConfigured) {
    const err = new Error('API server is not configured')
    err.kind = 'config'
    return Promise.reject(err)
  }
  const token = getToken()
  config.headers = config.headers || {}
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    config.headers['x-auth-token'] = token
  } else {
    // Legacy server without tokens: keep the previous behaviour
    const uid = userIdOf(getLocalUser())
    if (uid) config.headers['x-auth-token'] = uid
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    error.kind = classify(error)
    error.serverMessage = error.response?.data?.message || error.response?.data?.error || null
    // Machine-readable reason from the API (e.g. EMAIL_TAKEN, INSUFFICIENT_STABLE)
    error.serverCode = error.response?.data?.code || null

    const url = error.config?.url || ''
    const isAuthCall = AUTH_ENDPOINTS.some((p) => url.endsWith(p))
    if (error.kind === 'unauthorized' && !isAuthCall && getLocalUser()) {
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
    }
    return Promise.reject(error)
  },
)

export default defineBoot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { axios, api }
