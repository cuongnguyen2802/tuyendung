'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  SparklesIcon, BriefcaseIcon, UserCircleIcon, ChevronDownIcon,
  StarIcon, CheckCircleIcon, MapPinIcon,
} from 'lucide-react'
import { JobStatus } from '@tuyendung/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Job {
  id: string; title: string; status: JobStatus; city: string
  skills: { skill: { name: string } }[]
}

interface Candidate {
  id: string
  profile: { fullName: string; title?: string; city?: string; avatarUrl?: string } | null
  skills: string[]
  matchScore: number
  status: string
  appliedAt: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreLabel(score: number) {
  if (score >= 80) return { label: 'Phù hợp cao', color: 'text-brand bg-brand-50' }
  if (score >= 60) return { label: 'Phù hợp',     color: 'text-blue-600 bg-blue-50' }
  if (score >= 40) return { label: 'Trung bình',  color: 'text-yellow-600 bg-yellow-50' }
  return                  { label: 'Thấp',        color: 'text-gray-500 bg-gray-100' }
}

function calcScore(candidate: any, job: Job): number {
  const jobSkills = new Set(job.skills.map(s => s.skill.name.toLowerCase()))
  const cSkills: string[] = candidate?.skills?.map((s: any) =>
    (typeof s === 'string' ? s : s?.skill?.name ?? s?.name ?? '').toLowerCase()
  ) ?? []

  const skillMatch = cSkills.length > 0
    ? (cSkills.filter(s => jobSkills.has(s)).length / Math.max(1, jobSkills.size)) * 100
    : 50

  // City bonus
  const cityBonus = candidate?.profile?.city?.toLowerCase() === job.city?.toLowerCase() ? 15 : 0
  return Math.min(100, Math.round(skillMatch + cityBonus))
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AIPage() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)

  const { data: jobsData } = useQuery<{ data: Job[] }>({
    queryKey: ['employer-jobs-ai'],
    queryFn: () => api.get('/jobs/employer/my-jobs?limit=50'),
  })

  const jobs = (jobsData?.data ?? []).filter(j => j.status === 'PUBLISHED' || j.status === 'PENDING_APPROVAL')
  const selectedJob = jobs.find(j => j.id === selectedJobId) ?? jobs[0] ?? null

  const { data: candidatesData, isLoading } = useQuery<{ data: any[] }>({
    queryKey: ['ai-candidates', selectedJob?.id],
    queryFn: () => api.get(`/applications/job/${selectedJob!.id}?limit=50`),
    enabled: !!selectedJob,
  })

  const candidates: Candidate[] = (candidatesData?.data ?? []).map((app: any) => ({
    id: app.user?.id ?? app.id,
    profile: app.user?.profile ?? null,
    skills: app.user?.profile?.skills ?? [],
    matchScore: calcScore(app.user, selectedJob!),
    status: app.status,
    appliedAt: app.appliedAt,
  })).sort((a: Candidate, b: Candidate) => b.matchScore - a.matchScore)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">AI - Đề xuất</h1>
            <span className="rounded-full bg-gradient-to-r from-violet-500 to-brand px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Beta
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">
            AI phân tích hồ sơ ứng viên và xếp hạng mức độ phù hợp với tin tuyển dụng
          </p>
        </div>
      </div>

      {/* AI Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-brand p-5">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 right-20 h-24 w-24 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-white">AI Match Engine</p>
            <p className="text-sm text-white/80">
              Hệ thống tự động tính điểm phù hợp dựa trên kỹ năng, kinh nghiệm và vị trí địa lý
            </p>
          </div>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="card py-16 text-center">
          <BriefcaseIcon className="mx-auto mb-3 h-12 w-12 text-gray-200" />
          <p className="font-medium text-gray-500">Chưa có tin tuyển dụng nào đang hoạt động</p>
          <p className="mt-1 text-sm text-gray-400">Đăng tin tuyển dụng để AI gợi ý ứng viên phù hợp</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          {/* Job selector */}
          <div className="card overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50/60 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Chọn tin tuyển dụng</p>
            </div>
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
              {jobs.map(job => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={cn(
                    'flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-gray-50',
                    (selectedJob?.id === job.id) && 'bg-brand/5',
                  )}
                >
                  <div className={cn(
                    'mt-0.5 h-2 w-2 shrink-0 rounded-full',
                    selectedJob?.id === job.id ? 'bg-brand' : 'bg-gray-300',
                  )} />
                  <div className="min-w-0">
                    <p className={cn(
                      'text-sm font-medium leading-snug',
                      selectedJob?.id === job.id ? 'text-brand' : 'text-gray-800',
                    )}>
                      {job.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">{job.city}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Candidate list */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Ứng viên phù hợp — {selectedJob?.title}
              </p>
              <span className="text-xs text-gray-400">{candidates.length} hồ sơ</span>
            </div>

            {isLoading ? (
              <div className="divide-y divide-gray-100">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                    </div>
                    <div className="h-8 w-16 animate-pulse rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : candidates.length === 0 ? (
              <div className="py-16 text-center">
                <UserCircleIcon className="mx-auto mb-3 h-12 w-12 text-gray-200" />
                <p className="text-sm text-gray-400">Chưa có ứng viên nào cho tin này</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {candidates.map((c, idx) => {
                  const { label, color } = scoreLabel(c.matchScore)
                  return (
                    <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition">
                      {/* Rank */}
                      <span className="w-5 shrink-0 text-center text-sm font-bold text-gray-300">{idx + 1}</span>

                      {/* Avatar */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                        {c.profile?.fullName?.[0]?.toUpperCase() ?? '?'}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900">{c.profile?.fullName ?? 'Ứng viên'}</p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                          {c.profile?.title && <span>{c.profile.title}</span>}
                          {c.profile?.city && (
                            <span className="flex items-center gap-0.5">
                              <MapPinIcon className="h-3 w-3" />{c.profile.city}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Score gauge */}
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              c.matchScore >= 80 ? 'bg-brand'
                              : c.matchScore >= 60 ? 'bg-brand'
                              : c.matchScore >= 40 ? 'bg-yellow-500'
                              : 'bg-gray-400',
                            )}
                            style={{ width: `${c.matchScore}%` }}
                          />
                        </div>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', color)}>
                          {c.matchScore}% {label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
