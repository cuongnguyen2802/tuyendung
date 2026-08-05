'use client'

import Link from 'next/link'
import { useState } from 'react'
import { SearchIcon, DownloadIcon, FileTextIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'

interface Invoice {
  id: string
  invoiceNumber: string
  orderNumber: string
  orderId: string
  issuedAt: string
  dueDate: string
  amount: number
  status: InvoiceStatus
}

const MOCK_INVOICES: Invoice[] = [
  { id: '1', invoiceNumber: 'INV-2025-0047', orderNumber: 'ORD-2025-0051', orderId: '3', issuedAt: '2025-08-01', dueDate: '2025-08-15', amount: 5_489_000, status: 'PAID' },
  { id: '2', invoiceNumber: 'INV-2025-0038', orderNumber: 'ORD-2025-0042', orderId: '1', issuedAt: '2025-07-15', dueDate: '2025-07-30', amount: 1_639_000, status: 'PAID' },
  { id: '3', invoiceNumber: 'INV-2025-0035', orderNumber: 'ORD-2025-0039', orderId: '2', issuedAt: '2025-07-02', dueDate: '2025-07-17', amount: 990_000, status: 'PAID' },
  { id: '4', invoiceNumber: 'INV-2025-0054', orderNumber: 'ORD-2025-0055', orderId: '4', issuedAt: '2025-08-04', dueDate: '2025-08-19', amount: 2_750_000, status: 'SENT' },
]

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
  DRAFT:     { label: 'Nháp',          className: 'bg-gray-100 text-gray-500 border-gray-200' },
  SENT:      { label: 'Đã gửi',        className: 'bg-blue-50 text-blue-700 border-blue-200' },
  PAID:      { label: 'Đã thanh toán', className: 'bg-green-50 text-green-700 border-green-200' },
  OVERDUE:   { label: 'Quá hạn',       className: 'bg-red-50 text-red-600 border-red-200' },
  CANCELLED: { label: 'Đã huỷ',        className: 'bg-gray-100 text-gray-400 border-gray-200' },
}

const fmt = (n: number) => n.toLocaleString('vi-VN') + ' ₫'

export default function InvoicesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<InvoiceStatus | 'ALL'>('ALL')

  const filtered = MOCK_INVOICES.filter(inv => {
    const match = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.orderNumber.toLowerCase().includes(search.toLowerCase())
    return match && (filter === 'ALL' || inv.status === filter)
  })

  const totalPaid = MOCK_INVOICES.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount, 0)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Hóa đơn</h1>
          <p className="mt-0.5 text-sm text-gray-500">Danh sách hóa đơn dịch vụ của bạn</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Tổng hóa đơn',   value: MOCK_INVOICES.length },
          { label: 'Đã thanh toán',  value: MOCK_INVOICES.filter(i => i.status === 'PAID').length },
          { label: 'Chờ thanh toán', value: MOCK_INVOICES.filter(i => i.status === 'SENT').length },
          { label: 'Tổng đã trả',    value: fmt(totalPaid) },
        ].map(c => (
          <div key={c.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo số hóa đơn, mã đơn hàng..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {(['ALL', 'SENT', 'PAID', 'OVERDUE'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-medium transition',
                  filter === s
                    ? 'border-brand bg-brand text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
                )}
              >
                {s === 'ALL' ? 'Tất cả' : STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <FileTextIcon className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">Không tìm thấy hóa đơn nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Số hóa đơn</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Đơn hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày phát hành</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Hạn thanh toán</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Số tiền</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(inv => {
                  const cfg = STATUS_CONFIG[inv.status]
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-semibold text-gray-700">{inv.invoiceNumber}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link href={`/employer/billing/orders/${inv.orderId}`} className="text-brand hover:underline text-xs font-medium">
                          {inv.orderNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500">{new Date(inv.issuedAt).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-3.5 text-gray-500">{new Date(inv.dueDate).toLocaleDateString('vi-VN')}</td>
                      <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-gray-900">{fmt(inv.amount)}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold', cfg.className)}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/employer/billing/invoices/${inv.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 hover:border-brand hover:text-brand transition"
                          >
                            Xem <ChevronRightIcon className="h-3 w-3" />
                          </Link>
                          <button className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-1.5 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition">
                            <DownloadIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
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
