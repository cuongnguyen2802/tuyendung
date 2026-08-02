'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { api } from '@/lib/api'
import {
  ArrowLeftIcon, SaveIcon, EyeIcon, ChevronDownIcon, ImageIcon,
  SearchIcon, InfoIcon, Loader2Icon, XIcon, UploadCloudIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import DropZone from '@/components/common/DropZone'

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false })

interface Category { id: string; name: string; slug: string; icon?: string }

const ICON_MAP: Record<string, string> = {
  compass: '🧭', lightbulb: '💡', banknote: '💰', 'graduation-cap': '🎓',
  briefcase: '💼', 'trending-up': '📈', book: '📚', star: '⭐',
  target: '🎯', chart: '📊', people: '👥', trophy: '🏆',
}
const iconEmoji = (icon?: string) => ICON_MAP[icon ?? ''] ?? '📄'

type FormData = {
  title: string
  content: string
  excerpt: string
  imageUrl: string
  categoryId: string
  status: 'DRAFT' | 'PUBLISHED'
  metaTitle: string
  metaDescription: string
  metaKeywords: string
}

export default function NewArticlePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeSection, setActiveSection] = useState<'content' | 'seo'>('content')
  const [coverUploading, setCoverUploading] = useState(false)

  const [form, setForm] = useState<FormData>({
    title: '',
    content: '',
    excerpt: '',
    imageUrl: '',
    categoryId: '',
    status: 'DRAFT',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
  })

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['admin-article-categories'],
    queryFn: () => api.get('/articles/admin/categories'),
  })

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleCoverUpload = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setCoverUploading(true)
    try {
      const formData = new FormData()
      formData.append('files', file)
      const result: any = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = Array.isArray(result) ? result[0]?.url : result?.url
      if (url) setForm((f) => ({ ...f, imageUrl: url }))
      queryClient.invalidateQueries({ queryKey: ['admin-media'] })
      queryClient.invalidateQueries({ queryKey: ['media-stats'] })
    } catch (err: any) {
      setError(err.message ?? 'Upload ảnh thất bại')
    } finally {
      setCoverUploading(false)
    }
  }, [queryClient])

  const handleSubmit = async (publishNow = false) => {
    if (!form.title.trim()) { setError('Vui lòng nhập tiêu đề'); return }
    if (!form.categoryId) { setError('Vui lòng chọn danh mục'); return }
    if (!form.content.trim() || form.content === '<p></p>') { setError('Vui lòng nhập nội dung'); return }
    setSaving(true); setError('')
    try {
      const payload = { ...form, status: publishNow ? 'PUBLISHED' : form.status }
      const created: any = await api.post('/articles/admin', payload)
      // Navigate to edit page so user can continue editing
      router.push(`/admin/news/${created.id}/edit`)
    } catch (err: any) {
      setError(err.message ?? 'Có lỗi xảy ra')
      setSaving(false)
    }
  }

  const charCount = (form.metaDescription ?? '').length
  const titleCharCount = (form.metaTitle || form.title).length

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/news"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:bg-gray-100">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Thêm bài viết mới</h1>
            <p className="text-sm text-gray-400">Soạn thảo nội dung và cài đặt SEO</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <SaveIcon className="h-4 w-4" />
            Lưu nháp
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:opacity-50"
          >
            {saving ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <EyeIcon className="h-4 w-4" />}
            {saving ? 'Đang lưu...' : 'Xuất bản'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button onClick={() => setError('')}><XIcon className="h-4 w-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <input
              value={form.title}
              onChange={set('title')}
              placeholder="Tiêu đề bài viết..."
              className="w-full border-0 bg-transparent text-2xl font-bold text-gray-900 placeholder-gray-300 outline-none"
            />
          </div>

          <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit">
            <button type="button" onClick={() => setActiveSection('content')}
              className={cn('rounded-lg px-4 py-1.5 text-sm font-medium transition',
                activeSection === 'content' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              Nội dung
            </button>
            <button type="button" onClick={() => setActiveSection('seo')}
              className={cn('rounded-lg px-4 py-1.5 text-sm font-medium transition',
                activeSection === 'seo' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              SEO
            </button>
          </div>

          {activeSection === 'content' && (
            <div className="space-y-4">
              <RichTextEditor
                value={form.content}
                onChange={(html) => setForm((f) => ({ ...f, content: html }))}
                minHeight={500}
              />
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <label className="mb-2 block text-sm font-semibold text-gray-700">Mô tả ngắn (excerpt)</label>
                <textarea
                  value={form.excerpt}
                  onChange={set('excerpt')}
                  rows={3}
                  placeholder="Tóm tắt nội dung bài viết (hiển thị ở trang danh sách)..."
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-brand"
                />
              </div>
            </div>
          )}

          {activeSection === 'seo' && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <SearchIcon className="h-4 w-4 text-brand" /> Cài đặt SEO
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-2 text-xs font-medium text-gray-400">Xem trước kết quả tìm kiếm</p>
                <p className="text-xs text-brand">tuyendung.vn › blog › ...</p>
                <p className="text-base font-medium text-blue-700 hover:underline cursor-pointer line-clamp-1">
                  {form.metaTitle || form.title || 'Tiêu đề bài viết'}
                </p>
                <p className="mt-0.5 text-sm text-gray-600 line-clamp-2">
                  {form.metaDescription || form.excerpt || 'Mô tả bài viết sẽ hiện ở đây...'}
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Meta Title</label>
                    <span className={cn('text-xs', titleCharCount > 60 ? 'text-red-500' : 'text-gray-400')}>{titleCharCount}/60</span>
                  </div>
                  <input value={form.metaTitle} onChange={set('metaTitle')}
                    placeholder={form.title || 'Để trống sẽ dùng tiêu đề bài viết'}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand" />
                  <p className="mt-1 text-xs text-gray-400">Tối ưu: 50–60 ký tự</p>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Meta Description</label>
                    <span className={cn('text-xs', charCount > 160 ? 'text-red-500' : charCount > 120 ? 'text-amber-500' : 'text-gray-400')}>{charCount}/160</span>
                  </div>
                  <textarea value={form.metaDescription} onChange={set('metaDescription')} rows={3}
                    placeholder={form.excerpt || 'Mô tả ngắn cho công cụ tìm kiếm...'}
                    className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand" />
                  <p className="mt-1 text-xs text-gray-400">Tối ưu: 120–160 ký tự</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Từ khóa (Keywords)</label>
                  <input value={form.metaKeywords} onChange={set('metaKeywords')}
                    placeholder="tìm việc làm, việc làm IT, tuyển dụng..."
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand" />
                  <p className="mt-1 text-xs text-gray-400">Phân cách bằng dấu phẩy.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">Cài đặt xuất bản</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">Trạng thái</label>
                <div className="relative">
                  <select value={form.status} onChange={set('status')}
                    className="w-full appearance-none rounded-xl border border-gray-200 px-3 py-2.5 pr-8 text-sm outline-none focus:border-brand">
                    <option value="DRAFT">Nháp</option>
                    <option value="PUBLISHED">Xuất bản ngay</option>
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">Danh mục <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={form.categoryId} onChange={set('categoryId')}
                    className="w-full appearance-none rounded-xl border border-gray-200 px-3 py-2.5 pr-8 text-sm outline-none focus:border-brand">
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{iconEmoji(c.icon)} {c.name}</option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Cover image with drag-drop */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <ImageIcon className="h-4 w-4 text-gray-400" /> Ảnh bìa
            </h3>

            {form.imageUrl ? (
              <div className="group relative mb-3 overflow-hidden rounded-xl border border-gray-100">
                <img src={form.imageUrl} alt="Cover preview" className="h-40 w-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                  <DropZone onFiles={handleCoverUpload} accept="image/*" uploading={coverUploading}>
                    <button type="button"
                      className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 shadow transition hover:bg-gray-100">
                      <UploadCloudIcon className="h-3.5 w-3.5" /> Đổi ảnh
                    </button>
                  </DropZone>
                  <button type="button"
                    onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                    className="flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-red-600 shadow transition hover:bg-red-50">
                    <XIcon className="h-3.5 w-3.5" /> Xóa
                  </button>
                </div>
                {coverUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2Icon className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>
            ) : (
              <DropZone onFiles={handleCoverUpload} accept="image/*" uploading={coverUploading} compact className="mb-3">
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-8 transition hover:border-brand hover:bg-brand/5 cursor-pointer">
                  {coverUploading ? (
                    <Loader2Icon className="h-8 w-8 animate-spin text-brand" />
                  ) : (
                    <>
                      <UploadCloudIcon className="h-8 w-8 text-gray-300" />
                      <p className="text-xs font-medium text-gray-400">Kéo thả hoặc click để chọn ảnh</p>
                    </>
                  )}
                </div>
              </DropZone>
            )}

            <input
              value={form.imageUrl}
              onChange={set('imageUrl')}
              placeholder="Hoặc dán URL ảnh vào đây..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-2">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <div className="space-y-1 text-xs text-blue-700">
                <p className="font-semibold">Mẹo viết bài tốt</p>
                <ul className="space-y-0.5 list-disc list-inside">
                  <li>Tiêu đề 50–70 ký tự</li>
                  <li>Meta description 120–160 ký tự</li>
                  <li>Dùng heading H2, H3 để phân chia nội dung</li>
                  <li>Thêm alt text cho hình ảnh</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
