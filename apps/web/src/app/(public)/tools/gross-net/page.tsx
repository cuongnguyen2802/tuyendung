'use client'

import { useState, useMemo } from 'react'
import { InfoIcon } from 'lucide-react'

const REGIONS = [
  { label: 'Vùng 1 (HCM, Hà Nội...)', min: 4960000 },
  { label: 'Vùng 2 (Đà Nẵng, Cần Thơ...)', min: 4410000 },
  { label: 'Vùng 3 (Tỉnh thành loại 2)', min: 3860000 },
  { label: 'Vùng 4 (Các tỉnh còn lại)', min: 3450000 },
]

const TAX_BRACKETS = [
  { from: 0,         to: 5_000_000,  rate: 0.05 },
  { from: 5_000_000, to: 10_000_000, rate: 0.10 },
  { from: 10_000_000,to: 18_000_000, rate: 0.15 },
  { from: 18_000_000,to: 32_000_000, rate: 0.20 },
  { from: 32_000_000,to: 52_000_000, rate: 0.25 },
  { from: 52_000_000,to: 80_000_000, rate: 0.30 },
  { from: 80_000_000,to: Infinity,   rate: 0.35 },
]

function calcPersonalIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0
  let tax = 0
  for (const b of TAX_BRACKETS) {
    if (taxableIncome <= b.from) break
    const chunk = Math.min(taxableIncome, b.to) - b.from
    tax += chunk * b.rate
  }
  return tax
}

function fmt(n: number) {
  return n.toLocaleString('vi-VN') + '₫'
}

export default function GrossNetPage() {
  const [gross, setGross]         = useState('')
  const [regionIdx, setRegionIdx] = useState(0)
  const [dependents, setDependents] = useState(0)

  const result = useMemo(() => {
    const g = parseFloat(gross.replace(/\./g, '').replace(/,/g, '')) || 0
    if (g <= 0) return null

    const region = REGIONS[regionIdx]
    const socialBase = Math.min(g, 20 * region.min)

    const bhxh = socialBase * 0.08
    const bhyt = socialBase * 0.015
    const bhtn = socialBase * 0.01
    const totalInsurance = bhxh + bhyt + bhtn

    const PERSONAL_DEDUCTION = 11_000_000
    const DEPENDENT_DEDUCTION = 4_400_000 * dependents
    const assessableIncome = g - totalInsurance
    const taxableIncome = Math.max(0, assessableIncome - PERSONAL_DEDUCTION - DEPENDENT_DEDUCTION)
    const pit = calcPersonalIncomeTax(taxableIncome)

    const net = g - totalInsurance - pit

    return { g, bhxh, bhyt, bhtn, totalInsurance, assessableIncome, taxableIncome, pit, net }
  }, [gross, regionIdx, dependents])

  return (
    <>
      <div className="border-b border-gray-100 bg-gradient-to-br from-brand/5 via-white to-emerald-50">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">Công cụ</p>
          <h1 className="mb-2 text-3xl font-extrabold text-gray-900">Tính lương Gross → Net</h1>
          <p className="text-gray-500 text-sm">Tính nhanh lương thực nhận sau bảo hiểm và thuế TNCN theo quy định 2024.</p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Lương Gross (₫/tháng)</label>
            <input
              type="text"
              inputMode="numeric"
              value={gross}
              onChange={e => setGross(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Ví dụ: 20000000"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Vùng lương</label>
            <select
              value={regionIdx}
              onChange={e => setRegionIdx(+e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
            >
              {REGIONS.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Số người phụ thuộc <span className="font-normal text-gray-400">(mỗi người giảm trừ 4.400.000₫)</span>
            </label>
            <select
              value={dependents}
              onChange={e => setDependents(+e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
            >
              {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n} người</option>)}
            </select>
          </div>
        </div>

        {result && (
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-gray-900">Kết quả tính toán</h2>

            <div className="space-y-2 text-sm">
              <Row label="Lương Gross" value={fmt(result.g)} />
              <div className="border-t border-dashed border-gray-100 pt-2">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Bảo hiểm (người lao động đóng)</p>
                <Row label="BHXH (8%)" value={`– ${fmt(result.bhxh)}`} muted />
                <Row label="BHYT (1,5%)" value={`– ${fmt(result.bhyt)}`} muted />
                <Row label="BHTN (1%)" value={`– ${fmt(result.bhtn)}`} muted />
              </div>
              <Row label="Thu nhập chịu thuế" value={fmt(result.taxableIncome)} />
              <Row label="Thuế TNCN" value={`– ${fmt(result.pit)}`} muted />
            </div>

            <div className="rounded-xl bg-brand/5 p-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">Lương Net thực nhận</span>
                <span className="text-xl font-extrabold text-brand">{fmt(result.net)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
              <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>Kết quả mang tính tham khảo. Thuế thực tế có thể khác do phụ cấp, thu nhập khác hoặc quyết toán cuối năm.</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={muted ? 'text-gray-400' : 'text-gray-600'}>{label}</span>
      <span className={`font-medium tabular-nums ${muted ? 'text-gray-400' : 'text-gray-800'}`}>{value}</span>
    </div>
  )
}
