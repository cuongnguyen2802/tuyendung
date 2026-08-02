import { Suspense, type ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { serverFetch } from '@/lib/server-fetch'
import {
  JobDto,
  JOB_TYPE_LABELS,
  WORK_MODE_LABELS,
  COMPANY_SIZE_LABELS,
  CompanySize,
  JobCategoryDto,
  PaginatedResponse,
} from '@tuyendung/types'
import { formatSalary, formatDeadline } from '@/lib/utils'
import {
  MapPinIcon,
  BriefcaseIcon,
  DollarSignIcon,
  ChevronRightIcon,
  BuildingIcon,
  UsersIcon,
  CalendarIcon,
  ClockIcon,
  BellIcon,
  BadgeCheckIcon,
  TrendingUpIcon,
  ExternalLinkIcon,
  LayersIcon,
} from 'lucide-react'
import type { Metadata } from 'next'
import { StickyShare } from '@/components/jobs/StickyShare'
import { ApplyButtons } from '@/components/jobs/ApplyButtons'
import { ContactEmployerButton } from '@/components/common/ContactEmployerButton'
import { JobsSearchBar } from '@/components/jobs/JobsSearchBar'
import { JobCard } from '@/components/jobs/JobCard'
import { JobFilters } from '@/components/jobs/JobFilters'
import { Pagination } from '@/components/common/Pagination'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string>>
}

async function getJob(slug: string, token?: string): Promise<JobDto | null> {
  // Pass token so backend populates isSaved / hasApplied for this user.
  // Skip ISR cache when authenticated (response is personalized).
  return serverFetch<JobDto>(`/jobs/${slug}`, token
    ? { token, revalidate: false }
    : { revalidate: 60, tags: [`job-${slug}`] })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  if (slug.startsWith('viec-lam-')) {
    const cat = await serverFetch<JobCategoryDto>(`/job-categories/slug/${slug}`, { revalidate: 300 })
    if (cat) {
      return {
        title: `Việc làm ${cat.name} mới nhất — TuyenDung.vn`,
        description: cat.description || `Tìm kiếm việc làm ${cat.name} lương cao, uy tín. Hàng nghìn tin tuyển dụng mới nhất.`,
      }
    }
  }
  const job = await getJob(slug)
  if (!job) return { title: 'Việc làm không tồn tại' }
  return {
    title: `${job.title} tại ${job.employer.companyName}`,
    description: job.description.slice(0, 160),
  }
}

function getDaysLeft(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
}

function formatExperience(min?: number, max?: number): string {
  if (min === undefined || min === null) return 'Không yêu cầu'
  if (min === 0) return 'Không yêu cầu'
  if (max) return `${min} - ${max} năm`
  return `${min}+ năm`
}

function DeadlineBadge({ deadline }: { deadline: string }) {
  const days = getDaysLeft(deadline)
  if (days < 0) {
    return (
      <span className="ml-2 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
        Đã hết hạn
      </span>
    )
  }
  const color =
    days <= 3
      ? 'bg-red-100 text-red-600'
      : days <= 7
        ? 'bg-orange-100 text-orange-600'
        : days <= 14
          ? 'bg-yellow-100 text-yellow-700'
          : 'bg-brand-100 text-brand'
  return (
    <span className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      Còn {days} ngày
    </span>
  )
}

function MetricCircle({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col items-center gap-2.5 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

function SectionBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-base font-semibold text-gray-900">
        <span className="h-5 w-1 rounded-full bg-brand" />
        {title}
      </h3>
      {children}
    </div>
  )
}

function RenderContent({ content }: { content: string }) {
  const isHtml = /<[a-z][\s\S]*>/i.test(content)
  if (isHtml) {
    return (
      <div
        className="prose prose-sm max-w-none text-gray-700
          prose-headings:font-semibold prose-headings:text-gray-900 prose-headings:mt-4 prose-headings:mb-2
          prose-h3:text-base prose-h2:text-lg
          prose-ul:my-2 prose-ul:pl-5 prose-li:my-0.5
          prose-ol:my-2 prose-ol:pl-5
          prose-p:my-1.5 prose-p:leading-relaxed
          prose-strong:text-gray-900"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }
  const lines = content.split('\n')
  const elements: ReactNode[] = []
  const listItems: string[] = []
  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-700">
          {listItems.map((item, i) => <li key={i}>{item}</li>)}
        </ul>,
      )
      listItems.length = 0
    }
  }
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) { flushList(); continue }
    const bulletMatch = line.match(/^[-•*+]\s+(.+)/) ?? line.match(/^\d+[.)]\s+(.+)/)
    if (bulletMatch) { listItems.push(bulletMatch[1]) }
    else { flushList(); elements.push(<p key={`p-${elements.length}`} className="text-sm leading-relaxed text-gray-700">{line}</p>) }
  }
  flushList()
  return <div className="space-y-3">{elements}</div>
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  )
}

export default async function JobOrCategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const session = await getServerSession(authOptions)
  const token = session?.accessToken

  // Category pages: slugs always start with 'viec-lam-'
  if (slug.startsWith('viec-lam-')) {
    const sp = await searchParams
    const [category, jobsResult] = await Promise.all([
      serverFetch<JobCategoryDto>(`/job-categories/slug/${slug}`, { revalidate: 300 }),
      serverFetch<PaginatedResponse<JobDto>>(
        `/jobs?${new URLSearchParams({ ...sp, categorySlug: slug }).toString()}`,
        { revalidate: 30 },
      ),
    ])
    if (!category) notFound()
    const { data: jobs, meta } = jobsResult ?? { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }

    return (
      <div className="min-h-screen bg-gray-50">
        <Suspense><JobsSearchBar /></Suspense>

        {/* Category hero */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-5">
            <nav className="mb-3 flex items-center gap-1 text-xs text-gray-400">
              <Link href="/" className="hover:text-brand">Trang chủ</Link>
              <ChevronRightIcon className="h-3 w-3" />
              <Link href="/jobs" className="hover:text-brand">Việc làm</Link>
              <ChevronRightIcon className="h-3 w-3" />
              <span className="text-gray-600">{category.name}</span>
            </nav>
            <div className="flex items-center gap-4">
              {category.icon && (
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-3xl">
                  {category.icon}
                </span>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">Việc làm {category.name}</h1>
                {category.description && (
                  <p className="mt-0.5 text-sm text-gray-500">{category.description}</p>
                )}
                <p className="mt-1 text-sm font-semibold text-brand">{meta.total} việc làm đang tuyển</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-5">
          <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
            <div className="hidden lg:block">
              <Suspense><JobFilters /></Suspense>
            </div>
            <div>
              {jobs.length === 0 ? (
                <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-gray-200 py-20 text-center text-gray-400">
                  <BriefcaseIcon className="h-14 w-14 text-gray-200" />
                  <div>
                    <p className="font-semibold text-gray-500">Chưa có việc làm {category.name} nào</p>
                    <p className="mt-1 text-sm">Hãy quay lại sau hoặc xem tất cả việc làm</p>
                  </div>
                  <Link href="/jobs" className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90">
                    Xem tất cả việc làm
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => <JobCard key={job.id} job={job} />)}
                </div>
              )}
              {meta.totalPages > 1 && <div className="mt-8"><Pagination meta={meta} /></div>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const job = await getJob(slug, token)
  if (!job) notFound()

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryNegotiable)
  const experience = formatExperience(job.experienceMin, job.experienceMax)
  const companySize =
    job.employer.size && COMPANY_SIZE_LABELS[job.employer.size as CompanySize]

  const reqChips = [
    experience !== 'Không yêu cầu' ? experience : null,
    JOB_TYPE_LABELS[job.jobType],
    WORK_MODE_LABELS[job.workMode],
  ].filter(Boolean) as string[]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search bar */}
      <Suspense>
        <JobsSearchBar />
      </Suspense>

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-2.5">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500">
            <Link href="/" className="hover:text-brand">
              Trang chủ
            </Link>
            <ChevronRightIcon className="h-3.5 w-3.5 shrink-0" />
            <Link href="/jobs" className="hover:text-brand">
              Tìm việc làm
            </Link>
            <ChevronRightIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1 text-gray-700">{job.title}</span>
          </nav>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* ── Left column ─────────────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Header card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              {/* Company + title */}
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center">
                  {job.employer.logoUrl ? (
                    <Image
                      src={job.employer.logoUrl}
                      alt={job.employer.companyName}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-200">
                      {job.employer.companyName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <Link
                    href={`/companies/${job.employer.slug}`}
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    {job.employer.companyName}
                  </Link>
                  {job.employer.verified && (
                    <BadgeCheckIcon className="ml-1.5 inline-block h-4 w-4 text-brand" />
                  )}
                  <h1 className="mt-1 text-xl font-bold leading-snug text-gray-900">
                    {job.title}
                  </h1>
                </div>
              </div>

              {/* 3 circle metrics */}
              <div className="mt-6 grid grid-cols-3 gap-2 border-t border-gray-100 pt-5">
                <MetricCircle
                  icon={<DollarSignIcon className="h-6 w-6" />}
                  label="Thu nhập"
                  value={salary}
                />
                <MetricCircle
                  icon={<MapPinIcon className="h-6 w-6" />}
                  label="Địa điểm"
                  value={job.city}
                />
                <MetricCircle
                  icon={<BriefcaseIcon className="h-6 w-6" />}
                  label="Kinh nghiệm"
                  value={experience}
                />
              </div>

              {/* Salary link */}
              {!job.salaryNegotiable && (
                <p className="mt-4 text-center text-xs text-brand hover:underline cursor-pointer">
                  Xem mức lương thị trường cho vị trí này &rsaquo;&rsaquo;
                </p>
              )}

              {/* Deadline */}
              {job.deadline && (
                <div className="mt-3 flex items-center justify-center gap-1 text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4 shrink-0" />
                  <span>Hạn nộp hồ sơ: {formatDeadline(job.deadline)}</span>
                  <DeadlineBadge deadline={job.deadline} />
                </div>
              )}

              {/* CTA buttons */}
              <ApplyButtons slug={job.slug} jobId={job.id} isSaved={job.isSaved} hasApplied={job.hasApplied} />
            </div>

            {/* Job detail card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              {/* Section header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                <h2 className="text-lg font-bold text-gray-900">Chi tiết tin tuyển dụng</h2>
                <button className="flex items-center gap-1.5 rounded-lg border border-brand/40 bg-brand/5 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/10">
                  <BellIcon className="h-3.5 w-3.5" />
                  Gửi tôi việc làm tương tự
                </button>
              </div>

              <div className="space-y-6">
                {/* Requirement chips */}
                <div className="space-y-2.5">
                  {reqChips.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="w-20 shrink-0 text-xs font-semibold text-gray-600">
                        Yêu cầu:
                      </span>
                      {reqChips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Skills */}
                  {job.skills.length > 0 && (
                    <div className="flex flex-wrap items-start gap-2">
                      <span className="w-20 shrink-0 pt-1 text-xs font-semibold text-gray-600">
                        Chuyên môn:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((s) => (
                          <span
                            key={s.id}
                            className="rounded-full border border-brand/30 bg-brand/5 px-3 py-1 text-xs font-medium text-brand"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <SectionBlock title="Mô tả công việc">
                  <RenderContent content={job.description} />
                </SectionBlock>

                {/* Requirements */}
                {job.requirements && (
                  <SectionBlock title="Yêu cầu ứng viên">
                    <RenderContent content={job.requirements} />
                  </SectionBlock>
                )}

                {/* Benefits */}
                {job.benefits && (
                  <SectionBlock title="Quyền lợi">
                    <RenderContent content={job.benefits} />
                  </SectionBlock>
                )}

                {/* Location */}
                <SectionBlock title="Địa điểm làm việc">
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <span>{job.location || job.city}</span>
                  </div>
                </SectionBlock>
              </div>
            </div>
          </div>

          {/* ── Right sidebar ────────────────────────────────────────────────── */}
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            {/* Company card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              {/* Logo */}
              <div className="mb-4 flex justify-center">
                <div className="h-20 w-20 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center">
                  {job.employer.logoUrl ? (
                    <Image
                      src={job.employer.logoUrl}
                      alt={job.employer.companyName}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-gray-200">
                      {job.employer.companyName.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              <Link
                href={`/companies/${job.employer.slug}`}
                className="block text-center text-base font-bold text-gray-900 hover:text-brand leading-snug"
              >
                {job.employer.companyName}
              </Link>

              <div className="mt-3 divide-y divide-gray-100">
                {companySize && (
                  <InfoRow
                    icon={<UsersIcon className="h-4 w-4" />}
                    label="Quy mô"
                    value={companySize}
                  />
                )}
                {job.employer.industry && (
                  <InfoRow
                    icon={<BuildingIcon className="h-4 w-4" />}
                    label="Lĩnh vực"
                    value={job.employer.industry}
                  />
                )}
                {job.employer.city && (
                  <InfoRow
                    icon={<MapPinIcon className="h-4 w-4" />}
                    label="Địa điểm"
                    value={job.employer.city}
                  />
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href={`/companies/${job.employer.slug}`}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-brand/30 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand/5"
                >
                  <ExternalLinkIcon className="h-4 w-4" />
                  Xem trang công ty
                </Link>
                {(job.employer as any).userId && (
                  <ContactEmployerButton
                    employerUserId={(job.employer as any).userId}
                    variant="outline"
                    label="Nhắn tin nhà tuyển dụng"
                    className="w-full justify-center"
                  />
                )}
              </div>
            </div>

            {/* Thông tin chung */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-1 font-bold text-gray-900">Thông tin chung</h3>
              <div className="divide-y divide-gray-100">
                <InfoRow
                  icon={<LayersIcon className="h-4 w-4" />}
                  label="Hình thức làm việc"
                  value={JOB_TYPE_LABELS[job.jobType]}
                />
                <InfoRow
                  icon={<ClockIcon className="h-4 w-4" />}
                  label="Loại hình làm việc"
                  value={WORK_MODE_LABELS[job.workMode]}
                />
                {job.experienceMin !== undefined && (
                  <InfoRow
                    icon={<TrendingUpIcon className="h-4 w-4" />}
                    label="Kinh nghiệm yêu cầu"
                    value={experience}
                  />
                )}
                <InfoRow
                  icon={<UsersIcon className="h-4 w-4" />}
                  label="Số lượng tuyển"
                  value={`${job.quantity} người`}
                />
                {job.deadline && (
                  <InfoRow
                    icon={<CalendarIcon className="h-4 w-4" />}
                    label="Hạn nộp hồ sơ"
                    value={formatDeadline(job.deadline)}
                  />
                )}
              </div>
            </div>

            {/* Related categories */}
            {(job.employer.industry || job.skills.length > 0) && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 font-bold text-gray-900">Danh mục nghề liên quan</h3>
                <div className="flex flex-wrap gap-2">
                  {job.employer.industry && (
                    <Link
                      href={`/jobs?industry=${encodeURIComponent(job.employer.industry)}`}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-brand hover:text-brand transition"
                    >
                      {job.employer.industry}
                    </Link>
                  )}
                  {job.skills.slice(0, 6).map((s) => (
                    <Link
                      key={s.id}
                      href={`/jobs?keyword=${encodeURIComponent(s.name)}`}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-brand hover:text-brand transition"
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Sticky share panel */}
      <StickyShare slug={job.slug} title={job.title} />
    </div>
  )
}
