import * as SecureStore from 'expo-secure-store'

// Khi chạy trên thiết bị thật, thay localhost bằng IP máy tính (vd: 192.168.1.x)
// Khi chạy trên emulator Android: dùng 10.0.2.2 thay localhost
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'

// ── Token management ──────────────────────────────────────────────────────────

const ACCESS_KEY  = 'access_token'
const REFRESH_KEY = 'refresh_token'

export const TokenStore = {
  getAccess:     () => SecureStore.getItemAsync(ACCESS_KEY),
  getRefresh:    () => SecureStore.getItemAsync(REFRESH_KEY),
  setTokens:     (access: string, refresh: string) =>
    Promise.all([
      SecureStore.setItemAsync(ACCESS_KEY,  access),
      SecureStore.setItemAsync(REFRESH_KEY, refresh),
    ]),
  clear:         () =>
    Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
    ]),
}

// ── Base fetch with auth ──────────────────────────────────────────────────────

type FetchOptions = RequestInit & { auth?: boolean }

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { auth = true, ...rest } = options
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(rest.headers as Record<string, string>),
  }

  if (auth) {
    const token = await TokenStore.getAccess()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, { ...rest, headers })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

// ── Auth endpoints ────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ data: { accessToken: string; refreshToken: string; user: any } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }), auth: false },
    ),

  register: (data: { email: string; password: string; fullName: string; role?: string }) =>
    apiFetch<{ data: { accessToken: string; refreshToken: string; user: any } }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(data), auth: false },
    ),

  me: () => apiFetch<{ data: any }>('/auth/me'),
}

// ── Jobs endpoints ────────────────────────────────────────────────────────────

export const jobsApi = {
  list: (params?: { page?: number; limit?: number; q?: string; location?: string }) => {
    const qs = new URLSearchParams(
      Object.entries(params ?? {})
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)]),
    ).toString()
    return apiFetch<{ data: any[]; meta: any }>(`/jobs${qs ? `?${qs}` : ''}`, { auth: false })
  },

  detail: (id: string) =>
    apiFetch<{ data: any }>(`/jobs/${id}`, { auth: false }),

  apply: (jobId: string, resumeId?: string) =>
    apiFetch<{ data: any }>('/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId, resumeId }),
    }),
}

// ── Applications ──────────────────────────────────────────────────────────────

export const applicationsApi = {
  mine: () => apiFetch<{ data: any[] }>('/applications/my'),
}
