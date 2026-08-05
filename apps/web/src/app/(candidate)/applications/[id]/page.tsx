'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ApplicationStatus, APPLICATION_STATUS_LABELS } from '@tuyendung/types'
import { cn, timeAgo } from '@/lib/utils'
import { resolveMediaUrl } from '@/lib/media'
import {
  ArrowLeftIcon, BuildingIcon, MapPinIcon, BriefcaseIcon,
  FileTextIcon, MessageSquareIcon, CheckCircle2Icon, CircleDotIcon,
  CircleIcon, XCircleIcon, ClockIcon, CalendarIcon, ExternalLinkIcon,
  AlertTriangleIcon, DownloadIcon,
} from 'lucide-react'
import { useState } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ApplicationDetail {
  id: string
  jobId: string
  userId: string
  coverLetter?: string
  status: ApplicationStatus
  notes?: string
  appliedAt: string
  updatedAt: string
  job: {
    id: string
    title: string
    slug: string
    city?: string
    jobType?: string
    salaryMin?: number
    salaryMax?: number
    salaryNegotiable?: boolean
    deadline?: string
    employer: {
      companyName: string
      logoUrl?: string
      slug: string
      city?: string
      website?: string
      industry?: string
      verified: boolean
    }
    skills: { skill: { id: string; name: string } }[]
  }
  resume?: {
    id: string
    title: string
    fileUrl?: string
  }
}

// ─── Status timeline config ──────────────────────────────────────────────────

const TIMELINE_STEPS: { status: ApplicationStatus; label: string; desc: string }[] = [
  { status: 'PENDING',   label: 'Đã gửi',        desc: 'Đơn đã được ghi nhận' },
  { status: 'REVIEWING', label: 'Đang xem xét',  desc: 'Nhà tuyển dụng đang duyệt hồ sơ' },
  { status: 'INTERVIEW', label: 'Phỏng vấn',     desc: 'Bạn được mời tham gia phỏng vấn' },
  { status: 'OFFER',     label: 'Nhận offer',     desc: 'Chúc mừng! Bạn đã nhận được offer' },
]

const STATUS_ORDER: Record<ApplicationStatus, number> = {
  PENDING: 0, REVIEWING: 1, INTERVIEW: 2, OFFER: 3,
  REJECTED: -1, WITHDRAWN: -1,
}

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  CONTRACT: 'Hợp đồng',
  INTERNSHIP: 'Thực tập',
  FREELANCE: 'Freelance',
  REMOTE: 'Remote',
}

function formatSalary(min?: number, max?: number, negotiable?: boolean) {
  if (negotiable) return 'Thỏa thuận'
  if (!min && !max) return null
  const fmt = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(0)}tr` : `${n.toLocaleString()}`)
  if (min && max) return `${fmt(min)} – ${fmt(max)} VND`
  if (min) return `Từ ${fmt(min)} VND`
  if (max) return `Đến ${fmt(max)} VND`
  return null
}

// ─── Timeline component ───────────────────────────────────────────────────────

function StatusTimeline({ status }: { status: ApplicationStatus }) {
  const isRejected = status === 'REJECTED'
  const isWithdrawn = status === 'WITHDRAWN'
  const currentIdx = STATUS_ORDER[status] ?? 0

  if (isWithdrawn) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
        <CircleIcon className="h-5 w-5 shrink-0 text-gray-400" />
        <div>
          <p className="font-semibold text-gray-600">Đã rút đơn</p>
          <p className="text-sm text-gray-400">Bạn đã rút đơn ứng tuyển này</p>
        </div>
      </div>
    )
  }

  if (isRejected) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
        <XCircleIcon className="h-5 w-5 shrink-0 text-red-500" />
        <div>
          <p className="font-semibold text-red-700">Chưa phù hợp</p>
          <p className="text-sm text-red-500">Nhà tuyển dụng đã xem xét và hồ sơ chưa phù hợp lần này</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* connector line */}
      <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" />

      <div className="space-y-0">
        {TIMELINE_STEPS.map((step, idx) => {
          const done = idx < currentIdx
          const active = idx === currentIdx

          return (
            <div key={step.status} className="relative flex items-start gap-4 pb-6 last:pb-0">
              {/* icon */}
              <div className={cn(
                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white transition-colors',
                done   ? 'border-brand bg-brand'    : '',
                active ? 'border-brand'              : '',
                !done && !active ? 'border-gray-200' : '',
              )}>
                {done ? (
                  <CheckCircle2Icon className="h-4 w-4 text-white" />
                ) : active ? (
                  <CircleDotIcon className="h-4 w-4 text-brand" />
                ) : (
                  <CircleIcon className="h-4 w-4 text-gray-300" />
                )}
              </div>

              {/* text */}
              <div className="pt-0.5">
                <p className={cn(
                  'text-sm font-semibold',
                  done || active ? 'text-gray-900' : 'text-gray-400',
                )}>
                  {step.label}
                  {active && (
                    <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">
                      Hiện tại
                    </span>
                  )}
                </p>
                <p className={cn('text-xs', done || active ? 'text-gray-500' : 'text-gray-300')}>
                  {step.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [confirmWithdraw, setConfirmWithdraw] = useState(false)

  const { data: app, isLoading, error } = useQuery<ApplicationDetail>({
    queryKey: ['application', id],
    queryFn: () => api.get(`/applications/${id}`),
  })

  const withdrawMutation = useMutation({
    mutationFn: () => api.patch(`/applications/${id}/withdraw`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['application', id] })
      queryClient.invalidateQueries({ queryKey: ['my-applications'] })
      setConfirmWithdraw(false)
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    )
  }

  if (error || !app) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center text-gray-400">
        <AlertTriangleIcon className="h-12 w-12" />
        <p className="font-medium">Không tìm thấy đơn ứng tuyển</p>
        <Link href="/applications" className="btn-primary">Quay lại danh sách</Link>
      </div>
    )
  }

  const salary = formatSalary(app.job.salaryMin, app.job.salaryMax, app.job.salaryNegotiable)
  const canWithdraw = app.status === 'PENDING'

  return (
    <div className="space-y-5">
      {/* ── Back + header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Chi tiết ứng tuyển</h1>
      </div>

      {/* ── Job card ──────────────────────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-start gap-4">
          {/* logo */}
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center">
            {app.job.employer.logoUrl ? (
              <img src={resolveMediaUrl(app.job.employer.logoUrl) ?? ''} alt={app.job.employer.companyName} className="h-full w-full object-contain p-1" />
            ) : (
              <BuildingIcon className="h-6 w-6 text-gray-300" />
            )}
          </div>

          {/* info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  href={`/jobs/${app.job.slug}`}
                  className="text-base font-bold text-gray-900 hover:text-brand"
                  target="_blank"
                >
                  {app.job.title}
                  <ExternalLinkIcon className="ml-1 inline-block h-3.5 w-3.5 text-gray-400" />
                </Link>
                <Link
                  href={`/companies/${app.job.employer.slug}`}
                  className="mt-0.5 block text-sm text-gray-500 hover:text-brand"
                >
                  {app.job.employer.companyName}
                  {app.job.employer.verified && (
                    <span className="ml-1.5 rounded bg-brand/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand">✓ Đã xác minh</span>
                  )}
                </Link>
              </div>

              {/* status badge */}
              <span className={cn(
                'shrink-0 rounded-full px-3 py-1 text-xs font-semibold',
                app.status === 'PENDING'   && 'bg-yellow-50 text-yellow-700',
                app.status === 'REVIEWING' && 'bg-blue-50 text-blue-700',
                app.status === 'INTERVIEW' && 'bg-purple-50 text-purple-700',
                app.status === 'OFFER'     && 'bg-green-50 text-green-700',
                app.status === 'REJECTED'  && 'bg-red-50 text-red-600',
                app.status === 'WITHDRAWN' && 'bg-gray-100 text-gray-500',
              )}>
                {APPLICATION_STATUS_LABELS[app.status]}
              </span>
            </div>

            {/* meta */}
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
              {app.job.city && (
                <span className="flex items-center gap-1">
                  <MapPinIcon className="h-3.5 w-3.5" /> {app.job.city}
                </span>
              )}
              {app.job.jobType && (
                <span className="flex items-center gap-1">
                  <BriefcaseIcon className="h-3.5 w-3.5" /> {JOB_TYPE_LABELS[app.job.jobType] ?? app.job.jobType}
                </span>
              )}
              {salary && (
                <span className="font-medium text-brand">{salary}</span>
              )}
              {app.job.deadline && (
                <span className="flex items-center gap-1 text-orange-500">
                  <ClockIcon className="h-3.5 w-3.5" />
                  Hết hạn {new Date(app.job.deadline).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>

            {/* skills */}
            {app.job.skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {app.job.skills.map(({ skill }) => (
                  <span key={skill.id} className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                    {skill.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* applied / updated timestamps */}
        <div className="mt-4 flex flex-wrap gap-4 border-t border-gray-100 pt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5" />
            Ứng tuyển: <strong className="text-gray-600">{new Date(app.appliedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <ClockIcon className="h-3.5 w-3.5" />
            Cập nhật: <strong className="text-gray-600">{timeAgo(app.updatedAt)}</strong>
          </span>
        </div>
      </div>

      {/* ── Status timeline ────────────────────────────────────────────── */}
      <div className="card p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Trạng thái xử lý</h2>
        <StatusTimeline status={app.status} />
      </div>

      {/* ── Employer notes (rejection reason / interview info) ────────── */}
      {app.notes && (
        <div className={cn(
          'card p-5',
          app.status === 'REJECTED' ? 'border-red-100 bg-red-50' : 'border-blue-100 bg-blue-50',
        )}>
          <div className="flex items-start gap-3">
            <MessageSquareIcon className={cn(
              'mt-0.5 h-5 w-5 shrink-0',
              app.status === 'REJECTED' ? 'text-red-400' : 'text-blue-400',
            )} />
            <div>
              <p className={cn(
                'mb-1 text-sm font-semibold',
                app.status === 'REJECTED' ? 'text-red-700' : 'text-blue-700',
              )}>
                {app.status === 'REJECTED' ? 'Phản hồi từ nhà tuyển dụng' : 'Thông tin từ nhà tuyển dụng'}
              </p>
              <p className={cn(
                'whitespace-pre-line text-sm',
                app.status === 'REJECTED' ? 'text-red-600' : 'text-blue-600',
              )}>
                {app.notes}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Submitted documents ───────────────────────────────────────── */}
      <div className="card p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Hồ sơ đã gửi</h2>
        <div className="space-y-3">
          {/* Resume */}
          {app.resume ? (
            <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <FileTextIcon className="h-5 w-5 text-brand" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{app.resume.title}</p>
                  <p className="text-xs text-gray-400">CV đã đính kèm</p>
                </div>
              </div>
              {app.resume.fileUrl && (
                <a
                  href={app.resume.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  <DownloadIcon className="h-3.5 w-3.5" /> Xem CV
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-400">
              <FileTextIcon className="h-5 w-5" />
              <span>Không đính kèm CV</span>
            </div>
          )}

          {/* Cover letter */}
          {app.coverLetter && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="mb-2 flex items-center gap-2">
                <MessageSquareIcon className="h-4 w-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">Thư giới thiệu</p>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                {app.coverLetter}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Actions ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Link href="/applications" className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2">
          ← Quay lại danh sách
        </Link>

        {canWithdraw && (
          confirmWithdraw ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Xác nhận rút đơn?</span>
              <button
                onClick={() => withdrawMutation.mutate()}
                disabled={withdrawMutation.isPending}
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 transition disabled:opacity-50"
              >
                {withdrawMutation.isPending ? 'Đang rút...' : 'Xác nhận'}
              </button>
              <button
                onClick={() => setConfirmWithdraw(false)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Hủy
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmWithdraw(true)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:border-red-200 hover:text-red-600 transition"
            >
              Rút đơn ứng tuyển
            </button>
          )
        )}
      </div>
    </div>
  )
}
