'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { BarChart3Icon, EyeIcon, UsersRoundIcon, TrendingUpIcon, BriefcaseIcon } from 'lucide-react'
import { JobStatus } from '@tuyendung/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Insights {
  statusBreakdown: { status: string; count: number }[]
  topJobs: { id: string; title: string; status: string; applicationCount: number; views: number }[]
  totalViews: number
  dailyTrend: { date: string; count: number }[]
}

interface DashboardStats {
  totalJobs: number; publishedJobs: number; totalApplications: number; newApplications: number
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PERIODS = [
  { label: '7 ngày', value: 7 },
  { label: '30 ngày', value: 30 },
  { label: '90 ngày', value: 90 },
]

const STATUS_VI: Record<string, string> = {
  PENDING: 'Chờ xem xét', REVIEWING: 'Duyệt hồ sơ', INTERVIEW: 'Phỏng vấn',
  OFFER: 'Đề nghị', REJECTED: 'Không phù hợp', WITHDRAWN: 'Đã rút',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-blue-500', REVIEWING: 'bg-indigo-500', INTERVIEW: 'bg-yellow-500',
  OFFER: 'bg-brand', REJECTED: 'bg-red-400', WITHDRAWN: 'bg-gray-400',
}

const JOB_STATUS_BADGE: Partial<Record<JobStatus, string>> = {
  PUBLISHED: 'bg-brand-50 text-brand',
  DRAFT: 'bg-gray-100 text-gray-500',
  PENDING_APPROVAL: 'bg-yellow-50 text-yellow-600',
  CLOSED: 'bg-gray-100 text-gray-500',
  EXPIRED: 'bg-red-50 text-red-600',
}

const JOB_STATUS_VI: Partial<Record<JobStatus, string>> = {
  PUBLISHED: 'Đang tuyển', DRAFT: 'Nháp', PENDING_APPROVAL: 'Chờ duyệt',
  CLOSED: 'Đã đóng', EXPIRED: 'Hết hạn',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const [period, setPeriod] = useState(30)

  const { data: insights, isLoading } = useQuery<Insights>({
    queryKey: ['employer-insights', period],
    queryFn: () => api.get(`/employers/me/insights?period=${period}`),
  })

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['employer-dashboard'],
    queryFn: () => api.get('/employers/me/dashboard'),
  })

  const totalApplications = useMemo(
    () => insights?.statusBreakdown.reduce((s, b) => s + b.count, 0) ?? 0,
    [insights],
  )

  const maxTrend = useMemo(
    () => Math.max(1, ...(insights?.dailyTrend.map(d => d.count) ?? [])),
    [insights],
  )

  const maxApps = useMemo(
    () => Math.max(1, ...(insights?.topJobs.map(j => j.applicationCount) ?? [])),
    [insights],
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Insights</h1>
          <p className="mt-0.5 text-sm text-gray-500">Phân tích hiệu quả tuyển dụng</p>
        </div>
        <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition',
                p.value === period
                  ? 'bg-brand text-white'
                  : 'text-gray-600 hover:bg-gray-50',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Tổng lượt xem', value: insights?.totalViews ?? 0, icon: EyeIcon, color: 'text-blue-600 bg-blue-50' },
          { label: 'Tổng ứng tuyển', value: totalApplications, icon: UsersRoundIcon, color: 'text-purple-600 bg-purple-50' },
          { label: 'Tin đang tuyển', value: stats?.publishedJobs ?? 0, icon: BriefcaseIcon, color: 'text-brand bg-brand-50' },
          { label: 'Tỉ lệ ứng tuyển', value: insights?.totalViews ? `${((totalApplications / insights.totalViews) * 100).toFixed(1)}%` : '—', icon: TrendingUpIcon, color: 'text-orange-600 bg-orange-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5">
            <div className={cn('mb-3 w-fit rounded-xl p-2', color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-extrabold text-gray-900">
              {isLoading ? <span className="inline-block h-7 w-16 animate-pulse rounded bg-gray-100" /> : value.toLocaleString()}
            </div>
            <div className="mt-0.5 text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Daily trend */}
        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-gray-900">
            Ứng tuyển theo ngày <span className="ml-1 text-xs font-normal text-gray-400">({period} ngày gần nhất)</span>
          </h2>
          {isLoading ? (
            <div className="flex h-36 items-end gap-1">
              {Array.from({ length: period }).map((_, i) => (
                <div key={i} className="flex-1 animate-pulse rounded-t bg-gray-100" style={{ height: `${Math.random() * 80 + 10}%` }} />
              ))}
            </div>
          ) : (
            <div className="flex h-36 items-end gap-[2px]">
              {insights?.dailyTrend.map(({ date, count }) => (
                <div
                  key={date}
                  className="group relative flex-1"
                  title={`${formatDate(date)}: ${count} ứng tuyển`}
                >
                  <div
                    className="rounded-t bg-brand/70 transition-all group-hover:bg-brand"
                    style={{ height: `${(count / maxTrend) * 100}%`, minHeight: count > 0 ? 4 : 0 }}
                  />
                  {/* Tooltip */}
                  {count > 0 && (
                    <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-1.5 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100">
                      {count}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* X axis labels */}
          {insights && (
            <div className="mt-1 flex justify-between text-[10px] text-gray-400">
              <span>{formatDate(insights.dailyTrend[0]?.date ?? '')}</span>
              <span>{formatDate(insights.dailyTrend[Math.floor(insights.dailyTrend.length / 2)]?.date ?? '')}</span>
              <span>{formatDate(insights.dailyTrend[insights.dailyTrend.length - 1]?.date ?? '')}</span>
            </div>
          )}
        </div>

        {/* Application funnel */}
        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-gray-900">Phễu ứng tuyển</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />
              ))}
            </div>
          ) : totalApplications === 0 ? (
            <div className="flex h-36 items-center justify-center">
              <p className="text-sm text-gray-400">Chưa có đơn ứng tuyển nào</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {insights?.statusBreakdown
                .sort((a, b) => b.count - a.count)
                .map(({ status, count }) => (
                  <div key={status} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-xs text-gray-600">{STATUS_VI[status] ?? status}</span>
                    <div className="flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={cn('h-5 rounded-full transition-all duration-500', STATUS_COLOR[status] ?? 'bg-gray-400')}
                        style={{ width: `${(count / totalApplications) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-xs font-bold text-gray-700">{count}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Top jobs */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Top tin tuyển dụng</h2>
        </div>
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                <div className="ml-auto h-4 w-24 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : !insights?.topJobs.length ? (
          <div className="py-12 text-center">
            <BarChart3Icon className="mx-auto mb-3 h-10 w-10 text-gray-200" />
            <p className="text-sm text-gray-400">Chưa có dữ liệu</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {insights.topJobs.map((job, idx) => (
              <div key={job.id} className="flex items-center gap-4 px-5 py-4">
                <span className="w-5 shrink-0 text-center text-sm font-bold text-gray-300">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{job.title}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={cn('badge text-[10px]', JOB_STATUS_BADGE[job.status as JobStatus])}>
                      {JOB_STATUS_VI[job.status as JobStatus] ?? job.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      <EyeIcon className="mr-0.5 inline h-3 w-3" />{job.views.toLocaleString()} lượt xem
                    </span>
                  </div>
                </div>
                {/* Mini bar */}
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-brand"
                      style={{ width: `${(job.applicationCount / maxApps) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-sm font-bold text-gray-900">
                    {job.applicationCount}
                  </span>
                  <span className="text-xs text-gray-400">CV</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
