import Link from 'next/link'
import Image from 'next/image'
import { CalendarIcon, ArrowRightIcon, BookOpenIcon } from 'lucide-react'

export interface ArticleCardData {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  imageUrl?: string | null
  publishedAt?: string | null
  category?: { id: string; name: string; slug: string } | null
}

const CATEGORY_COLORS: Record<string, string> = {
  'ky-nang':      'bg-purple-100 text-purple-700',
  'phong-van':    'bg-blue-100 text-blue-700',
  'luong-thuong': 'bg-amber-100 text-amber-700',
  'cv':           'bg-rose-100 text-rose-700',
  'nghe-nghiep':  'bg-teal-100 text-teal-700',
}

function categoryColor(slug?: string | null) {
  if (!slug) return 'bg-gray-100 text-gray-600'
  const key = Object.keys(CATEGORY_COLORS).find((k) => slug.includes(k))
  return key ? CATEGORY_COLORS[key] : 'bg-brand-100 text-brand'
}

// Gradient placeholders when no imageUrl
const PLACEHOLDER_GRADIENTS = [
  'from-emerald-400 to-teal-600',
  'from-violet-400 to-purple-600',
  'from-amber-400 to-orange-500',
  'from-sky-400 to-blue-600',
  'from-rose-400 to-pink-600',
  'from-lime-400 to-brand',
]

function fmtDate(iso?: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function ArticleCard({ article, index }: { article: ArticleCardData; index: number }) {
  const gradient = PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length]
  const catColor = categoryColor(article.category?.slug)
  const date = fmtDate(article.publishedAt)

  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-lg"
    >
      {/* Thumbnail */}
      <div className="relative h-44 w-full shrink-0 overflow-hidden bg-gray-100">
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <BookOpenIcon className="h-12 w-12 text-white/60" />
          </div>
        )}
        {/* Category badge */}
        {article.category && (
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${catColor}`}>
            {article.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 group-hover:text-brand">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="line-clamp-2 text-xs leading-relaxed text-gray-500">{article.excerpt}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          {date ? (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <CalendarIcon className="h-3 w-3" />
              {date}
            </span>
          ) : <span />}
          <span className="flex items-center gap-0.5 text-xs font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
            Đọc ngay <ArrowRightIcon className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export function HandbookSection({ articles }: { articles: ArticleCardData[] }) {
  if (articles.length === 0) return null

  return (
    <section className="bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4">

        {/* Header */}
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-brand">Góc tư vấn</p>
            <h2 className="text-2xl font-bold text-gray-900">Cẩm nang nghề nghiệp</h2>
            <p className="mt-1 text-sm text-gray-500">Bí quyết xin việc, phỏng vấn và phát triển sự nghiệp</p>
          </div>
          <Link
            href="/blog"
            className="hidden items-center gap-1.5 rounded-xl border border-brand/30 bg-white px-5 py-2 text-sm font-semibold text-brand transition hover:bg-brand/5 sm:flex"
          >
            Xem tất cả <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, i) => (
            <ArticleCard key={article.id} article={article} index={i} />
          ))}
        </div>

        {/* Mobile "view all" */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded-xl border border-brand/30 bg-white px-5 py-2.5 text-sm font-semibold text-brand"
          >
            Xem tất cả bài viết <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  )
}
