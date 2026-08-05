'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { UsersIcon, UserCheckIcon, ClockIcon, TrophyIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type AppStatus = 'PENDING' | 'REVIEWING' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN'

interface Application {
  id: string
  status: AppStatus
  appliedAt: string
  job: {
    id: string
    title: string
  }
  user: {
    email: string
    profile?: {
      fullName: string
      avatarUrl?: string
      title?: string
      city?: string
    }
  }
}

interface ApplicationsResponse {
  data: Application[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

interface Insights {
  statusBreakdown: { status: AppStatus; count: number }[]
  topJobs: { id: string; title: string; applicationCount: number }[]
  totalViews: number
  dailyTrend: { date: string; count: number }[]
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AppStatus, { label: string; className: string; dot: string; bar: string }> = {
  PENDING:   { label: 'Chờ xem xét', className: 'bg-gray-100 text-gray-600 border-gray-200',    dot: 'bg-gray-400',   bar: 'bg-gray-400' },
  REVIEWING: { label: 'Đang xem xét',className: 'bg-blue-50 text-blue-700 border-blue-200',     dot: 'bg-blue-500',   bar: 'bg-blue-500' },
  INTERVIEW: { label: 'Phỏng vấn',   className: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-500',  bar: 'bg-amber-500' },
  OFFER:     { label: 'Đề nghị',     className: 'bg-green-50 text-green-700 border-green-200',  dot: 'bg-green-500',  bar: 'bg-green-500' },
  REJECTED:  { label: 'Từ chối',     className: 'bg-red-50 text-red-600 border-red-200',        dot: 'bg-red-400',    bar: 'bg-red-400' },
  WITHDRAWN: { label: 'Đã rút',      className: 'bg-gray-100 text-gray-400 border-gray-200',    dot: 'bg-gray-300',   bar: 'bg-gray-300' },
}

const STATUS_ORDER: AppStatus[] = ['PENDING', 'REVIEWING', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN']

function getInitial(name?: string, email?: string) {
  return (name ?? email ?? '?')[0].toUpperCase()
}

const AVATAR_COLORS = [
  'bg-blue-500','bg-pink-500','bg-green-500','bg-purple-500',
  'bg-orange-500','bg-teal-500','bg-indigo-500','bg-rose-500',
]

function avatarColor(id: string) {
  let hash = 0
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length
  return AVATAR_COLORS[hash]
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CandidateReportsPage() {
  const [page, setPage] = useState(1)

  const { data: insights, isLoading: loadingInsights } = useQuery<Insights>({
    queryKey: ['employer-insights', 30],
    queryFn: () => api.get('/employers/me/insights?period=30'),
    staleTime: 60_000,
  })

  const { data: appsData, isLoading: loadingApps } = useQuery<ApplicationsResponse>({
    queryKey: ['employer-applications', page],
    queryFn: () => api.get(`/applications/employer/me?page=${page}&limit=15`),
    staleTime: 30_000,
  })

  const isLoading = loadingInsights || loadingApps

  // Build status map from breakdown
  const statusMap: Partial<Record<AppStatus, number>> = {}
  for (const s of (insights?.statusBreakdown ?? [])) {
    statusMap[s.status as AppStatus] = s.count
  }
  const total = Object.values(statusMap).reduce((a, b) => a + b, 0) || 1

  const newThisWeek = (appsData?.data ?? []).filter(a => {
    return (Date.now() - new Date(a.appliedAt).getTime()) < 7 * 24 * 3600 * 1000
  }).length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Báo cáo ứng viên</h1>
        <p className="mt-0.5 text-sm text-gray-500">Tổng quan ứng viên đã nộp hồ sơ vào công ty bạn</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Tổng ứng viên',    value: appsData?.meta.total ?? '—', icon: UsersIcon,    bg: 'bg-brand/5',   ic: 'text-brand',    vl: 'text-brand' },
          { label: 'Mới tuần này',      value: newThisWeek,                  icon: ClockIcon,    bg: 'bg-amber-50',  ic: 'text-amber-600',vl: 'text-amber-700' },
          { label: 'Đang xem xét',     value: (statusMap['REVIEWING'] ?? 0) + (statusMap['INTERVIEW'] ?? 0), icon: UserCheckIcon, bg: 'bg-blue-50', ic: 'text-blue-600', vl: 'text-blue-700' },
          { label: 'Đề nghị việc làm', value: statusMap['OFFER'] ?? 0,      icon: TrophyIcon,   bg: 'bg-green-50',  ic: 'text-green-600',vl: 'text-green-700' },
        ].map(c => {
          const Icon = c.icon
          return (
            <div key={c.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">{c.label}</p>
                <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', c.bg)}>
                  <Icon className={cn('h-3.5 w-3.5', c.ic)} />
                </div>
              </div>
              {isLoading ? (
                <div className="h-8 w-12 animate-pulse rounded-md bg-gray-100" />
              ) : (
                <p className={cn('text-2xl font-bold', c.vl)}>{c.value}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Status breakdown + Top jobs */}
      <div className="grid gap-4 sm:grid-cols-[1fr_260px]">
        {/* Status breakdown */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Phân bổ theo trạng thái</h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />)}
            </div>
          ) : total === 1 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Chưa có hồ sơ ứng tuyển</p>
          ) : (
            <div className="space-y-3">
              {STATUS_ORDER.filter(s => (statusMap[s] ?? 0) > 0).map(status => {
                const cfg = STATUS_CONFIG[status]
                const count = statusMap[status] ?? 0
                const pct = Math.round((count / total) * 100)
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={cn('h-2 w-2 rounded-full', cfg.dot)} />
                        <span className="text-xs text-gray-600">{cfg.label}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div className={cn('h-2 rounded-full transition-all', cfg.bar)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top jobs by applications */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Top tin nhận nhiều hồ sơ</h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />)}
            </div>
          ) : (insights?.topJobs ?? []).length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-2">
              {(insights?.topJobs ?? []).map((job, i) => (
                <div key={job.id} className="flex items-center gap-2.5 py-2 border-b border-gray-50 last:border-0">
                  <span className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                    i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400',
                  )}>
                    {i + 1}
                  </span>
                  <p className="flex-1 text-xs text-gray-700 line-clamp-1">{job.title}</p>
                  <span className="shrink-0 text-xs font-bold text-brand">{job.applicationCount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Candidates table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3.5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Ứng viên gần đây</h2>
          {appsData && (
            <span className="text-xs text-gray-400">
              Trang {appsData.meta.page}/{appsData.meta.totalPages} — {appsData.meta.total} ứng viên
            </span>
          )}
        </div>

        {loadingApps ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100" />
                <div className="flex-1 space-y-1">
                  <div className="h-3.5 w-32 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : (appsData?.data ?? []).length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <UsersIcon className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">Chưa có hồ sơ ứng tuyển</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/60">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ứng viên</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vị trí</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày nộp</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {appsData?.data.map(app => {
                    const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.PENDING
                    const name = app.user.profile?.fullName
                    const color = avatarColor(app.id)
                    return (
                      <tr key={app.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            {app.user.profile?.avatarUrl ? (
                              <img
                                src={app.user.profile.avatarUrl}
                                alt=""
                                className="h-8 w-8 shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold', color)}>
                                {getInitial(name, app.user.email)}
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-800">{name ?? app.user.email}</p>
                              {app.user.profile?.title && (
                                <p className="text-xs text-gray-400 truncate max-w-[120px]">{app.user.profile.title}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 max-w-[180px]">
                          <p className="truncate text-xs">{app.job.title}</p>
                        </td>
                        <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap text-xs">
                          {new Date(app.appliedAt).toLocaleDateString('vi-VN')}
                        </td>
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

            {/* Pagination */}
            {appsData && appsData.meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 border-t border-gray-100 px-5 py-3">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Trước
                </button>
                <span className="text-xs text-gray-500">Trang {page}/{appsData.meta.totalPages}</span>
                <button
                  disabled={page >= appsData.meta.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
