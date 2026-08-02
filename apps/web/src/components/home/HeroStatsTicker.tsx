'use client'

import { useQuery } from '@tanstack/react-query'
import { TrendingUpIcon, ZapIcon } from 'lucide-react'
import { api } from '@/lib/api'

interface Stats {
  totalActive: number
  newLast24h: number
}

function fmtNum(n: number) {
  return n.toLocaleString('vi-VN')
}

export function HeroStatsTicker({
  initialStats,
  today,
}: {
  initialStats: Stats
  today: string
}) {
  const { data: stats = initialStats } = useQuery<Stats>({
    queryKey: ['job-market-stats-hero'],
    queryFn: () => api.get('/jobs/stats'),
    initialData: initialStats,
    refetchInterval: 60_000,
    staleTime: 30_000,
  })

  return (
    <div className="flex items-center gap-6 rounded-2xl bg-white/10 px-6 py-4 backdrop-blur-md">
      {/* Icon */}
      <div className="hidden shrink-0 sm:block">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
          <ZapIcon className="h-6 w-6 text-yellow-300" />
        </div>
      </div>

      {/* Label + date */}
      <div className="shrink-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Thị trường việc làm hôm nay</p>
        <p className="text-sm font-bold text-white/80">{today}</p>
      </div>

      <div className="h-8 w-px bg-white/20" />

      {/* Stat 1 */}
      <div className="flex items-center gap-2">
        <TrendingUpIcon className="h-4 w-4 text-brand/70" />
        <div>
          <p className="text-xs text-white/60">Việc làm đang tuyển</p>
          <p className="text-lg font-extrabold text-white">{fmtNum(stats.totalActive)}</p>
        </div>
      </div>

      <div className="h-8 w-px bg-white/20" />

      {/* Stat 2 */}
      <div className="flex items-center gap-2">
        <ZapIcon className="h-4 w-4 text-yellow-300" />
        <div>
          <p className="text-xs text-white/60">Việc làm mới hôm nay</p>
          <p className="text-lg font-extrabold text-white">{fmtNum(stats.newLast24h)}</p>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Robot SVG */}
      <div className="hidden shrink-0 xl:block">
        <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16">
          <circle cx="40" cy="40" r="40" fill="white" fillOpacity=".08" />
          <rect x="22" y="18" width="36" height="28" rx="8" fill="#22c55e" fillOpacity=".8" />
          <circle cx="33" cy="30" r="5" fill="white" />
          <circle cx="47" cy="30" r="5" fill="white" />
          <circle cx="34" cy="31" r="2.5" fill="#0f5c32" />
          <circle cx="48" cy="31" r="2.5" fill="#0f5c32" />
          <line x1="40" y1="18" x2="40" y2="10" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="40" cy="8" r="3" fill="#4ade80" />
          <rect x="31" y="39" width="18" height="4" rx="2" fill="white" fillOpacity=".6" />
          <rect x="26" y="48" width="28" height="18" rx="6" fill="#19734E" fillOpacity=".7" />
          <rect x="14" y="50" width="10" height="6" rx="3" fill="#19734E" fillOpacity=".6" />
          <rect x="56" y="50" width="10" height="6" rx="3" fill="#19734E" fillOpacity=".6" />
          <circle cx="40" cy="56" r="4" fill="#4ade80" fillOpacity=".6" />
        </svg>
      </div>
    </div>
  )
}
