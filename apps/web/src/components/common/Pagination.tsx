'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { PaginationMeta } from '@tuyendung/types'
import { cn } from '@/lib/utils'

export function Pagination({ meta }: { meta: PaginationMeta }) {
  const router = useRouter()
  const params = useSearchParams()

  const goToPage = (page: number) => {
    const p = new URLSearchParams(params.toString())
    p.set('page', String(page))
    router.push(`?${p.toString()}`)
  }

  const pages = Array.from({ length: Math.min(meta.totalPages, 7) }, (_, i) => {
    if (meta.totalPages <= 7) return i + 1
    if (meta.page <= 4) return i + 1
    if (meta.page >= meta.totalPages - 3) return meta.totalPages - 6 + i
    return meta.page - 3 + i
  })

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        onClick={() => goToPage(meta.page - 1)}
        disabled={meta.page === 1}
        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => goToPage(p)}
          className={cn(
            'h-9 w-9 rounded-lg border text-sm font-medium transition',
            p === meta.page
              ? 'border-brand bg-brand text-white'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50',
          )}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => goToPage(meta.page + 1)}
        disabled={meta.page === meta.totalPages}
        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
