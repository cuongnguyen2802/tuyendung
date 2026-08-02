'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatSalary, timeAgo } from '@/lib/utils'
import { JobDto } from '@tuyendung/types'
import { BookmarkIcon, MapPinIcon, DollarSignIcon, HeartIcon, SearchIcon } from 'lucide-react'

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  CONTRACT: 'Hợp đồng',
  INTERNSHIP: 'Thực tập',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
}

export default function SavedJobsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<{ data: JobDto[] }>({
    queryKey: ['saved-jobs'],
    queryFn: () => api.get('/users/me/saved-jobs'),
  })

  const unsaveMutation = useMutation({
    mutationFn: (jobId: string) => api.post(`/jobs/${jobId}/save`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-jobs'] }),
  })

  const savedJobs = data?.data ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Việc làm đã lưu</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {savedJobs.length > 0
              ? `${savedJobs.length} việc làm đã lưu`
              : 'Lưu các tin tuyển dụng yêu thích để xem lại sau'}
          </p>
        </div>
        {savedJobs.length > 0 && (
          <Link
            href="/jobs"
            className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-brand hover:text-brand"
          >
            <SearchIcon className="h-4 w-4" /> Tìm thêm việc
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <BookmarkIcon className="h-8 w-8 text-gray-300" />
          </div>
          <div>
            <p className="font-semibold text-gray-600">Bạn chưa lưu việc làm nào</p>
            <p className="mt-1 text-sm text-gray-400">Nhấn icon bookmark trên tin tuyển dụng để lưu lại</p>
          </div>
          <Link
            href="/jobs"
            className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90"
          >
            Khám phá việc làm
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {savedJobs.map((job) => (
            <div
              key={job.id}
              className="group relative flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-brand/30 hover:shadow-sm"
            >
              {/* Logo */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                {job.employer.logoUrl ? (
                  <Image
                    src={job.employer.logoUrl}
                    alt={job.employer.companyName}
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-lg font-bold text-gray-300">
                    {job.employer.companyName[0]}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <Link
                  href={`/jobs/${job.slug}`}
                  className="line-clamp-1 font-semibold text-gray-900 transition hover:text-brand"
                >
                  {job.title}
                </Link>
                <p className="mt-0.5 text-sm text-gray-500">{job.employer.companyName}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="h-3.5 w-3.5" /> {job.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSignIcon className="h-3.5 w-3.5" />
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryNegotiable)}
                  </span>
                  {job.jobType && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium">
                      {JOB_TYPE_LABELS[job.jobType] ?? job.jobType}
                    </span>
                  )}
                </div>
              </div>

              {/* Right */}
              <div className="flex shrink-0 flex-col items-end gap-3">
                <button
                  onClick={() => unsaveMutation.mutate(job.id)}
                  disabled={unsaveMutation.isPending}
                  title="Bỏ lưu"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-brand opacity-0 transition hover:border-red-300 hover:text-red-500 group-hover:opacity-100"
                >
                  <HeartIcon className="h-4 w-4 fill-brand" />
                </button>
                <p className="text-xs text-gray-400">
                  {timeAgo(job.publishedAt || job.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {savedJobs.length > 0 && (
        <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4 text-sm text-gray-600">
          <strong className="text-brand">Mẹo:</strong> Ứng tuyển sớm để tăng cơ hội được nhà tuyển dụng chú ý.{' '}
          <Link href="/resumes" className="font-medium text-brand hover:underline">
            Cập nhật CV ngay →
          </Link>
        </div>
      )}
    </div>
  )
}
