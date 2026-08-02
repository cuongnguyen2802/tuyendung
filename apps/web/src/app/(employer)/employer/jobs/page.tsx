'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { JobDto, JobStatus } from '@tuyendung/types'
import { cn, timeAgo } from '@/lib/utils'
import { format } from 'date-fns'
import {
  PencilIcon, SearchIcon, ChevronDownIcon, CopyIcon,
  PauseIcon, TrendingUpIcon, UsersIcon, EyeIcon,
  FileEditIcon, CalendarIcon, StarIcon,
} from 'lucide-react'

// ── Helpers ──────────────────────────────────────────────────────────────────

type JobWithCount = JobDto & { _count?: { applications: number } }

function jobDisplayId(id: string) {
  // derive a 7-digit display reference from CUID
  let num = 0
  for (let i = 0; i < id.length; i++) num = (num * 31 + id.charCodeAt(i)) >>> 0
  return `#${String(num % 10_000_000).padStart(7, '0')}`
}

function formatDate(d?: string | null) {
  if (!d) return null
  return format(new Date(d), 'dd/MM/yyyy')
}

// ── Status config ─────────────────────────────────────────────────────────────

const DISPLAY_STATUS: Record<JobStatus, { label: string; className: string } | null> = {
  PUBLISHED:        { label: 'Đang hiển thị', className: 'bg-brand-50 text-brand border border-brand/30' },
  CLOSED:           { label: 'Đã đóng',       className: 'bg-gray-100 text-gray-500 border border-gray-200' },
  EXPIRED:          { label: 'Hết hạn',        className: 'bg-red-50 text-red-600 border border-red-200' },
  DRAFT:            null,
  PENDING_APPROVAL: null,
  REJECTED:         null,
}

const APPROVAL_STATUS: Record<JobStatus, { label: string; className: string } | null> = {
  PUBLISHED:        { label: 'Đã duyệt',   className: 'bg-brand-50 text-brand border border-brand/30' },
  CLOSED:           { label: 'Đã duyệt',   className: 'bg-gray-100 text-gray-500 border border-gray-200' },
  PENDING_APPROVAL: { label: 'Chờ duyệt',  className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  REJECTED:         { label: 'Bị từ chối', className: 'bg-red-50 text-red-600 border border-red-200' },
  DRAFT:            { label: 'Nháp',       className: 'bg-gray-100 text-gray-500 border border-gray-200' },
  EXPIRED:          { label: 'Đã duyệt',   className: 'bg-gray-100 text-gray-500 border border-gray-200' },
}

// ── Filter selects ────────────────────────────────────────────────────────────

const DISPLAY_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'PUBLISHED', label: 'Đang hiển thị' },
  { value: 'CLOSED',    label: 'Đã đóng' },
  { value: 'EXPIRED',   label: 'Hết hạn' },
]

const APPROVAL_OPTIONS = [
  { value: '',                label: 'Tất cả' },
  { value: 'PUBLISHED',       label: 'Đã duyệt' },
  { value: 'PENDING_APPROVAL',label: 'Chờ duyệt' },
  { value: 'REJECTED',        label: 'Bị từ chối' },
  { value: 'DRAFT',           label: 'Nháp' },
]

// ── Small components ──────────────────────────────────────────────────────────

function Select({
  value, onChange, options, prefix,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  prefix: string
}) {
  return (
    <div className="relative flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
      <span className="shrink-0 text-gray-500">{prefix}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-transparent pr-5 font-medium text-gray-800 outline-none cursor-pointer"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-gray-400" />
    </div>
  )
}

function StatCell({ count, from, to }: { count: number; from?: string | null; to?: string | null }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-sm text-gray-700">
        <UsersIcon className="h-3.5 w-3.5 text-gray-400" />
        <span>Lượt ứng tuyển: <strong>{count}</strong></span>
      </div>
      {from && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <CalendarIcon className="h-3 w-3" />
          <span>{formatDate(from)} – {to ? formatDate(to) : 'Hiện tại'}</span>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function EmployerJobsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch]           = useState('')
  const [displayFilter, setDisplay]   = useState('')
  const [approvalFilter, setApproval] = useState('')

  const { data, isLoading } = useQuery<{ data: JobWithCount[] }>({
    queryKey: ['employer-jobs'],
    queryFn: () => api.get('/jobs/employer/my-jobs?limit=100'),
  })

  const closeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/jobs/${id}/close`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employer-jobs'] }),
  })

  const featureMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/jobs/${id}/feature`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employer-jobs'] }),
  })

  const allJobs = data?.data ?? []

  const jobs = useMemo(() => {
    let list = allJobs
    if (search.trim()) {
      const kw = search.toLowerCase()
      list = list.filter(j => j.title.toLowerCase().includes(kw))
    }
    if (displayFilter) {
      list = list.filter(j =>
        displayFilter === 'PUBLISHED' ? j.status === 'PUBLISHED' :
        displayFilter === 'CLOSED'    ? j.status === 'CLOSED' :
        displayFilter === 'EXPIRED'   ? j.status === 'EXPIRED' : true,
      )
    }
    if (approvalFilter) {
      list = list.filter(j => j.status === approvalFilter)
    }
    return list
  }, [allJobs, search, displayFilter, approvalFilter])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quản lý Tin tuyển dụng</h1>
        <Link
          href="/employer/jobs/new"
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand transition"
        >
          <FileEditIcon className="h-4 w-4" />
          Đăng tin
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-60">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm tin tuyển dụng theo tiêu đề hoặc mã tin"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>

          {/* Display status */}
          <Select
            value={displayFilter}
            onChange={setDisplay}
            prefix="Trạng thái hiển thị:"
            options={DISPLAY_OPTIONS}
          />

          {/* Approval status */}
          <Select
            value={approvalFilter}
            onChange={setApproval}
            prefix="Trạng thái duyệt tin:"
            options={APPROVAL_OPTIONS}
          />
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-gray-500">
          Tìm thấy <span className="font-semibold text-brand">{jobs.length}</span> tin tuyển dụng
        </p>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-px rounded-xl border border-gray-200 overflow-hidden">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 animate-pulse bg-gray-100" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && jobs.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white py-20 text-center">
          <p className="text-gray-400 text-sm">Không tìm thấy tin tuyển dụng nào</p>
          {allJobs.length === 0 && (
            <Link href="/employer/jobs/new" className="mt-3 inline-block btn-primary text-sm">
              Đăng tin đầu tiên
            </Link>
          )}
        </div>
      )}

      {/* Table */}
      {!isLoading && jobs.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_56px_200px_180px_180px] border-b border-gray-100 bg-gray-50/80 min-w-[820px]">
            <div className="px-5 py-3 text-xs font-semibold text-gray-500">Tin tuyển dụng</div>
            <div className="px-2 py-3 text-center text-xs font-semibold text-gray-500">
              <span className="sr-only">Thao tác</span>
            </div>
            <div className="px-4 py-3 text-xs font-semibold text-gray-500">Dịch vụ chạy gần đây</div>
            <div className="px-4 py-3 text-xs font-semibold text-gray-500">Đợt hiển thị gần nhất</div>
            <div className="px-4 py-3 text-xs font-semibold text-gray-500">Toàn bộ thời gian hiển thị</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {jobs.map(job => {
              const appCount = job._count?.applications ?? job.applicationCount ?? 0
              const displayBadge  = DISPLAY_STATUS[job.status]
              const approvalBadge = APPROVAL_STATUS[job.status]
              const canClose = job.status === JobStatus.PUBLISHED
              const canPause = job.status === JobStatus.PUBLISHED
              const canFeature = job.status === JobStatus.PUBLISHED

              return (
                <div
                  key={job.id}
                  className="grid grid-cols-[1fr_56px_200px_180px_180px] hover:bg-gray-50/50 transition min-w-[820px]"
                >
                  {/* Job info */}
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 font-mono">{jobDisplayId(job.id)}</span>
                    </div>
                    <Link
                      href={`/employer/jobs/${job.id}/edit`}
                      className="font-semibold text-gray-900 hover:text-brand transition text-sm leading-snug line-clamp-1"
                    >
                      {job.title}
                    </Link>

                    {/* Status badges */}
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {displayBadge && (
                        <span className={cn('rounded-md px-2 py-0.5 text-[11px] font-medium', displayBadge.className)}>
                          {displayBadge.label}
                        </span>
                      )}
                      {approvalBadge && (
                        <span className={cn('rounded-md px-2 py-0.5 text-[11px] font-medium', approvalBadge.className)}>
                          {approvalBadge.label}
                        </span>
                      )}
                      {job.isFeatured && (
                        <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                          ★ Tin nổi bật
                        </span>
                      )}
                    </div>

                    {/* Campaign name (job city + type) */}
                    <p className="mt-1.5 text-xs text-gray-400 line-clamp-1">
                      {job.city} · {job.workMode} · {timeAgo(job.createdAt)}
                    </p>

                    {/* CV actions */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <Link
                        href={`/employer/jobs/${job.id}/applications`}
                        className="inline-flex items-center gap-1 rounded-md border border-brand/30 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand hover:bg-brand/10 transition"
                      >
                        <UsersIcon className="h-3 w-3" />
                        Xem CV ứng tuyển
                      </Link>
                      {appCount > 0 && (
                        <Link
                          href={`/employer/jobs/${job.id}/applications?status=PENDING`}
                          className="text-xs font-medium text-brand hover:underline"
                        >
                          {appCount} CV ứng tuyển
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col items-center justify-center gap-1.5 px-2 py-3 border-l border-gray-100">
                    <Link
                      href={`/employer/jobs/${job.id}/edit`}
                      title="Chỉnh sửa"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-brand transition"
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                    </Link>

                    {canPause && (
                      <button
                        onClick={() => closeMutation.mutate(job.id)}
                        disabled={closeMutation.isPending}
                        title="Tạm dừng / Đóng tin"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-red-500 transition"
                      >
                        <PauseIcon className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {canFeature && (
                      <button
                        onClick={() => featureMutation.mutate(job.id)}
                        disabled={featureMutation.isPending}
                        title={job.isFeatured ? 'Bỏ tin nổi bật' : 'Đặt làm tin nổi bật'}
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg transition',
                          job.isFeatured
                            ? 'bg-amber-50 text-amber-500 hover:bg-amber-100'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-amber-500',
                        )}
                      >
                        <StarIcon className={cn('h-3.5 w-3.5', job.isFeatured && 'fill-amber-400')} />
                      </button>
                    )}

                    <div className="relative">
                      <Link
                        href={`/jobs/${job.slug}`}
                        target="_blank"
                        title="Đẩy tin / Xem tin"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-brand transition"
                      >
                        <TrendingUpIcon className="h-3.5 w-3.5" />
                      </Link>
                      <span className="pointer-events-none absolute -right-1 -top-1 rounded-full bg-orange-400 px-1 py-px text-[9px] font-bold leading-none text-white">
                        Mới
                      </span>
                    </div>

                    <Link
                      href={`/employer/jobs/new?copyFrom=${job.id}`}
                      title="Sao chép tin"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-brand transition"
                    >
                      <CopyIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  {/* Recent service */}
                  <div className="border-l border-gray-100 px-4 py-4 flex items-center">
                    <p className="text-sm text-gray-400 italic">Chưa kích hoạt dịch vụ</p>
                  </div>

                  {/* Latest period */}
                  <div className="border-l border-gray-100 px-4 py-4 flex items-center">
                    {job.publishedAt ? (
                      <StatCell
                        count={appCount}
                        from={job.publishedAt}
                        to={job.deadline ?? null}
                      />
                    ) : (
                      <p className="text-sm text-gray-300">–</p>
                    )}
                  </div>

                  {/* All time */}
                  <div className="border-l border-gray-100 px-4 py-4 flex items-center">
                    {job.publishedAt ? (
                      <StatCell
                        count={appCount}
                        from={job.publishedAt}
                        to={job.deadline ?? null}
                      />
                    ) : (
                      <p className="text-sm text-gray-300">–</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          </div>{/* /overflow-x-auto */}
        </div>
      )}
    </div>
  )
}
