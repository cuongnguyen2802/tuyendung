import Link from 'next/link'
import { notFound } from 'next/navigation'
import { serverFetch } from '@/lib/server-fetch'
import { DB_TO_URL, type Article } from '@/lib/handbook'
import { CalendarIcon, EyeIcon, ChevronRightIcon, ArrowLeftIcon } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { marked } from 'marked'
import type { Metadata } from 'next'

// ── Markdown config ───────────────────────────────────────────────────────────

marked.setOptions({ breaks: true })

// ── Data fetcher ──────────────────────────────────────────────────────────────

async function getArticle(slug: string): Promise<Article | null> {
  return serverFetch<Article>(`/articles/${slug}`, { revalidate: 300, tags: [`article-${slug}`] })
}

// ── Metadata (SEO) ────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ category: string; slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: 'Bài viết không tồn tại' }

  const title = `${article.title} | TuyenDung.vn`
  const description = article.excerpt ?? article.content.slice(0, 160).replace(/[#*`>-]/g, '').trim()
  const url = `https://tuyendung.vn/blog/${DB_TO_URL[article.category.slug] ?? article.category.slug}/${slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      publishedTime: article.publishedAt ?? undefined,
      ...(article.imageUrl && { images: [{ url: article.imageUrl, width: 800, height: 450, alt: article.title }] }),
    },
    twitter: {
      card: article.imageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(article.imageUrl && { images: [article.imageUrl] }),
    },
    alternates: { canonical: url },
  }
}

// ── JSON-LD structured data ───────────────────────────────────────────────────

function ArticleJsonLd({ article, url }: { article: Article; url: string }) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt ?? undefined,
    image: article.imageUrl ?? undefined,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    url,
    publisher: {
      '@type': 'Organization',
      name: 'TuyenDung.vn',
      url: 'https://tuyendung.vn',
    },
    articleSection: article.category.name,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ArticlePage(
  { params }: { params: Promise<{ category: string; slug: string }> }
) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) notFound()

  const urlCategorySlug = DB_TO_URL[article.category.slug] ?? article.category.slug
  const pageUrl = `https://tuyendung.vn/blog/${urlCategorySlug}/${slug}`
  const html = await marked(article.content)

  const publishedDate = article.publishedAt
    ? format(new Date(article.publishedAt), 'dd/MM/yyyy', { locale: vi })
    : null

  return (
    <>
      <ArticleJsonLd article={article} url={pageUrl} />

      <div className="min-h-screen bg-gray-50">
        {/* Cover image */}
        {article.imageUrl && (
          <div className="h-64 w-full overflow-hidden bg-gray-200 md:h-80">
            <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="mx-auto max-w-3xl px-4 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-brand">Trang chủ</Link>
            <ChevronRightIcon className="h-3.5 w-3.5" />
            <Link href="/blog" className="hover:text-brand">Cẩm nang</Link>
            <ChevronRightIcon className="h-3.5 w-3.5" />
            <Link href={`/blog/${urlCategorySlug}`} className="hover:text-brand">
              {article.category.name}
            </Link>
            <ChevronRightIcon className="h-3.5 w-3.5" />
            <span className="line-clamp-1 text-gray-600">{article.title}</span>
          </nav>

          {/* Article card */}
          <article className="rounded-2xl border border-gray-200 bg-white px-6 py-8 md:px-10">
            {/* Category tag */}
            <Link
              href={`/blog/${urlCategorySlug}`}
              className="mb-4 inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand hover:bg-brand/20"
            >
              {article.category.name}
            </Link>

            <h1 className="mb-4 text-2xl font-bold leading-snug text-gray-900 md:text-3xl">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="mb-6 text-base leading-relaxed text-gray-500 border-l-4 border-brand/30 pl-4 italic">
                {article.excerpt}
              </p>
            )}

            <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-gray-100 pb-6 text-sm text-gray-400">
              {publishedDate && (
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="h-4 w-4" /> {publishedDate}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <EyeIcon className="h-4 w-4" /> {article.views.toLocaleString('vi-VN')} lượt xem
              </span>
            </div>

            {/* Markdown content */}
            <div
              className="prose prose-gray max-w-none
                prose-headings:font-bold prose-headings:text-gray-900
                prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-xl
                prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-lg
                prose-p:leading-relaxed prose-p:text-gray-700
                prose-li:text-gray-700 prose-li:leading-relaxed
                prose-strong:text-gray-900
                prose-a:text-brand prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-brand/40 prose-blockquote:text-gray-600
                prose-table:text-sm prose-th:bg-gray-50 prose-th:font-semibold
                prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-brand"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </article>

          {/* Back link */}
          <div className="mt-6">
            <Link
              href={`/blog/${urlCategorySlug}`}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-brand hover:text-brand"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Xem thêm bài về {article.category.name}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
