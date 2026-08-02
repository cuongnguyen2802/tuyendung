'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { JobCategoryDto } from '@tuyendung/types'
import {
  PlusIcon, PencilIcon, TrashIcon, TagsIcon,
  GripVerticalIcon, CheckIcon, XIcon, LinkIcon,
} from 'lucide-react'

type FormState = {
  name: string
  slug: string
  icon: string
  description: string
  order: number
  isActive: boolean
}

const EMPTY: FormState = { name: '', slug: '', icon: '', description: '', order: 0, isActive: true }

function toSlug(s: string) {
  const base = s
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  return base.startsWith('viec-lam-') ? base : `viec-lam-${base}`
}

export default function JobCategoriesPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing] = useState<JobCategoryDto | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: categories = [], isLoading } = useQuery<JobCategoryDto[]>({
    queryKey: ['admin-job-categories'],
    queryFn: () => api.get('/job-categories?all=true'),
  })

  const createMut = useMutation({
    mutationFn: (d: FormState) => api.post('/job-categories', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-job-categories'] }); closeModal() },
  })

  const updateMut = useMutation({
    mutationFn: ({ id, d }: { id: string; d: Partial<FormState> }) =>
      api.put(`/job-categories/${id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-job-categories'] }); closeModal() },
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/job-categories/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-job-categories'] }); setDeleteId(null) },
  })

  function openCreate() {
    setForm({ ...EMPTY, order: (categories.length + 1) * 10 })
    setEditing(null)
    setModal('create')
  }

  function openEdit(cat: JobCategoryDto) {
    setForm({
      name: cat.name, slug: cat.slug, icon: cat.icon ?? '',
      description: cat.description ?? '', order: cat.order, isActive: cat.isActive,
    })
    setEditing(cat)
    setModal('edit')
  }

  function closeModal() { setModal(null); setEditing(null); setForm(EMPTY) }

  function handleNameChange(name: string) {
    setForm(f => ({ ...f, name, ...(modal === 'create' ? { slug: toSlug(name) } : {}) }))
  }

  function submit() {
    if (modal === 'create') createMut.mutate(form)
    else if (modal === 'edit' && editing) updateMut.mutate({ id: editing.id, d: form })
  }

  const isPending = createMut.isPending || updateMut.isPending
  const mutError = (createMut.error || updateMut.error || deleteMut.error) as Error | null

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Phân loại việc làm</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý danh mục hiển thị trên menu. Slug tạo link lọc việc làm theo phân loại.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-4 w-4" /> Thêm phân loại
        </button>
      </div>

      {mutError && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {mutError.message}
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="w-8 px-4 py-3"></th>
              <th className="px-4 py-3">Tên phân loại</th>
              <th className="px-4 py-3">Slug / Link</th>
              <th className="px-4 py-3">Icon</th>
              <th className="px-4 py-3 text-center">Thứ tự</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading && (
              <tr><td colSpan={7} className="py-12 text-center text-gray-400">Đang tải...</td></tr>
            )}
            {!isLoading && categories.length === 0 && (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <TagsIcon className="mx-auto mb-3 h-10 w-10 text-gray-200" />
                  <p className="text-gray-400">Chưa có phân loại nào. Thêm phân loại đầu tiên!</p>
                </td>
              </tr>
            )}
            {categories.map((cat) => (
              <tr key={cat.id} className="group hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-300">
                  <GripVerticalIcon className="h-4 w-4" />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <code className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">/jobs/{cat.slug}</code>
                    <a
                      href={`/jobs/${cat.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand hover:underline"
                      title="Mở link"
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </td>
                <td className="px-4 py-3 text-xl">{cat.icon || '—'}</td>
                <td className="px-4 py-3 text-center text-gray-500">{cat.order}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => updateMut.mutate({ id: cat.id, d: { isActive: !cat.isActive } })}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                      cat.isActive
                        ? 'bg-brand-50 text-brand hover:bg-brand-100'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {cat.isActive
                      ? <><CheckIcon className="h-3 w-3" /> Hiện</>
                      : <><XIcon className="h-3 w-3" /> Ẩn</>}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(cat)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(cat.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={closeModal}>
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="font-bold text-gray-900">
                {modal === 'create' ? 'Thêm phân loại mới' : 'Chỉnh sửa phân loại'}
              </h2>
              <button onClick={closeModal} className="rounded-lg p-1.5 hover:bg-gray-100">
                <XIcon className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Tên phân loại *</label>
                  <input
                    className="input"
                    placeholder="VD: Nhân viên kinh doanh"
                    value={form.name}
                    onChange={e => handleNameChange(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Icon (emoji)</label>
                  <input
                    className="input text-xl"
                    placeholder="💼"
                    value={form.icon}
                    onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="label">Slug (dùng cho URL) *</label>
                <div className="flex items-center gap-0 overflow-hidden rounded-xl border border-gray-300 bg-white focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
                  <span className="shrink-0 border-r border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-400">
                    /jobs/
                  </span>
                  <input
                    className="flex-1 px-3 py-2.5 font-mono text-sm outline-none"
                    placeholder="nhan-vien-kinh-doanh"
                    value={form.slug}
                    onChange={e => setForm(f => ({
                      ...f,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                    }))}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">Chỉ dùng ký tự a-z, số, dấu gạch ngang</p>
              </div>

              <div>
                <label className="label">Mô tả ngắn</label>
                <input
                  className="input"
                  placeholder="Mô tả về phân loại này..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    className="input"
                    value={form.order}
                    onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))}
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                    <input
                      type="checkbox"
                      className="accent-brand h-4 w-4"
                      checked={form.isActive}
                      onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    />
                    <span>Hiển thị trên menu</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button onClick={closeModal} className="btn-outline">Huỷ</button>
              <button
                onClick={submit}
                disabled={!form.name || !form.slug || isPending}
                className="btn-primary min-w-[100px]"
              >
                {isPending ? 'Đang lưu...' : modal === 'create' ? 'Thêm mới' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDeleteId(null)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="mb-2 font-bold text-gray-900">Xác nhận xoá</h2>
            <p className="mb-6 text-sm text-gray-500">
              Xoá phân loại này? Các việc làm đã gắn sẽ không bị xoá, chỉ mất liên kết phân loại.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-outline flex-1">Huỷ</button>
              <button
                onClick={() => deleteMut.mutate(deleteId)}
                disabled={deleteMut.isPending}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMut.isPending ? 'Đang xoá...' : 'Xoá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
