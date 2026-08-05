'use client'

import { BriefcaseIcon, EyeIcon, UsersIcon, TrendingUpIcon, CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type JobStatus = 'PUBLISHED' | 'CLOSED' | 'EXPIRED' | 'DRAFT'

interface JobReport {
  id: string
  title: string
  publishedAt: string
  deadline: string
  views: number
  applications: number
  newApplications: number
  conversionRate: number
  status: JobStatus
}

const MOCK_JOBS: JobReport[] = [
  { id: '1', title: 'Senior Frontend Developer (React/Next.js)', publishedAt: '2025-07-01', deadline: '2025-08-31', views: 1_843, applications: 47, newApplications: 12, conversionRate: 2.55, status: 'PUBLISHED' },
  { id: '2', title: 'Backend Developer (NestJS / Node.js)',       publishedAt: '2025-07-05', deadline: '2025-09-05', views: 1_201, applications: 29, newApplications: 8,  conversionRate: 2.41, status: 'PUBLISHED' },
  { id: '3', title: 'UI/UX Designer (Figma)',                    publishedAt: '2025-06-15', deadline: '2025-07-31', views: 2_054, applications: 63, newApplications: 0,  conversionRate: 3.07, status: 'CLOSED' },
  { id: '4', title: 'DevOps Engineer (AWS / Docker)',             publishedAt: '2025-07-10', deadline: '2025-09-10', views: 876,   applications: 14, newApplications: 5,  conversionRate: 1.60, status: 'PUBLISHED' },
  { id: '5', title: 'Product Manager',                           publishedAt: '2025-06-01', deadline: '2025-07-01', views: 3_120, applications: 88, newApplications: 0,  conversionRate: 2.82, status: 'EXPIRED' },
]

const STATUS_CONFIG: Record<JobStatus, { label: string; className: string }> = {
  PUBLISHED: { label: 'Đang tuyển',  className: 'bg-green-50 text-green-700 border-green-200' },
  CLOSED:    { label: 'Đã đóng',     className: 'bg-gray-100 text-gray-500 border-gray-200' },
  EXPIRED:   { label: 'Hết hạn',     className: 'bg-amber-50 text-amber-700 border-amber-200' },
  DRAFT:     { label: 'Nháp',        className: 'bg-gray-100 text-gray-400 border-gray-200' },
}

// Mini bar chart — last 7 days applications (mock)
const WEEKLY_DATA = [
  { day: 'T2', apps: 4 }, { day: 'T3', apps: 7 }, { day: 'T4', apps: 5 },
  { day: 'T5', apps: 11 }, { day: 'T6', apps: 9 }, { day: 'T7', apps: 3 }, { day: 'CN', apps: 2 },
]
const maxApps = Math.max(...WEEKLY_DATA.map(d => d.apps))

export default function JobReportsPage() {
  const totalViews = MOCK_JOBS.reduce((s, j) => s + j.views, 0)
  const totalApps  = MOCK_JOBS.reduce((s, j) => s + j.applications, 0)
  const avgConv    = MOCK_JOBS.reduce((s, j) => s + j.conversionRate, 0) / MOCK_JOBS.length
  const activeJobs = MOCK_JOBS.filter(j => j.status === 'PUBLISHED').length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Báo cáo việc làm</h1>
        <p className="mt-0.5 text-sm text-gray-500">Tổng quan hiệu quả các tin tuyển dụng của bạn</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Tin đang tuyển',    value: activeJobs,              icon: BriefcaseIcon, color: 'brand',  sub: `/ ${MOCK_JOBS.length} tổng tin` },
          { label: 'Tổng lượt xem',     value: totalViews.toLocaleString('vi-VN'), icon: EyeIcon,       color: 'blue',   sub: 'tất cả thời gian' },
          { label: 'Tổng hồ sơ',        value: totalApps,               icon: UsersIcon,     color: 'purple', sub: 'ứng tuyển' },
          { label: 'Tỷ lệ chuyển đổi',  value: avgConv.toFixed(2) + '%', icon: TrendingUpIcon,color: 'green',  sub: 'trung bình' },
        ].map(card => {
          const Icon = card.icon
          const colorMap: Record<string, { bg: string; icon: string; val: string }> = {
            brand:  { bg: 'bg-brand/5',   icon: 'text-brand',   val: 'text-brand' },
            blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',val: 'text-blue-700' },
            purple: { bg: 'bg-purple-50', icon: 'text-purple-600',val: 'text-purple-700' },
            green:  { bg: 'bg-green-50',  icon: 'text-green-600',val: 'text-green-700' },
          }
          const c = colorMap[card.color]
          return (
            <div key={card.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">{card.label}</p>
                <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', c.bg)}>
                  <Icon className={cn('h-3.5 w-3.5', c.icon)} />
                </div>
              </div>
              <p className={cn('text-2xl font-bold', c.val)}>{card.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Weekly applications chart */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Hồ sơ ứng tuyển 7 ngày gần nhất</h2>
            <p className="text-xs text-gray-400 mt-0.5">Tổng tất cả tin đang hoạt động</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <CalendarIcon className="h-3.5 w-3.5" />
            Tuần này
          </span>
        </div>
        <div className="flex items-end gap-2 h-32">
          {WEEKLY_DATA.map(d => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-700">{d.apps}</span>
              <div className="w-full rounded-t-md bg-brand/20 transition-all hover:bg-brand/40" style={{ height: `${(d.apps / maxApps) * 100}%` }}>
                <div className="w-full h-full rounded-t-md bg-brand opacity-70" />
              </div>
              <span className="text-xs text-gray-400">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Jobs table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-gray-700">Chi tiết từng tin tuyển dụng</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Vị trí</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Hạn nộp</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Lượt xem</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Hồ sơ</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">CV mới</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Tỉ lệ</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MOCK_JOBS.map(job => {
                const cfg = STATUS_CONFIG[job.status]
                return (
                  <tr key={job.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-gray-800 truncate max-w-[200px]">{job.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Đăng {new Date(job.publishedAt).toLocaleDateString('vi-VN')}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{new Date(job.deadline).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums font-medium text-gray-700">{job.views.toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums font-semibold text-gray-900">{job.applications}</td>
                    <td className="px-4 py-3.5 text-right">
                      {job.newApplications > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-brand/10 px-2 py-0.5 text-xs font-bold text-brand">+{job.newApplications}</span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-gray-600">{job.conversionRate.toFixed(2)}%</td>
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
