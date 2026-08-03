'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  PlusIcon, Trash2Icon, GripVerticalIcon, SaveIcon,
  CheckIcon, Loader2Icon, ChevronDownIcon, ChevronRightIcon,
} from 'lucide-react'

interface FaqItem  { q: string; a: string }
interface FaqSection { title: string; items: FaqItem[] }

const DEFAULT_DATA: FaqSection[] = [
  {
    title: 'Tài khoản & Đăng ký',
    items: [
      { q: 'Làm sao để tạo tài khoản?', a: '' },
    ],
  },
]

export default function AdminFaqPage() {
  const qc = useQueryClient()
  const [sections, setSections] = useState<FaqSection[]>(DEFAULT_DATA)
  const [openSection, setOpenSection] = useState<number | null>(0)
  const [saved, setSaved] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-page', 'faq'],
    queryFn: () => api.get('/admin/pages/faq'),
  })

  useEffect(() => {
    if (data?.sections) setSections(data.sections)
  }, [data])

  const mutation = useMutation({
    mutationFn: (d: { sections: FaqSection[] }) => api.put('/admin/pages/faq', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pages'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  function addSection() {
    setSections(s => [...s, { title: 'Chủ đề mới', items: [] }])
    setOpenSection(sections.length)
  }

  function removeSection(i: number) {
    setSections(s => s.filter((_, idx) => idx !== i))
  }

  function updateSectionTitle(i: number, title: string) {
    setSections(s => s.map((sec, idx) => idx === i ? { ...sec, title } : sec))
  }

  function addItem(si: number) {
    setSections(s => s.map((sec, idx) =>
      idx === si ? { ...sec, items: [...sec.items, { q: '', a: '' }] } : sec
    ))
  }

  function removeItem(si: number, ii: number) {
    setSections(s => s.map((sec, idx) =>
      idx === si ? { ...sec, items: sec.items.filter((_, i) => i !== ii) } : sec
    ))
  }

  function updateItem(si: number, ii: number, field: 'q' | 'a', val: string) {
    setSections(s => s.map((sec, idx) =>
      idx === si
        ? { ...sec, items: sec.items.map((item, i) => i === ii ? { ...item, [field]: val } : item) }
        : sec
    ))
  }

  if (isLoading) return <div className="flex justify-center py-20"><Loader2Icon className="h-7 w-7 animate-spin text-gray-300" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Trang Hỏi đáp (FAQ)</h1>
          <p className="mt-0.5 text-sm text-gray-500">Quản lý các câu hỏi thường gặp theo chủ đề</p>
        </div>
        <button
          onClick={() => mutation.mutate({ sections })}
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

      <div className="space-y-3">
        {sections.map((sec, si) => (
          <div key={si} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
              <GripVerticalIcon className="h-4 w-4 shrink-0 text-gray-300 cursor-grab" />
              <button type="button" onClick={() => setOpenSection(openSection === si ? null : si)} className="shrink-0">
                {openSection === si
                  ? <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                  : <ChevronRightIcon className="h-4 w-4 text-gray-400" />}
              </button>
              <input
                value={sec.title}
                onChange={e => updateSectionTitle(si, e.target.value)}
                className="flex-1 text-sm font-semibold text-gray-800 outline-none bg-transparent"
                placeholder="Tên chủ đề"
              />
              <span className="shrink-0 text-xs text-gray-400">{sec.items.length} câu hỏi</span>
              <button type="button" onClick={() => removeSection(si)} className="shrink-0 text-gray-300 hover:text-red-400 transition">
                <Trash2Icon className="h-4 w-4" />
              </button>
            </div>

            {/* Items */}
            {openSection === si && (
              <div className="divide-y divide-gray-50 px-4">
                {sec.items.map((item, ii) => (
                  <div key={ii} className="py-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="mt-2.5 text-xs font-bold text-brand w-4 shrink-0">Q</span>
                      <input
                        value={item.q}
                        onChange={e => updateItem(si, ii, 'q', e.target.value)}
                        placeholder="Câu hỏi..."
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                      />
                      <button type="button" onClick={() => removeItem(si, ii)} className="mt-2 text-gray-300 hover:text-red-400 transition">
                        <Trash2Icon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-2.5 text-xs font-bold text-gray-400 w-4 shrink-0">A</span>
                      <textarea
                        value={item.a}
                        onChange={e => updateItem(si, ii, 'a', e.target.value)}
                        rows={2}
                        placeholder="Câu trả lời..."
                        className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                      />
                    </div>
                  </div>
                ))}
                <div className="py-3">
                  <button
                    type="button"
                    onClick={() => addItem(si)}
                    className="flex items-center gap-1.5 text-sm text-brand hover:text-brand/80 transition"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Thêm câu hỏi
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addSection}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-4 text-sm font-medium text-gray-400 transition hover:border-brand hover:text-brand"
      >
        <PlusIcon className="h-4 w-4" />
        Thêm chủ đề mới
      </button>
    </div>
  )
}
