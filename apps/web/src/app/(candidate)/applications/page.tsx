'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ApplicationDto, APPLICATION_STATUS_LABELS, ApplicationStatus } from '@tuyendung/types'
import { timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { BriefcaseIcon } from 'lucide-react'

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  REVIEWING: 'bg-blue-50 text-blue-700',
  INTERVIEW: 'bg-purple-50 text-purple-700',
  OFFER: 'bg-brand-50 text-brand',
  REJECTED: 'bg-red-50 text-red-600',
  WITHDRAWN: 'bg-gray-100 text-gray-500',
}

export default function ApplicationsPage() {
  const { data, isLoading } = useQuery<{ data: ApplicationDto[] }>({
    queryKey: ['my-applications'],
    queryFn: () => api.get('/applications/me'),
  })

  const applications = data?.data || []

  return (
    <div>
      <h1 className="mb-6 text-xl font-bold text-gray-900">Việc đã ứng tuyển</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-24 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 py-16 text-center text-gray-400">
          <BriefcaseIcon className="h-12 w-12" />
          <p className="font-medium">Bạn chưa ứng tuyển vị trí nào</p>
          <Link href="/jobs" className="btn-primary">Tìm việc ngay</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="card flex items-start gap-4 p-5">
              <div className="h-12 w-12 shrink-0 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center">
                {app.job?.employer.logoUrl ? (
                  <Image src={app.job.employer.logoUrl} alt={app.job.employer.companyName} width={48} height={48} />
                ) : (
                  <span className="font-bold text-gray-300">{app.job?.employer.companyName.charAt(0)}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link href={`/jobs/${app.job?.slug}`} className="font-semibold text-gray-900 hover:text-brand">
                  {app.job?.title}
                </Link>
                <p className="text-sm text-gray-500">{app.job?.employer.companyName}</p>
                <p className="mt-1 text-xs text-gray-400">Ứng tuyển {timeAgo(app.appliedAt)}</p>
              </div>

              <span className={cn('badge shrink-0', STATUS_COLORS[app.status])}>
                {APPLICATION_STATUS_LABELS[app.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
