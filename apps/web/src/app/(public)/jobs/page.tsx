import { Suspense } from 'react'
import Link from 'next/link'
import { BellIcon, BriefcaseIcon, ChevronRightIcon, SlidersHorizontalIcon, TrendingUpIcon, ZapIcon } from 'lucide-react'
import { JobCard } from '@/components/jobs/JobCard'
import { JobFilters } from '@/components/jobs/JobFilters'
import { JobsSearchBar } from '@/components/jobs/JobsSearchBar'
import { Pagination } from '@/components/common/Pagination'
import { serverFetch } from '@/lib/server-fetch'
import { JobDto, PaginatedResponse } from '@tuyendung/types'
import type { Metadata } from 'next'

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams
  const keyword = params.keyword || ''
  const title = keyword
    ? `Tuyển dụng ${keyword} — ${new Date().getFullYear()}`
    : 'Tìm việc làm — TuyenDung.vn'
  return {
    title,
    description: `Tuyển dụng ${keyword || 'việc làm'} mới nhất. Hàng nghìn tin đăng từ các công ty uy tín.`,
  }
}

async function getJobs(params: Record<string, string>): Promise<PaginatedResponse<JobDto>> {
  const query = new URLSearchParams(params).toString()
  const data = await serverFetch<PaginatedResponse<JobDto>>(`/jobs?${query}`, { revalidate: false })
  return data ?? { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } }
}

const QUICK_CITIES = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Bình Dương']

// ── Streamed job list ─────────────────────────────────────────────────────────

async function JobListSection({ params }: { params: Record<string, string> }) {
  const { data: jobs, meta } = await getJobs(params)
  const keyword  = params.keyword  || ''
  const city     = params.city     || ''
  const sortBy   = params.sortBy   || 'newest'

  return (
    <>
      <SortBar sortBy={sortBy} keyword={keyword} city={city} total={meta.total} />

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-gray-200 bg-white py-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50">
            <BriefcaseIcon className="h-10 w-10 text-gray-300" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-600">Không tìm thấy việc làm phù hợp</p>
            <p className="mt-1.5 text-sm text-gray-400">Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc</p>
          </div>
          <Link
            href="/jobs"
            className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90"
          >
            Xem tất cả việc làm
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="mt-8">
          <Pagination meta={meta} />
        </div>
      )}
    </>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function JobListSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {/* Sort bar skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-9 w-24 rounded-xl bg-gray-200" />
          ))}
        </div>
        <div className="h-4 w-32 rounded bg-gray-200" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 shrink-0 rounded-xl bg-gray-200" />
            <div className="flex-1 space-y-2.5">
              <div className="flex items-start justify-between gap-4">
                <div className="h-5 w-2/3 rounded-lg bg-gray-200" />
                <div className="h-5 w-28 rounded-full bg-gray-200" />
              </div>
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              <div className="flex gap-2">
                <div className="h-6 w-24 rounded-full bg-gray-200" />
                <div className="h-6 w-20 rounded-full bg-gray-200" />
                <div className="h-6 w-16 rounded-full bg-gray-200" />
              </div>
              <div className="flex gap-2">
                <div className="h-5 w-20 rounded bg-gray-200" />
                <div className="h-5 w-24 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function JobsPage({ searchParams }: PageProps) {
  const params  = await searchParams
  const keyword = params.keyword || ''
  const city    = params.city    || ''
  const today   = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  return (
    <>
      {/* Sticky green search bar */}
      <Suspense>
        <JobsSearchBar defaultKeyword={keyword} defaultCity={city} />
      </Suspense>

      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-6">

          {/* ── Page header ── */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Tuyển dụng{' '}
                <span className="text-brand">
                  {keyword ? `"${keyword}"` : 'tất cả việc làm'}
                </span>
                <span className="ml-2 text-sm font-normal text-gray-400">[Update {today}]</span>
              </h1>
              <nav className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                <Link href="/" className="hover:text-brand transition">Trang chủ</Link>
                <ChevronRightIcon className="h-3 w-3" />
                <Link href="/jobs" className="hover:text-brand transition">Việc làm</Link>
                {keyword && (
                  <>
                    <ChevronRightIcon className="h-3 w-3" />
                    <span className="text-gray-600">{keyword}</span>
                  </>
                )}
              </nav>
            </div>

            <button className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 shadow-sm transition hover:border-brand hover:text-brand">
              <BellIcon className="h-4 w-4" />
              Tạo thông báo việc làm
            </button>
          </div>

          {/* ── City quick-links ── */}
          {keyword && (
            <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-3 text-sm">
              <ZapIcon className="h-3.5 w-3.5 shrink-0 text-blue-400" />
              <span className="text-gray-500">
                Xem <strong className="text-gray-700">&ldquo;{keyword}&rdquo;</strong> tại:
              </span>
              {QUICK_CITIES.map((c) => (
                <Link
                  key={c}
                  href={`/jobs?keyword=${encodeURIComponent(keyword)}&city=${encodeURIComponent(c)}`}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                    city === c
                      ? 'bg-brand text-white'
                      : 'bg-white text-brand border border-brand/30 hover:bg-brand hover:text-white'
                  }`}
                >
                  {c}
                </Link>
              ))}
              <Link href="/jobs" className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-brand transition">
                Tỉnh thành khác <ChevronRightIcon className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* ── Two-column layout ── */}
          <div className="flex gap-5">

            {/* Left — sticky filter sidebar */}
            <aside className="hidden w-[280px] shrink-0 self-start sticky top-[132px] lg:block">
              <Suspense>
                <JobFilters />
              </Suspense>
            </aside>

            {/* Right — job list (streamed) */}
            <div className="min-w-0 flex-1">
              <Suspense fallback={<JobListSkeleton />}>
                <JobListSection params={params} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Sort bar ──────────────────────────────────────────────────────────────────

function SortBar({
  sortBy, keyword, city, total,
}: {
  sortBy: string; keyword: string; city: string; total: number
}) {
  const base = new URLSearchParams()
  if (keyword) base.set('keyword', keyword)
  if (city)    base.set('city', city)

  const SORTS = [
    { value: 'newest', label: 'Mới nhất',  Icon: ZapIcon },
    { value: 'views',  label: 'Phổ biến',  Icon: TrendingUpIcon },
    { value: 'salary', label: 'Lương cao', Icon: SlidersHorizontalIcon },
  ]

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-500">Sắp xếp:</span>
        <div className="flex items-center gap-1">
          {SORTS.map(({ value, label, Icon }) => {
            const p = new URLSearchParams(base.toString())
            p.set('sortBy', value)
            const active = sortBy === value
            return (
              <Link
                key={value}
                href={`/jobs?${p.toString()}`}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            )
          })}
        </div>
      </div>
      {total > 0 && (
        <span className="text-sm text-gray-400">
          <span className="font-semibold text-gray-700">{total.toLocaleString('vi-VN')}</span> việc làm
        </span>
      )}
    </div>
  )
}
