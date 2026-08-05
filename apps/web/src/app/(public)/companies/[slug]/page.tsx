import Image from 'next/image'
import Link from 'next/link'
import { CompanyLogoImg } from '@/components/common/CompanyLogoImg'
import { notFound } from 'next/navigation'
import {
  MapPinIcon, GlobeIcon, UsersIcon, CalendarIcon,
  CheckCircleIcon, Building2Icon, BriefcaseIcon,
  ChevronRightIcon, PhoneIcon, FacebookIcon, LinkedinIcon, ShieldIcon,
} from 'lucide-react'
import type { Metadata } from 'next'
import { serverFetch } from '@/lib/server-fetch'
import { COMPANY_SIZE_LABELS, CompanySize, JobDto } from '@tuyendung/types'
import { ShowMore } from '@/components/companies/ShowMore'
import { CompanyJobsList } from '@/components/companies/CompanyJobsList'
import { CopyLinkButton } from '@/components/companies/CopyLinkButton'
import { ContactEmployerButton } from '@/components/common/ContactEmployerButton'
import { FollowCompanyButton } from '@/components/companies/FollowCompanyButton'

interface PageProps {
  params: Promise<{ slug: string }>
}

interface CompanyData {
  id: string
  userId: string
  companyName: string
  slug: string
  logoUrl?: string
  coverUrl?: string
  website?: string
  industry?: string
  city?: string
  country?: string
  size?: CompanySize
  founded?: number
  address?: string
  description?: string
  verified?: boolean
  taxCode?: string
  phone?: string
  facebookUrl?: string
  linkedinUrl?: string
  jobs?: any[]
  _count?: { jobs: number }
}

async function getCompany(slug: string) {
  return serverFetch<CompanyData>(`/employers/${slug}`, { revalidate: 120, tags: [`company-${slug}`] })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const company = await getCompany(slug)
  if (!company) return { title: 'Công ty không tồn tại' }
  return {
    title: `${company.companyName} tuyển dụng — TuyenDung.vn`,
    description:
      company.description?.slice(0, 155) ??
      `Tuyển dụng tại ${company.companyName}. Xem các vị trí đang tuyển dụng và nộp hồ sơ trực tuyến.`,
    openGraph: {
      title: company.companyName,
      images: company.logoUrl ? [company.logoUrl] : [],
    },
  }
}

function transformJobs(company: any): JobDto[] {
  return (company.jobs ?? []).map((job: any) => ({
    ...job,
    employer: {
      id: company.id,
      companyName: company.companyName,
      slug: company.slug,
      logoUrl: company.logoUrl,
      verified: company.verified,
      industry: company.industry,
      city: company.city,
    },
    skills: (job.skills ?? []).map((js: any) => js.skill ?? js),
    deadline: job.deadline ? new Date(job.deadline).toISOString() : undefined,
    publishedAt: job.publishedAt ? new Date(job.publishedAt).toISOString() : undefined,
    createdAt: new Date(job.createdAt).toISOString(),
    updatedAt: new Date(job.updatedAt).toISOString(),
  }))
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { slug } = await params
  const company = await getCompany(slug)
  if (!company) notFound()

  const jobs = transformJobs(company)
  const jobCount = company._count?.jobs ?? jobs.length

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <div className="relative h-56 w-full overflow-hidden sm:h-64">
        {/* Background */}
        {company.coverUrl ? (
          <>
            <Image src={company.coverUrl} alt="" fill className="object-cover" priority />
            <div className="absolute inset-0 bg-black/50" />
          </>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#0d3d2a] via-[#0f4a32] to-[#1a3d2e]">
            {/* Grid texture */}
            <svg className="absolute inset-0 h-full w-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Glow blobs */}
            <div className="absolute left-1/4 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-brand/40 blur-3xl" />
            <div className="absolute right-1/4 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full bg-emerald-400/20 blur-2xl" />
            <div className="absolute left-1/2 top-0 h-40 w-96 -translate-x-1/2 rounded-full bg-white/5 blur-2xl" />

            {/* Large initial watermark */}
            <div
              aria-hidden="true"
              className="absolute right-8 top-1/2 -translate-y-1/2 select-none font-black leading-none text-white/[0.05]"
              style={{ fontSize: 'clamp(120px, 18vw, 220px)' }}
            >
              {company.companyName.charAt(0).toUpperCase()}
            </div>

            {/* Decorative abstract SVG — building silhouette */}
            <svg
              aria-hidden="true"
              className="absolute bottom-0 right-0 h-full w-auto opacity-[0.04]"
              viewBox="0 0 320 200"
              fill="white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="20"  y="80"  width="40" height="120" />
              <rect x="70"  y="50"  width="55" height="150" />
              <rect x="135" y="30"  width="70" height="170" />
              <rect x="215" y="60"  width="45" height="140" />
              <rect x="270" y="90"  width="35" height="110" />
              <rect x="30"  y="100" width="6"  height="10" opacity="0.6" />
              <rect x="44"  y="100" width="6"  height="10" opacity="0.6" />
              <rect x="30"  y="118" width="6"  height="10" opacity="0.6" />
              <rect x="44"  y="118" width="6"  height="10" opacity="0.6" />
              <rect x="82"  y="65"  width="8"  height="12" opacity="0.6" />
              <rect x="98"  y="65"  width="8"  height="12" opacity="0.6" />
              <rect x="114" y="65"  width="8"  height="12" opacity="0.6" />
              <rect x="82"  y="86"  width="8"  height="12" opacity="0.6" />
              <rect x="98"  y="86"  width="8"  height="12" opacity="0.6" />
              <rect x="114" y="86"  width="8"  height="12" opacity="0.6" />
              <rect x="148" y="48"  width="10" height="14" opacity="0.6" />
              <rect x="166" y="48"  width="10" height="14" opacity="0.6" />
              <rect x="184" y="48"  width="10" height="14" opacity="0.6" />
              <rect x="148" y="72"  width="10" height="14" opacity="0.6" />
              <rect x="166" y="72"  width="10" height="14" opacity="0.6" />
              <rect x="184" y="72"  width="10" height="14" opacity="0.6" />
            </svg>

          </div>
        )}

        {/* Company info — sits at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-7xl px-4 pb-5 pt-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              <div className="flex items-end gap-4">
                {/* Logo */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white/30 bg-white shadow-xl sm:h-24 sm:w-24">
                  {company.logoUrl ? (
                    <CompanyLogoImg
                      src={company.logoUrl}
                      alt={company.companyName}
                      fallbackLetter={company.companyName.charAt(0)}
                      fallbackGradient="from-brand/20 to-brand/5"
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/20 to-brand/5 text-3xl font-bold text-brand">
                      {company.companyName.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Name + meta */}
                <div className="pb-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold text-white drop-shadow sm:text-2xl">
                      {company.companyName}
                    </h1>
                    {company.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/40">
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                        Đã xác minh
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
                    {company.industry && (
                      <span className="flex items-center gap-1">
                        <Building2Icon className="h-3.5 w-3.5" />
                        {company.industry}
                      </span>
                    )}
                    {company.city && (
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="h-3.5 w-3.5" />
                        {company.city}
                      </span>
                    )}
                    {company.size && (
                      <span className="flex items-center gap-1">
                        <UsersIcon className="h-3.5 w-3.5" />
                        {COMPANY_SIZE_LABELS[company.size as CompanySize]}
                      </span>
                    )}
                    {jobCount > 0 && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-300">
                        <BriefcaseIcon className="h-3.5 w-3.5" />
                        {jobCount} vị trí đang tuyển
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <ContactEmployerButton
                  employerUserId={company.userId}
                  variant="default"
                  label="Nhắn tin"
                  className="border-0 bg-white text-gray-900 hover:bg-gray-100"
                />
                <FollowCompanyButton employerId={company.id} variant="hero" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab nav ───────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4">
          <a
            href="#overview"
            className="border-b-2 border-brand px-3 py-3.5 text-sm font-semibold text-brand"
          >
            Trang chủ
          </a>
          <a
            href="#jobs"
            className="border-b-2 border-transparent px-3 py-3.5 text-sm font-semibold text-gray-500 transition hover:text-gray-900"
          >
            Tin tuyển dụng ({jobCount})
          </a>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-6" id="overview">
        {/* Breadcrumb */}
        <nav className="mb-5 flex items-center gap-1 text-xs text-gray-400">
          <Link href="/" className="hover:text-brand">Trang chủ</Link>
          <ChevronRightIcon className="h-3 w-3" />
          <Link href="/companies" className="hover:text-brand">Công ty</Link>
          <ChevronRightIcon className="h-3 w-3" />
          <span className="text-gray-600">{company.companyName}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[1fr_308px]">
          {/* ── Left column ─────────────────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Description */}
            {company.description && (
              <section className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-base font-bold text-gray-900">Giới thiệu công ty</h2>
                <ShowMore text={company.description} />
              </section>
            )}

            {/* Cover gallery */}
            {company.coverUrl && (
              <section className="rounded-xl border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-base font-bold text-gray-900">Hình ảnh công ty</h2>
                <div className="overflow-hidden rounded-xl">
                  <Image
                    src={company.coverUrl}
                    alt={company.companyName}
                    width={800}
                    height={350}
                    className="h-56 w-full object-cover"
                  />
                </div>
              </section>
            )}

            {/* Jobs */}
            <section id="jobs" className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">Tin tuyển dụng</h2>
                <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-sm font-bold text-brand">
                  {jobCount}
                </span>
              </div>
              {jobs.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center text-gray-400">
                  <BriefcaseIcon className="h-10 w-10 text-gray-200" />
                  <p className="text-sm">Hiện chưa có tin tuyển dụng nào</p>
                </div>
              ) : (
                <CompanyJobsList jobs={jobs} />
              )}
            </section>
          </div>

          {/* ── Right sidebar ────────────────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Company info */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-gray-900">Thông tin chung</h3>
              <div className="space-y-4 text-sm">
                {company.website && (
                  <InfoRow icon={<GlobeIcon className="h-4 w-4 text-brand" />} label="Website">
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-brand hover:underline"
                    >
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </InfoRow>
                )}
                {company.size && (
                  <InfoRow icon={<UsersIcon className="h-4 w-4 text-brand" />} label="Quy mô nhân sự">
                    {COMPANY_SIZE_LABELS[company.size as CompanySize]}
                  </InfoRow>
                )}
                {company.founded && (
                  <InfoRow icon={<CalendarIcon className="h-4 w-4 text-brand" />} label="Năm thành lập">
                    {company.founded}
                  </InfoRow>
                )}
                {company.industry && (
                  <InfoRow icon={<Building2Icon className="h-4 w-4 text-brand" />} label="Lĩnh vực">
                    {company.industry}
                  </InfoRow>
                )}
                {(company.address || company.city) && (
                  <InfoRow icon={<MapPinIcon className="h-4 w-4 text-brand" />} label="Địa chỉ">
                    {[company.address, company.city].filter(Boolean).join(', ')}
                  </InfoRow>
                )}
                {company.taxCode && (
                  <InfoRow icon={<ShieldIcon className="h-4 w-4 text-brand" />} label="Mã số thuế">
                    {company.taxCode}
                  </InfoRow>
                )}
                {company.phone && (
                  <InfoRow icon={<PhoneIcon className="h-4 w-4 text-brand" />} label="Điện thoại">
                    <a href={`tel:${company.phone}`} className="text-brand hover:underline">{company.phone}</a>
                  </InfoRow>
                )}
                {(company.facebookUrl || company.linkedinUrl) && (
                  <InfoRow icon={<GlobeIcon className="h-4 w-4 text-brand" />} label="Mạng xã hội">
                    <div className="flex gap-2 mt-1">
                      {company.facebookUrl && (
                        <a href={company.facebookUrl} target="_blank" rel="noopener noreferrer"
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1877f2] text-white hover:opacity-90">
                          <FacebookIcon className="h-3.5 w-3.5" />
                        </a>
                      )}
                      {company.linkedinUrl && (
                        <a href={company.linkedinUrl} target="_blank" rel="noopener noreferrer"
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0a66c2] text-white hover:opacity-90">
                          <LinkedinIcon className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </InfoRow>
                )}
              </div>
            </div>

            {/* Social share */}
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-gray-900">Chia sẻ công ty</h3>
              <p className="mb-3 text-xs text-gray-400">Sao chép đường dẫn tới trang:</p>
              <div className="flex gap-2">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    `/companies/${slug}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chia sẻ lên Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1877f2] text-white transition hover:opacity-90"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
                  </svg>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    `/companies/${slug}`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chia sẻ lên LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0a66c2] text-white transition hover:opacity-90"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.5 8a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM5 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8Zm5 0a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v.5C13.833 9.667 14.667 9 16 9c2 0 3 1 3 3.5V18a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-5c0-.833-.5-1.5-1.5-1.5S13 12.333 13 13v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-8Z" />
                  </svg>
                </a>
                <CopyLinkButton path={`/companies/${slug}`} />
              </div>
            </div>

            {/* Back */}
            <Link
              href="/companies"
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-brand hover:text-brand"
            >
              <Building2Icon className="h-4 w-4" />
              Xem tất cả công ty
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

// ── InfoRow ───────────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <div className="font-medium text-gray-700">{children}</div>
      </div>
    </div>
  )
}
