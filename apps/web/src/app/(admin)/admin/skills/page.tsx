'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  SearchIcon, PlusIcon, PencilIcon, Trash2Icon,
  Loader2Icon, CheckIcon, TagIcon, XIcon,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

interface Skill {
  id: string
  name: string
  slug: string
  category: string | null
  isActive: boolean
  _count: { jobSkills: number; candidateSkills: number }
}

interface SkillsData {
  data: Skill[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

// ── Modal ────────────────────────────────────────────────────────────────────

function SkillModal({
  skill,
  categories,
  onClose,
}: {
  skill: Skill | null
  categories: string[]
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [name, setName]         = useState(skill?.name ?? '')
  const [category, setCategory] = useState(skill?.category ?? '')
  const [newCat, setNewCat]     = useState('')
  const [useNewCat, setUseNewCat] = useState(false)

  const mutation = useMutation({
    mutationFn: () => {
      const cat = useNewCat ? newCat.trim() : category
      if (skill) return api.patch(`/admin/skills/${skill.id}`, { name, category: cat || undefined })
      return api.post('/admin/skills', { name, category: cat || undefined })
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-skills'] }); onClose() },
  })

  const disabled = !name.trim() || mutation.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-bold text-gray-900">{skill ? 'Sửa kỹ năng' : 'Thêm kỹ năng mới'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Tên kỹ năng <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              placeholder="VD: React.js, Photoshop, Quản lý dự án..."
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Nhóm kỹ năng</label>
            {!useNewCat ? (
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                >
                  <option value="">Không nhóm</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button
                  type="button"
                  onClick={() => setUseNewCat(true)}
                  className="shrink-0 rounded-xl border border-dashed border-gray-300 px-3 py-2.5 text-xs font-medium text-gray-500 hover:border-brand hover:text-brand"
                >
                  + Mới
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  placeholder="Tên nhóm mới..."
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => { setUseNewCat(false); setNewCat('') }}
                  className="shrink-0 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Hủy
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={disabled}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
            >
              {mutation.isPending ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <CheckIcon className="h-4 w-4" />}
              {skill ? 'Cập nhật' : 'Thêm kỹ năng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminSkillsPage() {
  const qc = useQueryClient()
  const [keyword, setKeyword]     = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [page, setPage]           = useState(1)
  const [modal, setModal]         = useState<'create' | Skill | null>(null)
  const [deletingId, setDeleting] = useState<string | null>(null)

  const { data, isLoading } = useQuery<SkillsData>({
    queryKey: ['admin-skills', keyword, catFilter, page],
    queryFn: () => {
      const p = new URLSearchParams()
      if (keyword)   p.set('keyword', keyword)
      if (catFilter) p.set('category', catFilter)
      p.set('page', String(page))
      p.set('limit', '50')
      return api.get(`/admin/skills?${p}`)
    },
  })

  const toggleActive = useMutation({
    mutationFn: (skill: Skill) => api.patch(`/admin/skills/${skill.id}`, { isActive: !skill.isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-skills'] }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/skills/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-skills'] }); setDeleting(null) },
  })

  const skills     = data?.data ?? []
  const meta       = data?.meta
  const categories = [...new Set(skills.map(s => s.category).filter(Boolean) as string[])].sort()

  // Group by category
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    const cat = s.category ?? '(Chưa phân nhóm)'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý kỹ năng</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Danh sách kỹ năng dùng để gán cho tin tuyển dụng và hồ sơ ứng viên
            {meta && <span className="ml-2 text-brand">({meta.total} kỹ năng)</span>}
          </p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand/90"
        >
          <PlusIcon className="h-4 w-4" />
          Thêm kỹ năng
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-56">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(1) }}
            placeholder="Tìm theo tên kỹ năng"
            className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        {categories.length > 0 && (
          <select
            value={catFilter}
            onChange={e => { setCatFilter(e.target.value); setPage(1) }}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="">Tất cả nhóm</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2Icon className="h-7 w-7 animate-spin text-gray-300" />
        </div>
      ) : skills.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <TagIcon className="h-12 w-12 text-gray-200" />
          <div>
            <p className="font-semibold text-gray-400">Chưa có kỹ năng nào</p>
            <p className="mt-1 text-sm text-gray-400">Thêm kỹ năng đầu tiên để bắt đầu</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, items]) => (
            <div key={cat} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{cat}</p>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map(skill => (
                  <div key={skill.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('font-medium text-sm', !skill.isActive && 'text-gray-400 line-through')}>
                          {skill.name}
                        </span>
                        {!skill.isActive && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-400">
                            Ẩn
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {skill._count.jobSkills} tin · {skill._count.candidateSkills} ứng viên
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => toggleActive.mutate(skill)}
                        disabled={toggleActive.isPending}
                        title={skill.isActive ? 'Ẩn kỹ năng' : 'Hiện kỹ năng'}
                        className={cn(
                          'relative h-5 w-9 rounded-full transition-colors duration-200',
                          skill.isActive ? 'bg-brand' : 'bg-gray-200',
                        )}
                      >
                        <span className={cn(
                          'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
                          skill.isActive ? 'translate-x-4' : '',
                        )} />
                      </button>
                      <button
                        onClick={() => setModal(skill)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-brand hover:text-brand"
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleting(skill.id)}
                        disabled={skill._count.jobSkills > 0 || skill._count.candidateSkills > 0}
                        title={
                          skill._count.jobSkills > 0 || skill._count.candidateSkills > 0
                            ? 'Không thể xóa kỹ năng đang được sử dụng'
                            : 'Xóa'
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Trash2Icon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">Trang {meta.page}/{meta.totalPages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40">Trước</button>
            <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40">Sau</button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal !== null && (
        <SkillModal
          skill={modal === 'create' ? null : modal}
          categories={categories}
          onClose={() => setModal(null)}
        />
      )}

      {/* Delete confirm */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 font-bold text-gray-900">Xóa kỹ năng này?</h3>
            <p className="mb-5 text-sm text-gray-500">Thao tác không thể hoàn tác.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleting(null)} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Hủy</button>
              <button
                onClick={() => remove.mutate(deletingId)}
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
