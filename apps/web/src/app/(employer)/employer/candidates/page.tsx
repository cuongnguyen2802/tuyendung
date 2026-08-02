'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import Link from 'next/link'
import {
  SearchIcon, RotateCcwIcon, ChevronDownIcon, DownloadIcon,
  MailIcon, PhoneIcon, MessageSquareIcon, AlertTriangleIcon,
  FileTextIcon, MapPinIcon, SparklesIcon, BookmarkIcon,
  MoreHorizontalIcon, UserIcon,
} from 'lucide-react'

// ── Types & Helpers ───────────────────────────────────────────────────────────

type AppStatus = 'PENDING' | 'REVIEWING' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN'

interface Application {
  id: string
  status: AppStatus
  appliedAt: string
  coverLetter?: string
  job: { id: string; title: string; slug: string }
  user: {
    id: string
    email: string
    profile?: { fullName?: string; avatarUrl?: string; title?: string; city?: string; phone?: string }
  }
  resume?: { id: string; title: string; fileUrl?: string }
}

const STATUS_CONFIG: Record<AppStatus, { label: string; color: string }> = {
  PENDING:    { label: 'Tiếp nhận',         color: 'text-blue-600 bg-blue-50 border-blue-200' },
  REVIEWING:  { label: 'Duyệt hồ sơ',       color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  INTERVIEW:  { label: 'Phỏng vấn',          color: 'text-purple-700 bg-purple-50 border-purple-200' },
  OFFER:      { label: 'Đề nghị làm việc',   color: 'text-brand bg-brand-50 border-brand/30' },
  REJECTED:   { label: 'Chưa phù hợp',       color: 'text-red-600 bg-red-50 border-red-200' },
  WITHDRAWN:  { label: 'Đã rút đơn',         color: 'text-gray-500 bg-gray-50 border-gray-200' },
}

const STATUS_OPTIONS: AppStatus[] = ['PENDING', 'REVIEWING', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN']

function jobDisplayId(id: string) {
  let num = 0
  for (let i = 0; i < id.length; i++) num = (num * 31 + id.charCodeAt(i)) >>> 0
  return `#${String(num % 10_000_000).padStart(7, '0')}`
}

function getInitials(name?: string, email?: string) {
  const src = name || email || '?'
  return src.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

const AVATAR_COLORS = [
  'bg-rose-500', 'bg-amber-500', 'bg-emerald-600', 'bg-blue-600',
  'bg-violet-600', 'bg-pink-500', 'bg-teal-600', 'bg-indigo-600',
]
function avatarColor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function daysSince(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000)
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CandidatesPage() {
  const qc = useQueryClient()

  const [keyword, setKeyword]   = useState('')
  const [status, setStatus]     = useState<AppStatus | ''>('')
  const [timeRange, setTimeRange] = useState<'all' | '7d' | '30d' | '90d'>('all')
  const [viewFilter, setViewFilter] = useState<'all' | 'unviewed' | 'unanswered'>('all')
  const [page, setPage]         = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Status dropdown open state per row
  const [openStatus, setOpenStatus] = useState<string | null>(null)

  const { data, isLoading } = useQuery<any>({
    queryKey: ['employer-applications', keyword, status, page],
    queryFn: () => {
      const p = new URLSearchParams({ page: String(page), limit: '20' })
      if (keyword) p.set('keyword', keyword)
      if (status)  p.set('status', status)
      return api.get(`/applications/employer/me?${p}`)
    },
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, newStatus }: { id: string; newStatus: AppStatus }) =>
      api.patch(`/applications/${id}/status`, { status: newStatus }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employer-applications'] })
      setOpenStatus(null)
    },
  })

  const apps: Application[] = data?.data ?? []
  const meta = data?.meta
  const total = meta?.total ?? 0

  // derived counts from current page (approximate without server-side counts)
  const pendingOld = useMemo(
    () => apps.filter(a => a.status === 'PENDING' && daysSince(a.appliedAt) > 7).length,
    [apps],
  )
  const unviewed   = useMemo(() => apps.filter(a => a.status === 'PENDING').length, [apps])
  const unanswered = useMemo(() => apps.filter(a => a.status === 'PENDING').length, [apps])

  const displayedApps = useMemo(() => {
    let list = apps
    if (viewFilter === 'unviewed')   list = list.filter(a => a.status === 'PENDING')
    if (viewFilter === 'unanswered') list = list.filter(a => a.status === 'PENDING')
    if (timeRange !== 'all') {
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
      list = list.filter(a => daysSince(a.appliedAt) <= days)
    }
    return list
  }, [apps, viewFilter, timeRange])

  function toggleSelect(id: string) {
    setSelected(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }
  function toggleAll() {
    setSelected(prev =>
      prev.size === displayedApps.length ? new Set() : new Set(displayedApps.map(a => a.id)),
    )
  }

  function handleReset() {
    setKeyword(''); setStatus(''); setTimeRange('all'); setViewFilter('all'); setPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <h1 className="text-xl font-bold text-gray-900">Quản lý CV ứng viên</h1>

      {/* ── Filter bar ── */}
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3.5 space-y-3">
        {/* Row 1 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={keyword}
              onChange={e => { setKeyword(e.target.value); setPage(1) }}
              placeholder="Tìm kiếm tên, email..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm placeholder:text-gray-400 outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 transition"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={status}
              onChange={e => { setStatus(e.target.value as AppStatus | ''); setPage(1) }}
              className="appearance-none cursor-pointer rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
            >
              <option value="">Nhập trạng thái CV</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          </div>

          {/* Reset */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition"
          >
            <RotateCcwIcon className="h-3.5 w-3.5" />
            Đặt lại
          </button>
        </div>

        {/* Row 2 */}
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <select
              value={timeRange}
              onChange={e => { setTimeRange(e.target.value as any); setPage(1) }}
              className="appearance-none cursor-pointer rounded-lg border-2 border-brand bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-brand outline-none focus:ring-2 focus:ring-brand/20 transition"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="7d">7 ngày gần đây</option>
              <option value="30d">30 ngày gần đây</option>
              <option value="90d">90 ngày gần đây</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-brand" />
          </div>
        </div>
      </div>

      {/* ── Warning banner ── */}
      {pendingOld > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangleIcon className="h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-sm text-gray-700">
            Bạn có{' '}
            <span className="font-bold text-amber-600">{pendingOld}</span>
            {' '}CV ứng tuyển trên 7 ngày chưa phản hồi.{' '}
            <button
              onClick={() => { setStatus('PENDING'); setViewFilter('unanswered') }}
              className="font-semibold text-brand hover:underline"
            >
              Phản hồi ngay
            </button>
          </p>
        </div>
      )}

      {/* ── Stats bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">
            Tìm thấy <span className="font-bold text-brand">{total}</span> ứng viên
          </span>

          <button
            onClick={() => setViewFilter(v => v === 'unviewed' ? 'all' : 'unviewed')}
            className={cn(
              'flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition',
              viewFilter === 'unviewed'
                ? 'border-brand bg-brand/10 font-semibold text-brand'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
            )}
          >
            <FileTextIcon className="h-3.5 w-3.5" />
            CV chưa xem
            <span className={cn(
              'rounded-full px-1.5 py-0.5 text-[11px] font-bold',
              viewFilter === 'unviewed' ? 'bg-brand text-white' : 'bg-orange-500 text-white',
            )}>
              {unviewed}
            </span>
          </button>

          <button
            onClick={() => setViewFilter(v => v === 'unanswered' ? 'all' : 'unanswered')}
            className={cn(
              'flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition',
              viewFilter === 'unanswered'
                ? 'border-brand bg-brand/10 font-semibold text-brand'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300',
            )}
          >
            <MessageSquareIcon className="h-3.5 w-3.5" />
            CV chưa phản hồi
            <span className={cn(
              'rounded-full px-1.5 py-0.5 text-[11px] font-bold',
              viewFilter === 'unanswered' ? 'bg-brand text-white' : 'bg-orange-500 text-white',
            )}>
              {unanswered}
            </span>
          </button>
        </div>

        <button className="flex items-center gap-2 rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand/5 transition">
          <DownloadIcon className="h-4 w-4" />
          Xuất danh sách CV
        </button>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {/* Table header */}
        <div className="grid grid-cols-[40px_1fr_220px_260px_200px] border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selected.size === displayedApps.length && displayedApps.length > 0}
              onChange={toggleAll}
              className="h-4 w-4 cursor-pointer rounded accent-brand"
            />
          </div>
          <div>Ứng viên</div>
          <div>Chiến dịch</div>
          <div>Insights</div>
          <div>Trạng thái</div>
        </div>

        {isLoading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[40px_1fr_220px_260px_200px] px-4 py-5 gap-4 animate-pulse">
                <div className="h-4 w-4 rounded bg-gray-200" />
                <div className="flex gap-3">
                  <div className="h-12 w-12 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-gray-200" />
                    <div className="h-3 w-44 rounded bg-gray-200" />
                    <div className="h-3 w-28 rounded bg-gray-200" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-40 rounded bg-gray-200" />
                  <div className="h-3 w-16 rounded bg-gray-200" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-20 rounded bg-gray-200" />
                  <div className="h-3 w-36 rounded bg-gray-200" />
                </div>
                <div className="h-8 w-32 rounded-lg bg-gray-200" />
              </div>
            ))}
          </div>
        ) : displayedApps.length === 0 ? (
          <div className="py-20 text-center">
            <UserIcon className="mx-auto h-10 w-10 text-gray-200" />
            <p className="mt-3 text-sm text-gray-400">Chưa có ứng viên nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {displayedApps.map(app => (
              <ApplicationRow
                key={app.id}
                app={app}
                selected={selected.has(app.id)}
                onToggle={() => toggleSelect(app.id)}
                statusOpen={openStatus === app.id}
                onStatusOpen={() => setOpenStatus(v => v === app.id ? null : app.id)}
                onStatusChange={(s) => updateStatus.mutate({ id: app.id, newStatus: s })}
                updating={updateStatus.isPending && updateStatus.variables?.id === app.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === meta.totalPages || Math.abs(p - page) <= 2)
            .reduce<(number | '...')[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '...' ? (
                <span key={`e${i}`} className="px-1 text-gray-400 text-sm">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={cn(
                    'h-8 min-w-[32px] rounded-lg border px-2 text-sm font-medium transition',
                    page === p
                      ? 'border-brand bg-brand text-white'
                      : 'border-gray-200 text-gray-700 hover:border-brand hover:text-brand',
                  )}
                >
                  {p}
                </button>
              ),
            )}
        </div>
      )}
    </div>
  )
}

// ── Application Row ───────────────────────────────────────────────────────────

function ApplicationRow({
  app,
  selected,
  onToggle,
  statusOpen,
  onStatusOpen,
  onStatusChange,
  updating,
}: {
  app: Application
  selected: boolean
  onToggle: () => void
  statusOpen: boolean
  onStatusOpen: () => void
  onStatusChange: (s: AppStatus) => void
  updating: boolean
}) {
  const profile = app.user.profile
  const name    = profile?.fullName || app.user.email.split('@')[0]
  const initials = getInitials(profile?.fullName, app.user.email)
  const bgColor  = avatarColor(app.user.id)
  const isPending = app.status === 'PENDING'
  const appliedDate = format(new Date(app.appliedAt), 'dd/MM/yyyy HH:mm')
  const cfg = STATUS_CONFIG[app.status]

  return (
    <div className={cn(
      'grid grid-cols-[40px_1fr_220px_260px_200px] items-start gap-2 px-4 py-4 transition hover:bg-gray-50/60',
      selected && 'bg-brand/5',
    )}>
      {/* Checkbox */}
      <div className="flex items-start pt-1">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="h-4 w-4 cursor-pointer rounded accent-brand"
        />
      </div>

      {/* Ứng viên */}
      <div className="flex gap-3">
        <div className="flex flex-col items-center gap-1 shrink-0">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
          ) : (
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white', bgColor)}>
              {initials}
            </div>
          )}
          {isPending && (
            <span className="text-[11px] font-semibold leading-none text-brand">
              Chưa<br />xem
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 truncate">{name}</p>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
            <MailIcon className="h-3 w-3 shrink-0" />
            <span className="truncate">{app.user.email}</span>
          </div>
          {profile?.phone && (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <PhoneIcon className="h-3 w-3 shrink-0" />
              <span>{profile.phone}</span>
            </div>
          )}
          <Link
            href={`/employer/messages?to=${app.user.id}`}
            className="mt-1 flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
          >
            <MessageSquareIcon className="h-3 w-3" />
            Chat với ứng viên
          </Link>
        </div>
      </div>

      {/* Chiến dịch */}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-800" title={app.job.title}>
          {app.job.title}
        </p>
        <span className="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
          {jobDisplayId(app.job.id)}
        </span>
        {app.resume?.fileUrl && (
          <a
            href={app.resume.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1.5 flex items-center gap-1 text-xs text-brand hover:underline"
          >
            <FileTextIcon className="h-3 w-3" />
            Xem CV đính kèm
          </a>
        )}
      </div>

      {/* Insights */}
      <div className="space-y-1.5 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-600">
            Ứng tuyển
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-400">⏱</span>
          <span>{appliedDate}</span>
        </div>
        {profile?.city && (
          <div className="flex items-center gap-1 text-brand">
            <MapPinIcon className="h-3 w-3 shrink-0" />
            <span className="font-medium">Sẵn sàng di chuyển ({profile.city})</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-brand">
            <SparklesIcon className="h-3 w-3" />
            <span className="font-medium">AI đánh giá CV</span>
          </span>
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-400">
            Chưa khả dụng
          </span>
        </div>
      </div>

      {/* Trạng thái */}
      <div className="flex items-center gap-2 relative">
        <div className="relative flex-1">
          <button
            onClick={onStatusOpen}
            disabled={updating}
            className={cn(
              'flex w-full items-center justify-between gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition',
              cfg.color,
              updating && 'opacity-60',
            )}
          >
            <span className="flex items-center gap-1.5 truncate">
              <DownloadIcon className="h-3.5 w-3.5 shrink-0" />
              {cfg.label}
            </span>
            <ChevronDownIcon className="h-3.5 w-3.5 shrink-0" />
          </button>

          {statusOpen && (
            <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-xl border border-gray-100 bg-white py-1 shadow-xl">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => onStatusChange(s)}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-2 text-sm transition hover:bg-gray-50',
                    app.status === s && 'font-semibold text-brand',
                  )}
                >
                  <span className={cn('h-2 w-2 rounded-full', {
                    'bg-blue-500': s === 'PENDING',
                    'bg-yellow-500': s === 'REVIEWING',
                    'bg-purple-500': s === 'INTERVIEW',
                    'bg-brand': s === 'OFFER',
                    'bg-red-500': s === 'REJECTED',
                    'bg-gray-400': s === 'WITHDRAWN',
                  })} />
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition">
          <BookmarkIcon className="h-4 w-4" />
        </button>
        <button className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:border-gray-300 hover:text-gray-600 transition">
          <MoreHorizontalIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
