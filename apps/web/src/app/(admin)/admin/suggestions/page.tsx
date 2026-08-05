'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  PlusIcon, Trash2Icon, SaveIcon, Building2Icon,
  UserCircleIcon, CalendarIcon, SparklesIcon,
  GlobeIcon, FileTextIcon, ArrowRightIcon,
  PencilIcon, CheckIcon, XIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type SuggestionKey = 'groupA' | 'groupB' | 'workshops'

interface SuggestionItem {
  id: string
  title: string
  description: string
  category: string
  link?: string
  active: boolean
  icon?: string
}

interface WorkshopItem {
  id: string
  title: string
  description: string
  date: string
  organizer: string
  link?: string
  active: boolean
}

const GROUP_A_CATEGORIES = ['Visa & Di trú', 'Thuế & Kế toán', 'Tư vấn doanh nghiệp', 'Pháp lý', 'Tuyển dụng chuyên sâu', 'Khác']
const GROUP_B_CATEGORIES = ['Mẫu CV', 'Hướng dẫn tạo CV', 'Kỹ năng phỏng vấn', 'Khóa học', 'Chứng chỉ', 'Khác']

const TAB_CONFIG = [
  {
    key: 'groupA' as SuggestionKey,
    label: 'Nhóm A — Nhà tuyển dụng',
    icon: Building2Icon,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    categories: GROUP_A_CATEGORIES,
    placeholder: { title: 'VD: Dịch vụ tư vấn Visa', description: 'Hỗ trợ doanh nghiệp làm Visa lao động nước ngoài', category: 'Visa & Di trú' },
  },
  {
    key: 'groupB' as SuggestionKey,
    label: 'Nhóm B — Ứng viên',
    icon: UserCircleIcon,
    color: 'text-brand',
    bg: 'bg-brand/5',
    categories: GROUP_B_CATEGORIES,
    placeholder: { title: 'VD: 50+ Mẫu CV chuyên nghiệp', description: 'Tải về miễn phí các mẫu CV đẹp theo ngành nghề', category: 'Mẫu CV' },
  },
  {
    key: 'workshops' as SuggestionKey,
    label: 'Hội thảo & Sự kiện',
    icon: CalendarIcon,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    categories: [],
    placeholder: { title: 'VD: Hội thảo Kỹ năng phỏng vấn 2026', description: 'Hội thảo trực tuyến miễn phí dành cho ứng viên', category: '' },
  },
]

function newItem(key: SuggestionKey): SuggestionItem | WorkshopItem {
  const id = Math.random().toString(36).slice(2)
  if (key === 'workshops') {
    return { id, title: '', description: '', date: '', organizer: '', link: '', active: true } as WorkshopItem
  }
  return { id, title: '', description: '', category: '', link: '', active: true } as SuggestionItem
}

export default function SuggestionsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<SuggestionKey>('groupA')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftItems, setDraftItems] = useState<Record<SuggestionKey, any[]>>({
    groupA: [], groupB: [], workshops: [],
  })
  const [loaded, setLoaded] = useState<Record<SuggestionKey, boolean>>({
    groupA: false, groupB: false, workshops: false,
  })

  const { data, isLoading } = useQuery<any>({
    queryKey: ['admin-suggestions'],
    queryFn: () => api.get('/admin/suggestions'),
    onSuccess: (d: any) => {
      setDraftItems({ groupA: d.groupA ?? [], groupB: d.groupB ?? [], workshops: d.workshops ?? [] })
      setLoaded({ groupA: true, groupB: true, workshops: true })
    },
  })

  const saveMutation = useMutation({
    mutationFn: ({ key, items }: { key: string; items: any[] }) =>
      api.put('/admin/suggestions', { key, items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-suggestions'] })
      toast.success('Đã lưu thay đổi')
    },
    onError: () => toast.error('Lưu thất bại'),
  })

  const tabCfg = TAB_CONFIG.find(t => t.key === activeTab)!
  const items: any[] = draftItems[activeTab]

  const addItem = () => {
    const item = newItem(activeTab)
    setDraftItems(prev => ({ ...prev, [activeTab]: [...prev[activeTab], item] }))
    setEditingId(item.id)
  }

  const updateItem = (id: string, patch: Record<string, any>) => {
    setDraftItems(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(it => it.id === id ? { ...it, ...patch } : it),
    }))
  }

  const removeItem = (id: string) => {
    setDraftItems(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(it => it.id !== id),
    }))
    if (editingId === id) setEditingId(null)
  }

  const save = () => {
    saveMutation.mutate({ key: activeTab, items })
    setEditingId(null)
  }

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-sm text-gray-400">Đang tải...</div>
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gợi ý & Quảng cáo</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Quản lý nội dung gợi ý, quảng cáo hiển thị cho nhà tuyển dụng (nhóm A) và ứng viên (nhóm B)
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-3 gap-4">
        {TAB_CONFIG.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              'rounded-xl border p-4 text-left transition',
              activeTab === t.key
                ? 'border-brand bg-brand text-white shadow-md'
                : 'border-gray-200 bg-white hover:border-brand/30',
            )}
          >
            <t.icon className={cn('mb-2 h-5 w-5', activeTab === t.key ? 'text-white' : t.color)} />
            <p className={cn('text-sm font-semibold', activeTab === t.key ? 'text-white' : 'text-gray-800')}>
              {t.label}
            </p>
            <p className={cn('text-2xl font-bold mt-1', activeTab === t.key ? 'text-white' : t.color)}>
              {(draftItems[t.key] ?? []).length}
              <span className={cn('ml-1 text-xs font-normal', activeTab === t.key ? 'text-white/70' : 'text-gray-400')}>
                mục
              </span>
            </p>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {/* Tab header */}
        <div className={cn('flex items-center justify-between rounded-t-xl border-b px-5 py-3', tabCfg.bg)}>
          <div className="flex items-center gap-2">
            <tabCfg.icon className={cn('h-4 w-4', tabCfg.color)} />
            <span className={cn('text-sm font-semibold', tabCfg.color)}>{tabCfg.label}</span>
            <span className="rounded-full bg-white/60 px-2 py-0.5 text-xs font-medium text-gray-600">
              {items.length} mục
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={addItem}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:shadow transition"
            >
              <PlusIcon className="h-3.5 w-3.5" /> Thêm mục
            </button>
            <button
              onClick={save}
              disabled={saveMutation.isPending}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand/90 disabled:opacity-50 transition"
            >
              <SaveIcon className="h-3.5 w-3.5" />
              {saveMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="divide-y divide-gray-50 p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center text-gray-400">
              <SparklesIcon className="h-10 w-10 text-gray-200" />
              <p className="text-sm">Chưa có mục nào. Bấm "Thêm mục" để bắt đầu.</p>
            </div>
          ) : (
            items.map((item: any) => {
              const isEditing = editingId === item.id
              return (
                <div key={item.id} className={cn('rounded-xl p-4 transition', isEditing ? 'bg-gray-50' : 'hover:bg-gray-50/60')}>
                  {isEditing ? (
                    /* Edit form */
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">Tiêu đề *</label>
                          <input
                            value={item.title}
                            onChange={e => updateItem(item.id, { title: e.target.value })}
                            className="input w-full text-sm"
                            placeholder={tabCfg.placeholder.title}
                          />
                        </div>
                        {activeTab !== 'workshops' && tabCfg.categories.length > 0 && (
                          <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">Danh mục</label>
                            <select
                              value={item.category}
                              onChange={e => updateItem(item.id, { category: e.target.value })}
                              className="input w-full text-sm"
                            >
                              <option value="">Chọn danh mục</option>
                              {tabCfg.categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                        )}
                        {activeTab === 'workshops' && (
                          <>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-600">Ngày tổ chức</label>
                              <input type="date" value={item.date} onChange={e => updateItem(item.id, { date: e.target.value })} className="input w-full text-sm" />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-600">Đơn vị tổ chức</label>
                              <input value={item.organizer ?? ''} onChange={e => updateItem(item.id, { organizer: e.target.value })} className="input w-full text-sm" placeholder="VD: TuyenDung.vn" />
                            </div>
                          </>
                        )}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Mô tả</label>
                        <textarea
                          value={item.description}
                          onChange={e => updateItem(item.id, { description: e.target.value })}
                          className="input w-full text-sm resize-none"
                          rows={2}
                          placeholder={tabCfg.placeholder.description}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">Link (URL)</label>
                        <input
                          value={item.link ?? ''}
                          onChange={e => updateItem(item.id, { link: e.target.value })}
                          className="input w-full text-sm"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={item.active}
                            onChange={e => updateItem(item.id, { active: e.target.checked })}
                            className="h-4 w-4 accent-brand"
                          />
                          Hiển thị (active)
                        </label>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingId(null)}
                            className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-300 transition">
                            <XIcon className="h-3.5 w-3.5" /> Hủy
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand/90 transition">
                            <CheckIcon className="h-3.5 w-3.5" /> Xong
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <div className="flex items-start gap-4">
                      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', tabCfg.bg)}>
                        {activeTab === 'groupA' ? <Building2Icon className={cn('h-4 w-4', tabCfg.color)} />
                          : activeTab === 'groupB' ? <FileTextIcon className={cn('h-4 w-4', tabCfg.color)} />
                            : <CalendarIcon className={cn('h-4 w-4', tabCfg.color)} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <div className="flex-1">
                            <p className={cn('font-semibold text-gray-800', !item.active && 'opacity-40')}>
                              {item.title || <span className="italic text-gray-300">Chưa có tiêu đề</span>}
                            </p>
                            {item.category && (
                              <span className={cn('inline-block rounded-full px-2 py-0.5 text-[10px] font-medium mt-0.5', tabCfg.bg, tabCfg.color)}>
                                {item.category}
                              </span>
                            )}
                            {activeTab === 'workshops' && item.date && (
                              <span className="ml-1 inline-block rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-600">
                                📅 {new Date(item.date).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            {!item.active && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-400">Ẩn</span>
                            )}
                            <button onClick={() => setEditingId(item.id)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
                              <PencilIcon className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => removeItem(item.id)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition">
                              <Trash2Icon className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        {item.description && (
                          <p className={cn('mt-1 text-xs text-gray-500 line-clamp-2', !item.active && 'opacity-40')}>
                            {item.description}
                          </p>
                        )}
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-brand hover:underline">
                            <GlobeIcon className="h-3 w-3" /> {item.link}
                          </a>
                        )}
                        {activeTab === 'workshops' && item.organizer && (
                          <p className="mt-0.5 text-xs text-gray-400">Tổ chức bởi: {item.organizer}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Matching suggestion info card */}
      <div className="rounded-xl border border-dashed border-brand/30 bg-brand/5 p-5">
        <div className="flex items-start gap-3">
          <SparklesIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <div>
            <p className="font-semibold text-gray-800">Gợi ý matching nhóm A ↔ nhóm B</p>
            <p className="mt-1 text-sm text-gray-500">
              Tính năng gợi ý nhà tuyển dụng và ứng viên phù hợp cho nhau được vận hành tự động qua module Matching.
            </p>
            <a href="/admin/matching"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
              Xem Module Matching <ArrowRightIcon className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
