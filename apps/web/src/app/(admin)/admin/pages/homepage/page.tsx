'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PlusIcon, Trash2Icon, SaveIcon, CheckIcon, Loader2Icon } from 'lucide-react'

interface HowItWorksStep { step: string; title: string; desc: string }
interface EmployerStat  { value: string; label: string }

interface HomepageData {
  badge:             string
  headline:          string
  headlineHighlight: string
  subheadline:       string
  popularSearches:   string[]
  howItWorks:        HowItWorksStep[]
  employerBenefits:  string[]
  employerStats:     EmployerStat[]
}

const DEFAULT: HomepageData = {
  badge:             'Nền tảng tuyển dụng tin cậy tại Việt Nam',
  headline:          'Tìm được việc làm',
  headlineHighlight: 'mơ ước của bạn',
  subheadline:       'Kết nối hàng nghìn ứng viên tài năng với những cơ hội nghề nghiệp tốt nhất tại Việt Nam',
  popularSearches:   ['Frontend Developer', 'Marketing Manager', 'Kế toán', 'Nhân sự', 'Remote', 'Product Manager'],
  howItWorks: [
    { step: '01', title: 'Tạo hồ sơ chuyên nghiệp',   desc: 'Điền thông tin, kỹ năng và kinh nghiệm. Upload CV hoặc tạo CV trực tuyến ngay trên nền tảng chỉ trong vài phút.' },
    { step: '02', title: 'Khám phá cơ hội phù hợp',    desc: 'Tìm kiếm theo ngành nghề, địa điểm, mức lương. Lưu việc yêu thích và nhận thông báo việc làm mới mỗi ngày.' },
    { step: '03', title: 'Ứng tuyển & thành công',      desc: 'Nộp đơn chỉ trong vài cú click. Theo dõi trạng thái ứng tuyển và nhận phản hồi trực tiếp từ nhà tuyển dụng.' },
  ],
  employerBenefits: [
    'Đăng tin tuyển dụng miễn phí, không giới hạn ứng viên',
    'Tiếp cận 500,000+ ứng viên đang tích cực tìm việc',
    'Công cụ lọc CV thông minh, tiết kiệm thời gian sàng lọc',
    'Quản lý toàn bộ quy trình tuyển dụng tập trung một nơi',
  ],
  employerStats: [
    { value: '500K+',  label: 'Ứng viên tiềm năng' },
    { value: '2,000+', label: 'Doanh nghiệp tin dùng' },
    { value: '85%',    label: 'Tìm được ứng viên trong 7 ngày' },
    { value: '4.8★',   label: 'Đánh giá từ nhà tuyển dụng' },
  ],
}

const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand'

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-3">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {desc && <p className="mt-0.5 text-xs text-gray-400">{desc}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export default function AdminHomepagePage() {
  const qc = useQueryClient()
  const [data, setData] = useState<HomepageData>(DEFAULT)
  const [saved, setSaved] = useState(false)

  const { data: fetched, isLoading } = useQuery({
    queryKey: ['admin-page', 'homepage'],
    queryFn: () => api.get('/admin/pages/homepage'),
  })

  useEffect(() => {
    if (fetched) setData({ ...DEFAULT, ...fetched })
  }, [fetched])

  const mutation = useMutation({
    mutationFn: (d: HomepageData) => api.put('/admin/pages/homepage', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pages'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  function set<K extends keyof HomepageData>(field: K, val: HomepageData[K]) {
    setData(d => ({ ...d, [field]: val }))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2Icon className="h-7 w-7 animate-spin text-gray-300" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Trang chủ</h1>
          <p className="mt-0.5 text-sm text-gray-500">Hero, từ khóa tìm nhiều, quy trình tìm việc và lợi ích nhà tuyển dụng</p>
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
      <Section title="Hero" desc="Phần đầu trang — banner chính">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Badge (dòng nhỏ phía trên tiêu đề)</label>
            <input value={data.badge} onChange={e => set('badge', e.target.value)} className={inputCls} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Tiêu đề chính</label>
              <input value={data.headline} onChange={e => set('headline', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">Phần highlight (màu xanh)</label>
              <input value={data.headlineHighlight} onChange={e => set('headlineHighlight', e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Phụ đề</label>
            <textarea value={data.subheadline} onChange={e => set('subheadline', e.target.value)} rows={2} className={inputCls + ' resize-none'} />
          </div>
        </div>
      </Section>

      {/* Popular searches */}
      <Section title="Từ khóa tìm nhiều" desc="Các tag hiển thị bên dưới thanh tìm kiếm">
        <div className="space-y-2">
          {data.popularSearches.map((tag, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={tag}
                onChange={e => set('popularSearches', data.popularSearches.map((t, idx) => idx === i ? e.target.value : t))}
                placeholder="Từ khóa..."
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => set('popularSearches', data.popularSearches.filter((_, idx) => idx !== i))}
                className="shrink-0 text-gray-300 hover:text-red-400 transition"
              >
                <Trash2Icon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set('popularSearches', [...data.popularSearches, ''])}
            className="flex items-center gap-1.5 text-sm text-brand hover:text-brand/80 transition"
          >
            <PlusIcon className="h-4 w-4" /> Thêm từ khóa
          </button>
        </div>
      </Section>

      {/* How it works */}
      <Section title="Quy trình tìm việc" desc="3 bước hướng dẫn ứng viên">
        <div className="space-y-4">
          {data.howItWorks.map((step, i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-10 items-center justify-center rounded-lg bg-brand/10 text-xs font-bold text-brand">
                  {step.step}
                </span>
                <span className="text-xs font-semibold text-gray-500">Bước {i + 1}</span>
              </div>
              <div className="space-y-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Tiêu đề</label>
                  <input
                    value={step.title}
                    onChange={e => set('howItWorks', data.howItWorks.map((s, idx) => idx === i ? { ...s, title: e.target.value } : s))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-500">Mô tả</label>
                  <textarea
                    value={step.desc}
                    onChange={e => set('howItWorks', data.howItWorks.map((s, idx) => idx === i ? { ...s, desc: e.target.value } : s))}
                    rows={2}
                    className={inputCls + ' resize-none'}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Employer benefits */}
      <Section title="Lợi ích cho nhà tuyển dụng" desc="Danh sách bullet points trong section tuyển dụng cùng chúng tôi">
        <div className="space-y-2">
          {data.employerBenefits.map((benefit, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={benefit}
                onChange={e => set('employerBenefits', data.employerBenefits.map((b, idx) => idx === i ? e.target.value : b))}
                placeholder="Lợi ích..."
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => set('employerBenefits', data.employerBenefits.filter((_, idx) => idx !== i))}
                className="shrink-0 text-gray-300 hover:text-red-400 transition"
              >
                <Trash2Icon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set('employerBenefits', [...data.employerBenefits, ''])}
            className="flex items-center gap-1.5 text-sm text-brand hover:text-brand/80 transition"
          >
            <PlusIcon className="h-4 w-4" /> Thêm lợi ích
          </button>
        </div>
      </Section>

      {/* Employer stats */}
      <Section title="Số liệu nhà tuyển dụng" desc="4 chỉ số hiển thị dạng card trong section NTD">
        <div className="space-y-2">
          {data.employerStats.map((stat, i) => (
            <div key={i} className="grid grid-cols-[120px_1fr_36px] gap-2 items-center">
              <input
                value={stat.value}
                onChange={e => set('employerStats', data.employerStats.map((s, idx) => idx === i ? { ...s, value: e.target.value } : s))}
                placeholder="500K+"
                className={inputCls + ' text-center font-bold'}
              />
              <input
                value={stat.label}
                onChange={e => set('employerStats', data.employerStats.map((s, idx) => idx === i ? { ...s, label: e.target.value } : s))}
                placeholder="Nhãn hiển thị"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => set('employerStats', data.employerStats.filter((_, idx) => idx !== i))}
                className="text-gray-300 hover:text-red-400 transition"
              >
                <Trash2Icon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set('employerStats', [...data.employerStats, { value: '', label: '' }])}
            className="flex items-center gap-1.5 text-sm text-brand hover:text-brand/80 transition"
          >
            <PlusIcon className="h-4 w-4" /> Thêm số liệu
          </button>
        </div>
      </Section>
    </div>
  )
}
