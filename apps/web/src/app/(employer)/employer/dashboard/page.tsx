'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import {
  BriefcaseIcon, UsersRoundIcon, ChevronRightIcon, ArrowRightIcon,
  InfoIcon, ChevronLeftIcon, FileTextIcon, TrendingUpIcon, PlusCircleIcon,
  SparklesIcon, ZapIcon, TargetIcon,
} from 'lucide-react'
import { JobStatus, JobDto } from '@tuyendung/types'
import { cn } from '@/lib/utils'
import { timeAgo } from '@/lib/utils'
import { SuggestionsWidget } from '@/components/common/SuggestionsWidget'

interface DashboardStats {
  totalJobs: number
  publishedJobs: number
  totalApplications: number
  newApplications: number
}

interface Company {
  companyName: string
  logoUrl?: string
  verified: boolean
}

// ── Promotional banners ────────────────────────────────────────────────────────

const BANNERS = [
  {
    id: 1,
    tag: 'Nâng cấp tài khoản',
    title: 'Tìm ứng viên\nnhanh hơn 3 lần',
    sub: 'Với gói Premium, tiếp cận 2 triệu+ ứng viên và tối ưu quy trình tuyển dụng',
    cta: 'Khám phá ngay',
    href: '/employer/shop',
    from: 'from-violet-600',
    to: 'to-blue-600',
    icon: ZapIcon,
    decoration: 'bg-violet-500/20',
  },
  {
    id: 2,
    tag: 'AI tuyển dụng',
    title: 'Để AI gợi ý\nứng viên cho bạn',
    sub: 'Hệ thống AI phân tích hồ sơ và tự động đề xuất ứng viên phù hợp nhất',
    cta: 'Dùng thử miễn phí',
    href: '/employer/ai',
    from: 'from-emerald-500',
    to: 'to-teal-600',
    icon: SparklesIcon,
    decoration: 'bg-emerald-400/20',
  },
  {
    id: 3,
    tag: 'Chiến dịch',
    title: 'Đăng tin hàng loạt\ntiết kiệm thời gian',
    sub: 'Tạo chiến dịch tuyển dụng, đăng nhiều vị trí cùng lúc và theo dõi hiệu quả',
    cta: 'Tạo chiến dịch',
    href: '/employer/campaigns',
    from: 'from-orange-500',
    to: 'to-red-500',
    icon: TargetIcon,
    decoration: 'bg-orange-400/20',
  },
]

function BannerSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setCurrent(p => (p + 1) % BANNERS.length), 5000)
    return () => clearInterval(id)
  }, [])

  const prev = () => setCurrent(p => (p - 1 + BANNERS.length) % BANNERS.length)
  const next = () => setCurrent(p => (p + 1) % BANNERS.length)

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {BANNERS.map(b => {
          const Icon = b.icon
          return (
            <div
              key={b.id}
              className={`relative flex min-w-full items-center overflow-hidden bg-gradient-to-r ${b.from} ${b.to} p-6`}
              style={{ minHeight: 160 }}
            >
              {/* Decoration circle */}
              <div className={`absolute -right-8 -top-8 h-40 w-40 rounded-full ${b.decoration}`} />
              <div className={`absolute -bottom-10 right-16 h-28 w-28 rounded-full ${b.decoration}`} />

              <div className="relative z-10 flex-1 pr-4">
                <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white">
                  <Icon className="h-3 w-3" /> {b.tag}
                </span>
                <h3 className="mt-1 whitespace-pre-line text-xl font-extrabold leading-tight text-white">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm text-white/80 leading-relaxed line-clamp-2">{b.sub}</p>
                <Link
                  href={b.href}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-bold text-gray-900 shadow-sm transition hover:bg-white/90"
                >
                  {b.cta} <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="relative z-10 hidden sm:flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <Icon className="h-14 w-14 text-white/90" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/40"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/40"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50',
            )}
          />
        ))}
      </div>
    </div>
  )
}

// ── Status labels ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Partial<Record<JobStatus, string>> = {
  DRAFT:            'bg-gray-100 text-gray-600',
  PENDING_APPROVAL: 'bg-yellow-50 text-yellow-700',
  PUBLISHED:        'bg-brand-50 text-brand',
  CLOSED:           'bg-gray-100 text-gray-500',
  EXPIRED:          'bg-red-50 text-red-600',
  REJECTED:         'bg-red-50 text-red-600',
}

const STATUS_LABELS: Partial<Record<JobStatus, string>> = {
  DRAFT: 'Nháp', PENDING_APPROVAL: 'Chờ duyệt', PUBLISHED: 'Đang tuyển',
  CLOSED: 'Đã đóng', EXPIRED: 'Hết hạn', REJECTED: 'Bị từ chối',
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function EmployerDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['employer-dashboard'],
    queryFn: () => api.get('/employers/me/dashboard'),
  })

  const { data: company } = useQuery<Company>({
    queryKey: ['my-company'],
    queryFn: () => api.get('/employers/me/company'),
  })

  const { data: jobsData, isLoading: jobsLoading } = useQuery<{ data: (JobDto & { _count: { applications: number } })[] }>({
    queryKey: ['employer-jobs-recent'],
    queryFn: () => api.get('/jobs/employer/my-jobs?limit=5'),
  })

  const recentJobs = jobsData?.data ?? []

  const ACTION_CARDS = [
    {
      value:   stats?.newApplications ?? 0,
      label:   'CV mới (7 ngày)',
      sub:     'Chưa xem xét',
      icon:    FileTextIcon,
      color:   'text-blue-600 bg-blue-50',
      btnText: 'Xem CV',
      href:    '/employer/candidates',
    },
    {
      value:   stats?.totalApplications ?? 0,
      label:   'Tổng CV ứng tuyển',
      sub:     'Từ trước đến nay',
      icon:    UsersRoundIcon,
      color:   'text-purple-600 bg-purple-50',
      btnText: 'Xem tất cả',
      href:    '/employer/candidates',
    },
    {
      value:   stats?.publishedJobs ?? 0,
      label:   'Tin đang tuyển',
      sub:     'Đang hiển thị',
      icon:    BriefcaseIcon,
      color:   'text-brand bg-brand-50',
      btnText: 'Quản lý tin',
      href:    '/employer/jobs',
    },
    {
      value:   stats?.totalJobs ?? 0,
      label:   'Tổng tin đăng',
      sub:     'Tất cả trạng thái',
      icon:    TrendingUpIcon,
      color:   'text-orange-600 bg-orange-50',
      btnText: 'Đăng tin mới',
      href:    '/employer/jobs/new',
    },
  ]

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Bảng tin</h1>
        <Link href="/employer/jobs/new" className="btn-primary flex items-center gap-1.5">
          <PlusCircleIcon className="h-4 w-4" /> Đăng tin mới
        </Link>
      </div>

      {/* ── Announcement banner ─────────────────────────────────── */}
      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
        <div className="min-w-0 flex-1 text-sm">
          <span className="font-semibold text-blue-700">Thông báo quan trọng: </span>
          <span className="text-blue-600">
            Từ ngày <strong>15/04/2026</strong>, TuyenDung.vn cập nhật Quy định đăng tin cơ bản đối với một số vị trí tuyển dụng.
          </span>{' '}
          <Link href="#" className="font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-800">
            Xem chi tiết
          </Link>
        </div>
      </div>

      {/* ── Promotional slider ──────────────────────────────────── */}
      <BannerSlider />

      {/* ── Greeting + action cards ─────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-100 bg-gradient-to-r from-brand/5 to-transparent px-5 py-4">
          <p className="text-lg font-bold text-gray-900">
            Xin chào,{' '}
            <span className="text-brand">{company?.companyName ?? 'Nhà tuyển dụng'}</span>!
          </p>
          <p className="mt-0.5 text-sm text-gray-500">Đây là tổng quan hoạt động tuyển dụng của bạn</p>
        </div>

        <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 lg:grid-cols-4">
          {ACTION_CARDS.map(({ value, label, sub, icon: Icon, color, btnText, href }) => (
            <div key={label} className="flex flex-col p-5">
              <div className={cn('mb-3 inline-flex w-fit rounded-xl p-2', color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-extrabold text-gray-900">
                {statsLoading
                  ? <span className="inline-block h-8 w-12 animate-pulse rounded bg-gray-100" />
                  : value.toLocaleString()
                }
              </div>
              <div className="mt-0.5 text-sm font-medium text-gray-700">{label}</div>
              <div className="mb-3 text-xs text-gray-400">{sub}</div>
              <Link
                href={href}
                className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
              >
                {btnText} <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent jobs ─────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">Tin tuyển dụng gần đây</h2>
          <Link href="/employer/jobs" className="flex items-center gap-1 text-sm text-brand hover:underline">
            Xem tất cả <ChevronRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {jobsLoading ? (
          <div className="divide-y divide-gray-100">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                <div className="ml-auto h-4 w-20 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : recentJobs.length === 0 ? (
          <div className="py-12 text-center">
            <BriefcaseIcon className="mx-auto mb-3 h-10 w-10 text-gray-200" />
            <p className="text-sm text-gray-400">Chưa có tin tuyển dụng nào</p>
            <Link href="/employer/jobs/new" className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90">
              <PlusCircleIcon className="h-4 w-4" /> Đăng tin đầu tiên
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-500">Vị trí tuyển dụng</th>
                <th className="hidden px-5 py-2.5 text-left text-xs font-medium text-gray-500 sm:table-cell">Trạng thái</th>
                <th className="px-5 py-2.5 text-right text-xs font-medium text-gray-500">Ứng viên</th>
                <th className="hidden px-5 py-2.5 text-right text-xs font-medium text-gray-500 md:table-cell">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentJobs.map(job => (
                <tr key={job.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3.5">
                    <Link href={`/jobs/${job.slug}`} className="font-medium text-gray-900 transition hover:text-brand">
                      {job.title}
                    </Link>
                    <div className="mt-0.5 text-xs text-gray-400">{timeAgo(job.createdAt)}</div>
                  </td>
                  <td className="hidden px-5 py-3.5 sm:table-cell">
                    <span className={cn('badge', STATUS_COLORS[job.status])}>
                      {STATUS_LABELS[job.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/employer/jobs/${job.id}/applications`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-brand hover:text-brand"
                    >
                      <UsersRoundIcon className="h-3.5 w-3.5" />
                      {(job as any)._count?.applications ?? 0}
                    </Link>
                  </td>
                  <td className="hidden px-5 py-3.5 text-right md:table-cell">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/employer/jobs/${job.id}`}
                        className="text-xs text-gray-500 hover:text-brand"
                      >
                        Chỉnh sửa
                      </Link>
                      <Link
                        href={`/employer/jobs/${job.id}/applications`}
                        className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/20"
                      >
                        Xem CV
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Tips section ────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: '📝',
            title: 'Viết JD thu hút',
            desc: 'Mô tả công việc rõ ràng giúp tăng 60% lượt ứng tuyển phù hợp.',
            href: '/employer/jobs/new',
            cta: 'Đăng tin ngay',
          },
          {
            icon: '🏢',
            title: 'Hoàn thiện hồ sơ công ty',
            desc: 'Công ty có hồ sơ đầy đủ nhận được nhiều ứng viên hơn 3 lần.',
            href: '/employer/company',
            cta: 'Cập nhật',
          },
          {
            icon: '🤖',
            title: 'Dùng AI để tìm ứng viên',
            desc: 'Để AI gợi ý hồ sơ phù hợp, tiết kiệm 70% thời gian sàng lọc.',
            href: '/employer/ai',
            cta: 'Thử ngay',
          },
        ].map(tip => (
          <div key={tip.title} className="card p-5">
            <div className="mb-3 text-2xl">{tip.icon}</div>
            <h3 className="font-semibold text-gray-900">{tip.title}</h3>
            <p className="mt-1 text-sm text-gray-500 leading-relaxed">{tip.desc}</p>
            <Link
              href={tip.href}
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
            >
              {tip.cta} <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        ))}
      </div>

      {/* ── Suggestions (nhóm A) ──────────────────────────────────────── */}
      <SuggestionsWidget group="groupA" />

    </div>
  )
}
