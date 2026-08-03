'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  PlusIcon, Trash2Icon, SaveIcon, CheckIcon, Loader2Icon,
} from 'lucide-react'

interface PricingFeature { text: string; included: boolean }
interface PricingPlan {
  name: string
  price: string
  period: string
  description: string
  badge: string
  highlighted: boolean
  features: PricingFeature[]
  cta: string
}

const DEFAULT_PLANS: PricingPlan[] = [
  {
    name: 'Miễn phí',
    price: '0',
    period: 'mãi mãi',
    description: 'Dành cho nhà tuyển dụng mới bắt đầu',
    badge: '',
    highlighted: false,
    features: [
      { text: '3 tin tuyển dụng / tháng', included: true },
      { text: 'Tìm kiếm ứng viên cơ bản', included: true },
      { text: 'Không hỗ trợ ưu tiên', included: false },
    ],
    cta: 'Bắt đầu miễn phí',
  },
  {
    name: 'Pro',
    price: '799.000',
    period: 'tháng',
    description: 'Dành cho doanh nghiệp đang tăng trưởng',
    badge: 'Phổ biến',
    highlighted: true,
    features: [
      { text: 'Tin tuyển dụng không giới hạn', included: true },
      { text: 'Nổi bật trong kết quả tìm kiếm', included: true },
      { text: 'Hỗ trợ qua chat', included: true },
    ],
    cta: 'Dùng thử 7 ngày',
  },
  {
    name: 'Enterprise',
    price: 'Liên hệ',
    period: '',
    description: 'Giải pháp toàn diện cho tập đoàn',
    badge: '',
    highlighted: false,
    features: [
      { text: 'Mọi tính năng Pro', included: true },
      { text: 'Account Manager riêng', included: true },
      { text: 'Tích hợp ATS', included: true },
    ],
    cta: 'Liên hệ tư vấn',
  },
]

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand'

export default function AdminPricingPage() {
  const qc = useQueryClient()
  const [plans, setPlans] = useState<PricingPlan[]>(DEFAULT_PLANS)
  const [saved, setSaved] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-page', 'pricing'],
    queryFn: () => api.get('/admin/pages/pricing'),
  })

  useEffect(() => {
    if (data?.plans) setPlans(data.plans)
  }, [data])

  const mutation = useMutation({
    mutationFn: (d: { plans: PricingPlan[] }) => api.put('/admin/pages/pricing', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pages'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  function updatePlan(i: number, field: keyof PricingPlan, val: unknown) {
    setPlans(p => p.map((plan, idx) => idx === i ? { ...plan, [field]: val } : plan))
  }

  function addFeature(pi: number) {
    setPlans(p => p.map((plan, idx) =>
      idx === pi ? { ...plan, features: [...plan.features, { text: '', included: true }] } : plan
    ))
  }

  function updateFeature(pi: number, fi: number, field: 'text' | 'included', val: string | boolean) {
    setPlans(p => p.map((plan, idx) =>
      idx === pi
        ? { ...plan, features: plan.features.map((f, i) => i === fi ? { ...f, [field]: val } : f) }
        : plan
    ))
  }

  function removeFeature(pi: number, fi: number) {
    setPlans(p => p.map((plan, idx) =>
      idx === pi ? { ...plan, features: plan.features.filter((_, i) => i !== fi) } : plan
    ))
  }

  function addPlan() {
    setPlans(p => [...p, { name: 'Gói mới', price: '0', period: 'tháng', description: '', badge: '', highlighted: false, features: [], cta: 'Đăng ký' }])
  }

  function removePlan(i: number) {
    setPlans(p => p.filter((_, idx) => idx !== i))
  }

  if (isLoading) return <div className="flex justify-center py-20"><Loader2Icon className="h-7 w-7 animate-spin text-gray-300" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Trang Bảng giá</h1>
          <p className="mt-0.5 text-sm text-gray-500">Quản lý các gói dịch vụ dành cho nhà tuyển dụng</p>
        </div>
        <button
          onClick={() => mutation.mutate({ plans })}
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

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan, pi) => (
          <div key={pi} className={`rounded-2xl border bg-white p-5 shadow-sm space-y-4 ${plan.highlighted ? 'border-brand ring-1 ring-brand' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Gói #{pi + 1}</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={plan.highlighted}
                    onChange={e => updatePlan(pi, 'highlighted', e.target.checked)}
                    className="accent-brand"
                  />
                  Nổi bật
                </label>
                <button type="button" onClick={() => removePlan(pi)} className="text-gray-300 hover:text-red-400 transition">
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <Field label="Tên gói">
              <input value={plan.name} onChange={e => updatePlan(pi, 'name', e.target.value)} className={inputCls} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Giá">
                <input value={plan.price} onChange={e => updatePlan(pi, 'price', e.target.value)} placeholder="799.000" className={inputCls} />
              </Field>
              <Field label="Chu kỳ">
                <input value={plan.period} onChange={e => updatePlan(pi, 'period', e.target.value)} placeholder="tháng" className={inputCls} />
              </Field>
            </div>

            <Field label="Mô tả ngắn">
              <input value={plan.description} onChange={e => updatePlan(pi, 'description', e.target.value)} className={inputCls} />
            </Field>

            <Field label="Badge (để trống nếu không có)">
              <input value={plan.badge} onChange={e => updatePlan(pi, 'badge', e.target.value)} placeholder="Phổ biến" className={inputCls} />
            </Field>

            <Field label="Text nút CTA">
              <input value={plan.cta} onChange={e => updatePlan(pi, 'cta', e.target.value)} className={inputCls} />
            </Field>

            <Field label="Tính năng">
              <div className="space-y-1.5">
                {plan.features.map((f, fi) => (
                  <div key={fi} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={f.included}
                      onChange={e => updateFeature(pi, fi, 'included', e.target.checked)}
                      className="accent-brand shrink-0"
                    />
                    <input
                      value={f.text}
                      onChange={e => updateFeature(pi, fi, 'text', e.target.value)}
                      placeholder="Tính năng..."
                      className="flex-1 rounded-md border border-gray-200 px-2 py-1 text-xs outline-none focus:border-brand"
                    />
                    <button type="button" onClick={() => removeFeature(pi, fi)} className="text-gray-300 hover:text-red-400 transition">
                      <Trash2Icon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addFeature(pi)} className="flex items-center gap-1 text-xs text-brand hover:text-brand/80 transition">
                  <PlusIcon className="h-3 w-3" />
                  Thêm tính năng
                </button>
              </div>
            </Field>
          </div>
        ))}

        <button
          type="button"
          onClick={addPlan}
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 min-h-[200px] text-sm font-medium text-gray-400 transition hover:border-brand hover:text-brand"
        >
          <PlusIcon className="h-4 w-4" />
          Thêm gói mới
        </button>
      </div>
    </div>
  )
}
