'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  UserPlusIcon, Building2Icon, BriefcaseIcon,
  CheckCircleIcon, FileTextIcon, ClockIcon,
  XCircleIcon, RefreshCwIcon, SearchIcon,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'

type EventType = 'new_candidate' | 'new_employer' | 'new_job' | 'job_approved' | 'new_application' | 'application_status'

interface ActivityEvent {
  id: string
  type: EventType
  title: string
  description: string
  meta?: Record<string, string | null>
  timestamp: string
}

const TYPE_CONFIG: Record<EventType, {
  icon: React.ElementType
  color: string
  bg: string
  dot: string
}> = {
  new_candidate:      { icon: UserPlusIcon,     color: 'text-sky-600',    bg: 'bg-sky-50',    dot: 'bg-sky-400'    },
  new_employer:       { icon: Building2Icon,    color: 'text-violet-600', bg: 'bg-violet-50', dot: 'bg-violet-400' },
  new_job:            { icon: BriefcaseIcon,    color: 'text-amber-600',  bg: 'bg-amber-50',  dot: 'bg-amber-400'  },
  job_approved:       { icon: CheckCircleIcon,  color: 'text-brand',      bg: 'bg-brand/8',   dot: 'bg-brand'      },
  new_application:    { icon: FileTextIcon,     color: 'text-orange-600', bg: 'bg-orange-50', dot: 'bg-orange-400' },
  application_status: { icon: RefreshCwIcon,   color: 'text-slate-600',  bg: 'bg-slate-50',  dot: 'bg-slate-400'  },
}

const FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: 'Tất cả',             value: '' },
  { label: 'Ứng viên mới',       value: 'new_candidate' },
  { label: 'Nhà tuyển dụng',     value: 'new_employer' },
  { label: 'Tin tuyển dụng',     value: 'new_job,job_approved' },
  { label: 'Đơn ứng tuyển',      value: 'new_application' },
]

function EventIcon({ type }: { type: EventType }) {
  const cfg = TYPE_CONFIG[type]
  const Icon = cfg.icon
  return (
    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', cfg.bg)}>
      <Icon className={cn('h-4 w-4', cfg.color)} />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const MAP: Record<string, { label: string; cls: string }> = {
    PENDING:   { label: 'Chờ xử lý',   cls: 'bg-slate-100 text-slate-600'  },
    REVIEWING: { label: 'Đang xem',    cls: 'bg-sky-100 text-sky-700'      },
    INTERVIEW: { label: 'Phỏng vấn',   cls: 'bg-violet-100 text-violet-700' },
    OFFER:     { label: 'Đề nghị',     cls: 'bg-brand/10 text-brand'       },
    REJECTED:  { label: 'Từ chối',     cls: 'bg-red-100 text-red-600'      },
  }
  const s = MAP[status]
  if (!s) return null
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', s.cls)}>
      {s.label}
    </span>
  )
}

function groupByDate(events: ActivityEvent[]) {
  const groups: { date: string; events: ActivityEvent[] }[] = []
  const map = new Map<string, ActivityEvent[]>()

  for (const ev of events) {
    const d = new Date(ev.timestamp)
    const key = d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(ev)
  }

  map.forEach((evs, date) => groups.push({ date, events: evs }))
  return groups
}

export default function AdminActivityPage() {
  const [filter, setFilter] = useState('')
  const [keyword, setKeyword] = useState('')

  const { data: rawEvents = [], isLoading, refetch, isFetching } = useQuery<ActivityEvent[]>({
    queryKey: ['admin-activity'],
    queryFn: () => api.get('/admin/activity?limit=100'),
    staleTime: 30_000,
  })

  const events = rawEvents.filter(ev => {
    if (filter) {
      const types = filter.split(',')
      if (!types.includes(ev.type)) return false
    }
    if (keyword) {
      const q = keyword.toLowerCase()
      return ev.description.toLowerCase().includes(q) || ev.title.toLowerCase().includes(q)
    }
    return true
  })

  const groups = groupByDate(events)

  const SUMMARY = [
    { label: 'Ứng viên mới',   count: rawEvents.filter(e => e.type === 'new_candidate').length,   color: 'text-sky-600',    dot: 'bg-sky-400'    },
    { label: 'Nhà tuyển dụng', count: rawEvents.filter(e => e.type === 'new_employer').length,     color: 'text-violet-600', dot: 'bg-violet-400' },
    { label: 'Tin tuyển dụng', count: rawEvents.filter(e => e.type === 'new_job' || e.type === 'job_approved').length, color: 'text-brand', dot: 'bg-brand' },
    { label: 'Đơn ứng tuyển',  count: rawEvents.filter(e => e.type === 'new_application').length,  color: 'text-orange-600', dot: 'bg-orange-400' },
  ]

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Lịch sử hoạt động</h1>
          <p className="mt-0.5 text-xs text-slate-400">Toàn bộ sự kiện trong hệ thống theo thời gian thực</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700 disabled:opacity-50"
        >
          <RefreshCwIcon className={cn('h-3 w-3', isFetching && 'animate-spin')} />
          Làm mới
        </button>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SUMMARY.map(s => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
            <div className={cn('h-2 w-2 shrink-0 rounded-full', s.dot)} />
            <div>
              <p className={cn('text-xl font-bold tabular-nums', s.color)}>{s.count}</p>
              <p className="text-[11px] text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            placeholder="Tìm kiếm..."
            className="input pl-8 text-sm h-8 w-52"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold transition',
                filter === opt.value
                  ? 'bg-brand text-white'
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {events.length > 0 && (
          <span className="ml-auto text-xs text-slate-400">{events.length} sự kiện</span>
        )}
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, g) => (
            <div key={g} className="space-y-3">
              <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-slate-100" />
                  <div className="flex-1 space-y-1.5 pt-1">
                    <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center text-slate-400">
          <ClockIcon className="h-12 w-12 text-slate-200" />
          <p className="font-semibold text-slate-500">Không có sự kiện nào</p>
          <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(({ date, events: dayEvents }) => (
            <div key={date}>
              {/* Date label */}
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="rounded-full border border-slate-200 bg-white px-3 py-0.5 text-[11px] font-semibold capitalize text-slate-500">
                  {date}
                </span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>

              {/* Events */}
              <div className="relative space-y-0">
                {/* Vertical line */}
                <div className="absolute left-4 top-0 h-full w-px bg-slate-100" />

                {dayEvents.map((ev, i) => {
                  const cfg = TYPE_CONFIG[ev.type]
                  return (
                    <div
                      key={ev.id}
                      className={cn(
                        'relative flex items-start gap-3 py-3 pl-1 pr-3 transition rounded-lg hover:bg-slate-50',
                        i !== dayEvents.length - 1 && '',
                      )}
                    >
                      {/* Icon */}
                      <div className="z-10 shrink-0">
                        <EventIcon type={ev.type} />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-800">{ev.title}</span>
                          {ev.meta?.status && <StatusBadge status={ev.meta.status} />}
                          {ev.type === 'job_approved' && (
                            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand">
                              Đã đăng
                            </span>
                          )}
                          {ev.type === 'new_job' && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                              Chờ duyệt
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-sm text-slate-500">{ev.description}</p>
                      </div>

                      {/* Time */}
                      <span className="shrink-0 pt-1 text-[11px] tabular-nums text-slate-400">
                        {formatDistanceToNow(new Date(ev.timestamp), { addSuffix: true, locale: vi })}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
