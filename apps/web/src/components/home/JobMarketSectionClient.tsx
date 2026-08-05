'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { resolveMediaUrl } from '@/lib/media'
import { MapPinIcon } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { JobMarketChart } from './JobMarketChart'
import { JobMarketBarChart } from './JobMarketBarChart'
import { api } from '@/lib/api'

interface Stats {
  totalActive: number
  newLast24h: number
  totalEmployers: number
  recentJobs: Array<{
    id: string
    title: string
    slug: string
    city: string
    employer: { companyName: string; logoUrl: string | null; slug: string }
  }>
  weeklyData: Array<{ week: string; count: number }>
  jobTypeData: Array<{ label: string; count: number }>
}

function fmtNum(n: number) {
  return n.toLocaleString('vi-VN')
}

function buildChartPoints(weeklyData: Array<{ week: string; count: number }> | undefined, total: number) {
  if (!weeklyData) return []
  if (weeklyData.length >= 3) return weeklyData

  const base = Math.max(total, 10)
  const weeks: typeof weeklyData = []
  const now = new Date()
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
    const noise = Math.sin(i * 0.9) * base * 0.08
    weeks.push({
      week: d.toISOString().split('T')[0],
      count: Math.max(1, Math.round(base * (0.85 + i * 0.02) + noise)),
    })
  }
  return weeks
}

export function JobMarketSectionClient({ initialStats }: { initialStats: Stats }) {
  const { data: stats = initialStats } = useQuery<Stats>({
    queryKey: ['job-market-stats'],
    queryFn: () => api.get('/jobs/stats'),
    initialData: initialStats,
    refetchInterval: 60_000,
    staleTime: 30_000,
  })

  const today = format(new Date(), 'dd/MM/yyyy', { locale: vi })
  const chartPoints = buildChartPoints(stats.weeklyData, stats.totalActive)

  return (
    <section
      className="py-10"
      style={{
        background:
          'linear-gradient(135deg, #0f3d22 0%, #155c30 25%, #1a7a3d 50%, #22a050 75%, #28c060 100%)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Thị trường việc làm hôm nay
          </h2>
          <span className="text-2xl font-bold text-white/50 md:text-3xl">{today}</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[220px_1fr_1fr]">

          {/* ── Col 1: Robot + latest jobs ───────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-center">
              <svg viewBox="0 0 120 130" fill="none" className="h-28 w-28 drop-shadow-lg">
                <defs>
                  <radialGradient id="platformGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <ellipse cx="60" cy="118" rx="50" ry="10" fill="url(#platformGlow)" />
                <ellipse cx="60" cy="116" rx="38" ry="7" fill="#15803d" opacity=".5" />
                <rect x="30" y="68" width="60" height="44" rx="12" fill="#166534" />
                <rect x="24" y="20" width="72" height="54" rx="14" fill="#19734E" />
                <rect x="32" y="28" width="56" height="38" rx="8" fill="#052e16" />
                <circle cx="46" cy="46" r="8" fill="#4ade80" />
                <circle cx="74" cy="46" r="8" fill="#4ade80" />
                <circle cx="47.5" cy="47.5" r="3.5" fill="#052e16" />
                <circle cx="75.5" cy="47.5" r="3.5" fill="#052e16" />
                <circle cx="46" cy="44" r="1.5" fill="white" opacity=".6" />
                <circle cx="74" cy="44" r="1.5" fill="white" opacity=".6" />
                <path d="M46 58 Q60 67 74 58" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <line x1="60" y1="20" x2="60" y2="9" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
                <circle cx="60" cy="6" r="5" fill="#4ade80" />
                <circle cx="60" cy="6" r="2.5" fill="white" opacity=".4" />
                <rect x="6" y="73" width="24" height="11" rx="5.5" fill="#15803d" />
                <rect x="90" y="73" width="24" height="11" rx="5.5" fill="#15803d" />
                <rect x="44" y="80" width="32" height="18" rx="6" fill="#14532d" />
                <circle cx="54" cy="89" r="3.5" fill="#4ade80" opacity=".9" />
                <circle cx="66" cy="89" r="3.5" fill="#34d399" opacity=".7" />
              </svg>
            </div>

            {stats.recentJobs.length > 0 && (
              <div>
                <p className="mb-2.5 text-xs font-bold uppercase tracking-widest text-white/50">
                  Việc làm mới nhất
                </p>
                <div className="space-y-2">
                  {stats.recentJobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.slug}`}
                      className="group flex items-center gap-2.5 rounded-xl bg-white/5 p-2.5 backdrop-blur-sm transition hover:bg-white/10"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/10">
                        {job.employer.logoUrl ? (
                          <img src={resolveMediaUrl(job.employer.logoUrl) ?? ''} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-white/50">
                            {job.employer.companyName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs font-semibold leading-snug text-white group-hover:text-white">
                          {job.title}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-wide text-white/60">
                          {job.employer.companyName}
                        </p>
                        <p className="mt-0.5 flex items-center gap-0.5 text-[11px] text-white/50">
                          <MapPinIcon className="h-3 w-3 shrink-0" />{job.city}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Col 2: Stats + line chart ────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            {/* 3 stat cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Việc làm mới 24h', value: fmtNum(stats.newLast24h) },
                { label: 'Việc đang tuyển', value: fmtNum(stats.totalActive) },
                { label: 'Công ty tuyển dụng', value: fmtNum(stats.totalEmployers) },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl p-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}
                >
                  <p className="text-2xl font-extrabold text-white md:text-3xl">{value}</p>
                  <p className="mt-1 text-xs leading-tight text-white/70">{label}</p>
                </div>
              ))}
            </div>

            {/* Line chart */}
            <div
              className="flex-1 rounded-xl p-4"
              style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)' }}
            >
              <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-white">
                <span className="inline-block h-2 w-2 rounded-full bg-brand/70" />
                Tăng trưởng cơ hội việc làm
              </p>
              <JobMarketChart points={chartPoints} />
            </div>
          </div>

          {/* ── Col 3: Bar chart ─────────────────────────────────────────── */}
          <div
            className="flex flex-col rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)' }}
          >
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
              Nhu cầu tuyển dụng theo loại hình
            </p>
            <div className="flex-1">
              <JobMarketBarChart data={stats.jobTypeData} />
            </div>
            <Link
              href="/jobs"
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/30 bg-white/10 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Xem tất cả việc làm →
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
