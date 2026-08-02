'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Fragment } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'
import { ApplicationDto, ApplicationStatus, CandidateProfileDto } from '@tuyendung/types'
import { timeAgo, cn } from '@/lib/utils'
import {
  SendIcon, ClockIcon, CalendarCheckIcon, BookmarkIcon,
  BriefcaseIcon, UserCircleIcon, FileTextIcon, SearchIcon,
  ArrowRightIcon, ChevronRightIcon, CheckCircleIcon, SparklesIcon,
} from 'lucide-react'

const STATUS_CFG: Record<ApplicationStatus, { label: string; dot: string; bg: string; text: string }> = {
  PENDING:   { label: 'Đã gửi',        dot: 'bg-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  REVIEWING: { label: 'Đang xem xét', dot: 'bg-sky-400',    bg: 'bg-sky-50',    text: 'text-sky-700'    },
  INTERVIEW: { label: 'Phỏng vấn',    dot: 'bg-violet-400', bg: 'bg-violet-50', text: 'text-violet-700' },
  OFFER:     { label: 'Offer',         dot: 'bg-brand',      bg: 'bg-brand/10',  text: 'text-brand'  },
  REJECTED:  { label: 'Từ chối',       dot: 'bg-red-400',    bg: 'bg-red-50',    text: 'text-red-600'    },
  WITHDRAWN: { label: 'Đã rút',        dot: 'bg-gray-300',   bg: 'bg-gray-100',  text: 'text-gray-500'   },
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Chào buổi sáng'
  if (h < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}

function formatToday() {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date())
}

function calcProfileScore(p: CandidateProfileDto | null | undefined): number {
  if (!p) return 0
  const checks = [
    !!p.fullName, !!p.title, !!p.summary, !!p.phone, !!p.city, !!p.avatarUrl,
    (p.skills?.length ?? 0) > 0,
    (p.experiences?.length ?? 0) > 0,
    (p.educations?.length ?? 0) > 0,
    !!(p.linkedinUrl || p.githubUrl || p.portfolioUrl),
  ]
  return Math.round(checks.filter(Boolean).length / checks.length * 100)
}

interface SavedJob {
  id: string
  job: { id: string; title: string; slug: string; employer: { companyName: string; logoUrl?: string } }
}

export default function CandidateDashboardPage() {
  const { data: session } = useSession()
  const displayName = session?.user?.name ?? session?.user?.email?.split('@')[0] ?? 'bạn'

  const { data: appsData, isLoading: appsLoading } = useQuery<{ data: ApplicationDto[] }>({
    queryKey: ['my-applications'],
    queryFn: () => api.get('/applications/me'),
  })
  const { data: savedData } = useQuery<{ data: SavedJob[] }>({
    queryKey: ['saved-jobs'],
    queryFn: () => api.get('/saved-jobs'),
  })
  const { data: profile } = useQuery<CandidateProfileDto>({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/users/me/profile'),
    retry: false,
  })

  const apps       = appsData?.data ?? []
  const savedCount = savedData?.data?.length ?? 0
  const recentApps = apps.slice(0, 5)

  const totalApps     = apps.length
  const reviewingApps = apps.filter(a => a.status === 'PENDING' || a.status === 'REVIEWING').length
  const interviewApps = apps.filter(a => a.status === 'INTERVIEW').length
  const offerApps     = apps.filter(a => a.status === 'OFFER').length

  const profileScore = calcProfileScore(profile)
  const scoreColor   = profileScore >= 80 ? 'bg-brand' : profileScore >= 50 ? 'bg-orange-400' : 'bg-red-400'
  const scoreText    = profileScore >= 80 ? 'text-brand' : profileScore >= 50 ? 'text-orange-500' : 'text-red-500'

  const STATS = [
    { label: 'Đã ứng tuyển', value: totalApps,     icon: SendIcon,          border: 'border-l-slate-400',   href: '/applications' },
    { label: 'Chờ phản hồi', value: reviewingApps, icon: ClockIcon,         border: 'border-l-orange-400',  href: '/applications' },
    { label: 'Mời phỏng vấn', value: interviewApps, icon: CalendarCheckIcon, border: 'border-l-violet-400', href: '/applications' },
    { label: 'Việc đã lưu',  value: savedCount,    icon: BookmarkIcon,      border: 'border-l-brand',   href: '/saved-jobs'   },
  ]

  const PIPELINE = [
    { label: 'Ứng tuyển',    count: totalApps,     color: 'bg-slate-400'   },
    { label: 'Đang xét',     count: apps.filter(a => a.status === 'REVIEWING').length, color: 'bg-sky-400' },
    { label: 'Phỏng vấn',   count: interviewApps, color: 'bg-violet-400'  },
    { label: 'Nhận offer',   count: offerApps,     color: 'bg-brand'   },
  ]

  const PROFILE_CHECKS = [
    { label: 'Tiêu đề nghề nghiệp', done: !!profile?.title },
    { label: 'Tóm tắt bản thân',    done: !!profile?.summary },
    { label: 'Kỹ năng',             done: (profile?.skills?.length ?? 0) > 0 },
    { label: 'Kinh nghiệm làm việc', done: (profile?.experiences?.length ?? 0) > 0 },
    { label: 'Ảnh đại diện',        done: !!profile?.avatarUrl },
  ]

  const QUICK_LINKS = [
    { href: '/profile',    icon: UserCircleIcon, label: 'Cập nhật hồ sơ' },
    { href: '/resumes',    icon: FileTextIcon,   label: 'Quản lý CV' },
    { href: '/jobs',       icon: SearchIcon,     label: 'Tìm việc mới' },
    { href: '/saved-jobs', icon: BookmarkIcon,   label: 'Việc đã lưu' },
  ]

  return (
    <div className="space-y-4">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white px-6 py-5 shadow-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            {formatToday()}
          </p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">
            {getGreeting()},{' '}
            <span className="text-brand capitalize">{displayName}</span>
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">Tiếp tục hành trình tìm việc của bạn hôm nay.</p>
        </div>
        <div className="flex gap-2.5">
          <Link
            href="/jobs"
            className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
          >
            <SearchIcon className="h-4 w-4" />
            Tìm việc làm
          </Link>
          <Link
            href="/resumes"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand/40 hover:text-brand-600"
          >
            <FileTextIcon className="h-4 w-4" />
            CV của tôi
          </Link>
        </div>
      </div>

      {/* ── KPI row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map(({ label, value, icon: Icon, border, href }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              'group flex flex-col gap-3 rounded-xl border border-l-4 border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md',
              border,
            )}
          >
            <Icon className="h-4 w-4 text-slate-400 transition group-hover:text-brand" />
            <div>
              <div className="text-2xl font-bold tabular-nums text-slate-900">
                {appsLoading
                  ? <span className="inline-block h-7 w-8 animate-pulse rounded bg-slate-100" />
                  : value
                }
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Application pipeline ───────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-100 bg-white px-6 py-4 shadow-sm">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Phễu ứng tuyển
        </p>
        <div className="flex items-start">
          {PIPELINE.map(({ label, count, color }, i) => (
            <Fragment key={label}>
              <div className="flex flex-1 flex-col items-center text-center">
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm', color)}>
                  {count}
                </div>
                <p className="mt-2 max-w-[64px] text-[11px] font-medium leading-tight text-slate-500">{label}</p>
              </div>
              {i < PIPELINE.length - 1 && (
                <div className="mt-3.5 h-px flex-shrink-0 w-6 bg-slate-200 mx-1" />
              )}
            </Fragment>
          ))}
        </div>
      </div>

      {/* ── Main grid ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Recent applications — left 2/3 */}
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-50 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-slate-900">Ứng tuyển gần đây</h2>
            <Link
              href="/applications"
              className="flex items-center gap-0.5 text-xs font-semibold text-brand hover:underline"
            >
              Xem tất cả <ChevronRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          {appsLoading ? (
            <div className="divide-y divide-slate-50">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 px-5 py-4">
                  <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-slate-100" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-2/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                  </div>
                  <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          ) : recentApps.length === 0 ? (
            <div className="flex flex-col items-center gap-2.5 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                <BriefcaseIcon className="h-7 w-7 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">Bạn chưa ứng tuyển vào đâu cả</p>
              <Link href="/jobs" className="text-sm font-semibold text-brand hover:underline">
                Tìm việc ngay →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentApps.map(app => {
                const cfg = STATUS_CFG[app.status]
                return (
                  <div key={app.id} className="flex items-center gap-3.5 px-5 py-3.5 transition hover:bg-slate-50/60">
                    {/* Logo */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                      {app.job?.employer?.logoUrl ? (
                        <Image
                          src={app.job.employer.logoUrl}
                          alt={app.job.employer.companyName}
                          width={40} height={40}
                          className="object-contain"
                        />
                      ) : (
                        <span className="text-sm font-bold text-slate-300">
                          {app.job?.employer?.companyName?.charAt(0) ?? '?'}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/jobs/${app.job?.slug}`}
                        className="block truncate text-sm font-semibold text-slate-800 hover:text-brand-600"
                      >
                        {app.job?.title}
                      </Link>
                      <p className="truncate text-xs text-slate-400">{app.job?.employer?.companyName}</p>
                    </div>

                    {/* Status + time */}
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                        cfg.bg, cfg.text,
                      )}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
                        {cfg.label}
                      </span>
                      <span className="text-[11px] tabular-nums text-slate-400">{timeAgo(app.appliedAt)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right column — 1/3 */}
        <div className="flex flex-col gap-4">

          {/* Profile strength */}
          <div className="rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Độ hoàn thiện hồ sơ</h2>
              <span className={cn('text-sm font-bold tabular-nums', scoreText)}>{profileScore}%</span>
            </div>
            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn('h-full rounded-full transition-all duration-700', scoreColor)}
                style={{ width: `${profileScore}%` }}
              />
            </div>
            <ul className="space-y-2">
              {PROFILE_CHECKS.map(({ label, done }) => (
                <li key={label} className="flex items-center gap-2.5 text-xs">
                  {done
                    ? <CheckCircleIcon className="h-3.5 w-3.5 shrink-0 text-brand" />
                    : <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-slate-200" />
                  }
                  <span className={cn('leading-none', done ? 'text-slate-400 line-through' : 'text-slate-700')}>
                    {label}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/profile"
              className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-brand py-2 text-xs font-semibold text-white transition hover:bg-brand-600"
            >
              Hoàn thiện ngay <ArrowRightIcon className="h-3 w-3" />
            </Link>
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Thao tác nhanh</h2>
            <div className="space-y-0.5">
              {QUICK_LINKS.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2.5 transition hover:bg-slate-50 hover:text-brand-600"
                >
                  <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="flex-1 text-xs font-medium text-slate-600 group-hover:text-brand-600">{label}</span>
                  <ArrowRightIcon className="h-3 w-3 text-slate-300" />
                </Link>
              ))}
            </div>
          </div>

          {/* Tip card */}
          <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-4">
            <div className="flex gap-2.5">
              <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <div>
                <p className="text-xs font-semibold text-brand-700">Gợi ý cho bạn</p>
                <p className="mt-0.5 text-xs leading-relaxed text-brand">
                  Bật thông báo việc làm để nhận cơ hội phù hợp ngay khi có tin mới.
                </p>
                <Link
                  href="/settings/job-alerts"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                >
                  Cài đặt ngay <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
