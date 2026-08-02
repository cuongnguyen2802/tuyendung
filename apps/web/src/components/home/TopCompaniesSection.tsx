'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon, BriefcaseIcon, BadgeCheckIcon } from 'lucide-react'
import { EmployerDto } from '@tuyendung/types'
import { CompanyLogoImg } from '@/components/common/CompanyLogoImg'

// ── Industry filter pills ──────────────────────────────────────────────────

const INDUSTRY_ORDER = [
  'Tất cả',
  'Công nghệ thông tin',
  'Ngân hàng - Bảo hiểm',
  'Tài chính - Công nghệ',
  'Bất động sản',
  'Thương mại điện tử',
  'Sản xuất',
  'Bán lẻ - Tiêu dùng',
  'Giáo dục',
  'Y tế',
]

// ── Company card (grid item) ───────────────────────────────────────────────

function CompanyCard({ company }: { company: EmployerDto }) {
  return (
    <Link
      href={`/companies/${company.slug}`}
      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 transition hover:border-brand/40 hover:shadow-md"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
        {company.logoUrl ? (
          <CompanyLogoImg
            src={company.logoUrl}
            alt={company.companyName}
            fallbackLetter={company.companyName.charAt(0)}
            fallbackGradient="from-gray-200 to-gray-300"
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <span className="text-xl font-bold text-gray-300">
            {company.companyName.charAt(0)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900">
          {company.companyName}
        </p>
        {company.industry && (
          <p className="mt-0.5 truncate text-xs text-gray-400">{company.industry}</p>
        )}
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-gray-500">
          <BriefcaseIcon className="h-3 w-3 shrink-0" />
          {company.jobCount ?? 0} việc làm
        </p>
      </div>
    </Link>
  )
}

// ── Featured company (left large card) ────────────────────────────────────

function FeaturedCard({ company }: { company: EmployerDto }) {
  return (
    <Link
      href={`/companies/${company.slug}`}
      className="group relative flex h-full min-h-[340px] flex-col items-center justify-end overflow-hidden rounded-2xl p-6 text-center"
      style={{ background: 'linear-gradient(160deg, #061E15 0%, #0C3827 50%, #19734E 100%)' }}
    >
      {/* Background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />

      {/* Logo */}
      <div className="relative mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white/20 bg-white shadow-xl">
        {company.logoUrl ? (
          <CompanyLogoImg
            src={company.logoUrl}
            alt={company.companyName}
            fallbackLetter={company.companyName.charAt(0)}
            fallbackGradient="from-gray-100 to-gray-200"
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <span className="text-3xl font-bold text-gray-300">
            {company.companyName.charAt(0)}
          </span>
        )}
      </div>

      {/* Info */}
      <h3 className="text-lg font-bold leading-snug text-white">
        {company.companyName}
      </h3>
      {company.industry && (
        <p className="mt-1 text-sm text-white/70">{company.industry}</p>
      )}
      <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-medium text-white/90">
        <BriefcaseIcon className="h-4 w-4 shrink-0" />
        {company.jobCount ?? 0} việc làm
      </p>

      {company.verified && (
        <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/20 px-3 py-1 text-xs font-semibold text-white/60">
          <BadgeCheckIcon className="h-3.5 w-3.5" />
          Đã xác minh
        </span>
      )}
    </Link>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export function TopCompaniesSection({ companies }: { companies: EmployerDto[] }) {
  const [activeIndustry, setActiveIndustry] = useState('Tất cả')
  const [featuredIndex, setFeaturedIndex] = useState(0)

  // Derive available industries from actual data
  const availableIndustries = useMemo(() => {
    const set = new Set(companies.map((c) => c.industry).filter(Boolean) as string[])
    const ordered = INDUSTRY_ORDER.filter((i) => i === 'Tất cả' || set.has(i))
    const rest = Array.from(set).filter((i) => !INDUSTRY_ORDER.includes(i))
    return [...ordered, ...rest]
  }, [companies])

  // Filter companies by active industry
  const filtered = useMemo(
    () =>
      activeIndustry === 'Tất cả'
        ? companies
        : companies.filter((c) => c.industry === activeIndustry),
    [companies, activeIndustry],
  )

  const featured = filtered[featuredIndex % Math.max(filtered.length, 1)]
  const gridCompanies = filtered.filter((_, i) => i !== featuredIndex % Math.max(filtered.length, 1))

  function prevFeatured() {
    setFeaturedIndex((i) => (i - 1 + filtered.length) % filtered.length)
  }
  function nextFeatured() {
    setFeaturedIndex((i) => (i + 1) % filtered.length)
  }

  // Reset featured index when filter changes
  function handleIndustry(industry: string) {
    setActiveIndustry(industry)
    setFeaturedIndex(0)
  }

  if (companies.length === 0) return null

  return (
    <section className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4">

        {/* ── Banner ── */}
        <div className="mb-6 flex items-stretch overflow-hidden rounded-2xl">
          {/* Left text */}
          <div
            className="flex flex-1 flex-col justify-center px-8 py-6"
            style={{ background: 'linear-gradient(135deg, #061E15 0%, #0C3827 60%, #19734E 100%)' }}
          >
            <h2 className="text-2xl font-extrabold text-white md:text-3xl">
              Thương hiệu lớn tiêu biểu
            </h2>
            <p className="mt-2 max-w-xs text-sm text-white/70">
              Hàng trăm thương hiệu lớn tiêu biểu đang tuyển dụng
            </p>
            <Link
              href="/companies"
              className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-5 py-2 text-sm font-bold text-brand shadow transition hover:bg-brand-50"
            >
              Xem tất cả công ty →
            </Link>
          </div>

          {/* Right: logo mosaic */}
          <div
            className="hidden md:flex items-center justify-end gap-3 px-6 py-4"
            style={{ background: 'linear-gradient(135deg, #0C3827 0%, #19734E 100%)' }}
          >
            <div className="grid grid-cols-3 gap-2">
              {companies.slice(0, 6).map((c) => (
                <div
                  key={c.id}
                  className="flex h-14 w-20 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/90 shadow"
                >
                  {c.logoUrl ? (
                    <CompanyLogoImg
                      src={c.logoUrl}
                      alt={c.companyName}
                      fallbackLetter={c.companyName.charAt(0)}
                      fallbackGradient="from-gray-100 to-gray-200"
                      className="h-full w-full object-contain p-1.5"
                    />
                  ) : (
                    <span className="text-base font-bold text-gray-300">
                      {c.companyName.charAt(0)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Industry filter pills ── */}
        <div className="mb-5 flex flex-wrap items-center gap-2">
          {availableIndustries.map((industry) => (
            <button
              key={industry}
              onClick={() => handleIndustry(industry)}
              className={[
                'rounded-full px-4 py-1.5 text-sm font-medium transition',
                activeIndustry === industry
                  ? 'bg-brand text-white shadow'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-brand hover:text-brand',
              ].join(' ')}
            >
              {industry}
            </button>
          ))}
        </div>

        {/* ── Featured + grid ── */}
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-400">Chưa có công ty nào trong ngành này</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[300px_1fr]">

            {/* Featured company */}
            <div className="flex flex-col gap-2">
              <FeaturedCard company={featured} />
              {filtered.length > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={prevFeatured}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-brand hover:text-brand"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-gray-400">
                    {(featuredIndex % filtered.length) + 1} / {filtered.length}
                  </span>
                  <button
                    onClick={nextFeatured}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition hover:border-brand hover:text-brand"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Company grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {gridCompanies.slice(0, 6).map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
              {gridCompanies.length === 0 && filtered.length === 1 && (
                <div className="col-span-2 flex items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-sm text-gray-400">
                  Đây là công ty duy nhất trong ngành này
                </div>
              )}
            </div>
          </div>
        )}

        {/* View all link */}
        <div className="mt-6 text-center">
          <Link
            href="/companies"
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand/30 bg-brand/5 px-6 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand/10"
          >
            Xem tất cả công ty →
          </Link>
        </div>
      </div>
    </section>
  )
}
