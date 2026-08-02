'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUpIcon, MapPinIcon, BriefcaseIcon, ArrowRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Static salary data (VNĐ/tháng, ×1000) ────────────────────────────────────

const INDUSTRIES: Record<string, { label: string; base: [number, number, number] }> = {
  it:        { label: 'Công nghệ thông tin / Phần mềm', base: [10000, 22000, 50000] },
  marketing: { label: 'Marketing / Truyền thông',       base: [8000,  15000, 32000] },
  finance:   { label: 'Tài chính / Ngân hàng',          base: [9000,  18000, 40000] },
  sales:     { label: 'Kinh doanh / Bán hàng',          base: [7000,  14000, 30000] },
  hr:        { label: 'Nhân sự / Hành chính',           base: [7000,  13000, 25000] },
  accounting:{ label: 'Kế toán / Kiểm toán',           base: [7000,  12000, 22000] },
  design:    { label: 'Thiết kế / Đồ họa',             base: [8000,  16000, 35000] },
  logistics: { label: 'Vận tải / Logistics',            base: [7000,  12000, 22000] },
  healthcare:{ label: 'Y tế / Dược phẩm',              base: [9000,  18000, 40000] },
  education: { label: 'Giáo dục / Đào tạo',            base: [6000,  11000, 20000] },
  legal:     { label: 'Pháp lý / Luật',                base: [10000, 20000, 45000] },
  pm:        { label: 'Quản lý dự án / PM',             base: [12000, 25000, 55000] },
}

const EXP_LEVELS = [
  { value: 'intern',  label: 'Thực tập sinh', mult: [0.4, 0.5, 0.55] },
  { value: 'entry',   label: 'Mới ra trường (0–1 năm)', mult: [0.7, 0.8, 0.85] },
  { value: 'junior',  label: 'Junior (1–3 năm)', mult: [0.9, 1.0, 1.1] },
  { value: 'mid',     label: 'Mid-level (3–5 năm)', mult: [1.2, 1.4, 1.5] },
  { value: 'senior',  label: 'Senior (5–8 năm)', mult: [1.7, 2.0, 2.3] },
  { value: 'lead',    label: 'Lead / Manager (8+ năm)', mult: [2.2, 2.8, 3.5] },
]

const LOCATIONS = [
  { value: 'hcm',   label: 'TP. Hồ Chí Minh', mult: 1.2 },
  { value: 'hanoi', label: 'Hà Nội',           mult: 1.15 },
  { value: 'dn',    label: 'Đà Nẵng',          mult: 0.95 },
  { value: 'other', label: 'Tỉnh/thành khác', mult: 0.82 },
]

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}tr`
  return `${n}k`
}

function fmtFull(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n * 1000) + ' đ'
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SalaryToolPage() {
  const [industry, setIndustry] = useState('')
  const [exp, setExp]           = useState('')
  const [location, setLocation] = useState('hcm')
  const [result, setResult]     = useState<null | { min: number; mid: number; max: number }>(null)

  function calculate() {
    if (!industry || !exp) return
    const ind   = INDUSTRIES[industry]
    const expLv = EXP_LEVELS.find(e => e.value === exp)!
    const locMt = LOCATIONS.find(l => l.value === location)!.mult
    setResult({
      min: Math.round(ind.base[0] * expLv.mult[0] * locMt),
      mid: Math.round(ind.base[1] * expLv.mult[1] * locMt),
      max: Math.round(ind.base[2] * expLv.mult[2] * locMt),
    })
  }

  const pct = result ? {
    min: 0,
    mid: Math.round(((result.mid - result.min) / (result.max - result.min)) * 100),
    max: 100,
  } : null

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#042616] to-[#0a3d20] py-14 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold">
            <TrendingUpIcon className="h-3.5 w-3.5 text-emerald-400" />
            Công cụ miễn phí
          </div>
          <h1 className="mb-3 text-3xl font-extrabold md:text-4xl">Tra cứu mức lương thị trường</h1>
          <p className="text-white/60">
            Khám phá mức lương theo ngành nghề, kinh nghiệm và địa điểm để thương lượng lương tốt hơn
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Form */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-gray-900">Nhập thông tin của bạn</h2>

          <div className="space-y-5">
            {/* Industry */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                <BriefcaseIcon className="mr-1.5 inline h-4 w-4 text-gray-400" />
                Ngành nghề <span className="text-red-500">*</span>
              </label>
              <select
                value={industry}
                onChange={e => { setIndustry(e.target.value); setResult(null) }}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                <option value="">-- Chọn ngành nghề --</option>
                {Object.entries(INDUSTRIES).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Kinh nghiệm làm việc <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {EXP_LEVELS.map(e => (
                  <button
                    key={e.value}
                    onClick={() => { setExp(e.value); setResult(null) }}
                    className={cn(
                      'rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition',
                      exp === e.value
                        ? 'border-brand bg-brand/5 text-brand'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300',
                    )}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                <MapPinIcon className="mr-1.5 inline h-4 w-4 text-gray-400" />
                Địa điểm làm việc
              </label>
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.map(l => (
                  <button
                    key={l.value}
                    onClick={() => { setLocation(l.value); setResult(null) }}
                    className={cn(
                      'rounded-xl border px-4 py-2 text-sm font-medium transition',
                      location === l.value
                        ? 'border-brand bg-brand/5 text-brand'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300',
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={calculate}
              disabled={!industry || !exp}
              className="w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition hover:bg-brand/90 disabled:opacity-50"
            >
              Xem mức lương tham khảo
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-lg font-bold text-gray-900">Mức lương tham khảo</h2>
            <p className="mb-6 text-sm text-gray-500">
              {INDUSTRIES[industry]?.label} · {EXP_LEVELS.find(e => e.value === exp)?.label} ·{' '}
              {LOCATIONS.find(l => l.value === location)?.label}
            </p>

            {/* Bar visualization */}
            <div className="mb-6 grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Tối thiểu', value: result.min, color: 'bg-blue-100 text-blue-700' },
                { label: 'Phổ biến',  value: result.mid, color: 'bg-brand/10 text-brand' },
                { label: 'Cao nhất', value: result.max, color: 'bg-emerald-100 text-emerald-700' },
              ].map(({ label, value, color }) => (
                <div key={label} className={cn('rounded-2xl p-4', color)}>
                  <div className="text-xl font-extrabold">{fmt(value)}</div>
                  <div className="mt-0.5 text-xs font-semibold">{label}</div>
                  <div className="mt-1 text-[11px] opacity-70">{fmtFull(value)}/tháng</div>
                </div>
              ))}
            </div>

            {/* Gradient bar */}
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-gradient-to-r from-blue-200 via-brand/60 to-emerald-300">
              <div
                className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-brand shadow-md"
                style={{ left: `${pct!.mid}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-gray-400">
              <span>{fmt(result.min)}</span>
              <span className="font-semibold text-brand">{fmt(result.mid)} (trung bình)</span>
              <span>{fmt(result.max)}</span>
            </div>

            <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
              ⚠️ Dữ liệu mang tính tham khảo, dựa trên khảo sát thị trường lao động Việt Nam 2025. Mức lương thực tế có thể khác tùy công ty và kỹ năng cụ thể.
            </p>

            <div className="mt-5 flex gap-3">
              <Link
                href={`/jobs?industry=${industry}`}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white hover:bg-brand/90"
              >
                Tìm việc ngành này <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setResult(null)}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Tính lại
              </button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6">
          <h3 className="mb-4 font-bold text-gray-900">Mẹo thương lượng lương hiệu quả</h3>
          <ul className="space-y-3">
            {[
              'Nghiên cứu mức lương thị trường trước khi phỏng vấn để tự tin khi thảo luận.',
              'Đừng nêu mức lương mong muốn trước, hãy để nhà tuyển dụng đề xuất trước.',
              'Liệt kê giá trị bạn mang lại: kỹ năng đặc biệt, dự án thành công, chứng chỉ.',
              'Xem xét tổng thể: lương cứng + thưởng + bảo hiểm + phúc lợi + lộ trình thăng tiến.',
              'Thương lượng qua email sau buổi offer để có thời gian suy nghĩ kỹ hơn.',
            ].map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-600">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-[11px] font-bold text-brand">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
