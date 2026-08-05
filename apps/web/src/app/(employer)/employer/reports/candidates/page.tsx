'use client'

import { UsersIcon, UserCheckIcon, ClockIcon, TrophyIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type AppStatus = 'PENDING' | 'REVIEWING' | 'INTERVIEW' | 'OFFER' | 'REJECTED'

interface CandidateReport {
  id: string
  name: string
  avatarInitial: string
  avatarColor: string
  position: string
  appliedAt: string
  status: AppStatus
  rating?: number
  source: string
}

const MOCK_CANDIDATES: CandidateReport[] = [
  { id: '1', name: 'Nguyễn Văn An',    avatarInitial: 'A', avatarColor: 'bg-blue-500',   position: 'Senior Frontend Developer', appliedAt: '2025-07-28', status: 'REVIEWING',  rating: 4, source: 'Organic' },
  { id: '2', name: 'Trần Thị Bình',    avatarInitial: 'B', avatarColor: 'bg-pink-500',   position: 'Senior Frontend Developer', appliedAt: '2025-07-30', status: 'INTERVIEW',  rating: 5, source: 'AI gợi ý' },
  { id: '3', name: 'Lê Minh Cường',    avatarInitial: 'C', avatarColor: 'bg-green-500',  position: 'Backend Developer',         appliedAt: '2025-08-01', status: 'PENDING',    source: 'Organic' },
  { id: '4', name: 'Phạm Thu Hà',      avatarInitial: 'H', avatarColor: 'bg-purple-500', position: 'UI/UX Designer',           appliedAt: '2025-07-25', status: 'OFFER',      rating: 5, source: 'LinkedIn' },
  { id: '5', name: 'Hoàng Đức Dũng',   avatarInitial: 'D', avatarColor: 'bg-orange-500', position: 'DevOps Engineer',          appliedAt: '2025-08-02', status: 'PENDING',    source: 'Organic' },
  { id: '6', name: 'Vũ Thị Lan',       avatarInitial: 'L', avatarColor: 'bg-teal-500',   position: 'Senior Frontend Developer', appliedAt: '2025-07-20', status: 'REJECTED',   rating: 2, source: 'Organic' },
  { id: '7', name: 'Đỗ Quang Minh',    avatarInitial: 'M', avatarColor: 'bg-indigo-500', position: 'Backend Developer',         appliedAt: '2025-07-31', status: 'REVIEWING',  rating: 3, source: 'AI gợi ý' },
  { id: '8', name: 'Ngô Thị Ngân',     avatarInitial: 'N', avatarColor: 'bg-rose-500',   position: 'Product Manager',          appliedAt: '2025-07-18', status: 'REJECTED',   source: 'Organic' },
]

const STATUS_CONFIG: Record<AppStatus, { label: string; className: string; dot: string }> = {
  PENDING:   { label: 'Chờ xem xét', className: 'bg-gray-100 text-gray-600 border-gray-200',    dot: 'bg-gray-400' },
  REVIEWING: { label: 'Đang xem xét',className: 'bg-blue-50 text-blue-700 border-blue-200',     dot: 'bg-blue-500' },
  INTERVIEW: { label: 'Phỏng vấn',   className: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-500' },
  OFFER:     { label: 'Đề nghị',     className: 'bg-green-50 text-green-700 border-green-200',  dot: 'bg-green-500' },
  REJECTED:  { label: 'Từ chối',     className: 'bg-red-50 text-red-600 border-red-200',        dot: 'bg-red-400' },
}

// Donut chart data
const STATUS_COUNTS: Partial<Record<AppStatus, number>> = {}
MOCK_CANDIDATES.forEach(c => { STATUS_COUNTS[c.status] = (STATUS_COUNTS[c.status] ?? 0) + 1 })

const DONUT_COLORS: Record<AppStatus, string> = {
  PENDING:   '#94a3b8',
  REVIEWING: '#3b82f6',
  INTERVIEW: '#f59e0b',
  OFFER:     '#22c55e',
  REJECTED:  '#f87171',
}

function Stars({ n }: { n?: number }) {
  if (!n) return <span className="text-xs text-gray-300">—</span>
  return (
    <span className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= n ? 'text-amber-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  )
}

export default function CandidateReportsPage() {
  const total = MOCK_CANDIDATES.length
  const newThisWeek = MOCK_CANDIDATES.filter(c => {
    const d = new Date(c.appliedAt)
    const now = new Date()
    return (now.getTime() - d.getTime()) < 7 * 24 * 3600 * 1000
  }).length
  const inReview  = MOCK_CANDIDATES.filter(c => c.status === 'REVIEWING' || c.status === 'INTERVIEW').length
  const hired     = MOCK_CANDIDATES.filter(c => c.status === 'OFFER').length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Báo cáo ứng viên</h1>
        <p className="mt-0.5 text-sm text-gray-500">Tổng quan ứng viên đã nộp hồ sơ</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Tổng ứng viên',   value: total,       icon: UsersIcon,     bg: 'bg-brand/5',   ic: 'text-brand',   vl: 'text-brand' },
          { label: 'Mới tuần này',     value: newThisWeek, icon: ClockIcon,     bg: 'bg-amber-50',  ic: 'text-amber-600',vl:'text-amber-700' },
          { label: 'Đang xem xét',    value: inReview,    icon: UserCheckIcon, bg: 'bg-blue-50',   ic: 'text-blue-600', vl:'text-blue-700' },
          { label: 'Đề nghị việc làm', value: hired,       icon: TrophyIcon,    bg: 'bg-green-50',  ic: 'text-green-600',vl:'text-green-700' },
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
              <p className={cn('text-2xl font-bold', c.vl)}>{c.value}</p>
            </div>
          )
        })}
      </div>

      {/* Status breakdown */}
      <div className="grid gap-4 sm:grid-cols-[1fr_280px]">
        {/* Legend */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Phân bổ theo trạng thái</h2>
          <div className="space-y-3">
            {(Object.entries(STATUS_COUNTS) as [AppStatus, number][]).map(([status, count]) => {
              const cfg = STATUS_CONFIG[status]
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
                  <div className="h-1.5 w-full rounded-full bg-gray-100">
                    <div
                      className={cn('h-1.5 rounded-full', cfg.dot)}
                      style={{ width: `${pct}%`, backgroundColor: DONUT_COLORS[status] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Source breakdown */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Nguồn ứng viên</h2>
          {(() => {
            const sources: Record<string, number> = {}
            MOCK_CANDIDATES.forEach(c => { sources[c.source] = (sources[c.source] ?? 0) + 1 })
            return Object.entries(sources).map(([src, cnt]) => (
              <div key={src} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{src}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 rounded-full bg-brand/30" style={{ width: `${(cnt / total) * 80}px` }} />
                  <span className="text-sm font-semibold text-gray-800 w-6 text-right">{cnt}</span>
                </div>
              </div>
            ))
          })()}
        </div>
      </div>

      {/* Candidates table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-gray-700">Danh sách ứng viên gần đây</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ứng viên</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vị trí</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nguồn</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày nộp</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Đánh giá</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_CANDIDATES.map(c => {
                const cfg = STATUS_CONFIG[c.status]
                return (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold', c.avatarColor)}>
                          {c.avatarInitial}
                        </div>
                        <span className="font-medium text-gray-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 text-xs max-w-[160px] truncate">{c.position}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn(
                        'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
                        c.source === 'AI gợi ý' ? 'bg-brand/10 text-brand' : 'bg-gray-100 text-gray-600',
                      )}>
                        {c.source}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{new Date(c.appliedAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3.5 text-center"><Stars n={c.rating} /></td>
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
      </div>
    </div>
  )
}
