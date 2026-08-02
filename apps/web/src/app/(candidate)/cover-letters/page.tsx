'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  PlusIcon, PenLineIcon, TrashIcon, ChevronRightIcon,
  EyeIcon, FileIcon, SparklesIcon, StarIcon, Loader2Icon,
} from 'lucide-react'
import { api } from '@/lib/api'
import { timeAgo } from '@/lib/utils'

interface CoverLetter {
  id: string
  title: string
  content: string
  jobTitle?: string
  company?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface FormState {
  title: string
  jobTitle: string
  company: string
  content: string
}

const EMPTY_FORM: FormState = { title: '', jobTitle: '', company: '', content: '' }

export default function CoverLettersPage() {
  const qc = useQueryClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const { data: letters = [], isLoading } = useQuery<CoverLetter[]>({
    queryKey: ['cover-letters'],
    queryFn: () => api.get('/cover-letters'),
  })

  const create = useMutation({
    mutationFn: (data: FormState) => api.post('/cover-letters', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cover-letters'] }); closeCompose() },
  })

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FormState> }) =>
      api.put(`/cover-letters/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cover-letters'] }); closeCompose() },
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/cover-letters/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cover-letters'] }); setDeletingId(null) },
  })

  const setDefault = useMutation({
    mutationFn: (id: string) => api.patch(`/cover-letters/${id}/set-default`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cover-letters'] }),
  })

  function openCreate() { setForm(EMPTY_FORM); setEditingId(null); setShowCompose(true) }
  function openEdit(cl: CoverLetter) {
    setForm({ title: cl.title, jobTitle: cl.jobTitle ?? '', company: cl.company ?? '', content: cl.content })
    setEditingId(cl.id)
    setShowCompose(true)
  }
  function closeCompose() { setShowCompose(false); setEditingId(null); setForm(EMPTY_FORM) }

  function handleSave() {
    if (!form.title.trim() || !form.content.trim()) return
    if (editingId) update.mutate({ id: editingId, data: form })
    else create.mutate(form)
  }

  const isSaving = create.isPending || update.isPending

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/profile" className="hover:text-brand">Tài khoản</Link>
        <ChevronRightIcon className="h-3.5 w-3.5" />
        <span className="text-gray-600">Quản lý thư xin việc</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Thư xin việc của tôi</h1>
          <p className="mt-0.5 text-sm text-gray-500">Tạo và quản lý các cover letter cho từng vị trí ứng tuyển</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/cover-letters/templates"
            className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-brand hover:text-brand"
          >
            <FileIcon className="h-4 w-4" />
            Xem mẫu
          </Link>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
          >
            <PlusIcon className="h-4 w-4" />
            Tạo thư mới
          </button>
        </div>
      </div>

      <div className="flex gap-4 rounded-2xl border border-brand/20 bg-brand/5 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <SparklesIcon className="h-6 w-6" />
        </div>
        <div>
          <p className="font-semibold text-gray-800">Thư xin việc ấn tượng tăng cơ hội phỏng vấn lên 3x</p>
          <p className="mt-1 text-sm text-gray-500">
            Viết thư xin việc riêng cho mỗi vị trí, nhấn mạnh điểm phù hợp với yêu cầu của nhà tuyển dụng.{' '}
            <Link href="/blog/cv" className="font-medium text-brand hover:underline">Xem hướng dẫn →</Link>
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2Icon className="h-8 w-8 animate-spin text-gray-300" />
        </div>
      ) : letters.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <PenLineIcon className="h-14 w-14 text-gray-200" />
          <div>
            <p className="font-semibold text-gray-500">Bạn chưa có thư xin việc nào</p>
            <p className="mt-1 text-sm text-gray-400">Bắt đầu tạo thư xin việc chuyên nghiệp ngay</p>
          </div>
          <div className="flex gap-2">
            <button onClick={openCreate} className="rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand/90">
              Viết thư mới
            </button>
            <Link href="/cover-letters/templates" className="rounded-xl border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:border-brand hover:text-brand">
              Dùng mẫu có sẵn
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {letters.map((cl) => (
            <div key={cl.id} className="group rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-brand/30 hover:shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
                  <PenLineIcon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">{cl.title}</p>
                    {cl.isDefault && (
                      <span className="shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">Mặc định</span>
                    )}
                  </div>
                  {(cl.jobTitle || cl.company) && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {[cl.jobTitle, cl.company].filter(Boolean).join(' tại ')} · {timeAgo(cl.updatedAt)}
                    </p>
                  )}
                  <p className="mt-1.5 line-clamp-2 text-sm text-gray-600">{cl.content}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(cl)}
                    title="Chỉnh sửa"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:border-brand hover:text-brand"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  {!cl.isDefault && (
                    <button
                      onClick={() => setDefault.mutate(cl.id)}
                      title="Đặt làm mặc định"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:border-amber-400 hover:text-amber-500"
                    >
                      <StarIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setDeletingId(cl.id)}
                    title="Xóa"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 hover:border-red-300 hover:text-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compose / Edit modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-bold text-gray-900">{editingId ? 'Chỉnh sửa thư xin việc' : 'Tạo thư xin việc mới'}</h2>
              <button onClick={closeCompose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">✕</button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Tên thư <span className="text-red-500">*</span></label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  placeholder="VD: Thư xin việc lập trình viên Backend"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Vị trí ứng tuyển</label>
                  <input
                    value={form.jobTitle}
                    onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    placeholder="Backend Developer"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Tên công ty</label>
                  <input
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    placeholder="Công ty XYZ"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Nội dung thư <span className="text-red-500">*</span></label>
                <textarea
                  rows={8}
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  placeholder={"Kính gửi Ban Tuyển dụng,\n\nTôi tên là... với X năm kinh nghiệm trong lĩnh vực..."}
                />
              </div>
              {(create.isError || update.isError) && (
                <p className="text-sm text-red-500">{((create.error || update.error) as Error)?.message}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={closeCompose} className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !form.title.trim() || !form.content.trim()}
                  className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
                >
                  {isSaving && <Loader2Icon className="h-4 w-4 animate-spin" />}
                  {editingId ? 'Cập nhật' : 'Lưu thư'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 font-bold text-gray-900">Xóa thư xin việc này?</h3>
            <p className="mb-5 text-sm text-gray-500">Thao tác này không thể hoàn tác.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeletingId(null)} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Hủy
              </button>
              <button
                onClick={() => remove.mutate(deletingId!)}
                disabled={remove.isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {remove.isPending && <Loader2Icon className="h-4 w-4 animate-spin" />}
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
