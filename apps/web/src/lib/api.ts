import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'

// ── Client-side session token cache ──────────────────────────────────────────
// Avoids calling getSession() (HTTP round-trip) before every API request.
// Updated by SessionSync component whenever the NextAuth session changes.

let _cachedToken: string | null = null
let _tokenExp = 0

export function setApiToken(token: string | null) {
  _cachedToken = token
  // Access token lifetime is 1h; cache for 55 min to be safe
  _tokenExp = token ? Date.now() + 55 * 60 * 1000 : 0
}

// Fallback: used only on the very first API call before SessionSync has run
let _sessionFetch: Promise<any> | null = null

async function getTokenOnce(): Promise<string | null> {
  // Return cache if still valid
  if (_cachedToken && Date.now() < _tokenExp) return _cachedToken

  // Deduplicate concurrent calls — only one getSession() in flight at a time
  if (!_sessionFetch) {
    _sessionFetch = Promise.race([
      getSession(),
      new Promise<null>((r) => setTimeout(() => r(null), 3000)),
    ]).finally(() => { _sessionFetch = null })
  }

  const session = await _sessionFetch
  if (session?.accessToken) {
    setApiToken(session.accessToken)
    return session.accessToken
  }
  return null
}

// ── Client-side Axios instance (for use inside client components) ─────────────

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api/v1',
  timeout: 10000,
})

function forceLogout() {
  setApiToken(null)
  signOut({ callbackUrl: '/login' }).finally(() => {
    if (typeof window !== 'undefined') window.location.href = '/login'
  })
}

api.interceptors.request.use(async (config) => {
  if ((config as any).__skipAuth) return config

  const token = await getTokenOnce()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    ;(config as any).__authSent = true
  }
  return config
})

api.interceptors.response.use(
  (res) => res.data.data,
  async (error) => {
    if (error.response?.status === 401 && (error.config as any)?.__authSent) {
      forceLogout()
      return Promise.reject(new Error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại'))
    }
    const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại'
    if (error.response?.status === 403 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('upgrade-required', { detail: { message } }))
    }
    return Promise.reject(new Error(message))
  },
)

// ── Server-side Axios instance (for use in Server Components / Route Handlers) ─

const _serverApi = axios.create({
  baseURL: process.env.API_URL + '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

export const serverApi = (accessToken?: string) => {
  if (!accessToken) return _serverApi
  return axios.create({
    baseURL: process.env.API_URL + '/api/v1',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    timeout: 10000,
  })
}
