'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { BriefcaseIcon, EyeIcon, UsersIcon, TrendingUpIcon, CalendarIcon, LoaderIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type JobStatus = 'PUBLISHED' | 'CLOSED' | 'EXPIRED' | 'DRAFT' | 'PENDING_APPROVAL' | 'REJECTED'

interface DashboardStats {
  totalJobs: number
  publishedJobs: number
  totalApplications: number
  newApplications: number
}

interface TopJob {
  id: string
  title: string
  status: JobStatus
  applicationCount: number
  views: number
}

interface DailyPoint {
  date: string
  count: number
}

interface Insights {
  statusBreakdown: { status: string; count: number }[]
  topJobs: TopJob[]
  totalViews: number
  dailyTrend: DailyPoint[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<JobStatus, { label: string; className: string }> = {
  PUBLISHED:        { label: 'Đang tuyển',    className: 'bg-green-50 text-green-700 border-green-200' },
  CLOSED:           { label: 'Đã đóng',       className: 'bg-gray-100 text-gray-500 border-gray-200' },
  EXPIRED:          { label: 'Hết hạn',       className: 'bg-amber-50 text-amber-700 border-amber-200' },
  DRAFT:            { label: 'Nháp',          className: 'bg-gray-100 text-gray-400 border-gray-200' },
  PENDING_APPROVAL: { label: 'Chờ duyệt',     className: 'bg-blue-50 text-blue-700 border-blue-200' },
  REJECTED:         { label: 'Bị từ chối',    className: 'bg-red-50 text-red-600 border-red-200' },
}

// ─── Chart: last 14 days grouped ─────────────────────────────────────────────

function buildChartData(dailyTrend: DailyPoint[], days = 14) {
  const result: { label: string; count: number }[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const found = dailyTrend.find(p => p.date === key)
    const dayNum = d.getDate()
    const month = d.getMonth() + 1
    result.push({ label: `${dayNum}/${month}`, count: found?.count ?? 0 })
  }
  return result
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JobReportsPage() {
  const { data: stats, isLoading: loadingStats } = useQuery<DashboardStats>({
    queryKey: ['employer-dashboard'],
    queryFn: () => api.get('/employers/me/dashboard'),
    staleTime: 30_000,
  })

  const { data: insights, isLoading: loadingInsights } = useQuery<Insights>({
    queryKey: ['employer-insights', 30],
    queryFn: () => api.get('/employers/me/insights?period=30'),
    staleTime: 60_000,
  })

  const isLoading = loadingStats || loadingInsights

  // Derived metrics
  const totalViews = insights?.totalViews ?? 0
  const topJobs    = insights?.topJobs ?? []
  const chartData  = buildChartData(insights?.dailyTrend ?? [], 14)
  const maxCount   = Math.max(...chartData.map(d => d.count), 1)

  const avgConv = topJobs.length > 0
    ? topJobs.reduce((s, j) => s + (j.views > 0 ? (j.applicationCount / j.views) * 100 : 0), 0) / topJobs.length
    : 0

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Báo cáo việc làm</h1>
        <p className="mt-0.5 text-sm text-gray-500">Tổng quan hiệu quả các tin tuyển dụng của bạn (30 ngày gần nhất)</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: 'Tin đang tuyển',
            value: isLoading ? '—' : stats?.publishedJobs ?? 0,
            sub: `/ ${stats?.totalJobs ?? '—'} tổng tin`,
            icon: BriefcaseIcon, bg: 'bg-brand/5', ic: 'text-brand', vl: 'text-brand',
          },
          {
            label: 'Tổng lượt xem',
            value: isLoading ? '—' : totalViews.toLocaleString('vi-VN'),
            sub: 'tất cả tin',
            icon: EyeIcon, bg: 'bg-blue-50', ic: 'text-blue-600', vl: 'text-blue-700',
          },
          {
            label: 'Tổng hồ sơ',
            value: isLoading ? '—' : stats?.totalApplications ?? 0,
            sub: `${stats?.newApplications ?? '—'} mới 7 ngày`,
            icon: UsersIcon, bg: 'bg-purple-50', ic: 'text-purple-600', vl: 'text-purple-700',
          },
          {
            label: 'Tỷ lệ chuyển đổi',
            value: isLoading ? '—' : avgConv.toFixed(2) + '%',
            sub: 'views → nộp đơn',
            icon: TrendingUpIcon, bg: 'bg-green-50', ic: 'text-green-600', vl: 'text-green-700',
          },
        ].map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">{card.label}</p>
                <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', card.bg)}>
                  <Icon className={cn('h-3.5 w-3.5', card.ic)} />
                </div>
              </div>
              {isLoading ? (
                <div className="h-8 w-16 animate-pulse rounded-md bg-gray-100" />
              ) : (
                <p className={cn('text-2xl font-bold', card.vl)}>{card.value}</p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            </div>
          )
        })}
      </div>

      {/* 14-day applications chart */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Hồ sơ ứng tuyển theo ngày</h2>
            <p className="text-xs text-gray-400 mt-0.5">14 ngày gần nhất — tổng tất cả tin</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <CalendarIcon className="h-3.5 w-3.5" />
            30 ngày qua
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-end gap-1.5 h-28">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="flex-1 animate-pulse rounded-t bg-gray-100" style={{ height: `${20 + Math.random() * 60}%` }} />
            ))}
          </div>
        ) : (
          <div className="flex items-end gap-1.5 h-28">
            {chartData.map((d, i) => {
              const height = maxCount > 0 ? (d.count / maxCount) * 100 : 0
              return (
                <div key={i} className="group relative flex flex-1 flex-col items-center gap-1">
                  {/* Tooltip */}
                  {d.count > 0 && (
                    <span className="absolute -top-6 hidden group-hover:block rounded bg-gray-800 px-1.5 py-0.5 text-[10px] text-white whitespace-nowrap">
                      {d.count} hồ sơ
                    </span>
                  )}
                  <div
                    className={cn(
                      'w-full rounded-t-sm transition-all',
                      d.count > 0 ? 'bg-brand/70 hover:bg-brand' : 'bg-gray-100',
                    )}
                    style={{ height: height > 0 ? `${Math.max(height, 8)}%` : '4%' }}
                  />
                  <span className="text-[9px] text-gray-400 rotate-45 origin-left mt-0.5 hidden sm:block">
                    {d.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Top jobs table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3.5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Top tin tuyển dụng (theo hồ sơ nhận được)</h2>
          <span className="text-xs text-gray-400">Top 5</span>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        ) : topJobs.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <BriefcaseIcon className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">Chưa có dữ liệu tin tuyển dụng</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vị trí</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Lượt xem</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Hồ sơ</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Tỉ lệ</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topJobs.map((job, i) => {
                  const cfg = STATUS_CONFIG[job.status as JobStatus] ?? STATUS_CONFIG.DRAFT
                  const conv = job.views > 0 ? ((job.applicationCount / job.views) * 100).toFixed(2) : '0.00'
                  return (
                    <tr key={job.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                          i === 0 ? 'bg-amber-100 text-amber-700' :
                          i === 1 ? 'bg-gray-100 text-gray-600' :
                          i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400',
                        )}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-gray-800 line-clamp-1">{job.title}</p>
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-gray-600">
                        {job.views.toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="inline-flex items-center justify-center rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand tabular-nums">
                          {job.applicationCount}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-gray-600">{conv}%</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold', cfg.className)}>
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
