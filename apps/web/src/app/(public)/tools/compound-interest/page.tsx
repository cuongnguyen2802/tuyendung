'use client'

import { useState, useMemo } from 'react'

function fmt(n: number) {
  return n.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + '₫'
}

export default function CompoundInterestPage() {
  const [principal, setPrincipal]   = useState('')
  const [rate, setRate]             = useState('')
  const [years, setYears]           = useState('')
  const [freq, setFreq]             = useState('12')

  const result = useMemo(() => {
    const P = parseFloat(principal.replace(/[^0-9.]/g, '')) || 0
    const r = parseFloat(rate) / 100 || 0
    const t = parseFloat(years) || 0
    const n = parseInt(freq) || 12
    if (P <= 0 || r <= 0 || t <= 0) return null

    const A = P * Math.pow(1 + r / n, n * t)
    const interest = A - P

    const rows: { year: number; balance: number; totalInterest: number }[] = []
    for (let y = 1; y <= t; y++) {
      const balance = P * Math.pow(1 + r / n, n * y)
      rows.push({ year: y, balance, totalInterest: balance - P })
    }

    return { A, interest, rows }
  }, [principal, rate, years, freq])

  return (
    <>
      <div className="border-b border-gray-100 bg-gradient-to-br from-brand/5 via-white to-emerald-50">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">Công cụ</p>
          <h1 className="mb-2 text-3xl font-extrabold text-gray-900">Tính lãi suất kép</h1>
          <p className="text-gray-500 text-sm">Mô phỏng tăng trưởng vốn theo thời gian với lãi suất kép.</p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Vốn ban đầu (₫)</label>
              <input
                type="text"
                inputMode="numeric"
                value={principal}
                onChange={e => setPrincipal(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="100000000"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Lãi suất hàng năm (%)</label>
              <input
                type="number"
                value={rate}
                onChange={e => setRate(e.target.value)}
                placeholder="6"
                min="0"
                step="0.1"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Thời gian (năm)</label>
              <input
                type="number"
                value={years}
                onChange={e => setYears(e.target.value)}
                placeholder="10"
                min="1"
                max="50"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">Tần suất ghép lãi</label>
              <select
                value={freq}
                onChange={e => setFreq(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
              >
                <option value="1">Hàng năm</option>
                <option value="2">Nửa năm</option>
                <option value="4">Hàng quý</option>
                <option value="12">Hàng tháng</option>
              </select>
            </div>
          </div>
        </div>

        {result && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm text-center">
                <p className="text-xs text-gray-400 mb-1">Vốn ban đầu</p>
                <p className="font-bold text-gray-800 text-sm">{fmt(parseFloat(principal) || 0)}</p>
              </div>
              <div className="rounded-xl border border-brand/20 bg-brand/5 p-4 shadow-sm text-center">
                <p className="text-xs text-gray-400 mb-1">Tiền lãi cộng dồn</p>
                <p className="font-bold text-brand text-sm">{fmt(result.interest)}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm text-center">
                <p className="text-xs text-gray-400 mb-1">Tổng tích lũy</p>
                <p className="font-extrabold text-emerald-700">{fmt(result.A)}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-gray-100 px-5 py-3">
                <h3 className="font-semibold text-sm text-gray-800">Bảng tăng trưởng theo năm</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500">
                      <th className="py-2.5 pl-5 pr-3 text-left font-semibold">Năm</th>
                      <th className="px-3 py-2.5 text-right font-semibold">Số dư</th>
                      <th className="px-5 py-2.5 text-right font-semibold">Lãi cộng dồn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {result.rows.map(row => (
                      <tr key={row.year} className="hover:bg-gray-50">
                        <td className="py-2.5 pl-5 pr-3 text-gray-600">Năm {row.year}</td>
                        <td className="px-3 py-2.5 text-right font-medium tabular-nums text-gray-800">{fmt(row.balance)}</td>
                        <td className="px-5 py-2.5 text-right font-medium tabular-nums text-brand">{fmt(row.totalInterest)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
