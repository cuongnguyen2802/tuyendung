import Link from 'next/link'
import { Suspense } from 'react'
import { SearchBar } from '@/components/common/SearchBar'
import { JobCard } from '@/components/jobs/JobCard'
import { RecommendedJobs } from '@/components/jobs/RecommendedJobs'
import { TopIndustries } from '@/components/home/TopIndustries'
import { CompanyMarquee } from '@/components/home/CompanyMarquee'
import { TopCompaniesSection } from '@/components/home/TopCompaniesSection'
import { HandbookSection, ArticleCardData } from '@/components/home/HandbookSection'
import { JobMarketSection } from '@/components/home/JobMarketSection'
import { serverFetch } from '@/lib/server-fetch'
import { JobDto, EmployerDto, JobCategoryDto } from '@tuyendung/types'
import {
  BriefcaseIcon,
  Building2Icon,
  UsersIcon,
  LayersIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  UserIcon,
  SearchIcon,
} from 'lucide-react'

export const revalidate = 60

async function getFeaturedJobs(): Promise<JobDto[]> {
  const data = await serverFetch<{ data: JobDto[] }>('/jobs?limit=8&sortBy=newest', { revalidate: 60 })
  return data?.data ?? []
}

async function getTopCompanies(): Promise<EmployerDto[]> {
  const data = await serverFetch<{ data: EmployerDto[] }>('/employers?limit=16', { revalidate: 120 })
  return data?.data ?? []
}

async function getJobCategories(): Promise<JobCategoryDto[]> {
  return (await serverFetch<JobCategoryDto[]>('/job-categories', { revalidate: 120 })) ?? []
}

async function getJobStats() {
  return serverFetch<{ totalActive: number; newLast24h: number }>('/jobs/stats', { revalidate: 60 })
}

async function getHandbookArticles(): Promise<ArticleCardData[]> {
  const data = await serverFetch<{ data: ArticleCardData[] }>('/articles?limit=6', { revalidate: 300 })
  return data?.data ?? []
}

// ── Static data ───────────────────────────────────────────────────────────────

const POPULAR_SEARCHES = [
  'Frontend Developer',
  'Marketing Manager',
  'Kế toán',
  'Nhân sự',
  'Remote',
  'Product Manager',
]

const HOW_IT_WORKS = [
  {
    step: '01',
    Icon: UserIcon,
    title: 'Tạo hồ sơ chuyên nghiệp',
    desc: 'Điền thông tin, kỹ năng và kinh nghiệm. Upload CV hoặc tạo CV trực tuyến ngay trên nền tảng chỉ trong vài phút.',
  },
  {
    step: '02',
    Icon: SearchIcon,
    title: 'Khám phá cơ hội phù hợp',
    desc: 'Tìm kiếm theo ngành nghề, địa điểm, mức lương. Lưu việc yêu thích và nhận thông báo việc làm mới mỗi ngày.',
  },
  {
    step: '03',
    Icon: CheckCircleIcon,
    title: 'Ứng tuyển & thành công',
    desc: 'Nộp đơn chỉ trong vài cú click. Theo dõi trạng thái ứng tuyển và nhận phản hồi trực tiếp từ nhà tuyển dụng.',
  },
]

const EMPLOYER_BENEFITS = [
  'Đăng tin tuyển dụng miễn phí, không giới hạn ứng viên',
  'Tiếp cận 500,000+ ứng viên đang tích cực tìm việc',
  'Công cụ lọc CV thông minh, tiết kiệm thời gian sàng lọc',
  'Quản lý toàn bộ quy trình tuyển dụng tập trung một nơi',
]

const EMPLOYER_STATS = [
  { value: '500K+', label: 'Ứng viên tiềm năng' },
  { value: '2,000+', label: 'Doanh nghiệp tin dùng' },
  { value: '85%', label: 'Tìm được ứng viên trong 7 ngày' },
  { value: '4.8★', label: 'Đánh giá từ nhà tuyển dụng' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [featuredJobs, companies, heroStats, jobCategories, handbookArticles] = await Promise.all([
    getFeaturedJobs(),
    getTopCompanies(),
    getJobStats(),
    getJobCategories(),
    getHandbookArticles(),
  ])

  const totalActive = heroStats?.totalActive ?? 10000
  const newToday = heroStats?.newLast24h ?? 0

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0f5132] pb-20 pt-20 text-white">
        {/* Subtle grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Top radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 55% at 50% -5%, rgba(52,211,153,0.18) 0%, transparent 65%)',
          }}
        />
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full border border-white/[0.05] bg-white/[0.02]" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-96 w-96 rounded-full border border-white/[0.05] bg-white/[0.02]" />
        <div className="pointer-events-none absolute left-1/4 top-12 h-12 w-12 rounded-full border border-emerald-400/20 bg-emerald-400/5" />
        <div className="pointer-events-none absolute right-1/3 bottom-16 h-8 w-8 rounded-full border border-emerald-400/20 bg-emerald-400/5" />

        {/* Content */}
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          {/* Status badge */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-1.5 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-white/65">
              Nền tảng tuyển dụng tin cậy tại Việt Nam
            </span>
          </div>

          {/* Main headline */}
          <h1 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
            Tìm được việc làm
            <br />
            <span className="text-emerald-400">mơ ước của bạn</span>
          </h1>
          <p className="mx-auto mb-9 max-w-xl text-base leading-relaxed text-white/50 md:text-lg">
            Kết nối hàng nghìn ứng viên tài năng với những cơ hội nghề nghiệp tốt nhất tại Việt Nam
          </p>

          {/* Search bar */}
          <div className="mx-auto max-w-2xl">
            <SearchBar size="large" />
          </div>

          {/* Popular searches */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-white/35">Tìm nhiều nhất:</span>
            {POPULAR_SEARCHES.map((tag) => (
              <Link
                key={tag}
                href={`/jobs?keyword=${encodeURIComponent(tag)}`}
                className="rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-1 text-xs font-medium text-white/55 transition hover:border-white/30 hover:bg-white/[0.12] hover:text-white/80"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        {/* Stats cards — bottom of hero */}
        <div className="relative mx-auto mt-16 max-w-4xl px-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              {
                value: totalActive.toLocaleString('vi-VN') + '+',
                label: 'Việc làm đang tuyển',
                Icon: BriefcaseIcon,
              },
              { value: '2,000+', label: 'Công ty uy tín', Icon: Building2Icon },
              { value: '500,000+', label: 'Ứng viên đã tham gia', Icon: UsersIcon },
              {
                value: newToday > 0 ? newToday.toLocaleString('vi-VN') + '+' : '30+',
                label: newToday > 0 ? 'Việc mới hôm nay' : 'Ngành nghề đa dạng',
                Icon: newToday > 0 ? TrendingUpIcon : LayersIcon,
              },
            ].map(({ value, label, Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-center backdrop-blur-sm"
              >
                <Icon className="mx-auto mb-2 h-5 w-5 text-emerald-400/75" />
                <div className="text-xl font-extrabold text-white md:text-2xl">{value}</div>
                <div className="mt-0.5 text-[11px] leading-tight text-white/40">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ─────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white">
        <p className="pt-5 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Tin tưởng bởi hàng nghìn doanh nghiệp
        </p>
        <CompanyMarquee companies={companies} />
      </div>

      {/* ── TOP INDUSTRIES ────────────────────────────────────────────────── */}
      <TopIndustries categories={jobCategories} />

      {/* ── FEATURED JOBS ─────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-brand">
                Cơ hội hấp dẫn
              </p>
              <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">Việc làm nổi bật</h2>
              <p className="mt-2 text-sm text-gray-500">
                Những vị trí được nhiều ứng viên quan tâm nhất
              </p>
            </div>
            <Link
              href="/jobs"
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand hover:text-brand"
            >
              Xem tất cả <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {featuredJobs.length > 0 && (
            <div className="mt-10 text-center">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-3.5 text-sm font-bold text-white transition hover:bg-brand/90"
              >
                Xem tất cả {totalActive.toLocaleString('vi-VN')}+ việc làm
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── RECOMMENDED JOBS ──────────────────────────────────────────────── */}
      <RecommendedJobs />

      {/* ── TOP COMPANIES ─────────────────────────────────────────────────── */}
      <TopCompaniesSection companies={companies} />

      {/* ── JOB MARKET (live stats) ───────────────────────────────────────── */}
      <Suspense fallback={<div className="h-80 animate-pulse bg-[#0f3d22] mx-0" />}>
        <JobMarketSection />
      </Suspense>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-gray-50/80 to-white py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-14 text-center">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-brand">
              Đơn giản &amp; Nhanh chóng
            </p>
            <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
              Tìm việc chỉ trong 3 bước
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-gray-500">
              Hệ thống thông minh giúp bạn kết nối với nhà tuyển dụng phù hợp nhanh nhất có thể
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, Icon, title, desc }, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-200 hover:border-brand/25 hover:shadow-md"
              >
                {/* Background step number */}
                <div className="absolute right-5 top-4 select-none text-7xl font-extrabold leading-none text-gray-100 transition-colors duration-200 group-hover:text-brand/[0.07]">
                  {step}
                </div>
                {/* Icon */}
                <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 transition-colors duration-200 group-hover:bg-brand/15">
                  <Icon className="h-7 w-7 text-brand" />
                </div>
                <h3 className="relative mb-3 text-[17px] font-bold text-gray-900">{title}</h3>
                <p className="relative text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link
              href="/jobs"
              className="rounded-xl bg-brand px-8 py-3.5 text-sm font-bold text-white transition hover:bg-brand/90"
            >
              Tìm việc ngay
            </Link>
            <Link
              href="/register"
              className="rounded-xl border border-gray-200 px-8 py-3.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
            >
              Tạo hồ sơ miễn phí
            </Link>
          </div>
        </div>
      </section>

      {/* ── HANDBOOK / BLOG ───────────────────────────────────────────────── */}
      <HandbookSection articles={handbookArticles} />

      {/* ── EMPLOYER CTA ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0f5132] py-20 text-white">
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -right-32 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-72 w-72 rounded-full bg-brand/25 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Left: copy */}
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                Dành cho nhà tuyển dụng
              </p>
              <h2 className="mb-4 text-3xl font-extrabold leading-tight md:text-4xl">
                Tuyển dụng hiệu quả,
                <br />
                <span className="text-emerald-400">tiết kiệm thời gian</span>
              </h2>
              <p className="mb-8 text-sm leading-relaxed text-white/55 md:text-base">
                Tiếp cận hàng trăm nghìn ứng viên chất lượng. Đăng tin, quản lý hồ sơ và tìm được
                người phù hợp nhanh hơn bao giờ hết.
              </p>

              <ul className="mb-9 space-y-3.5">
                {EMPLOYER_BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    <span className="text-sm text-white/65">{b}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/register?role=EMPLOYER"
                  className="rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-brand transition hover:bg-gray-50"
                >
                  Đăng ký miễn phí
                </Link>
                <Link
                  href="/employer/jobs/new"
                  className="flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Đăng tin ngay <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Right: stat cards */}
            <div className="grid grid-cols-2 gap-4">
              {EMPLOYER_STATS.map(({ value, label }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 text-center backdrop-blur-sm"
                >
                  <div className="text-3xl font-extrabold text-white">{value}</div>
                  <div className="mt-1.5 text-xs text-white/40">{label}</div>
                </div>
              ))}
              <div className="col-span-2 rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/15">
                    <TrendingUpIcon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Hiệu quả được chứng minh</div>
                    <div className="mt-0.5 text-xs text-white/45">
                      Hơn 85% nhà tuyển dụng tìm được ứng viên phù hợp trong 7 ngày đầu tiên
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
