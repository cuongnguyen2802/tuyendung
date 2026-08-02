import Link from 'next/link'
import { serverFetch } from '@/lib/server-fetch'
import {
  DB_TO_URL,
  CATEGORY_META,
  DEFAULT_CATEGORY_META,
  type Category,
  type Article,
} from '@/lib/handbook'
import {
  CompassIcon, LightbulbIcon, BanknoteIcon, GraduationCapIcon,
  PackageIcon, TrendingUpIcon, BookOpenIcon,
  CalendarIcon, EyeIcon, ChevronRightIcon, ArrowRightIcon,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { Metadata } from 'next'

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Cẩm nang nghề nghiệp — TuyenDung.vn',
  description:
    'Kho kiến thức nghề nghiệp: định hướng sự nghiệp, bí kíp tìm việc, chế độ lương thưởng, xu hướng tuyển dụng và nhiều hơn nữa.',
  openGraph: {
    title: 'Cẩm nang nghề nghiệp — TuyenDung.vn',
    description: 'Kho kiến thức giúp bạn phát triển sự nghiệp toàn diện.',
    type: 'website',
    url: 'https://tuyendung.vn/blog',
  },
  alternates: { canonical: 'https://tuyendung.vn/blog' },
}

// ── Icons per category ────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  'dinh-huong-nghe-nghiep':        CompassIcon,
  'bi-kip-tim-viec':                LightbulbIcon,
  'che-do-luong-thuong':            BanknoteIcon,
  'kien-thuc-chuyen-nganh':         GraduationCapIcon,
  'hanh-trang-nghe-nghiep':         PackageIcon,
  'thi-truong-xu-huong-tuyen-dung': TrendingUpIcon,
}

// ── Data fetchers ─────────────────────────────────────────────────────────────

async function getCategories(): Promise<Category[]> {
  const data = await serverFetch<Category[]>('/articles/categories', { revalidate: 300 })
  return data ?? []
}

async function getLatestArticles(): Promise<Article[]> {
  const data = await serverFetch<{ data: Article[] }>('/articles?page=1&limit=6', { revalidate: 300 })
  return data?.data ?? []
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function BlogIndexPage() {
  const [categories, latestArticles] = await Promise.all([
    getCategories(),
    getLatestArticles(),
  ])

  const totalArticles = categories.reduce((sum, c) => sum + c._count.articles, 0)
  const featuredArticle = latestArticles[0] ?? null
  const recentArticles  = latestArticles.slice(1)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex items-center justify-between gap-8">
            <div className="max-w-2xl">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand">Cẩm nang nghề nghiệp</p>
              <h1 className="text-4xl font-extrabold leading-tight text-gray-900 md:text-5xl">
                Kiến thức nghề nghiệp<br />
                <span className="text-brand">toàn diện, thực tiễn</span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                Tổng hợp kiến thức từ định hướng sự nghiệp, bí kíp tìm việc đến xu hướng thị trường —
                giúp bạn phát triển vững vàng trong mọi giai đoạn sự nghiệp.
              </p>
              {/* Stats chips */}
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-full border border-brand/20 bg-white px-4 py-1.5 text-sm font-medium text-gray-700">
                  <BookOpenIcon className="h-4 w-4 text-brand" />
                  {totalArticles > 0 ? `${totalArticles} bài viết` : 'Nhiều bài viết'}
                </div>
                <div className="flex items-center gap-2 rounded-full border border-brand/20 bg-white px-4 py-1.5 text-sm font-medium text-gray-700">
                  <CompassIcon className="h-4 w-4 text-brand" />
                  {categories.length} chủ đề
                </div>
              </div>
            </div>
            <div className="hidden shrink-0 select-none text-[120px] leading-none md:block" aria-hidden>
              📚
            </div>
          </div>
        </div>
      </div>

      {/* ── Category pills ────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap gap-2 py-3">
            {categories.map((cat) => {
              const urlSlug = DB_TO_URL[cat.slug] ?? cat.slug
              return (
                <Link
                  key={cat.id}
                  href={`/blog/${urlSlug}`}
                  className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 transition hover:border-brand hover:text-brand whitespace-nowrap"
                >
                  {cat.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 space-y-14">

        {/* ── Latest articles ─────────────────────────────────────────────────── */}
        {latestArticles.length > 0 && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Bài viết mới nhất</h2>
              <Link href="/blog/career" className="flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                Xem thêm <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>

            {featuredArticle && (
              <div className="grid gap-5 md:grid-cols-[1fr_380px]">
                {/* Large featured card */}
                <Link
                  href={`/blog/${DB_TO_URL[featuredArticle.category.slug] ?? featuredArticle.category.slug}/${featuredArticle.slug}`}
                  className="group relative flex min-h-[340px] overflow-hidden rounded-2xl bg-gray-900"
                >
                  {featuredArticle.imageUrl ? (
                    <img
                      src={featuredArticle.imageUrl}
                      alt={featuredArticle.title}
                      className="absolute inset-0 h-full w-full object-cover opacity-70 transition group-hover:scale-105 group-hover:opacity-60"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/80 to-emerald-700" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 p-7">
                    <CategoryBadge name={featuredArticle.category.name} />
                    <h3 className="mt-3 line-clamp-3 text-2xl font-bold leading-snug text-white">
                      {featuredArticle.title}
                    </h3>
                    {featuredArticle.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-300">{featuredArticle.excerpt}</p>
                    )}
                    <ArticleMeta article={featuredArticle} light className="mt-4" />
                  </div>
                </Link>

                {/* Right column: up to 2 secondary cards */}
                {recentArticles.length > 0 && (
                  <div className="flex flex-col gap-5">
                    {recentArticles.slice(0, 2).map((article) => (
                      <SmallArticleCard
                        key={article.id}
                        article={article}
                        href={`/blog/${DB_TO_URL[article.category.slug] ?? article.category.slug}/${article.slug}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Extra row: remaining articles */}
            {recentArticles.length > 2 && (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {recentArticles.slice(2).map((article) => (
                  <GridArticleCard
                    key={article.id}
                    article={article}
                    href={`/blog/${DB_TO_URL[article.category.slug] ?? article.category.slug}/${article.slug}`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Categories ──────────────────────────────────────────────────────── */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Khám phá theo chủ đề</h2>
              <p className="mt-1 text-sm text-gray-500">Chọn chủ đề phù hợp với giai đoạn sự nghiệp của bạn</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const Icon = ICON_MAP[cat.slug] ?? BookOpenIcon
              const meta = CATEGORY_META[cat.slug] ?? DEFAULT_CATEGORY_META
              const urlSlug = DB_TO_URL[cat.slug] ?? cat.slug

              return (
                <Link
                  key={cat.id}
                  href={`/blog/${urlSlug}`}
                  className={`group relative overflow-hidden rounded-2xl border ${meta.borderColor} bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md`}
                >
                  {/* Decorative bg illustration */}
                  <span className="absolute right-4 top-3 text-5xl opacity-10 select-none pointer-events-none" aria-hidden>
                    {meta.illustration}
                  </span>

                  <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${meta.bgColor}`}>
                    <Icon className={`h-5.5 w-5.5 ${meta.iconColor}`} style={{ width: 22, height: 22 }} />
                  </div>

                  <p className="font-bold text-gray-900 group-hover:text-brand">{cat.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">{meta.desc}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{cat._count.articles} bài viết</span>
                    <span className={`flex items-center gap-1 text-xs font-semibold ${meta.iconColor}`}>
                      Xem tất cả <ChevronRightIcon className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── CV guide CTA ─────────────────────────────────────────────────────── */}
        <section>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand to-emerald-600 px-8 py-10 text-white">
            <div className="absolute right-6 top-0 text-[100px] leading-none opacity-10 select-none" aria-hidden>📄</div>
            <div className="relative max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-white/70">Nổi bật</p>
              <h2 className="mt-2 text-2xl font-extrabold">Hướng dẫn viết CV từ A đến Z</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Bí quyết tạo CV vượt qua ATS, gây ấn tượng với nhà tuyển dụng và tăng tỷ lệ được gọi phỏng vấn lên 3x.
              </p>
              <div className="mt-6 flex gap-3">
                <Link
                  href="/blog/cv"
                  className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand transition hover:bg-gray-50"
                >
                  Đọc hướng dẫn →
                </Link>
                <Link
                  href="/resumes/templates"
                  className="rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Xem mẫu CV
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function CategoryBadge({ name }: { name: string }) {
  return (
    <span className="inline-block rounded-full bg-brand px-3 py-0.5 text-xs font-semibold text-white">
      {name}
    </span>
  )
}

function ArticleMeta({
  article, light, className,
}: { article: Article; light?: boolean; className?: string }) {
  const timeAgo = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true, locale: vi })
    : null

  return (
    <div className={`flex items-center gap-3 text-xs ${light ? 'text-gray-400' : 'text-gray-400'} ${className ?? ''}`}>
      {timeAgo && (
        <span className="flex items-center gap-1">
          <CalendarIcon className="h-3.5 w-3.5" /> {timeAgo}
        </span>
      )}
      <span className="flex items-center gap-1">
        <EyeIcon className="h-3.5 w-3.5" /> {article.views.toLocaleString('vi-VN')}
      </span>
    </div>
  )
}

function SmallArticleCard({ article, href }: { article: Article; href: string }) {
  return (
    <Link
      href={href}
      className="group flex gap-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 transition hover:shadow-md"
    >
      {article.imageUrl && (
        <img
          src={article.imageUrl}
          alt={article.title}
          className="h-24 w-24 shrink-0 rounded-xl object-cover"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-brand">
            {article.category.name}
          </span>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 group-hover:text-brand">
            {article.title}
          </h3>
        </div>
        <ArticleMeta article={article} className="mt-2" />
      </div>
    </Link>
  )
}

function GridArticleCard({ article, href }: { article: Article; href: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-40 overflow-hidden bg-gray-100">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand/10 to-emerald-50">
            <BookOpenIcon className="h-10 w-10 text-brand/30" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand">
          {article.category.name}
        </span>
        <h3 className="line-clamp-2 flex-1 text-sm font-semibold leading-snug text-gray-900 group-hover:text-brand">
          {article.title}
        </h3>
        <ArticleMeta article={article} className="mt-3" />
      </div>
    </Link>
  )
}
