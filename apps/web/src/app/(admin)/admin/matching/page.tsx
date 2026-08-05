'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  SearchIcon, ChevronDownIcon, BriefcaseIcon,
  UserCircleIcon, MapPinIcon, CheckCircle2Icon,
  SparklesIcon, BuildingIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function MatchScoreBadge({ score }: { score: number }) {
  if (score >= 80) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-bold text-green-700">
      <CheckCircle2Icon className="h-3.5 w-3.5" /> {score}%
    </span>
  )
  if (score >= 50) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-sm font-bold text-yellow-700">
      {score}%
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-sm font-bold text-orange-600">
      {score}%
    </span>
  )
}

export default function MatchingPage() {
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [jobSearch, setJobSearch] = useState('')

  const { data: jobsData, isLoading: loadingJobs } = useQuery<any>({
    queryKey: ['admin-matching-jobs'],
    queryFn: () => api.get('/admin/matching/jobs'),
  })

  const { data: matchData, isLoading: loadingMatch } = useQuery<any>({
    queryKey: ['admin-matching-candidates', selectedJobId],
    queryFn: () => api.get(`/admin/matching/candidates/${selectedJobId}?limit=30`),
    enabled: !!selectedJobId,
  })

  const jobs: any[] = jobsData?.data ?? jobsData ?? []
  const filteredJobs = jobs.filter((j: any) =>
    !jobSearch || j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
    j.employer?.companyName?.toLowerCase().includes(jobSearch.toLowerCase()),
  )

  const matchResult = matchData
  const candidates: any[] = matchResult?.candidates ?? []
  const jobInfo = matchResult?.job

  const highMatch = candidates.filter(c => c.matchScore >= 80).length
  const midMatch = candidates.filter(c => c.matchScore >= 50 && c.matchScore < 80).length
  const lowMatch = candidates.filter(c => c.matchScore > 0 && c.matchScore < 50).length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Module Matching</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Phân tích độ phù hợp giữa ứng viên và tin tuyển dụng dựa trên kỹ năng
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* Left: Job selector */}
        <div className="space-y-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-bold text-gray-800 flex items-center gap-2">
              <BriefcaseIcon className="h-4 w-4 text-brand" />
              Chọn tin tuyển dụng
            </h3>

            <div className="relative mb-3">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                value={jobSearch}
                onChange={e => setJobSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-8 pr-3 text-sm focus:border-brand focus:outline-none"
                placeholder="Tìm tin tuyển dụng..."
              />
            </div>

            <div className="max-h-[500px] space-y-1 overflow-y-auto">
              {loadingJobs ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
                ))
              ) : filteredJobs.length === 0 ? (
                <p className="py-6 text-center text-xs text-gray-400">Không có tin tuyển dụng</p>
              ) : (
                filteredJobs.map((job: any) => (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className={cn(
                      'w-full rounded-lg p-3 text-left transition',
                      selectedJobId === job.id
                        ? 'bg-brand text-white'
                        : 'hover:bg-gray-50 text-gray-700',
                    )}
                  >
                    <p className={cn('text-sm font-medium leading-tight', selectedJobId === job.id ? 'text-white' : 'text-gray-800')}>
                      {job.title}
                    </p>
                    <p className={cn('mt-0.5 text-xs', selectedJobId === job.id ? 'text-white/70' : 'text-gray-400')}>
                      {job.employer?.companyName}
                    </p>
                    {job.skills?.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {job.skills.slice(0, 3).map((js: any) => (
                          <span key={js.skill.id}
                            className={cn(
                              'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                              selectedJobId === job.id
                                ? 'bg-white/20 text-white'
                                : 'bg-brand/10 text-brand',
                            )}>
                            {js.skill.name}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className={cn('text-[10px]', selectedJobId === job.id ? 'text-white/60' : 'text-gray-400')}>
                            +{job.skills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Match results */}
        <div className="space-y-4">
          {!selectedJobId ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-white text-gray-400">
              <SparklesIcon className="h-10 w-10 text-gray-200" />
              <p className="text-sm">Chọn một tin tuyển dụng để xem danh sách ứng viên phù hợp</p>
            </div>
          ) : loadingMatch ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : (
            <>
              {/* Job info + summary */}
              {jobInfo && (
                <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-bold text-gray-900">{jobInfo.title}</h2>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {jobInfo.requiredSkills.map((s: string) => (
                          <span key={s} className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">
                            {s}
                          </span>
                        ))}
                        {jobInfo.requiredSkills.length === 0 && (
                          <span className="text-xs text-gray-400">Không yêu cầu kỹ năng cụ thể</span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-2xl font-bold text-brand">{candidates.length}</p>
                      <p className="text-xs text-gray-500">ứng viên phù hợp</p>
                    </div>
                  </div>

                  {candidates.length > 0 && (
                    <div className="mt-3 flex items-center gap-4 border-t border-brand/10 pt-3">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs text-gray-600">{highMatch} khớp cao (≥80%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-yellow-400" />
                        <span className="text-xs text-gray-600">{midMatch} khớp vừa (50–79%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-orange-400" />
                        <span className="text-xs text-gray-600">{lowMatch} khớp thấp (&lt;50%)</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Candidate list */}
              {candidates.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-white text-gray-400">
                  <UserCircleIcon className="h-10 w-10 text-gray-200" />
                  <p className="text-sm">Không tìm được ứng viên phù hợp</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {candidates.map((c: any, idx: number) => {
                    const allSkills = c.skills?.map((cs: any) => cs.skill?.name ?? cs).filter(Boolean) ?? []
                    return (
                      <div key={c.user?.id ?? idx}
                        className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-brand/30 hover:shadow-sm">
                        <div className="flex items-start gap-4">
                          {/* Rank */}
                          <div className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                            idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                              idx === 1 ? 'bg-gray-200 text-gray-600' :
                                idx === 2 ? 'bg-orange-100 text-orange-600' :
                                  'bg-gray-100 text-gray-400',
                          )}>
                            {idx + 1}
                          </div>

                          {/* Avatar */}
                          {c.avatarUrl ? (
                            <img src={c.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-400">
                              {c.fullName?.[0] ?? c.user?.email?.[0]?.toUpperCase()}
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-semibold text-gray-800">{c.fullName ?? c.user?.email}</p>
                                {c.title && <p className="text-xs text-gray-500">{c.title}</p>}
                                {c.city && (
                                  <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                                    <MapPinIcon className="h-3 w-3" /> {c.city}
                                  </p>
                                )}
                              </div>
                              <MatchScoreBadge score={c.matchScore} />
                            </div>

                            {/* Skills */}
                            <div className="mt-2 flex flex-wrap gap-1">
                              {allSkills.map((s: string) => {
                                const isMatched = c.matchedSkills?.includes(s)
                                return (
                                  <span key={s}
                                    className={cn(
                                      'rounded-full px-2 py-0.5 text-[10px] font-medium',
                                      isMatched
                                        ? 'bg-green-100 text-green-700 ring-1 ring-green-300'
                                        : 'bg-gray-100 text-gray-500',
                                    )}>
                                    {isMatched && <CheckCircle2Icon className="mr-0.5 inline h-2.5 w-2.5" />}
                                    {s}
                                  </span>
                                )
                              })}
                            </div>

                            {/* Matched skills summary */}
                            {c.matchedSkills?.length > 0 && (
                              <p className="mt-1.5 text-xs text-green-600">
                                Khớp {c.matchedSkills.length}/{jobInfo?.requiredSkills?.length ?? 0} kỹ năng yêu cầu
                              </p>
                            )}
                          </div>

                          {/* Applications count */}
                          <div className="shrink-0 text-right">
                            <p className="text-xs text-gray-400">{c.user?._count?.applications ?? 0}</p>
                            <p className="text-[10px] text-gray-300">đơn nộp</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
