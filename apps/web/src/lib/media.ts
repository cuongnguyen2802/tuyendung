/**
 * Resolve a media URL that may be:
 *  - An absolute S3 / external URL  → returned as-is
 *  - A relative path  (/uploads/...) → prepend NEXT_PUBLIC_API_URL
 *  - An old localhost URL stored in DB → swap host with NEXT_PUBLIC_API_URL
 *
 * This lets the backend store simple relative paths that work regardless of
 * which domain the API is deployed to.
 */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null

  // Already an absolute HTTPS URL (S3, Cloudinary, etc.) — use as-is
  if (url.startsWith('https://')) return url

  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')

  // Relative path produced by the new saveLocally logic
  if (url.startsWith('/')) {
    return apiBase + url
  }

  // Legacy format: http://localhost:3001/uploads/... stored before this fix.
  // Extract the path portion and prepend the correct API base.
  if (url.startsWith('http://')) {
    try {
      const { pathname } = new URL(url)
      return apiBase + pathname
    } catch {
      return url
    }
  }

  return url
}
