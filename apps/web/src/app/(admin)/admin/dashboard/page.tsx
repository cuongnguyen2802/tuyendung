'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  UsersIcon, BriefcaseIcon, Building2Icon, FileTextIcon,
  TrendingUpIcon, AlertTriangleIcon, CheckCircleIcon,
  ArrowUpIcon, ClockIcon, GripVerticalIcon, RotateCcwIcon,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTH_OPTIONS = [
  { label: '3 tháng', value: 3 },
  { label: '6 tháng', value: 6 },
  { label: '12 tháng', value: 12 },
]

type WidgetId =
  | 'jobs-chart'
  | 'users-chart'
  | 'apps-chart'
  | 'pending-jobs'
  | 'top-employers'
  | 'status-bar'

interface WidgetMeta { label: string; span: 1 | 2 | 3 }

const WIDGET_META: Record<WidgetId, WidgetMeta> = {
  'jobs-chart':    { label: 'Tin tuyển dụng mới',  span: 1 },
  'users-chart':   { label: 'Người dùng đăng ký',  span: 1 },
  'apps-chart':    { label: 'Đơn ứng tuyển',       span: 1 },
  'pending-jobs':  { label: 'Tin chờ duyệt',       span: 1 },
  'top-employers': { label: 'Top nhà tuyển dụng',  span: 2 },
  'status-bar':    { label: 'Trạng thái hệ thống', span: 3 },
}

const DEFAULT_ORDER: WidgetId[] = [
  'jobs-chart', 'users-chart', 'apps-chart',
  'pending-jobs', 'top-employers',
  'status-bar',
]

const LS_KEY = 'admin:dashboard:layout'

// ── DnD hook ──────────────────────────────────────────────────────────────────

function useDnD() {
  const [order, setOrder] = useState<WidgetId[]>(DEFAULT_ORDER)
  const [dragging, setDragging] = useState<number | null>(null)
  const [over, setOver]         = useState<number | null>(null)
  const srcRef = useRef<number | null>(null)

  // Hydrate from localStorage after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (!saved) return
      const parsed: WidgetId[] = JSON.parse(saved)
      const valid   = parsed.filter(id => DEFAULT_ORDER.includes(id))
      const missing = DEFAULT_ORDER.filter(id => !valid.includes(id))
      setOrder([...valid, ...missing])
    } catch {}
  }, [])

  const onDragStart = useCallback((e: React.DragEvent, i: number) => {
    srcRef.current = i
    setDragging(i)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(i)) // Firefox compat
  }, [])

  const onDragOver = useCallback((e: React.DragEvent, i: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOver(i)
  }, [])

  const onDrop = useCallback((e: React.DragEvent, target: number) => {
    e.preventDefault()
    const src = srcRef.current
    if (src === null || src === target) { setDragging(null); setOver(null); return }
    setOrder(prev => {
      const next = [...prev]
      const [moved] = next.splice(src, 1)
      next.splice(target, 0, moved)
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)) } catch {}
      return next
    })
    srcRef.current = null
    setDragging(null)
    setOver(null)
  }, [])

  const onDragEnd = useCallback(() => {
    srcRef.current = null
    setDragging(null)
    setOver(null)
  }, [])

  const onDragLeave = useCallback(() => setOver(null), [])

  const reset = useCallback(() => {
    setOrder(DEFAULT_ORDER)
    try { localStorage.removeItem(LS_KEY) } catch {}
  }, [])

  return { order, dragging, over, onDragStart, onDragOver, onDrop, onDragEnd, onDragLeave, reset }
}

// ── Widget shell (draggable wrapper) ─────────────────────────────────────────

interface ShellProps {
  id: WidgetId
  index: number
  isDragging: boolean
  isOver: boolean
  onDragStart: (e: React.DragEvent, i: number) => void
  onDragOver:  (e: React.DragEvent, i: number) => void
  onDrop:      (e: React.DragEvent, i: number) => void
  onDragEnd:   () => void
  onDragLeave: () => void
  children: React.ReactNode
}

function WidgetShell({
  id, index, isDragging, isOver,
  onDragStart, onDragOver, onDrop, onDragEnd, onDragLeave,
  children,
}: ShellProps) {
  const { span } = WIDGET_META[id]
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, index)}
      onDragOver={e => onDragOver(e, index)}
      onDrop={e => onDrop(e, index)}
      onDragEnd={onDragEnd}
      onDragLeave={onDragLeave}
      className={cn(
        'group overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-150 select-none',
        span === 3 ? 'col-span-3' : span === 2 ? 'col-span-2' : 'col-span-1',
        isDragging ? 'opacity-40 scale-[0.98] shadow-none' : '',
        isOver && !isDragging
          ? 'border-brand border-dashed ring-2 ring-brand/20'
          : 'border-slate-100',
      )}
    >
      {/* Drag handle bar */}
      <div
        className="flex cursor-grab items-center gap-2 border-b border-slate-50 bg-slate-50/60 px-4 py-2 active:cursor-grabbing"
        title="Kéo để di chuyển widget"
      >
        <GripVerticalIcon className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          {WIDGET_META[id].label}
        </span>
      </div>
      {children}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BarChart({ data, color = '#19734E' }: { data: Array<{ label: string; count: number }>; color?: string }) {
  if (!data.length) return <div className="flex h-28 items-center justify-center text-xs text-slate-400">Không có dữ liệu</div>
  const max = Math.max(...data.map(d => d.count), 1)
  const W = 480, H = 100, BOT = 22, n = data.length
  const colW = W / n
  const barW = Math.min(32, colW * 0.55)
  return (
    <svg viewBox={`0 0 ${W} ${H + BOT}`} className="w-full" style={{ overflow: 'visible' }}>
      {[0.25, 0.5, 0.75, 1].map(f => (
        <line key={f} x1={0} x2={W} y1={H - f * H} y2={H - f * H} stroke="#f1f5f9" strokeWidth={1} />
      ))}
      <line x1={0} x2={W} y1={H} y2={H} stroke="#e2e8f0" strokeWidth={1} />
      {data.map(({ label, count }, i) => {
        const bh = Math.max((count / max) * H, 2)
        const cx = (i + 0.5) * colW
        const bx = cx - barW / 2
        const by = H - bh
        return (
          <g key={i}>
            <rect x={bx} y={by} width={barW} height={bh} fill={color} fillOpacity={0.85} rx={3} />
            {count > 0 && <text x={cx} y={by - 5} textAnchor="middle" fontSize={9} fill="#64748b" fontWeight="600">{count}</text>}
            <text x={cx} y={H + 16} textAnchor="middle" fontSize={9} fill="#94a3b8">{label}</text>
          </g>
        )
      })}
    </svg>
  )
}

function PendingJobsList({ count }: { count: number }) {
  const { data } = useQuery<any>({
    queryKey: ['admin-pending-jobs'],
    queryFn: () => api.get('/admin/jobs?status=PENDING_APPROVAL&limit=5'),
    enabled: count > 0,
  })
  const jobs = data?.data ?? []
  if (count === 0) return (
    <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
      <CheckCircleIcon className="h-4 w-4 text-brand" /> Không có tin nào chờ duyệt
    </div>
  )
  if (!jobs.length) return (
    <div className="space-y-2">
      {[1, 2, 3].map(i => <div key={i} className="h-11 animate-pulse rounded-lg bg-slate-50" />)}
    </div>
  )
  return (
    <div className="space-y-1">
      {jobs.map((job: any) => (
        <Link key={job.id} href="/admin/jobs?status=PENDING_APPROVAL"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-amber-50">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-amber-100 text-[11px] font-bold text-amber-700">
            {job.employer?.companyName?.[0] ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">{job.title}</p>
            <p className="truncate text-xs text-slate-400">{job.employer?.companyName}</p>
          </div>
          <span className="shrink-0 text-[10px] font-semibold text-amber-600">Duyệt →</span>
        </Link>
      ))}
    </div>
  )
}

// ── Widget content renderers ──────────────────────────────────────────────────

function ChartWidget({ title, sub, icon, color, data }: {
  title: string; sub: string; icon: React.ReactNode; color: string
  data: Array<{ label: string; count: number }>
}) {
  return (
    <div className="px-5 py-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-400">{sub}</p>
        </div>
        {icon}
      </div>
      <BarChart data={data} color={color} />
    </div>
  )
}

function PendingWidget({ count }: { count: number }) {
  return (
    <div>
      <div className="flex items-center justify-between border-b border-slate-50 px-5 py-3">
        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-semibold text-slate-900">Tin chờ duyệt</span>
          {count > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">{count}</span>
          )}
        </div>
        <Link href="/admin/jobs?status=PENDING_APPROVAL" className="text-xs font-semibold text-brand hover:underline">
          Xem tất cả →
        </Link>
      </div>
      <div className="px-4 py-3"><PendingJobsList count={count} /></div>
    </div>
  )
}

function TopEmployersWidget({ employers }: { employers: any[] }) {
  return (
    <div>
      <div className="flex items-center justify-between border-b border-slate-50 px-5 py-3">
        <div className="flex items-center gap-2">
          <TrendingUpIcon className="h-4 w-4 text-brand" />
          <span className="text-sm font-semibold text-slate-900">Top nhà tuyển dụng</span>
        </div>
        <Link href="/admin/employers" className="text-xs font-semibold text-brand hover:underline">Xem tất cả →</Link>
      </div>
      <div className="grid grid-cols-[28px_1fr_60px_24px] items-center gap-3 border-b border-slate-50 px-5 py-2">
        {['#', 'Công ty', 'Tin', ''].map((h, i) => (
          <span key={i} className={cn('text-[10px] font-semibold uppercase tracking-wider text-slate-400', i === 2 && 'text-right')}>{h}</span>
        ))}
      </div>
      <div className="divide-y divide-slate-50">
        {employers.map((e: any, i: number) => (
          <div key={e.id} className="grid grid-cols-[28px_1fr_60px_24px] items-center gap-3 px-5 py-3 transition hover:bg-slate-50/70">
            <span className="text-sm font-bold tabular-nums text-slate-300">{i + 1}</span>
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded bg-slate-100 text-xs font-bold text-slate-500">
                {e.logoUrl ? <img src={e.logoUrl} alt="" className="h-full w-full object-cover" /> : e.companyName[0]}
              </div>
              <p className="truncate text-sm font-medium text-slate-800">{e.companyName}</p>
            </div>
            <p className="text-right text-sm tabular-nums font-semibold text-slate-700">
              {e._count?.jobs ?? 0}<span className="ml-0.5 text-xs font-normal text-slate-400">tin</span>
            </p>
            {e.verified ? <CheckCircleIcon className="h-4 w-4 shrink-0 text-brand" /> : <div className="h-4 w-4" />}
          </div>
        ))}
        {!employers.length && <div className="px-5 py-6 text-center text-sm text-slate-400">Chưa có dữ liệu</div>}
      </div>
    </div>
  )
}

function StatusBarWidget({ stats, pendingCount }: { stats: any; pendingCount: number }) {
  const items = [
    { label: 'Tin đang hiển thị',  value: stats?.publishedJobs ?? 0,          color: 'text-brand',       dot: 'bg-brand' },
    { label: 'Tin chờ duyệt',       value: pendingCount,                        color: 'text-amber-600',   dot: 'bg-amber-400' },
    { label: 'Tin đã đóng',         value: (stats?.totalJobs ?? 0) - (stats?.publishedJobs ?? 0) - pendingCount, color: 'text-slate-500', dot: 'bg-slate-300' },
    { label: 'Ứng tuyển tháng này', value: stats?.applicationsThisMonth ?? 0,  color: 'text-sky-600',     dot: 'bg-sky-400' },
  ]
  return (
    <div className="grid grid-cols-2 gap-px bg-slate-100 sm:grid-cols-4">
      {items.map(({ label, value, color, dot }) => (
        <div key={label} className="flex items-center gap-3 bg-white px-5 py-4">
          <div className={cn('h-2 w-2 shrink-0 rounded-full', dot)} />
          <div className="min-w-0">
            <p className={cn('text-lg font-bold tabular-nums', color)}>{value.toLocaleString('vi-VN')}</p>
            <p className="truncate text-[11px] text-slate-400">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Widget content map ────────────────────────────────────────────────────────

function renderWidget(id: WidgetId, stats: any, months: number, pendingCount: number) {
  switch (id) {
    case 'jobs-chart':
      return (
        <ChartWidget
          title="Tin tuyển dụng mới" sub={`${months} tháng gần nhất`}
          icon={<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10"><BriefcaseIcon className="h-3.5 w-3.5 text-brand" /></div>}
          color="#19734E" data={stats?.jobsChart ?? []}
        />
      )
    case 'users-chart':
      return (
        <ChartWidget
          title="Người dùng đăng ký" sub={`${months} tháng gần nhất`}
          icon={<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50"><UsersIcon className="h-3.5 w-3.5 text-violet-600" /></div>}
          color="#7c3aed" data={stats?.usersChart ?? []}
        />
      )
    case 'apps-chart':
      return (
        <ChartWidget
          title="Đơn ứng tuyển" sub={`${months} tháng gần nhất`}
          icon={<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50"><FileTextIcon className="h-3.5 w-3.5 text-orange-500" /></div>}
          color="#f97316" data={stats?.applicationsChart ?? []}
        />
      )
    case 'pending-jobs':
      return <PendingWidget count={pendingCount} />
    case 'top-employers':
      return <TopEmployersWidget employers={stats?.topEmployers ?? []} />
    case 'status-bar':
      return <StatusBarWidget stats={stats} pendingCount={pendingCount} />
  }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={cn('h-52 animate-pulse rounded-xl bg-slate-100', i === 4 ? 'col-span-2' : i === 5 ? 'col-span-3' : '')} />
        ))}
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [months, setMonths] = useState(6)
  const dnd = useDnD()

  const { data: stats, isLoading, isError } = useQuery<any>({
    queryKey: ['admin-stats', months],
    queryFn: () => api.get(`/admin/stats?months=${months}`),
    retry: 1,
    staleTime: 60_000,
  })

  if (isLoading) return <Skeleton />

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
          <AlertTriangleIcon className="h-7 w-7 text-red-400" />
        </div>
        <p className="font-semibold text-slate-700">Không thể tải dữ liệu</p>
        <p className="text-sm text-slate-400">Đảm bảo bạn đã đăng nhập với tài khoản Admin</p>
      </div>
    )
  }

  const pendingCount = stats?.pendingJobs ?? 0

  const KPI_CARDS = [
    { label: 'Tổng người dùng', value: stats?.totalUsers ?? 0,        trend: stats?.newUsersThisMonth ?? 0,    trendLabel: 'tháng này',      icon: UsersIcon,     border: 'border-l-sky-500',    iconColor: 'text-sky-600',    href: '/admin/users'     },
    { label: 'Nhà tuyển dụng',  value: stats?.totalEmployers ?? 0,    trend: null,                             trendLabel: 'đã đăng ký',     icon: Building2Icon, border: 'border-l-violet-500', iconColor: 'text-violet-600', href: '/admin/employers' },
    { label: 'Tin tuyển dụng',  value: stats?.totalJobs ?? 0,         trend: stats?.publishedJobs ?? 0,        trendLabel: 'đang hiển thị',  icon: BriefcaseIcon, border: 'border-l-brand',      iconColor: 'text-brand',      href: '/admin/jobs'      },
    { label: 'Đơn ứng tuyển',   value: stats?.totalApplications ?? 0, trend: stats?.applicationsThisMonth ?? 0, trendLabel: 'tháng này',     icon: FileTextIcon,  border: 'border-l-orange-500', iconColor: 'text-orange-600', href: '/admin/jobs'      },
  ]

  return (
    <div className="space-y-5">

      {/* ── Page header ────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tổng quan hệ thống</h1>
          <p className="mt-0.5 text-xs text-slate-400 flex items-center gap-1">
            <GripVerticalIcon className="h-3 w-3" />
            Kéo các widget để sắp xếp lại bố cục
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {/* Month range */}
          <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white">
            {MONTH_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setMonths(opt.value)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold transition',
                  months === opt.value ? 'bg-brand text-white' : 'text-slate-500 hover:bg-slate-50',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {/* Reset layout */}
          <button
            onClick={dnd.reset}
            title="Đặt lại bố cục mặc định"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
          >
            <RotateCcwIcon className="h-3 w-3" />
            Đặt lại
          </button>
          {pendingCount > 0 && (
            <Link
              href="/admin/jobs?status=PENDING_APPROVAL"
              className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
            >
              <ClockIcon className="h-3.5 w-3.5" />
              {pendingCount} tin chờ duyệt
            </Link>
          )}
        </div>
      </div>

      {/* ── KPI row (fixed, not draggable) ─────────────────── */}
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_CARDS.map(({ label, value, trend, trendLabel, icon: Icon, border, iconColor, href }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              'group flex flex-col gap-4 rounded-xl border border-l-4 border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md',
              border,
            )}
          >
            <div className="flex items-start justify-between">
              <p className="text-xs font-semibold text-slate-500">{label}</p>
              <Icon className={cn('h-4 w-4 shrink-0 transition group-hover:scale-110', iconColor)} />
            </div>
            <div>
              <p className="text-3xl font-bold tabular-nums text-slate-900">{value.toLocaleString('vi-VN')}</p>
              {trend !== null ? (
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  {trend > 0 && <ArrowUpIcon className="h-3 w-3 text-brand" />}
                  <span className={trend > 0 ? 'font-semibold text-brand' : ''}>
                    {trend > 0 ? `+${trend.toLocaleString('vi-VN')}` : trend.toLocaleString('vi-VN')}
                  </span>
                  {' '}{trendLabel}
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-400">{trendLabel}</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* ── Draggable widget grid ───────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {dnd.order.map((id, index) => (
          <WidgetShell
            key={id}
            id={id}
            index={index}
            isDragging={dnd.dragging === index}
            isOver={dnd.over === index}
            onDragStart={dnd.onDragStart}
            onDragOver={dnd.onDragOver}
            onDrop={dnd.onDrop}
            onDragEnd={dnd.onDragEnd}
            onDragLeave={dnd.onDragLeave}
          >
            {renderWidget(id, stats, months, pendingCount)}
          </WidgetShell>
        ))}
      </div>

    </div>
  )
}
