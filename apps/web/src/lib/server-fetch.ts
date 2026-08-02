const API_BASE = (process.env.API_URL ?? 'http://localhost:3001') + '/api/v1'

interface FetchOptions {
  token?: string
  /** seconds; false = no-store (dynamic, per-request) */
  revalidate?: number | false
  tags?: string[]
}

/**
 * Native-fetch wrapper for Server Components.
 * Uses Next.js's patched fetch → ISR revalidation works correctly.
 * The standard API response envelope is { success, data } — this unwraps .data automatically.
 */
export async function serverFetch<T>(path: string, options: FetchOptions = {}): Promise<T | null> {
  const { token, revalidate, tags } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const init: RequestInit = { headers }

  if (revalidate === false) {
    init.cache = 'no-store'
  } else if (typeof revalidate === 'number' || tags) {
    init.next = {
      ...(typeof revalidate === 'number' ? { revalidate } : {}),
      ...(tags ? { tags } : {}),
    }
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, init)
    if (!res.ok) return null
    const json = await res.json()
    return (json.data ?? json) as T
  } catch (err: any) {
    if (process.env.NODE_ENV === 'development') {
      const code = err?.cause?.code ?? err?.code ?? ''
      if (code === 'ECONNREFUSED' || code === 'ECONNRESET' || code === 'ENOTFOUND') {
        console.error(`[serverFetch] API not reachable at ${API_BASE}${path} — is the API server running?`)
      } else {
        console.error(`[serverFetch] ${path}:`, err?.message ?? err)
      }
    }
    return null
  }
}
