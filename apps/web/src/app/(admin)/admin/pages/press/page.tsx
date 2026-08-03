'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PlusIcon, Trash2Icon, SaveIcon, CheckIcon, Loader2Icon } from 'lucide-react'

interface Article { source: string; title: string; date: string; url: string; logo: string }
interface Release { date: string; title: string; excerpt: string; pdfUrl: string }

interface PressData {
  articles: Article[]
  releases: Release[]
  contactName: string
  contactEmail: string
  contactPhone: string
}

const DEFAULT: PressData = {
  articles: [
    {
      source: 'VnExpress',
      title: 'TuyenDung.vn đạt 2 triệu ứng viên sau 3 năm hoạt động',
      date: '2024-03-15',
      url: '',
      logo: '',
    },
  ],
  releases: [
    {
      date: '2024-06-01',
      title: 'Thông báo ra mắt tính năng AI Match',
      excerpt: 'TuyenDung.vn chính thức ra mắt tính năng ghép cặp thông minh...',
      pdfUrl: '',
    },
  ],
  contactName: 'Phòng Truyền thông',
  contactEmail: 'press@tuyendung.vn',
  contactPhone: '024 3535 3535',
}

const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand'

export default function AdminPressPage() {
  const qc = useQueryClient()
  const [form, setForm] = useState<PressData>(DEFAULT)
  const [saved, setSaved] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-page', 'press'],
    queryFn: () => api.get('/admin/pages/press'),
  })

  useEffect(() => {
    if (data) setForm({ ...DEFAULT, ...data })
  }, [data])

  const mutation = useMutation({
    mutationFn: (d: PressData) => api.put('/admin/pages/press', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pages'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  function updateArticle(i: number, f: keyof Article, v: string) {
    setForm(d => ({ ...d, articles: d.articles.map((a, idx) => idx === i ? { ...a, [f]: v } : a) }))
  }

  function updateRelease(i: number, f: keyof Release, v: string) {
    setForm(d => ({ ...d, releases: d.releases.map((r, idx) => idx === i ? { ...r, [f]: v } : r) }))
  }

  if (isLoading) return <div className="flex justify-center py-20"><Loader2Icon className="h-7 w-7 animate-spin text-gray-300" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Trang Góc báo chí</h1>
          <p className="mt-0.5 text-sm text-gray-500">Tin tức, thông cáo và liên hệ báo chí</p>
        </div>
        <button
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
            saved ? 'bg-emerald-500' : mutation.isPending ? 'bg-brand/60' : 'bg-brand hover:bg-brand/90'
          }`}
        >
          {mutation.isPending ? <Loader2Icon className="h-4 w-4 animate-spin" />
            : saved ? <CheckIcon className="h-4 w-4" />
            : <SaveIcon className="h-4 w-4" />}
          {saved ? 'Đã lưu!' : mutation.isPending ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>

      {/* Media articles */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="font-semibold text-gray-900">Báo chí đưa tin</h2>
          <p className="text-xs text-gray-400 mt-0.5">Các bài viết từ báo và tạp chí</p>
        </div>
        <div className="divide-y divide-gray-50">
          {form.articles.map((a, i) => (
            <div key={i} className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-500 w-20 shrink-0">Nguồn</span>
                <input value={a.source} onChange={e => updateArticle(i, 'source', e.target.value)} placeholder="VnExpress" className={inputCls} />
                <input value={a.date} onChange={e => updateArticle(i, 'date', e.target.value)} type="date" className="w-40 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand" />
                <button type="button" onClick={() => setForm(d => ({ ...d, articles: d.articles.filter((_, idx) => idx !== i) }))} className="text-gray-300 hover:text-red-400 transition">
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-500 w-20 shrink-0">Tiêu đề</span>
                <input value={a.title} onChange={e => updateArticle(i, 'title', e.target.value)} placeholder="Tiêu đề bài viết..." className={inputCls} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-500 w-20 shrink-0">Link bài</span>
                <input value={a.url} onChange={e => updateArticle(i, 'url', e.target.value)} placeholder="https://..." type="url" className={inputCls} />
              </div>
            </div>
          ))}
          <div className="px-5 py-3">
            <button
              type="button"
              onClick={() => setForm(d => ({ ...d, articles: [...d.articles, { source: '', title: '', date: '', url: '', logo: '' }] }))}
              className="flex items-center gap-1.5 text-sm text-brand hover:text-brand/80 transition"
            >
              <PlusIcon className="h-4 w-4" />
              Thêm bài báo
            </button>
          </div>
        </div>
      </div>

      {/* Press releases */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="font-semibold text-gray-900">Thông cáo báo chí</h2>
          <p className="text-xs text-gray-400 mt-0.5">Thông cáo chính thức từ công ty</p>
        </div>
        <div className="divide-y divide-gray-50">
          {form.releases.map((r, i) => (
            <div key={i} className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <input value={r.date} onChange={e => updateRelease(i, 'date', e.target.value)} type="date" className="w-40 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand" />
                <input value={r.title} onChange={e => updateRelease(i, 'title', e.target.value)} placeholder="Tiêu đề thông cáo..." className={inputCls} />
                <button type="button" onClick={() => setForm(d => ({ ...d, releases: d.releases.filter((_, idx) => idx !== i) }))} className="shrink-0 text-gray-300 hover:text-red-400 transition">
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </div>
              <textarea
                value={r.excerpt}
                onChange={e => updateRelease(i, 'excerpt', e.target.value)}
                rows={2}
                placeholder="Tóm tắt nội dung..."
                className={inputCls + ' resize-none'}
              />
              <input value={r.pdfUrl} onChange={e => updateRelease(i, 'pdfUrl', e.target.value)} type="url" placeholder="Link PDF (không bắt buộc)..." className={inputCls} />
            </div>
          ))}
          <div className="px-5 py-3">
            <button
              type="button"
              onClick={() => setForm(d => ({ ...d, releases: [...d.releases, { date: '', title: '', excerpt: '', pdfUrl: '' }] }))}
              className="flex items-center gap-1.5 text-sm text-brand hover:text-brand/80 transition"
            >
              <PlusIcon className="h-4 w-4" />
              Thêm thông cáo
            </button>
          </div>
        </div>
      </div>

      {/* Press contact */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Liên hệ báo chí</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Phòng ban / Tên</label>
            <input value={form.contactName} onChange={e => setForm(d => ({ ...d, contactName: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
            <input value={form.contactEmail} onChange={e => setForm(d => ({ ...d, contactEmail: e.target.value }))} type="email" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Điện thoại</label>
            <input value={form.contactPhone} onChange={e => setForm(d => ({ ...d, contactPhone: e.target.value }))} className={inputCls} />
          </div>
        </div>
      </div>
    </div>
  )
}
