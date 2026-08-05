'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PlusIcon, SearchIcon, ReceiptIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

interface Order {
  id: string
  orderNumber: string
  services: string
  amount: number
  status: OrderStatus
  createdAt: string
  invoiceId?: string
}

const MOCK_ORDERS: Order[] = [
  { id: '1', orderNumber: 'ORD-2025-0042', services: 'Gói PRO 1 tháng', amount: 1_490_000, status: 'COMPLETED', createdAt: '2025-07-15', invoiceId: 'INV-2025-0038' },
  { id: '2', orderNumber: 'ORD-2025-0039', services: 'Tin tuyển dụng nổi bật × 3', amount: 900_000, status: 'COMPLETED', createdAt: '2025-07-02', invoiceId: 'INV-2025-0035' },
  { id: '3', orderNumber: 'ORD-2025-0051', services: 'Gói PREMIUM 3 tháng', amount: 5_970_000, status: 'CONFIRMED', createdAt: '2025-08-01', invoiceId: 'INV-2025-0047' },
  { id: '4', orderNumber: 'ORD-2025-0055', services: 'Gói đăng tin × 10', amount: 2_500_000, status: 'PENDING', createdAt: '2025-08-04' },
  { id: '5', orderNumber: 'ORD-2025-0031', services: 'Dịch vụ xác minh doanh nghiệp', amount: 500_000, status: 'CANCELLED', createdAt: '2025-06-10' },
]

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  PENDING:   { label: 'Chờ xác nhận', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMED: { label: 'Đã xác nhận',  className: 'bg-blue-50 text-blue-700 border-blue-200' },
  COMPLETED: { label: 'Hoàn thành',   className: 'bg-green-50 text-green-700 border-green-200' },
  CANCELLED: { label: 'Đã huỷ',       className: 'bg-gray-100 text-gray-500 border-gray-200' },
}

const fmt = (n: number) => n.toLocaleString('vi-VN') + ' ₫'

const ALL_STATUSES: (OrderStatus | 'ALL')[] = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
const STATUS_LABELS: Record<OrderStatus | 'ALL', string> = {
  ALL: 'Tất cả', PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', COMPLETED: 'Hoàn thành', CANCELLED: 'Đã huỷ',
}

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL')

  const filtered = MOCK_ORDERS.filter(o => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.services.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filter === 'ALL' || o.status === filter
    return matchSearch && matchStatus
  })

  const totalCompleted = MOCK_ORDERS.filter(o => o.status === 'COMPLETED').reduce((s, o) => s + o.amount, 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Đơn hàng / Dịch vụ</h1>
          <p className="mt-0.5 text-sm text-gray-500">Quản lý các đơn hàng dịch vụ tuyển dụng của bạn</p>
        </div>
        <Link
          href="/employer/billing/orders/new"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand/90 transition"
        >
          <PlusIcon className="h-4 w-4" />
          Thêm đơn hàng mới
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Tổng đơn hàng', value: MOCK_ORDERS.length, sub: 'tất cả trạng thái' },
          { label: 'Chờ xác nhận', value: MOCK_ORDERS.filter(o => o.status === 'PENDING').length, sub: 'cần xử lý' },
          { label: 'Hoàn thành', value: MOCK_ORDERS.filter(o => o.status === 'COMPLETED').length, sub: 'đã hoàn tất' },
          { label: 'Đã chi tiêu', value: fmt(totalCompleted), sub: 'tổng cộng' },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="mt-1 text-lg font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-400">{c.sub}</p>
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
              placeholder="Tìm theo mã đơn, tên dịch vụ..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {ALL_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  'rounded-lg border px-3 py-1.5 text-xs font-medium transition',
                  filter === s
                    ? 'border-brand bg-brand text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                )}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <ReceiptIcon className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">Không tìm thấy đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Mã đơn</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Dịch vụ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày tạo</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Số tiền</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => {
                  const cfg = STATUS_CONFIG[order.status]
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-semibold text-gray-700">{order.orderNumber}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-gray-800">{order.services}</span>
                        {order.invoiceId && (
                          <Link href={`/employer/billing/invoices/${order.id}`} className="ml-2 text-xs text-brand hover:underline">
                            {order.invoiceId}
                          </Link>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold text-gray-900 tabular-nums">
                        {fmt(order.amount)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={cn('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold', cfg.className)}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Link
                          href={`/employer/billing/orders/${order.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 hover:border-brand hover:text-brand transition"
                        >
                          Chi tiết <ChevronRightIcon className="h-3.5 w-3.5" />
                        </Link>
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
