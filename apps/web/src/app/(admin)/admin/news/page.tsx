'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  SearchIcon, PlusIcon, PencilIcon, Trash2Icon, EyeIcon,
  CheckCircleIcon, FileIcon, ChevronDownIcon, XIcon,
  BookOpenIcon, TagIcon, GripVerticalIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { DB_TO_URL } from '@/lib/handbook'

// ── Icon options ──────────────────────────────────────────────────────────────

const ICON_OPTIONS = [
  { value: 'compass', emoji: '🧭', label: 'La bàn' },
  { value: 'lightbulb', emoji: '💡', label: 'Bóng đèn' },
  { value: 'banknote', emoji: '💰', label: 'Tiền' },
  { value: 'graduation-cap', emoji: '🎓', label: 'Tốt nghiệp' },
  { value: 'briefcase', emoji: '💼', label: 'Cặp công việc' },
  { value: 'trending-up', emoji: '📈', label: 'Xu hướng' },
  { value: 'book', emoji: '📚', label: 'Sách' },
  { value: 'star', emoji: '⭐', label: 'Ngôi sao' },
  { value: 'target', emoji: '🎯', label: 'Mục tiêu' },
  { value: 'chart', emoji: '📊', label: 'Biểu đồ' },
  { value: 'people', emoji: '👥', label: 'Nhóm người' },
  { value: 'trophy', emoji: '🏆', label: 'Cúp' },
]

const iconEmoji = (icon?: string) =>
  ICON_OPTIONS.find((o) => o.value === icon)?.emoji ?? '📄'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Category {
  id: string; name: string; slug: string; icon?: string; order: number
  _count?: { articles: number }
}

interface Article {
  id: string; title: string; slug: string; excerpt?: string
  imageUrl?: string; status: 'DRAFT' | 'PUBLISHED'; views: number
  publishedAt?: string; createdAt: string
  category: { id: string; name: string; icon?: string; slug?: string }
}

// ── Category modal ────────────────────────────────────────────────────────────

function CategoryModal({
  category, onClose, onSaved,
}: {
  category?: Category | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(category?.name ?? '')
  const [slug, setSlug] = useState(category?.slug ?? '')
  const [icon, setIcon] = useState(category?.icon ?? 'compass')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Auto-generate slug from name only when creating (not editing)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    if (!category?.id) {
      setSlug(
        e.target.value
          .toLowerCase()
          .normalize('NFD').replace(/[̀-ͯ]/g, '')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Vui lòng nhập tên danh mục'); return }
    setSaving(true); setError('')
    try {
      if (category?.id) {
        await api.put(`/articles/admin/categories/${category.id}`, { name, icon, slug: slug.trim() || undefined })
      } else {
        await api.post('/articles/admin/categories', { name, icon })
      }
      onSaved(); onClose()
    } catch (err: any) {
      setError(err.message ?? 'Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-gray-900">
            {category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition">
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Tên danh mục <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={handleNameChange}
              placeholder="Ví dụ: Định hướng nghề nghiệp"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand"
              autoFocus
            />
          </div>

          {/* Slug — only shown when editing */}
          {category?.id && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Slug <span className="text-xs font-normal text-gray-400">(dùng trong URL)</span>
              </label>
              <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 focus-within:border-brand">
                <span className="shrink-0 border-r border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-400 select-none">
                  /blog/
                </span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'))}
                  placeholder="dinh-huong-nghe-nghiep"
                  className="flex-1 bg-white px-3 py-2.5 font-mono text-sm outline-none"
                />
              </div>
              <p className="mt-1 text-xs text-amber-600">
                ⚠ Thay đổi slug sẽ làm hỏng link cũ đã chia sẻ
              </p>
            </div>
          )}

          {/* Icon picker */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Biểu tượng</label>
            <div className="grid grid-cols-6 gap-2">
              {ICON_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setIcon(opt.value)}
                  title={opt.label}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-xl border-2 py-2.5 text-xl transition',
                    icon === opt.value
                      ? 'border-brand bg-brand/5'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-300',
                  )}
                >
                  {opt.emoji}
                  <span className="text-[9px] text-gray-400 leading-none">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl bg-gray-50 px-4 py-3">
            <p className="mb-1.5 text-xs font-medium text-gray-400">Xem trước</p>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3.5 py-1.5 text-sm font-semibold text-brand">
              <span className="text-base">{iconEmoji(icon)}</span>
              {name || 'Tên danh mục'}
            </span>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              Hủy
            </button>
            <button type="submit" disabled={saving}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:opacity-50">
              {saving ? 'Đang lưu...' : category ? 'Cập nhật' : 'Thêm danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Categories tab ────────────────────────────────────────────────────────────

function CategoriesPanel({ categories, onRefresh }: { categories: Category[]; onRefresh: () => void }) {
  const queryClient = useQueryClient()
  const [catModal, setCatModal] = useState<Category | 'create' | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/articles/admin/categories/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-article-categories'] }); setDeletingId(null) },
    onError: (err: any) => { alert(err.message ?? 'Không thể xóa danh mục'); setDeletingId(null) },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{categories.length} danh mục</p>
        <button
          onClick={() => setCatModal('create')}
          className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
        >
          <PlusIcon className="h-4 w-4" /> Thêm danh mục
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              <th className="w-8 px-4 py-3" />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Danh mục</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Slug</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Bài viết</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Thứ tự</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-sm text-gray-400">
                  Chưa có danh mục nào
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="group hover:bg-gray-50/70 transition">
                  <td className="px-4 py-3 text-gray-300">
                    <GripVerticalIcon className="h-4 w-4" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-xl">
                        {iconEmoji(cat.icon)}
                      </span>
                      <span className="font-medium text-gray-800">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{cat.slug}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      (cat._count?.articles ?? 0) > 0
                        ? 'bg-brand/10 text-brand'
                        : 'bg-gray-100 text-gray-400',
                    )}>
                      {cat._count?.articles ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-gray-400 text-xs">
                    #{cat.order}
                  </td>
                  <td className="px-4 py-3">
                    <div className="invisible flex items-center justify-end gap-1 group-hover:visible">
                      <button
                        onClick={() => setCatModal(cat)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand transition"
                        title="Chỉnh sửa"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(cat.id)}
                        disabled={(cat._count?.articles ?? 0) > 0}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition disabled:cursor-not-allowed disabled:opacity-30"
                        title={(cat._count?.articles ?? 0) > 0 ? 'Còn bài viết, không thể xóa' : 'Xóa'}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Category modal */}
      {catModal !== null && (
        <CategoryModal
          category={catModal === 'create' ? null : catModal as Category}
          onClose={() => setCatModal(null)}
          onSaved={onRefresh}
        />
      )}

      {/* Delete confirm */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900">Xóa danh mục?</h3>
            <p className="mt-1.5 text-sm text-gray-500">Hành động này không thể hoàn tác.</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setDeletingId(null)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                Hủy
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingId)}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminNewsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [mainTab, setMainTab] = useState<'articles' | 'categories'>('articles')
  const [statusTab, setStatusTab] = useState<'' | 'PUBLISHED' | 'DRAFT'>('')
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [page, setPage] = useState(1)
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(null)

  const { data: categories = [], refetch: refetchCategories } = useQuery<Category[]>({
    queryKey: ['admin-article-categories'],
    queryFn: () => api.get('/articles/admin/categories'),
  })

  const { data, isLoading } = useQuery<any>({
    queryKey: ['admin-articles', statusTab, keyword, categoryId, page],
    queryFn: () => {
      const p = new URLSearchParams()
      if (statusTab) p.set('status', statusTab)
      if (keyword) p.set('keyword', keyword)
      if (categoryId) p.set('categoryId', categoryId)
      p.set('page', String(page)); p.set('limit', '20')
      return api.get(`/articles/admin/list?${p.toString()}`)
    },
    enabled: mainTab === 'articles',
  })

  const deleteArticleMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/articles/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-articles'] })
      queryClient.invalidateQueries({ queryKey: ['admin-article-categories'] })
      setDeletingArticleId(null)
    },
  })

  const articles: Article[] = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tin tức</h1>
          <p className="mt-0.5 text-sm text-gray-400">
            {categories.length} danh mục · {meta?.total ?? 0} bài viết
          </p>
        </div>
        {mainTab === 'articles' && (
          <button
            onClick={() => router.push('/admin/news/new')}
            className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90"
          >
            <PlusIcon className="h-4 w-4" /> Thêm bài viết
          </button>
        )}
      </div>

      {/* Main tabs: Bài viết / Danh mục */}
      <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit">
        <button
          onClick={() => setMainTab('articles')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition',
            mainTab === 'articles' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
          )}
        >
          <BookOpenIcon className="h-4 w-4" /> Bài viết
        </button>
        <button
          onClick={() => setMainTab('categories')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition',
            mainTab === 'categories' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
          )}
        >
          <TagIcon className="h-4 w-4" /> Danh mục
          <span className={cn(
            'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
            mainTab === 'categories' ? 'bg-brand text-white' : 'bg-gray-200 text-gray-500',
          )}>{categories.length}</span>
        </button>
      </div>

      {/* ── Categories tab ──────────────────────────────────────────────────── */}
      {mainTab === 'categories' && (
        <CategoriesPanel
          categories={categories}
          onRefresh={() => refetchCategories()}
        />
      )}

      {/* ── Articles tab ────────────────────────────────────────────────────── */}
      {mainTab === 'articles' && (
        <>
          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setCategoryId(''); setPage(1) }}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
                !categoryId ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              Tất cả
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => { setCategoryId(c.id); setPage(1) }}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition',
                  categoryId === c.id ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                )}
              >
                <span>{iconEmoji(c.icon)}</span>
                {c.name}
                {c._count !== undefined && (
                  <span className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px]',
                    categoryId === c.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500',
                  )}>{c._count.articles}</span>
                )}
              </button>
            ))}
          </div>

          {/* Status tabs + search */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
              {([
                { value: '', label: 'Tất cả' },
                { value: 'PUBLISHED', label: 'Đã xuất bản' },
                { value: 'DRAFT', label: 'Nháp' },
              ] as const).map((t) => (
                <button
                  key={t.value}
                  onClick={() => { setStatusTab(t.value); setPage(1) }}
                  className={cn(
                    'rounded-lg px-4 py-1.5 text-sm font-medium transition',
                    statusTab === t.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="relative flex-1 min-w-52">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setPage(1) }}
                placeholder="Tìm bài viết..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Bài viết</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Danh mục</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Trạng thái</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Lượt xem</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Ngày tạo</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 rounded bg-gray-100 animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : articles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <BookOpenIcon className="mx-auto mb-3 h-10 w-10 text-gray-200" />
                      <p className="text-sm text-gray-400">Chưa có bài viết nào</p>
                      <button onClick={() => router.push('/admin/news/new')}
                        className="mt-3 text-sm font-semibold text-brand hover:underline">
                        + Thêm bài viết đầu tiên
                      </button>
                    </td>
                  </tr>
                ) : (
                  articles.map((article) => (
                    <tr key={article.id} className="group hover:bg-gray-50/80 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {article.imageUrl ? (
                            <img src={article.imageUrl} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
                          ) : (
                            <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                              <FileIcon className="h-5 w-5 text-gray-300" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 line-clamp-1">{article.title}</p>
                            {article.excerpt && (
                              <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">{article.excerpt}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          {iconEmoji(article.category?.icon)}
                          {article.category?.name ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {article.status === 'PUBLISHED' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand">
                            <CheckCircleIcon className="h-3 w-3" /> Đã xuất bản
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">Nháp</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-xs text-gray-500">
                        {article.views.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400">
                        {formatDistanceToNow(new Date(article.createdAt), { addSuffix: true, locale: vi })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="invisible flex items-center justify-end gap-1 group-hover:visible">
                          {article.status === 'PUBLISHED' && (
                            <a
                              href={`/blog/${DB_TO_URL[article.category?.slug ?? ''] ?? 'career'}/${article.slug}`}
                              target="_blank" rel="noopener noreferrer"
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand transition" title="Xem bài viết">
                              <EyeIcon className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            onClick={() => router.push(`/admin/news/${article.id}/edit`)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand transition" title="Chỉnh sửa">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeletingArticleId(article.id)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition" title="Xóa">
                            <Trash2Icon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                <p className="text-sm text-gray-500">{meta.total} bài viết · trang {page}/{meta.totalPages}</p>
                <div className="flex gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40 hover:border-brand hover:text-brand transition">
                    ← Trước
                  </button>
                  <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40 hover:border-brand hover:text-brand transition">
                    Sau →
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete article confirm */}
      {deletingArticleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900">Xóa bài viết?</h3>
            <p className="mt-1.5 text-sm text-gray-500">Hành động này không thể hoàn tác.</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setDeletingArticleId(null)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                Hủy
              </button>
              <button
                onClick={() => deleteArticleMutation.mutate(deletingArticleId)}
                disabled={deleteArticleMutation.isPending}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleteArticleMutation.isPending ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
