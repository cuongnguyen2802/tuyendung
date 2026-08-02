import { readFileSync, statSync } from 'fs'
import { join } from 'path'

interface CacheEntry { data: unknown; mtime: number }
const cache = new Map<string, CacheEntry>()

// Reads a JSON file from src/data/, caches result in memory, invalidates only when file changes.
// statSync is a cheap syscall — no file I/O unless mtime changed.
export function readJsonCached<T>(file: string, fallback: T): T {
  const filePath = join(process.cwd(), 'src/data', file)
  try {
    const mtime = statSync(filePath).mtimeMs
    const hit = cache.get(file)
    if (hit && hit.mtime === mtime) return hit.data as T
    const data = JSON.parse(readFileSync(filePath, 'utf-8')) as T
    cache.set(file, { data, mtime })
    return data
  } catch {
    return fallback
  }
}
