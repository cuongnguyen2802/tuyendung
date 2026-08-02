'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  ChevronLeftIcon, MapPinIcon, BriefcaseIcon, GraduationCapIcon,
  DownloadIcon, MessageSquareIcon, LockIcon, ExternalLinkIcon,
  FileTextIcon, CalendarIcon, DollarSignIcon, CheckCircleIcon,
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Experience {
  id: string; title: string; company: string
  startDate: string; endDate: string | null; description: string | null
}
interface Education {
  id: string; school: string; degree: string; field: string
  startDate: string; endDate: string | null
}
interface Resume { id: string; title: string; fileUrl: string; createdAt: string }

interface CandidateProfile {
  id: string; email: string
  profile: {
    fullName: string; title: string | null; city: string | null
    summary: string | null; avatar: string | null
    expectedSalaryMin: number | null; expectedSalaryMax: number | null
    openToWork: boolean
    linkedinUrl: string | null; githubUrl: string | null; portfolioUrl: string | null
    experiences: Experience[]
    educations: Education[]
    skills: Array<{ skill: { id: string; name: string } }>
  } | null
  resumes: Resume[]
}

interface PlanData { plan: string; canViewContactInfo: boolean }

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return null
  const fmt = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(0)}tr` : `${(n / 1000).toFixed(0)}k`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (max) return `≤ ${fmt(max)}`
  return `≥ ${fmt(min!)}`
}

function formatPeriod(start: string, end: string | null) {
  const s = new Date(start)
  const label = (d: Date) => `${d.getMonth() + 1}/${d.getFullYear()}`
  return `${label(s)} – ${end ? label(new Date(end)) : 'Hiện tại'}`
}

function Avatar({ src, name, size = 80 }: { src: string | null; name: string; size?: number }) {
  if (src) return <img src={src} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover ring-2 ring-white shadow" />
  const initials = name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()
  return (
    <div style={{ width: size, height: size }} className="rounded-full bg-gradient-to-br from-brand to-emerald-400 flex items-center justify-center text-white font-bold ring-2 ring-white shadow" style2={{ fontSize: size * 0.32 }}>
      <span style={{ fontSize: size * 0.3 }}>{initials}</span>
    </div>
  )
}

// ── Section wrapper ────────────────────────────────────────────────────────────

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand" />
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const { data: candidate, isLoading: loadingCandidate } = useQuery<CandidateProfile>({
    queryKey: ['candidate', id],
    queryFn: () => apiClient.get(`/candidates/${id}`).then(r => r.data.data ?? r.data),
    enabled: !!id,
  })

  const { data: planData } = useQuery<PlanData>({
    queryKey: ['employer-plan'],
    queryFn: () => apiClient.get('/employers/me/plan').then(r => r.data.data ?? r.data),
    staleTime: 60_000,
  })

  const canViewContact = planData?.canViewContactInfo ?? false
  const profile = candidate?.profile

  if (loadingCandidate) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-40 animate-pulse rounded-2xl bg-gray-200" />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="h-64 animate-pulse rounded-2xl bg-gray-200" />
            <div className="col-span-2 h-64 animate-pulse rounded-2xl bg-gray-200" />
          </div>
        </div>
      </div>
    )
  }

  if (!candidate || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="mb-4 text-gray-500">Không tìm thấy hồ sơ ứng viên.</p>
          <button onClick={() => router.back()} className="rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white">
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  const salary = formatSalary(profile.expectedSalaryMin, profile.expectedSalaryMax)
  const skills = profile.skills ?? []
  const experiences = profile.experiences ?? []
  const educations = profile.educations ?? []
  const resumes = candidate.resumes ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand transition">
            <ChevronLeftIcon className="h-4 w-4" /> Quay lại tìm kiếm
          </button>
          <div className="flex gap-2">
            {resumes[0] && (
              <a href={resumes[0].fileUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-brand hover:text-brand transition">
                <DownloadIcon className="h-4 w-4" /> Tải CV
              </a>
            )}
            <Link href={`/employer/messages?to=${candidate.id}`}
              className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 transition">
              <MessageSquareIcon className="h-4 w-4" /> Nhắn tin
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">
        {/* Hero card */}
        <div className="mb-5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-brand/80 to-emerald-500/80" />
          <div className="px-6 pb-5">
            <div className="-mt-10 flex items-end gap-4">
              <Avatar src={profile.avatar} name={profile.fullName} size={80} />
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-bold text-gray-900">{profile.fullName}</h1>
                  {profile.openToWork && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      <CheckCircleIcon className="h-3 w-3" /> Đang tìm việc
                    </span>
                  )}
                </div>
                {profile.title && <p className="mt-0.5 text-sm text-gray-600">{profile.title}</p>}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {profile.city && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPinIcon className="h-3.5 w-3.5" /> {profile.city}
                </span>
              )}
              {salary && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <DollarSignIcon className="h-3.5 w-3.5" /> Mong muốn: {salary}/tháng
                </span>
              )}
              {experiences.length > 0 && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <BriefcaseIcon className="h-3.5 w-3.5" /> {experiences.length} kinh nghiệm
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-4">
            {/* Contact */}
            <Section icon={MessageSquareIcon} title="Thông tin liên hệ">
              {canViewContact ? (
                <div className="space-y-2.5">
                  <div>
                    <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Email</p>
                    <a href={`mailto:${candidate.email}`} className="text-sm text-brand hover:underline">{candidate.email}</a>
                  </div>
                  {profile.linkedinUrl && (
                    <div>
                      <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-gray-400">LinkedIn</p>
                      <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-brand hover:underline">
                        {profile.linkedinUrl.replace('https://', '')} <ExternalLinkIcon className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {profile.githubUrl && (
                    <div>
                      <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-gray-400">GitHub</p>
                      <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-brand hover:underline">
                        {profile.githubUrl.replace('https://', '')} <ExternalLinkIcon className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {profile.portfolioUrl && (
                    <div>
                      <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Portfolio</p>
                      <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-brand hover:underline">
                        {profile.portfolioUrl.replace('https://', '')} <ExternalLinkIcon className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-amber-50 p-4 text-center">
                  <LockIcon className="mx-auto mb-2 h-5 w-5 text-amber-500" />
                  <p className="mb-2 text-xs font-semibold text-amber-700">Thông tin bị ẩn</p>
                  <p className="mb-3 text-xs text-amber-600">Nâng cấp gói để xem email và liên kết cá nhân</p>
                  <Link href="/employer/upgrade" className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition">
                    Nâng cấp ngay
                  </Link>
                </div>
              )}
            </Section>

            {/* Skills */}
            {skills.length > 0 && (
              <Section icon={BriefcaseIcon} title={`Kỹ năng (${skills.length})`}>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map(({ skill }) => (
                    <span key={skill.id} className="rounded-full border border-brand/25 bg-brand/8 px-2.5 py-0.5 text-xs font-medium text-brand">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Resumes */}
            {resumes.length > 0 && (
              <Section icon={FileTextIcon} title="CV đính kèm">
                <div className="space-y-2">
                  {resumes.map((r) => (
                    <a key={r.id} href={r.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm hover:border-brand hover:bg-brand/5 transition">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileTextIcon className="h-4 w-4 shrink-0 text-brand" />
                        <span className="truncate font-medium text-gray-700">{r.title || 'CV'}</span>
                      </div>
                      <DownloadIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    </a>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4 lg:col-span-2">
            {/* Summary */}
            {profile.summary && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="mb-3 font-bold text-gray-900">Giới thiệu bản thân</h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">{profile.summary}</p>
              </div>
            )}

            {/* Experiences */}
            {experiences.length > 0 && (
              <Section icon={BriefcaseIcon} title="Kinh nghiệm làm việc">
                <div className="space-y-5">
                  {experiences.map((e, i) => (
                    <div key={e.id} className={cn('relative pl-5', i < experiences.length - 1 && 'pb-5')}>
                      <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-brand bg-white" />
                      {i < experiences.length - 1 && (
                        <div className="absolute left-[4px] top-4 h-full w-px bg-gray-200" />
                      )}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900">{e.title}</p>
                          <p className="text-sm text-brand">{e.company}</p>
                        </div>
                        <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
                          <CalendarIcon className="h-3 w-3" /> {formatPeriod(e.startDate, e.endDate)}
                        </span>
                      </div>
                      {e.description && (
                        <p className="mt-2 text-sm leading-relaxed text-gray-500 whitespace-pre-line">{e.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Educations */}
            {educations.length > 0 && (
              <Section icon={GraduationCapIcon} title="Học vấn">
                <div className="space-y-4">
                  {educations.map((e) => (
                    <div key={e.id} className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{e.school}</p>
                        <p className="text-sm text-gray-500">{[e.degree, e.field].filter(Boolean).join(' · ')}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
                        {formatPeriod(e.startDate, e.endDate)}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
