'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  HistoryIcon, BriefcaseIcon, UsersRoundIcon, UserCogIcon,
  LogInIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon,
  ClockIcon,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

type ActivityType =
  | 'LOGIN'
  | 'JOB_CREATED'
  | 'JOB_UPDATED'
  | 'JOB_STATUS_CHANGED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'COMPANY_UPDATED'
  | 'PROFILE_UPDATED'

interface ActivityLog {
  id: string
  type: ActivityType
  action: string
  targetId?: string
  targetName?: string
  meta?: Record<string, string>
  createdAt: string
}

interface ActivityResponse {
  data: ActivityLog[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

// ── Sub-navigation ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: undefined,                         label: 'Tất cả lịch sử',      icon: HistoryIcon },
  { key: 'APPLICATION_STATUS_CHANGED',      label: 'Lịch sử ứng viên',    icon: UsersRoundIcon },
  { key: 'JOB_CREATED' as ActivityType,     label: 'Lịch sử đăng tin',    icon: BriefcaseIcon },
  { key: 'COMPANY_UPDATED' as ActivityType, label: 'Lịch sử công ty',     icon: UserCogIcon },
  { key: 'LOGIN' as ActivityType,           label: 'Lịch sử đăng nhập',   icon: LogInIcon },
] as const

// ── Helpers ────────────────────────────────────────────────────────────────────

function toDateInputValue(d: Date) {
  return d.toISOString().slice(0, 10)
}

function formatDateHeading(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function groupByDate(items: ActivityLog[]) {
  const groups: { date: string; items: ActivityLog[] }[] = []
  let lastDate = ''
  for (const item of items) {
    const d = item.createdAt.slice(0, 10)
    if (d !== lastDate) {
      groups.push({ date: item.createdAt, items: [item] })
      lastDate = d
    } else {
      groups[groups.length - 1].items.push(item)
    }
  }
  return groups
}

const TYPE_COLOR: Record<ActivityType, string> = {
  LOGIN:                       'bg-blue-100 text-blue-600',
  JOB_CREATED:                 'bg-brand-100 text-brand',
  JOB_UPDATED:                 'bg-emerald-100 text-emerald-600',
  JOB_STATUS_CHANGED:          'bg-yellow-100 text-yellow-600',
  APPLICATION_STATUS_CHANGED:  'bg-purple-100 text-purple-600',
  COMPANY_UPDATED:             'bg-orange-100 text-orange-600',
  PROFILE_UPDATED:             'bg-gray-100 text-gray-600',
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ActivityPage() {
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  const [from, setFrom] = useState(toDateInputValue(thirtyDaysAgo))
  const [to,   setTo]   = useState(toDateInputValue(today))
  const [type, setType] = useState<ActivityType | undefined>()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<ActivityResponse>({
    queryKey: ['employer-activity', from, to, type, page],
    queryFn: () => {
      const params = new URLSearchParams({
        from,
        to,
        page: String(page),
        limit: '30',
        ...(type ? { type } : {}),
      })
      return api.get(`/activity/employer/me?${params}`)
    },
  })

  const groups = useMemo(() => groupByDate(data?.data ?? []), [data])
  const meta   = data?.meta

  return (
    <div className="space-y-0">
      <h1 className="mb-5 text-xl font-bold text-gray-900">Lịch sử hoạt động</h1>

      <div className="flex gap-5 items-start">

        {/* ── Sub-navigation ──────────────────────────────────── */}
        <nav className="w-60 shrink-0 rounded-2xl border border-gray-200 bg-white overflow-hidden">
          {CATEGORIES.map(({ key, label, icon: Icon }) => {
            const active = key === type
            return (
              <button
                key={key ?? 'all'}
                onClick={() => { setType(key as ActivityType | undefined); setPage(1) }}
                className={cn(
                  'flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium transition border-b border-gray-100 last:border-0',
                  active
                    ? 'bg-brand/5 text-brand font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-brand' : 'text-gray-400')} />
                {label}
              </button>
            )
          })}
        </nav>

        {/* ── Main content ─────────────────────────────────────── */}
        <div className="min-w-0 flex-1">

          {/* Date range filter */}
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3">
            <span className="text-sm font-medium text-gray-700">
              {CATEGORIES.find(c => c.key === type)?.label ?? 'Tất cả lịch sử'}
            </span>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <input
                type="date"
                value={from}
                onChange={e => { setFrom(e.target.value); setPage(1) }}
                className="rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-700 focus:border-brand focus:outline-none"
              />
              <span className="text-gray-400">–</span>
              <input
                type="date"
                value={to}
                onChange={e => { setTo(e.target.value); setPage(1) }}
                className="rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-700 focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          {/* Activity list */}
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            {isLoading ? (
              <div className="divide-y divide-gray-100">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="py-16 text-center">
                <HistoryIcon className="mx-auto mb-3 h-10 w-10 text-gray-200" />
                <p className="text-sm text-gray-400">Không có hoạt động nào trong khoảng thời gian này</p>
              </div>
            ) : (
              <div>
                {groups.map(group => (
                  <div key={group.date}>
                    {/* Date heading */}
                    <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-2.5">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {formatDateHeading(group.date)}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-gray-50">
                      {group.items.map(item => (
                        <div key={item.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition">
                          {/* Time */}
                          <div className="flex w-12 shrink-0 items-center gap-1 pt-0.5">
                            <ClockIcon className="h-3 w-3 text-gray-300" />
                            <span className="text-xs font-medium text-brand/80">
                              {formatTime(item.createdAt)}
                            </span>
                          </div>

                          {/* Dot */}
                          <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />

                          {/* Action text */}
                          <p className="min-w-0 flex-1 text-sm text-gray-700 leading-relaxed">
                            {renderAction(item)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Hiển thị {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} / {meta.total} hoạt động
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={meta.page <= 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-brand hover:text-brand disabled:opacity-40"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                  const p = i + 1
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition',
                        p === meta.page
                          ? 'border-brand bg-brand text-white'
                          : 'border-gray-200 text-gray-600 hover:border-brand hover:text-brand',
                      )}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={meta.page >= meta.totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-brand hover:text-brand disabled:opacity-40"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Render action with highlighted names ──────────────────────────────────────

function renderAction(item: ActivityLog) {
  const name = item.targetName
  if (!name) return <span>{item.action}</span>

  // Highlight candidate/job name inside the action text
  const idx = item.action.indexOf(name)
  if (idx === -1) return <span>{item.action}</span>

  return (
    <span>
      {item.action.slice(0, idx)}
      <span className="font-semibold text-brand">{name}</span>
      {item.action.slice(idx + name.length)}
    </span>
  )
}
