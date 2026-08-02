'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2Icon, MapPinIcon, HeartIcon, StarIcon } from 'lucide-react'
import { JobDto } from '@tuyendung/types'
import { cn, formatSalary, timeAgo } from '@/lib/utils'
import { CompanyLogoImg } from '@/components/common/CompanyLogoImg'
import { api } from '@/lib/api'

interface JobCardProps {
  job: JobDto
  variant?: 'default' | 'compact'
}

function isNew(date?: string | null): boolean {
  if (!date) return false
  return Date.now() - new Date(date).getTime() < 3 * 86400000
}

export function JobCard({ job, variant = 'default' }: JobCardProps) {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryNegotiable)
  const postedNew = isNew(job.publishedAt || job.createdAt)
  const queryClient = useQueryClient()

  const [saved, setSaved] = useState(job.isSaved ?? false)

  const toggleMutation = useMutation({
    mutationFn: () => api.post(`/jobs/${job.id}/save`),
    onMutate: () => setSaved((v) => !v),
    onSuccess: (res: { saved: boolean }) => {
      setSaved(res.saved)
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] })
    },
    onError: () => setSaved((v) => !v),
  })

  return (
    <div className={cn(
      'group relative flex gap-4 rounded-xl border bg-white p-4 transition hover:border-brand hover:shadow-md',
      job.isFeatured ? 'border-brand/30 bg-gradient-to-r from-brand-50/40 to-white' : 'border-gray-200',
    )}>
      {/* Featured badge */}
      {job.isFeatured && (
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
          <StarIcon className="h-3 w-3 fill-amber-500 text-amber-500" />
          Nổi bật
        </span>
      )}

      {/* Company logo */}
      <div className="shrink-0">
        <div className={cn(
          'flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-xl border',
          job.employer.logoUrl ? 'border-gray-100 bg-white' : 'border-transparent bg-teal-50',
        )}>
          {job.employer.logoUrl ? (
            <CompanyLogoImg
              src={job.employer.logoUrl}
              alt={job.employer.companyName}
              fallbackLetter={job.employer.companyName.charAt(0)}
              fallbackGradient="from-teal-400 to-teal-600"
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <Building2Icon className="h-8 w-8 text-teal-400" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {/* Title + salary */}
        <div className="flex items-start justify-between gap-4 pr-16">
          <Link
            href={`/jobs/${job.slug}`}
            className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900 transition group-hover:text-brand"
          >
            {job.title}
          </Link>
          <span className="shrink-0 text-sm font-bold text-brand">{salary}</span>
        </div>

        {/* Company */}
        <Link
          href={`/companies/${job.employer.slug}`}
          className="text-xs font-semibold uppercase tracking-wide text-gray-400 transition hover:text-brand"
        >
          {job.employer.companyName}
        </Link>

        {/* Location pills + experience */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
            postedNew ? 'bg-brand-50 text-brand' : 'bg-gray-100 text-gray-600',
          )}>
            <MapPinIcon className="h-3 w-3" />
            {job.city}{postedNew && <span className="font-bold">(mới)</span>}
          </span>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
            {job.experienceMin ? `${job.experienceMin}+ năm` : 'Không yêu cầu'}
          </span>
          {job.workMode === 'REMOTE' && (
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">Remote</span>
          )}
          {job.workMode === 'HYBRID' && (
            <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-600">Hybrid</span>
          )}
        </div>

        {/* Skills + footer */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-1">
            {job.employer.industry && (
              <span className="text-xs text-gray-400">{job.employer.industry}</span>
            )}
            {variant === 'default' && job.skills.slice(0, 3).map((s, i) => (
              <span key={s.id ?? s.slug ?? s.name ?? i} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                {s.name}
              </span>
            ))}
            {job.skills.length > 3 && (
              <span className="text-xs text-gray-400">+{job.skills.length - 3}</span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs text-gray-400">
              Đăng {timeAgo(job.publishedAt || job.createdAt)}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                toggleMutation.mutate()
              }}
              disabled={toggleMutation.isPending}
              title={saved ? 'Bỏ lưu' : 'Lưu việc làm'}
              aria-label={saved ? 'Bỏ lưu' : 'Lưu việc làm'}
              className={cn(
                'rounded-full border p-1.5 transition',
                saved
                  ? 'border-brand bg-brand/5 text-brand'
                  : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-brand hover:bg-brand/5 hover:text-brand',
              )}
            >
              <HeartIcon className={cn('h-3.5 w-3.5', saved && 'fill-brand')} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
