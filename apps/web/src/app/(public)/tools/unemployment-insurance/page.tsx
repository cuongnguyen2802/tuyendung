'use client'

import { useState, useMemo } from 'react'
import { InfoIcon } from 'lucide-react'

const REGIONS = [
  { label: 'Vùng 1 (HCM, Hà Nội...)', min: 4960000 },
  { label: 'Vùng 2 (Đà Nẵng, Cần Thơ...)', min: 4410000 },
  { label: 'Vùng 3 (Tỉnh thành loại 2)', min: 3860000 },
  { label: 'Vùng 4 (Các tỉnh còn lại)', min: 3450000 },
]

function fmt(n: number) {
  return n.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + '₫'
}

export default function UnemploymentInsurancePage() {
  const [salary, setSalary]       = useState('')
  const [months, setMonths]       = useState('')
  const [regionIdx, setRegionIdx] = useState(0)

  const result = useMemo(() => {
    const s = parseFloat(salary.replace(/[^0-9]/g, '')) || 0
    const m = parseInt(months) || 0
    if (s <= 0 || m < 12) return null

    const region = REGIONS[regionIdx]
    const maxBenefit = 5 * region.min

    const monthly = Math.min(s * 0.6, maxBenefit)

    // Duration: 1 month per 12 months of insurance (max 12 months)
    // 12–35 months = 3 months; 36–71 = 6 months; 72–107 = 9 months; 108+ = 12 months
    let duration = 3
    if (m >= 36 && m < 72) duration = 6
    else if (m >= 72 && m < 108) duration = 9
    else if (m >= 108) duration = 12

    const total = monthly * duration

    return { monthly, duration, total, maxBenefit }
  }, [salary, months, regionIdx])

  return (
    <>
      <div className="border-b border-gray-100 bg-gradient-to-br from-brand/5 via-white to-emerald-50">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">Công cụ</p>
          <h1 className="mb-2 text-3xl font-extrabold text-gray-900">Tính trợ cấp thất nghiệp</h1>
          <p className="text-gray-500 text-sm">Ước tính mức hưởng trợ cấp thất nghiệp theo Luật Việc làm 2013.</p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Mức lương bình quân 6 tháng trước khi nghỉ (₫/tháng)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={salary}
              onChange={e => setSalary(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="15000000"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
            />
            <p className="mt-1 text-xs text-gray-400">Lương đóng BHXH, bao gồm lương cơ bản và các khoản phụ cấp tính vào BHXH.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Tổng thời gian đóng BHTN (tháng)</label>
            <input
              type="number"
              value={months}
              onChange={e => setMonths(e.target.value)}
              placeholder="36"
              min="12"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
            />
            <p className="mt-1 text-xs text-gray-400">Cần tối thiểu 12 tháng để được hưởng trợ cấp.</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Nơi làm việc</label>
            <select
              value={regionIdx}
              onChange={e => setRegionIdx(+e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
            >
              {REGIONS.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
            </select>
          </div>
        </div>

        {result ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">Kết quả ước tính</h2>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-400 mb-1">Mức hưởng/tháng</p>
                <p className="font-bold text-gray-800 text-sm">{fmt(result.monthly)}</p>
              </div>
              <div className="rounded-xl bg-brand/5 p-3">
                <p className="text-xs text-gray-400 mb-1">Số tháng hưởng</p>
                <p className="font-bold text-brand">{result.duration} tháng</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3">
                <p className="text-xs text-gray-400 mb-1">Tổng trợ cấp</p>
                <p className="font-extrabold text-emerald-700 text-sm">{fmt(result.total)}</p>
              </div>
            </div>

            <div className="text-sm text-gray-500 space-y-1.5 border-t border-gray-100 pt-4">
              <p>• Mức hưởng = 60% lương bình quân 6 tháng, tối đa 5× lương tối thiểu vùng ({fmt(result.maxBenefit)}/tháng).</p>
              <p>• Thời gian hưởng: 12–35 tháng → 3 tháng; 36–71 tháng → 6 tháng; 72–107 tháng → 9 tháng; ≥108 tháng → 12 tháng.</p>
              <p>• Nộp hồ sơ trong 3 tháng kể từ ngày chấm dứt hợp đồng lao động.</p>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
              <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>Kết quả chỉ mang tính chất tham khảo. Mức trợ cấp chính xác do Trung tâm Dịch vụ Việc làm xác định.</span>
            </div>
          </div>
        ) : months && parseInt(months) < 12 ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            Bạn cần đóng BHTN ít nhất 12 tháng liên tục mới đủ điều kiện hưởng trợ cấp thất nghiệp.
          </div>
        ) : null}

        {/* Steps */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-800">Thủ tục nhận trợ cấp thất nghiệp</h3>
          <ol className="space-y-3 text-sm text-gray-600">
            {[
              'Nộp hồ sơ tại Trung tâm Dịch vụ Việc làm trong vòng 3 tháng từ ngày nghỉ việc.',
              'Hồ sơ gồm: Đơn đề nghị, Quyết định thôi việc/hợp đồng hết hạn, Sổ BHXH, CCCD.',
              'Nhận quyết định hưởng trợ cấp trong 20 ngày làm việc.',
              'Nhận tiền qua tài khoản ngân hàng hoặc bưu điện hàng tháng.',
              'Thông báo tìm kiếm việc làm hàng tháng để tiếp tục được hưởng trợ cấp.',
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  )
}
