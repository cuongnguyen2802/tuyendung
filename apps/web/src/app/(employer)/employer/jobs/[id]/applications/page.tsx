'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ApplicationStatus, APPLICATION_STATUS_LABELS } from '@tuyendung/types'
import {
  ArrowLeftIcon, UserCircleIcon, FileTextIcon,
  ChevronDownIcon,
} from 'lucide-react'
import Link from 'next/link'
import { timeAgo } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]:   'bg-gray-100 text-gray-600',
  [ApplicationStatus.REVIEWING]: 'bg-blue-50 text-blue-700',
  [ApplicationStatus.INTERVIEW]: 'bg-yellow-50 text-yellow-700',
  [ApplicationStatus.OFFER]:     'bg-brand-50 text-brand',
  [ApplicationStatus.REJECTED]:  'bg-red-50 text-red-600',
  [ApplicationStatus.WITHDRAWN]: 'bg-gray-100 text-gray-400',
}

const NEXT_STATUSES: Partial<Record<ApplicationStatus, ApplicationStatus[]>> = {
  [ApplicationStatus.PENDING]:   [ApplicationStatus.REVIEWING, ApplicationStatus.REJECTED],
  [ApplicationStatus.REVIEWING]: [ApplicationStatus.INTERVIEW, ApplicationStatus.REJECTED],
  [ApplicationStatus.INTERVIEW]: [ApplicationStatus.OFFER, ApplicationStatus.REJECTED],
}

const FILTER_TABS = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ xem xét', value: ApplicationStatus.PENDING },
  { label: 'Đang xem xét', value: ApplicationStatus.REVIEWING },
  { label: 'Phỏng vấn', value: ApplicationStatus.INTERVIEW },
  { label: 'Offer', value: ApplicationStatus.OFFER },
  { label: 'Từ chối', value: ApplicationStatus.REJECTED },
]

interface CandidateProfile {
  fullName?: string
  avatarUrl?: string
  title?: string
  city?: string
}

interface ApplicationUser {
  id: string
  email: string
  profile?: CandidateProfile
}

interface Application {
  id: string
  status: ApplicationStatus
  appliedAt: string
  coverLetter?: string
  notes?: string
  user?: ApplicationUser
  resume?: { id?: string; title?: string; fileUrl?: string }
}

export default function JobApplicationsPage() {
  const { id: jobId } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Fetch job info to display title
  const { data: job } = useQuery<any>({
    queryKey: ['employer-job', jobId],
    queryFn: () => api.get(`/jobs/employer/${jobId}`),
    enabled: !!jobId,
  })

  const { data, isLoading } = useQuery<{ data: Application[]; meta: any }>({
    queryKey: ['job-applications', jobId, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '50' })
      if (statusFilter) params.set('status', statusFilter)
      return api.get(`/applications/jobs/${jobId}?${params.toString()}`)
    },
    enabled: !!jobId,
  })

  const statusMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: string; status: string }) =>
      api.patch(`/applications/${appId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications', jobId] })
      queryClient.invalidateQueries({ queryKey: ['employer-dashboard'] })
    },
  })

  const applications = data?.data ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/employer/jobs"
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-brand hover:text-brand transition"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hồ sơ ứng tuyển</h1>
          {job?.title && <p className="mt-0.5 text-sm text-gray-500">{job.title}</p>}
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition',
              statusFilter === tab.value
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}
        </div>
      )}

      {/* Empty */}
      {!isLoading && applications.length === 0 && (
        <div className="card py-16 text-center text-gray-400">
          <UserCircleIcon className="mx-auto mb-3 h-12 w-12 text-gray-200" />
          <p className="font-medium">Chưa có hồ sơ ứng tuyển nào</p>
          {statusFilter && (
            <button onClick={() => setStatusFilter('')} className="mt-2 text-sm text-brand hover:underline">
              Xem tất cả hồ sơ
            </button>
          )}
        </div>
      )}

      {/* Application list */}
      {!isLoading && applications.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">{data?.meta?.total ?? applications.length} hồ sơ</p>
          {applications.map(app => {
            const profile = app.user?.profile
            const displayName = profile?.fullName ?? app.user?.email ?? 'Ẩn danh'
            const initial = displayName[0].toUpperCase()

            return (
              <div key={app.id} className="card overflow-hidden">
                {/* Main row */}
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
                  {/* Top: Avatar + Info */}
                  <div className="flex items-center gap-3 sm:contents">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand font-bold text-lg overflow-hidden">
                      {profile?.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        initial
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{displayName}</p>
                      {profile?.title && (
                        <p className="text-xs text-gray-500 truncate">{profile.title}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">Nộp {timeAgo(app.appliedAt)}</p>
                    </div>
                  </div>

                  {/* Bottom on mobile: Status + Actions */}
                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    <span className={cn('badge', STATUS_COLORS[app.status])}>
                      {APPLICATION_STATUS_LABELS[app.status]}
                    </span>

                    {NEXT_STATUSES[app.status]?.map(nextStatus => (
                      <button
                        key={nextStatus}
                        onClick={() => statusMutation.mutate({ appId: app.id, status: nextStatus })}
                        disabled={statusMutation.isPending}
                        className={cn(
                          'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                          nextStatus === ApplicationStatus.REJECTED
                            ? 'border border-red-200 text-red-600 hover:bg-red-50'
                            : 'border border-brand/30 text-brand hover:bg-brand/5',
                        )}
                      >
                        {APPLICATION_STATUS_LABELS[nextStatus]}
                      </button>
                    ))}

                    {(app.coverLetter || app.resume) && (
                      <button
                        onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-brand hover:text-brand transition"
                      >
                        <ChevronDownIcon
                          className={cn('h-4 w-4 transition-transform', expandedId === app.id && 'rotate-180')}
                        />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded detail */}
                {expandedId === app.id && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                    {/* Resume */}
                    {app.resume && (
                      <div className="flex items-center gap-3">
                        <FileTextIcon className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="text-sm text-gray-700">{app.resume.title ?? 'CV đính kèm'}</span>
                        {app.resume.fileUrl ? (
                          <a
                            href={app.resume.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto text-xs font-medium text-brand hover:underline"
                          >
                            Tải về
                          </a>
                        ) : app.resume.id ? (
                          <Link
                            href={`/resumes/builder?id=${app.resume.id}`}
                            target="_blank"
                            className="ml-auto text-xs font-medium text-brand hover:underline"
                          >
                            Xem CV
                          </Link>
                        ) : null}
                      </div>
                    )}

                    {/* Cover letter */}
                    {app.coverLetter && (
                      <div>
                        <p className="mb-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">Thư xin việc</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{app.coverLetter}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
