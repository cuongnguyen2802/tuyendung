import { Suspense } from 'react'
import Link from 'next/link'
import { BellIcon, BriefcaseIcon, ChevronRightIcon, SlidersHorizontalIcon } from 'lucide-react'
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

const QUICK_CITIES = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ']

// ── Async streamed component — renders after data arrives ─────────────────────

async function JobListSection({ params }: { params: Record<string, string> }) {
  const { data: jobs, meta } = await getJobs(params)
  const keyword = params.keyword || ''
  const city = params.city || ''
  const sortBy = params.sortBy || 'newest'

  return (
    <>
      <div className="mb-4">
        <SortBar sortBy={sortBy} keyword={keyword} city={city} />
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-gray-200 py-20 text-center text-gray-400">
          <BriefcaseIcon className="h-14 w-14 text-gray-200" />
          <div>
            <p className="font-semibold text-gray-500">Không tìm thấy việc làm phù hợp</p>
            <p className="mt-1 text-sm">Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc</p>
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

// ── Skeleton for the job list while streaming ─────────────────────────────────

function JobListSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="mb-4 flex gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-8 w-24 rounded-lg bg-gray-200" />
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="h-14 w-14 shrink-0 rounded-xl bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
              <div className="flex gap-2">
                <div className="h-6 w-24 rounded-full bg-gray-200" />
                <div className="h-6 w-20 rounded-full bg-gray-200" />
                <div className="h-6 w-28 rounded-full bg-gray-200" />
              </div>
            </div>
            <div className="h-7 w-28 shrink-0 rounded-full bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function JobsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const keyword = params.keyword || ''
  const city = params.city || ''
  const today = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <>
      {/* Sticky search bar */}
      <Suspense>
        <JobsSearchBar defaultKeyword={keyword} defaultCity={city} />
      </Suspense>

      <div className="mx-auto max-w-7xl px-4 py-5">
        {/* Results header — renders immediately */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">
              Tuyển dụng{' '}
              <span className="font-bold text-brand">
                {keyword ? `việc làm ${keyword}` : 'tất cả việc làm'}
              </span>{' '}
              <span className="text-sm font-normal text-gray-400">[Update {today}]</span>
            </h1>
            <nav className="mt-1 flex items-center gap-1 text-xs text-gray-400">
              <Link href="/" className="hover:text-brand">
                Trang chủ
              </Link>
              <ChevronRightIcon className="h-3 w-3" />
              <Link href="/jobs" className="hover:text-brand">
                Việc làm
              </Link>
              {keyword && (
                <>
                  <ChevronRightIcon className="h-3 w-3" />
                  <span className="capitalize text-gray-600">{keyword}</span>
                </>
              )}
            </nav>
          </div>
          <button className="flex shrink-0 items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:border-brand hover:text-brand">
            <BellIcon className="h-4 w-4" />
            Tạo thông báo việc làm
          </button>
        </div>

        {/* Location quick chips */}
        {keyword && (
          <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 px-4 py-3 text-sm">
            <span className="text-gray-500">
              Xem việc làm <strong>&quot;{keyword}&quot;</strong> tại
            </span>
            {QUICK_CITIES.map((c) => (
              <Link
                key={c}
                href={`/jobs?keyword=${encodeURIComponent(keyword)}&city=${encodeURIComponent(c)}`}
                className="font-semibold text-brand hover:underline"
              >
                {c}
              </Link>
            ))}
            <span className="text-gray-300">|</span>
            <Link href="/jobs" className="flex items-center gap-1 text-gray-500 hover:text-brand">
              Chọn tỉnh thành khác
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <Suspense>
              <JobFilters />
            </Suspense>
          </div>

          {/* Job list — streamed */}
          <div>
            <Suspense fallback={<JobListSkeleton />}>
              <JobListSection params={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Sort bar ──────────────────────────────────────────────────────────────────

function SortBar({ sortBy, keyword, city }: { sortBy: string; keyword: string; city: string }) {
  const base = new URLSearchParams()
  if (keyword) base.set('keyword', keyword)
  if (city) base.set('city', city)

  return (
    <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1">
        <SlidersHorizontalIcon className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500">Sắp xếp theo:</span>
        <div className="ml-1 flex items-center gap-1">
          {[
            { value: 'newest', label: 'Mới nhất' },
            { value: 'views', label: 'Phổ biến' },
            { value: 'salary', label: 'Lương cao' },
          ].map((opt) => {
            const p = new URLSearchParams(base.toString())
            p.set('sortBy', opt.value)
            const active = sortBy === opt.value
            return (
              <Link
                key={opt.value}
                href={`/jobs?${p.toString()}`}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
