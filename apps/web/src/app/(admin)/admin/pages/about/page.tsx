'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PlusIcon, Trash2Icon, SaveIcon, CheckIcon, Loader2Icon } from 'lucide-react'

interface Stat  { label: string; value: string }
interface TimelineItem { year: string; event: string }
interface Value  { icon: string; title: string; desc: string }

interface AboutData {
  headline: string
  subheadline: string
  stats: Stat[]
  story: string
  timeline: TimelineItem[]
  values: Value[]
}

const DEFAULT: AboutData = {
  headline: 'Kết nối tài năng với cơ hội',
  subheadline: 'Nền tảng tuyển dụng hàng đầu Việt Nam',
  stats: [
    { label: 'Ứng viên', value: '2M+' },
    { label: 'Nhà tuyển dụng', value: '50K+' },
    { label: 'Tin đăng / tháng', value: '100K+' },
    { label: 'Tỉnh thành', value: '63' },
  ],
  story: 'TuyenDung.vn được thành lập năm 2020 với sứ mệnh...',
  timeline: [
    { year: '2020', event: 'Thành lập và ra mắt phiên bản Beta' },
    { year: '2021', event: 'Đạt 500,000 ứng viên đăng ký' },
    { year: '2022', event: 'Mở rộng đến 63 tỉnh thành toàn quốc' },
    { year: '2023', event: 'Ra mắt ứng dụng di động' },
  ],
  values: [
    { icon: '🎯', title: 'Sứ mệnh rõ ràng', desc: 'Kết nối đúng người với đúng cơ hội' },
    { icon: '🤝', title: 'Tin tưởng lẫn nhau', desc: 'Minh bạch, trung thực trong mọi giao dịch' },
    { icon: '💡', title: 'Đổi mới liên tục', desc: 'Ứng dụng công nghệ để cải thiện trải nghiệm' },
  ],
}

const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand'

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 px-5 py-3">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function AdminAboutPage() {
  const qc = useQueryClient()
  const [data, setData] = useState<AboutData>(DEFAULT)
  const [saved, setSaved] = useState(false)

  const { data: fetched, isLoading } = useQuery({
    queryKey: ['admin-page', 'about'],
    queryFn: () => api.get('/admin/pages/about'),
  })

  useEffect(() => {
    if (fetched) setData({ ...DEFAULT, ...fetched })
  }, [fetched])

  const mutation = useMutation({
    mutationFn: (d: AboutData) => api.put('/admin/pages/about', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pages'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  function set<K extends keyof AboutData>(field: K, val: AboutData[K]) {
    setData(d => ({ ...d, [field]: val }))
  }

  if (isLoading) return <div className="flex justify-center py-20"><Loader2Icon className="h-7 w-7 animate-spin text-gray-300" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Trang Giới thiệu</h1>
          <p className="mt-0.5 text-sm text-gray-500">Câu chuyện, số liệu và giá trị cốt lõi</p>
        </div>
        <button
          onClick={() => mutation.mutate(data)}
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

      {/* Hero */}
      <Section title="Hero" desc="Tiêu đề hiển thị đầu trang">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Tiêu đề chính</label>
            <input value={data.headline} onChange={e => set('headline', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Phụ đề</label>
            <input value={data.subheadline} onChange={e => set('subheadline', e.target.value)} className={inputCls} />
          </div>
        </div>
      </Section>

      {/* Stats */}
      <Section title="Số liệu nổi bật" desc="4 con số hiển thị dạng card grid">
        <div className="space-y-2">
          {data.stats.map((stat, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_36px] gap-2 items-center">
              <input value={stat.value} onChange={e => set('stats', data.stats.map((s, idx) => idx === i ? { ...s, value: e.target.value } : s))} placeholder="2M+" className={inputCls} />
              <input value={stat.label} onChange={e => set('stats', data.stats.map((s, idx) => idx === i ? { ...s, label: e.target.value } : s))} placeholder="Ứng viên" className={inputCls} />
              <button type="button" onClick={() => set('stats', data.stats.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-400 transition">
                <Trash2Icon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => set('stats', [...data.stats, { value: '', label: '' }])} className="flex items-center gap-1.5 text-sm text-brand hover:text-brand/80 transition">
            <PlusIcon className="h-4 w-4" />Thêm số liệu
          </button>
        </div>
      </Section>

      {/* Story */}
      <Section title="Câu chuyện" desc="Đoạn văn giới thiệu lịch sử công ty">
        <textarea
          value={data.story}
          onChange={e => set('story', e.target.value)}
          rows={6}
          className={inputCls + ' resize-none'}
        />
      </Section>

      {/* Timeline */}
      <Section title="Dòng thời gian" desc="Các mốc phát triển theo năm">
        <div className="space-y-2">
          {data.timeline.map((item, i) => (
            <div key={i} className="grid grid-cols-[80px_1fr_36px] gap-2 items-center">
              <input value={item.year} onChange={e => set('timeline', data.timeline.map((t, idx) => idx === i ? { ...t, year: e.target.value } : t))} placeholder="2024" className={inputCls} />
              <input value={item.event} onChange={e => set('timeline', data.timeline.map((t, idx) => idx === i ? { ...t, event: e.target.value } : t))} placeholder="Sự kiện..." className={inputCls} />
              <button type="button" onClick={() => set('timeline', data.timeline.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-400 transition">
                <Trash2Icon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => set('timeline', [...data.timeline, { year: '', event: '' }])} className="flex items-center gap-1.5 text-sm text-brand hover:text-brand/80 transition">
            <PlusIcon className="h-4 w-4" />Thêm mốc thời gian
          </button>
        </div>
      </Section>

      {/* Values */}
      <Section title="Giá trị cốt lõi" desc="Icon + tiêu đề + mô tả">
        <div className="space-y-3">
          {data.values.map((v, i) => (
            <div key={i} className="grid grid-cols-[60px_1fr_2fr_36px] gap-2 items-center">
              <input value={v.icon} onChange={e => set('values', data.values.map((val, idx) => idx === i ? { ...val, icon: e.target.value } : val))} placeholder="🎯" className={inputCls + ' text-center text-lg'} />
              <input value={v.title} onChange={e => set('values', data.values.map((val, idx) => idx === i ? { ...val, title: e.target.value } : val))} placeholder="Tiêu đề" className={inputCls} />
              <input value={v.desc} onChange={e => set('values', data.values.map((val, idx) => idx === i ? { ...val, desc: e.target.value } : val))} placeholder="Mô tả" className={inputCls} />
              <button type="button" onClick={() => set('values', data.values.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-400 transition">
                <Trash2Icon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => set('values', [...data.values, { icon: '✨', title: '', desc: '' }])} className="flex items-center gap-1.5 text-sm text-brand hover:text-brand/80 transition">
            <PlusIcon className="h-4 w-4" />Thêm giá trị
          </button>
        </div>
      </Section>
    </div>
  )
}
