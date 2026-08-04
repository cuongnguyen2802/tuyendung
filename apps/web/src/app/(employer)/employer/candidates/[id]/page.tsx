'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  ChevronLeftIcon, MapPinIcon, BriefcaseIcon, GraduationCapIcon,
  DownloadIcon, MessageSquareIcon, LockIcon, ExternalLinkIcon,
  FileTextIcon, CalendarIcon, DollarSignIcon, CheckCircleIcon,
  LinkedinIcon, GithubIcon, GlobeIcon, StarIcon,
} from 'lucide-react'
import { api } from '@/lib/api'
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
    summary: string | null; avatarUrl: string | null
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

function AvatarEl({ src, name, size = 80 }: { src: string | null; name: string; size?: number }) {
  if (src) {
    return (
      <img src={src} alt={name}
        style={{ width: size, height: size }}
        className="rounded-2xl object-cover ring-4 ring-white shadow-lg" />
    )
  }
  const initials = name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()
  return (
    <div style={{ width: size, height: size }}
      className="rounded-2xl bg-gradient-to-br from-[#1e2d3d] to-brand flex items-center justify-center text-white font-bold ring-4 ring-white shadow-lg">
      <span style={{ fontSize: size * 0.3 }}>{initials}</span>
    </div>
  )
}

function SectionCard({ icon: Icon, iconColor = 'text-brand', iconBg = 'bg-brand/10', title, children }: {
  icon: React.ElementType; iconColor?: string; iconBg?: string; title: string; children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl', iconBg)}>
          <Icon className={cn('h-4 w-4', iconColor)} />
        </div>
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

  const { data: candidate, isLoading } = useQuery<CandidateProfile>({
    queryKey: ['candidate', id],
    queryFn: () => api.get(`/candidates/${id}`),
    enabled: !!id,
  })

  const { data: planData } = useQuery<PlanData>({
    queryKey: ['employer-plan'],
    queryFn: () => api.get('/employers/me/plan'),
    staleTime: 60_000,
  })

  const canViewContact = planData?.canViewContactInfo ?? false
  const canInitiateMessage = planData?.plan !== 'FREE'
  const profile = candidate?.profile

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-52 animate-pulse rounded-2xl bg-gray-200" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4">
            <div className="h-48 animate-pulse rounded-2xl bg-gray-200" />
            <div className="h-32 animate-pulse rounded-2xl bg-gray-200" />
          </div>
          <div className="col-span-2 space-y-4">
            <div className="h-28 animate-pulse rounded-2xl bg-gray-200" />
            <div className="h-40 animate-pulse rounded-2xl bg-gray-200" />
          </div>
        </div>
      </div>
    )
  }

  // ── Not found ──
  if (!candidate || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
            <FileTextIcon className="h-8 w-8 text-gray-400" />
          </div>
          <p className="mb-1 font-semibold text-gray-700">Không tìm thấy hồ sơ</p>
          <p className="mb-4 text-sm text-gray-400">Hồ sơ ứng viên không tồn tại hoặc đã bị ẩn.</p>
          <button onClick={() => router.back()}
            className="rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand/90 transition">
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
    <div className="space-y-5">
      {/* ── Topbar ── */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand transition">
          <ChevronLeftIcon className="h-4 w-4" /> Quay lại tìm kiếm
        </button>
        <div className="flex gap-2">
          {resumes[0] && (
            <a href={resumes[0].fileUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm hover:border-brand hover:text-brand transition">
              <DownloadIcon className="h-4 w-4" /> Tải CV
            </a>
          )}
          {canInitiateMessage ? (
            <Link href={`/employer/messages?to=${candidate.id}`}
              className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand/90 transition">
              <MessageSquareIcon className="h-4 w-4" /> Nhắn tin
            </Link>
          ) : (
            <Link href="/employer/upgrade"
              className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm hover:bg-amber-100 transition"
              title="Nâng cấp lên Pro để nhắn tin trực tiếp với ứng viên">
              <LockIcon className="h-4 w-4" /> Nâng cấp để nhắn tin
            </Link>
          )}
        </div>
      </div>

      {/* ── Hero card ── */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Banner */}
        <div className="relative h-36 overflow-hidden rounded-t-2xl bg-gradient-to-r from-[#1e2d3d] via-brand to-emerald-400">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
          <div className="absolute right-16 bottom-0 h-24 w-24 rounded-full bg-white/5" />
          <div className="absolute left-1/3 -bottom-6 h-32 w-32 rounded-full bg-white/5" />
        </div>

        {/* Avatar — straddles banner boundary */}
        <div className="relative">
          <div className="absolute bottom-0 left-6 z-10 translate-y-1/2">
            <AvatarEl src={profile.avatarUrl} name={profile.fullName} size={88} />
          </div>
        </div>

        {/* Info bar */}
        <div className="px-6 pb-5 pt-14">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
                {profile.openToWork && (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-700">
                    <CheckCircleIcon className="h-3 w-3" /> Đang tìm việc
                  </span>
                )}
              </div>
              {profile.title && (
                <p className="mt-1 text-sm font-medium text-gray-500">{profile.title}</p>
              )}
            </div>
          </div>

          {/* Stats chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.city && (
              <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-600">
                <MapPinIcon className="h-3.5 w-3.5 text-gray-400" /> {profile.city}
              </div>
            )}
            {salary && (
              <div className="flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-sm font-medium text-brand">
                <DollarSignIcon className="h-3.5 w-3.5" /> {salary}/tháng
              </div>
            )}
            {experiences.length > 0 && (
              <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-600">
                <BriefcaseIcon className="h-3.5 w-3.5 text-gray-400" /> {experiences.length} kinh nghiệm
              </div>
            )}
            {skills.length > 0 && (
              <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-600">
                <StarIcon className="h-3.5 w-3.5 text-gray-400" /> {skills.length} kỹ năng
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content grid ── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* ── Left column ── */}
        <div className="space-y-4">

          {/* Contact info */}
          <SectionCard icon={MessageSquareIcon} title="Thông tin liên hệ">
            {canViewContact ? (
              <div className="space-y-3">
                <ContactRow label="Email" href={`mailto:${candidate.email}`} text={candidate.email} />
                {profile.linkedinUrl && (
                  <ContactRow label="LinkedIn" href={profile.linkedinUrl}
                    text={profile.linkedinUrl.replace(/^https?:\/\/(www\.)?/i, '')} external />
                )}
                {profile.githubUrl && (
                  <ContactRow label="GitHub" href={profile.githubUrl}
                    text={profile.githubUrl.replace(/^https?:\/\/(www\.)?/i, '')} external />
                )}
                {profile.portfolioUrl && (
                  <ContactRow label="Portfolio" href={profile.portfolioUrl}
                    text={profile.portfolioUrl.replace(/^https?:\/\/(www\.)?/i, '')} external />
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-amber-50 p-5 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <LockIcon className="h-5 w-5 text-amber-500" />
                </div>
                <p className="mb-1 text-sm font-semibold text-amber-800">Thông tin bị ẩn</p>
                <p className="mb-4 text-xs leading-relaxed text-amber-600">
                  Nâng cấp gói để xem email, LinkedIn và liên kết cá nhân
                </p>
                <Link href="/employer/upgrade"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition">
                  Nâng cấp ngay
                </Link>
              </div>
            )}
          </SectionCard>

          {/* Skills */}
          {skills.length > 0 && (
            <SectionCard icon={StarIcon} iconBg="bg-violet-50" iconColor="text-violet-600" title={`Kỹ năng (${skills.length})`}>
              <div className="flex flex-wrap gap-1.5">
                {skills.map(({ skill }) => (
                  <span key={skill.id}
                    className="rounded-lg border border-brand/20 bg-brand/8 px-2.5 py-1 text-xs font-medium text-brand">
                    {skill.name}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Resumes */}
          {resumes.length > 0 && (
            <SectionCard icon={FileTextIcon} iconBg="bg-blue-50" iconColor="text-blue-600" title="CV đính kèm">
              <div className="space-y-2">
                {resumes.map((r) => (
                  <a key={r.id} href={r.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 hover:border-brand hover:bg-brand/5 transition group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
                        <FileTextIcon className="h-4 w-4 text-red-500" />
                      </div>
                      <span className="truncate text-sm font-medium text-gray-700 group-hover:text-brand">
                        {r.title || 'CV đính kèm'}
                      </span>
                    </div>
                    <DownloadIcon className="h-3.5 w-3.5 shrink-0 text-gray-400 group-hover:text-brand" />
                  </a>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4 lg:col-span-2">

          {/* Summary */}
          {profile.summary && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-bold text-gray-900">Giới thiệu bản thân</h3>
              <p className="whitespace-pre-line text-sm leading-7 text-gray-600">{profile.summary}</p>
            </div>
          )}

          {/* Experiences */}
          {experiences.length > 0 && (
            <SectionCard icon={BriefcaseIcon} iconBg="bg-orange-50" iconColor="text-orange-500" title="Kinh nghiệm làm việc">
              <div className="space-y-0">
                {experiences.map((e, i) => (
                  <div key={e.id} className={cn(
                    'relative pl-6',
                    i < experiences.length - 1 ? 'pb-6' : 'pb-0',
                  )}>
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1 h-3 w-3 rounded-full border-2 border-brand bg-white shadow-sm" />
                    {/* Timeline line */}
                    {i < experiences.length - 1 && (
                      <div className="absolute left-[5px] top-4 bottom-0 w-px bg-gradient-to-b from-brand/30 to-gray-100" />
                    )}

                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{e.title}</p>
                        <p className="mt-0.5 text-sm font-medium text-brand">{e.company}</p>
                      </div>
                      <span className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs text-gray-500 shrink-0">
                        <CalendarIcon className="h-3 w-3" /> {formatPeriod(e.startDate, e.endDate)}
                      </span>
                    </div>
                    {e.description && (
                      <p className="mt-2 text-sm leading-relaxed text-gray-500 whitespace-pre-line">
                        {e.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {/* Educations */}
          {educations.length > 0 && (
            <SectionCard icon={GraduationCapIcon} iconBg="bg-sky-50" iconColor="text-sky-600" title="Học vấn">
              <div className="space-y-4">
                {educations.map((e, i) => (
                  <div key={e.id} className={cn(
                    'flex items-start justify-between gap-3',
                    i < educations.length - 1 && 'border-b border-gray-50 pb-4',
                  )}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100">
                        <GraduationCapIcon className="h-4.5 w-4.5 text-sky-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{e.school}</p>
                        {(e.degree || e.field) && (
                          <p className="mt-0.5 text-sm text-gray-500">
                            {[e.degree, e.field].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-lg bg-gray-100 px-2.5 py-1 text-xs text-gray-500 whitespace-nowrap">
                      {formatPeriod(e.startDate, e.endDate)}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Small helpers ──────────────────────────────────────────────────────────────

function ContactRow({ label, href, text, external }: {
  label: string; href: string; text: string; external?: boolean
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
      <span className="mt-0.5 min-w-[64px] text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
      <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="flex min-w-0 flex-1 items-center gap-1 text-sm text-brand hover:underline break-all">
        <span className="truncate">{text}</span>
        {external && <ExternalLinkIcon className="h-3 w-3 shrink-0" />}
      </a>
    </div>
  )
}
