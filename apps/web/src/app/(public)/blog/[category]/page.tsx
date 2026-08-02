import Link from 'next/link'
import { notFound } from 'next/navigation'
import { serverFetch } from '@/lib/server-fetch'
import { toDbSlug, DB_TO_URL, CATEGORY_META, CATEGORY_NAMES, DEFAULT_CATEGORY_META, CATEGORY_SLUG_MAP, type Article, type Category } from '@/lib/handbook'
import { CalendarIcon, EyeIcon, ChevronRightIcon, BookOpenIcon, ArrowRightIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { Metadata } from 'next'

// ── Data fetchers ─────────────────────────────────────────────────────────────

async function getCategories(): Promise<Category[]> {
  const data = await serverFetch<Category[]>('/articles/categories', { revalidate: 300 })
  return data ?? []
}

async function getArticles(dbSlug: string, page = 1): Promise<{ data: Article[]; meta: any }> {
  const data = await serverFetch<{ data: Article[]; meta: any }>(`/articles?category=${dbSlug}&page=${page}&limit=12`, { revalidate: 300 })
  return data ?? { data: [], meta: {} }
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ category: string }> }
): Promise<Metadata> {
  const { category } = await params
  const dbSlug = toDbSlug(category)
  const cats = await getCategories()
  const cat = cats.find((c) => c.slug === dbSlug) ?? null
  const name = cat?.name ?? CATEGORY_NAMES[dbSlug]
  if (!name) return { title: 'Danh mục không tồn tại' }

  const title = `${name} — Cẩm nang nghề nghiệp | TuyenDung.vn`
  const description = (CATEGORY_META[dbSlug] ?? DEFAULT_CATEGORY_META).desc

  return {
    title,
    description,
    openGraph: { title, description, type: 'website', url: `https://tuyendung.vn/blog/${category}` },
    twitter: { card: 'summary', title, description },
    alternates: { canonical: `https://tuyendung.vn/blog/${category}` },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CategoryPage(
  { params, searchParams }: {
    params: Promise<{ category: string }>
    searchParams: Promise<{ page?: string }>
  }
) {
  const { category } = await params
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1'))
  const dbSlug = toDbSlug(category)

  // 404 only for truly unknown URL slugs; valid slugs render even when API is unreachable
  if (!(category in CATEGORY_SLUG_MAP)) notFound()

  const [allCategories, { data: articles, meta }] = await Promise.all([
    getCategories(),
    getArticles(dbSlug, page),
  ])
  const cat = allCategories.find((c) => c.slug === dbSlug) ?? null

  const catMeta = CATEGORY_META[dbSlug] ?? DEFAULT_CATEGORY_META
  const catName = cat?.name ?? CATEGORY_NAMES[dbSlug] ?? 'Danh mục bài viết'
  const featured = articles[0] ?? null
  const secondary = articles.slice(1, 3)
  const rest = articles.slice(3)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className={`bg-gradient-to-br ${catMeta.gradient} border-b border-gray-100`}>
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex items-center justify-between gap-6">
            <div className="max-w-xl">
              <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">{catName}</h1>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{catMeta.desc}</p>
            </div>
            <div className="hidden shrink-0 text-8xl select-none md:block" aria-hidden>
              {catMeta.illustration}
            </div>
          </div>
        </div>
      </div>

      {/* ── Category pills ───────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap gap-2 py-3">
            {allCategories.map((c) => {
              const urlSlug = DB_TO_URL[c.slug] ?? c.slug
              const isActive = c.slug === dbSlug
              return (
                <Link
                  key={c.id}
                  href={`/blog/${urlSlug}`}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition whitespace-nowrap ${
                    isActive
                      ? 'border-brand bg-brand text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-brand hover:text-brand'
                  }`}
                >
                  {c.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-brand">Trang chủ</Link>
          <ChevronRightIcon className="h-3.5 w-3.5" />
          <Link href="/blog" className="hover:text-brand">Cẩm nang nghề nghiệp</Link>
          <ChevronRightIcon className="h-3.5 w-3.5" />
          <span className="text-gray-600">{catName}</span>
        </nav>

        {articles.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white py-20 text-center">
            <BookOpenIcon className="mb-3 h-12 w-12 text-gray-200" />
            <p className="font-medium text-gray-500">Chưa có bài viết trong danh mục này</p>
            <p className="mt-1 text-sm text-gray-400">Quay lại sau nhé!</p>
          </div>
        ) : (
          <>
            {/* ── Featured section ──────────────────────────────────────── */}
            {featured && (
              <section className="mb-10">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Bài viết nổi bật</h2>
                  {meta?.total > 3 && (
                    <Link href={`/blog/${category}?page=2`}
                      className="flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
                      Xem tất cả <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_340px]">
                  {/* Large card */}
                  <Link
                    href={`/blog/${category}/${featured.slug}`}
                    className="group relative overflow-hidden rounded-2xl bg-gray-900"
                    style={{ minHeight: 320 }}
                  >
                    {featured.imageUrl ? (
                      <img
                        src={featured.imageUrl}
                        alt={featured.title}
                        className="absolute inset-0 h-full w-full object-cover opacity-70 transition group-hover:opacity-60 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand/80 to-emerald-700" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 p-6">
                      <span className="mb-3 inline-block rounded-full bg-brand px-3 py-0.5 text-xs font-semibold text-white">
                        {catName}
                      </span>
                      <h3 className="line-clamp-3 text-lg font-bold leading-snug text-white group-hover:text-brand-100 md:text-xl">
                        {featured.title}
                      </h3>
                      {featured.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm text-gray-300">{featured.excerpt}</p>
                      )}
                      <ArticleMeta article={featured} light />
                    </div>
                  </Link>

                  {/* Two secondary cards */}
                  {secondary.length > 0 && (
                    <div className="flex flex-col gap-4">
                      {secondary.map((article) => (
                        <Link
                          key={article.id}
                          href={`/blog/${category}/${article.slug}`}
                          className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-md"
                        >
                          {article.imageUrl && (
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="h-36 w-full object-cover transition group-hover:opacity-90"
                            />
                          )}
                          <div className="flex flex-1 flex-col p-4">
                            <span className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand">
                              {catName}
                            </span>
                            <h3 className="line-clamp-2 flex-1 text-sm font-semibold leading-snug text-gray-900 group-hover:text-brand">
                              {article.title}
                            </h3>
                            <ArticleMeta article={article} className="mt-2" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ── Article list ─────────────────────────────────────────── */}
            {rest.length > 0 && (
              <section>
                <h2 className="mb-5 text-xl font-bold text-gray-900">
                  {page > 1 ? `Trang ${page}` : 'Tất cả bài viết'}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article) => (
                    <ArticleGridCard key={article.id} article={article} category={category} catName={catName} />
                  ))}
                </div>
              </section>
            )}

            {/* ── Pagination ───────────────────────────────────────────── */}
            {meta?.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {page > 1 && (
                  <Link href={`/blog/${category}?page=${page - 1}`}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-brand hover:text-brand">
                    ← Trước
                  </Link>
                )}
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                  <Link key={p} href={`/blog/${category}?page=${p}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition ${
                      p === page
                        ? 'bg-brand text-white shadow-sm'
                        : 'border border-gray-200 bg-white text-gray-600 hover:border-brand hover:text-brand'
                    }`}>
                    {p}
                  </Link>
                ))}
                {page < meta.totalPages && (
                  <Link href={`/blog/${category}?page=${page + 1}`}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-brand hover:text-brand">
                    Sau →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ArticleMeta({
  article, light, className,
}: { article: Article; light?: boolean; className?: string }) {
  const timeAgo = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true, locale: vi })
    : null

  return (
    <div className={`flex items-center gap-3 text-xs ${light ? 'text-gray-400' : 'text-gray-400'} ${className ?? 'mt-3'}`}>
      {timeAgo && (
        <span className="flex items-center gap-1">
          <CalendarIcon className="h-3.5 w-3.5" />{timeAgo}
        </span>
      )}
      <span className="flex items-center gap-1">
        <EyeIcon className="h-3.5 w-3.5" />{article.views.toLocaleString('vi-VN')}
      </span>
    </div>
  )
}

function ArticleGridCard({
  article, category, catName,
}: { article: Article; category: string; catName: string }) {
  return (
    <Link
      href={`/blog/${category}/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-44 overflow-hidden bg-gray-100">
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
        <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand">{catName}</span>
        <h3 className="line-clamp-2 flex-1 text-sm font-semibold leading-snug text-gray-900 group-hover:text-brand">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-500">{article.excerpt}</p>
        )}
        <ArticleMeta article={article} className="mt-3" />
      </div>
    </Link>
  )
}
