'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CreditCardIcon, SearchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED'
type PaymentMethod = 'VNPay' | 'MoMo' | 'ZaloPay' | 'Chuyển khoản' | 'Thẻ tín dụng'

interface Payment {
  id: string
  date: string
  invoiceNumber: string
  invoiceId: string
  orderId: string
  method: PaymentMethod
  amount: number
  status: PaymentStatus
  ref: string
}

const MOCK_PAYMENTS: Payment[] = [
  { id: '1', date: '2025-08-01T10:30:00', invoiceNumber: 'INV-2025-0047', invoiceId: '1', orderId: '3', method: 'VNPay', amount: 5_489_000, status: 'SUCCESS', ref: 'VNPAY20250801109843' },
  { id: '2', date: '2025-07-15T14:20:00', invoiceNumber: 'INV-2025-0038', invoiceId: '2', orderId: '1', method: 'MoMo',  amount: 1_639_000, status: 'SUCCESS', ref: 'MOMO240715884523' },
  { id: '3', date: '2025-07-02T09:05:00', invoiceNumber: 'INV-2025-0035', invoiceId: '3', orderId: '2', method: 'Chuyển khoản', amount: 990_000, status: 'SUCCESS', ref: 'FT25183001234567' },
  { id: '4', date: '2025-08-04T16:45:00', invoiceNumber: 'INV-2025-0054', invoiceId: '4', orderId: '4', method: 'ZaloPay', amount: 2_750_000, status: 'PENDING', ref: 'ZLP20250804334521' },
]

const STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  SUCCESS:  { label: 'Thành công',    className: 'bg-green-50 text-green-700 border-green-200' },
  PENDING:  { label: 'Đang xử lý',   className: 'bg-amber-50 text-amber-700 border-amber-200' },
  FAILED:   { label: 'Thất bại',     className: 'bg-red-50 text-red-600 border-red-200' },
  REFUNDED: { label: 'Hoàn tiền',    className: 'bg-purple-50 text-purple-700 border-purple-200' },
}

const METHOD_COLORS: Record<PaymentMethod, string> = {
  'VNPay':        'bg-red-100 text-red-700',
  'MoMo':         'bg-pink-100 text-pink-700',
  'ZaloPay':      'bg-blue-100 text-blue-700',
  'Chuyển khoản': 'bg-green-100 text-green-700',
  'Thẻ tín dụng': 'bg-gray-100 text-gray-700',
}

const fmt = (n: number) => n.toLocaleString('vi-VN') + ' ₫'

export default function PaymentsPage() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_PAYMENTS.filter(p =>
    p.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    p.ref.toLowerCase().includes(search.toLowerCase()) ||
    p.method.toLowerCase().includes(search.toLowerCase()),
  )

  const totalSuccess = MOCK_PAYMENTS.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0)
  const thisMonth = MOCK_PAYMENTS.filter(p => {
    const d = new Date(p.date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && p.status === 'SUCCESS'
  }).reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Lịch sử thanh toán</h1>
        <p className="mt-0.5 text-sm text-gray-500">Tất cả giao dịch thanh toán dịch vụ</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Tổng giao dịch', value: MOCK_PAYMENTS.length },
          { label: 'Thành công', value: MOCK_PAYMENTS.filter(p => p.status === 'SUCCESS').length },
          { label: 'Chi tiêu tháng này', value: fmt(thisMonth) },
          { label: 'Tổng đã thanh toán', value: fmt(totalSuccess) },
        ].map(c => (
          <div key={c.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo số hóa đơn, mã giao dịch, phương thức..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <CreditCardIcon className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">Không tìm thấy giao dịch nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày & giờ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Hóa đơn</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Mã GD</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Phương thức</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Số tiền</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const cfg = STATUS_CONFIG[p.status]
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                        {new Date(p.date).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-4 py-3.5">
                        <Link href={`/employer/billing/invoices/${p.invoiceId}`} className="font-mono text-xs font-semibold text-brand hover:underline">
                          {p.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs text-gray-400">{p.ref}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={cn('inline-flex rounded-md px-2 py-0.5 text-xs font-semibold', METHOD_COLORS[p.method])}>
                          {p.method}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums font-semibold text-gray-900">{fmt(p.amount)}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold', cfg.className)}>
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
