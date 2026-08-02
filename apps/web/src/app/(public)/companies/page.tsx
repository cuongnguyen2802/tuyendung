import Link from 'next/link'
import { serverFetch } from '@/lib/server-fetch'
import { EmployerDto, COMPANY_SIZE_LABELS, CompanySize } from '@tuyendung/types'
import { Building2Icon, MapPinIcon, BriefcaseIcon, CheckCircleIcon, SearchIcon, UsersIcon } from 'lucide-react'
import { CompanyLogoImg } from '@/components/common/CompanyLogoImg'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Khám phá công ty tuyển dụng — TuyenDung.vn',
  description: 'Khám phá hàng trăm công ty hàng đầu Việt Nam. Tìm môi trường làm việc phù hợp và ứng tuyển ngay.',
}

interface PageProps { searchParams: Promise<Record<string, string>> }

const INDUSTRY_TABS = [
  { label: 'Tất cả', value: '' },
  { label: 'Công nghệ', value: 'Công nghệ thông tin' },
  { label: 'Fintech', value: 'Fintech' },
  { label: 'Thương mại điện tử', value: 'Thương mại điện tử' },
  { label: 'Game', value: 'Mobile Game' },
  { label: 'Viễn thông', value: 'Viễn thông & CNTT' },
  { label: 'Ngân hàng', value: 'Ngân hàng & Fintech' },
  { label: 'EdTech', value: 'EdTech' },
]

const CITY_OPTIONS = ['', 'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng']

async function getCompanies(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString()
  const data = await serverFetch<{ data: EmployerDto[]; meta: { total: number } }>(
    `/employers?${query}&limit=24`,
    { revalidate: false },
  )
  return data ?? { data: [], meta: { total: 0 } }
}

// Gradient per first letter for companies without logo
const LOGO_GRADIENTS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-rose-500 to-pink-500',
  'from-indigo-500 to-blue-600',
]
function logoGradient(name: string) {
  return LOGO_GRADIENTS[name.charCodeAt(0) % LOGO_GRADIENTS.length]
}

export default async function CompaniesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { data: companies, meta } = await getCompanies(params)
  const activeIndustry = params.industry ?? ''
  const activeCity = params.city ?? ''
  const search = params.search ?? ''

  function buildUrl(overrides: Record<string, string>) {
    const next = { ...params, ...overrides }
    Object.keys(next).forEach((k) => { if (!next[k]) delete next[k] })
    const qs = new URLSearchParams(next).toString()
    return `/companies${qs ? `?${qs}` : ''}`
  }

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0d1117] via-[#0f1923] to-[#0d1117] py-14">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-brand/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        {/* Grid overlay */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/70 backdrop-blur-sm">
            <Building2Icon className="h-4 w-4 text-brand" />
            {meta.total.toLocaleString()} công ty đang tuyển dụng
          </div>
          <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
            Khám phá công ty <span className="text-brand">hàng đầu</span>
          </h1>
          <p className="mb-8 text-white/60">
            Tìm kiếm môi trường làm việc lý tưởng từ hàng trăm doanh nghiệp uy tín
          </p>

          {/* Search box */}
          <form method="get" action="/companies" className="mx-auto max-w-2xl">
            <div className="flex overflow-hidden rounded-2xl bg-white shadow-2xl shadow-black/30">
              <div className="flex flex-1 items-center gap-3 px-5">
                <SearchIcon className="h-5 w-5 shrink-0 text-gray-400" />
                <input
                  name="search"
                  defaultValue={search}
                  type="text"
                  placeholder="Tên công ty, lĩnh vực..."
                  className="flex-1 py-4 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                />
              </div>
              <button
                type="submit"
                className="m-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90"
              >
                Tìm kiếm
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-0 overflow-x-auto py-2 scrollbar-hide">
            {INDUSTRY_TABS.map((tab) => (
              <Link
                key={tab.value}
                href={buildUrl({ industry: tab.value, page: '1' })}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
                  activeIndustry === tab.value
                    ? 'bg-brand/10 text-brand'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </Link>
            ))}

            <div className="mx-3 h-5 w-px shrink-0 bg-gray-200" />

            {/* City filter */}
            {CITY_OPTIONS.map((city) => (
              <Link
                key={city || 'all-cities'}
                href={buildUrl({ city, page: '1' })}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
                  activeCity === city
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {city || 'Tất cả thành phố'}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Result count */}
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{meta.total.toLocaleString()}</span> công ty
            {activeIndustry && <span className="text-brand"> · {activeIndustry}</span>}
            {activeCity && <span className="text-emerald-600"> · {activeCity}</span>}
          </p>
        </div>

        {companies.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100">
              <Building2Icon className="h-10 w-10 text-gray-300" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Không tìm thấy công ty nào</p>
              <p className="mt-1 text-sm text-gray-400">Thử thay đổi từ khoá hoặc bộ lọc</p>
            </div>
            <Link href="/companies" className="text-sm font-medium text-brand hover:underline">
              Xem tất cả công ty
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Company Card ──────────────────────────────────────────────────────────────

function CompanyCard({ company }: { company: EmployerDto }) {
  const gradient = logoGradient(company.companyName)
  const jobCount = company.jobCount ?? 0

  return (
    <Link
      href={`/companies/${company.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-lg hover:shadow-brand/10"
    >
      {/* Top colour strip */}
      <div className={`h-2 w-full bg-gradient-to-r ${gradient} opacity-80`} />

      <div className="flex flex-1 flex-col p-5">
        {/* Logo + verified */}
        <div className="mb-4 flex items-start justify-between">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
          >
            {company.logoUrl ? (
              <CompanyLogoImg
                src={company.logoUrl}
                alt={company.companyName}
                fallbackLetter={company.companyName.charAt(0)}
                fallbackGradient={gradient}
              />
            ) : (
              <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}>
                <span className="text-2xl font-bold text-white">
                  {company.companyName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {company.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand ring-1 ring-brand/30">
              <CheckCircleIcon className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="mb-1 line-clamp-1 font-bold text-gray-900 group-hover:text-brand transition-colors">
          {company.companyName}
        </h3>

        {/* Industry */}
        {company.industry && (
          <p className="mb-3 line-clamp-1 text-xs text-gray-400">{company.industry}</p>
        )}

        {/* Meta row */}
        <div className="mt-auto space-y-1.5 text-xs text-gray-500">
          {company.city && (
            <div className="flex items-center gap-1.5">
              <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              {company.city}
            </div>
          )}
          {company.size && (
            <div className="flex items-center gap-1.5">
              <UsersIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              {COMPANY_SIZE_LABELS[company.size as CompanySize]}
            </div>
          )}
        </div>

        {/* Job count badge */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <div
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
              jobCount > 0
                ? 'bg-brand/8 text-brand'
                : 'bg-gray-50 text-gray-400'
            }`}
          >
            <BriefcaseIcon className="h-3.5 w-3.5" />
            {jobCount > 0 ? `${jobCount} việc làm` : 'Chưa có tin'}
          </div>
          <span className="text-xs font-medium text-brand opacity-0 transition group-hover:opacity-100">
            Xem →
          </span>
        </div>
      </div>
    </Link>
  )
}
