'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2Icon, MapPinIcon, HeartIcon, StarIcon, ClockIcon, BriefcaseIcon, MonitorIcon } from 'lucide-react'
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

const WORK_MODE_CONFIG = {
  REMOTE:  { label: 'Remote',  className: 'bg-blue-50 text-blue-600 border-blue-100' },
  HYBRID:  { label: 'Hybrid',  className: 'bg-purple-50 text-purple-600 border-purple-100' },
  ONSITE:  { label: 'Onsite',  className: 'bg-gray-50 text-gray-500 border-gray-200' },
} as const

export function JobCard({ job, variant = 'default' }: JobCardProps) {
  const salary   = formatSalary(job.salaryMin, job.salaryMax, job.salaryNegotiable)
  const postedNew = isNew(job.publishedAt || job.createdAt)
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(job.isSaved ?? false)

  const toggleMutation = useMutation({
    mutationFn: () => api.post(`/jobs/${job.id}/save`),
    onMutate:   () => setSaved((v) => !v),
    onSuccess:  (res: { saved: boolean }) => {
      setSaved(res.saved)
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] })
    },
    onError: () => setSaved((v) => !v),
  })

  const workMode = job.workMode ? WORK_MODE_CONFIG[job.workMode as keyof typeof WORK_MODE_CONFIG] : null

  return (
    <article className={cn(
      'group relative rounded-2xl border bg-white p-5 transition-all duration-200',
      'hover:border-brand/40 hover:shadow-[0_4px_20px_rgba(25,115,78,0.10)]',
      job.isFeatured
        ? 'border-brand/25 bg-gradient-to-br from-[#f0faf5] to-white'
        : 'border-gray-200',
    )}>

      {/* ── Featured ribbon ── */}
      {job.isFeatured && (
        <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
          <StarIcon className="h-3 w-3 fill-amber-500 text-amber-500" />
          Nổi bật
        </span>
      )}

      <div className="flex gap-4">
        {/* ── Logo ── */}
        <div className="shrink-0">
          <Link href={`/companies/${job.employer.slug}`}>
            <div className={cn(
              'flex h-[64px] w-[64px] items-center justify-center overflow-hidden rounded-xl border-2 transition group-hover:border-brand/30',
              job.employer.logoUrl ? 'border-gray-100 bg-white' : 'border-transparent bg-gradient-to-br from-teal-50 to-teal-100',
            )}>
              {job.employer.logoUrl ? (
                <CompanyLogoImg
                  src={job.employer.logoUrl}
                  alt={job.employer.companyName}
                  fallbackLetter={job.employer.companyName.charAt(0)}
                  fallbackGradient="from-teal-400 to-teal-600"
                  className="h-full w-full object-contain p-1.5"
                />
              ) : (
                <Building2Icon className="h-7 w-7 text-teal-400" />
              )}
            </div>
          </Link>
        </div>

        {/* ── Content ── */}
        <div className="min-w-0 flex-1">

          {/* Row 1: title + salary */}
          <div className="flex items-start justify-between gap-3 pr-10">
            <Link
              href={`/jobs/${job.slug}`}
              className="line-clamp-2 text-[15px] font-semibold leading-snug text-gray-900 transition group-hover:text-brand"
            >
              {job.title}
            </Link>
            <span className={cn(
              'shrink-0 rounded-full px-3 py-0.5 text-sm font-bold',
              job.salaryNegotiable
                ? 'bg-gray-100 text-gray-500'
                : 'bg-brand/8 text-brand',
            )}>
              {salary}
            </span>
          </div>

          {/* Row 2: company name */}
          <Link
            href={`/companies/${job.employer.slug}`}
            className="mt-1 inline-block text-[13px] font-medium text-gray-500 transition hover:text-brand"
          >
            {job.employer.companyName}
          </Link>

          {/* Row 3: location + work mode + experience chips */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
              postedNew
                ? 'border-brand/20 bg-brand/8 text-brand'
                : 'border-gray-200 bg-gray-50 text-gray-600',
            )}>
              <MapPinIcon className="h-3 w-3 shrink-0" />
              {job.city}
              {postedNew && (
                <span className="ml-0.5 rounded-full bg-brand px-1.5 py-px text-[10px] font-bold text-white">Mới</span>
              )}
            </span>

            {workMode && (
              <span className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                workMode.className,
              )}>
                <MonitorIcon className="h-3 w-3 shrink-0" />
                {workMode.label}
              </span>
            )}

            {(job.experienceMin != null) && (
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-600">
                <BriefcaseIcon className="h-3 w-3 shrink-0" />
                {job.experienceMin === 0 ? 'Chưa có KN' : `${job.experienceMin}+ năm`}
              </span>
            )}
          </div>

          {/* Row 4: skills + time */}
          {variant === 'default' && (
            <div className="mt-2.5 flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {job.skills.slice(0, 4).map((s, i) => (
                  <span
                    key={s.id ?? s.slug ?? s.name ?? i}
                    className="rounded-md border border-gray-100 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-500"
                  >
                    {s.name}
                  </span>
                ))}
                {job.skills.length > 4 && (
                  <span className="text-[11px] text-gray-400">+{job.skills.length - 4}</span>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                  <ClockIcon className="h-3 w-3" />
                  {timeAgo(job.publishedAt || job.createdAt)}
                </span>

                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); toggleMutation.mutate() }}
                  disabled={toggleMutation.isPending}
                  title={saved ? 'Bỏ lưu' : 'Lưu việc làm'}
                  aria-label={saved ? 'Bỏ lưu' : 'Lưu việc làm'}
                  className={cn(
                    'rounded-full border p-1.5 transition-all',
                    saved
                      ? 'border-brand/30 bg-brand/5 text-brand'
                      : 'border-gray-200 text-gray-300 hover:border-brand/30 hover:bg-brand/5 hover:text-brand',
                  )}
                >
                  <HeartIcon className={cn('h-3.5 w-3.5', saved && 'fill-brand')} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
