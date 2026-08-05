'use client'

import Link from 'next/link'
import { use } from 'react'
import { ArrowLeftIcon, FileTextIcon, PrinterIcon, CheckCircleIcon, ClockIcon, XCircleIcon, PackageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const MOCK_ORDER = {
  id: '3',
  orderNumber: 'ORD-2025-0051',
  status: 'CONFIRMED' as const,
  createdAt: '2025-08-01T09:15:00',
  confirmedAt: '2025-08-01T10:30:00',
  notes: 'Đăng ký gói PREMIUM để mở rộng tuyển dụng Q3/2025',
  invoiceId: 'INV-2025-0047',
  items: [
    { name: 'Gói PREMIUM', description: 'Hiệu lực 3 tháng — 90 ngày', qty: 1, unitPrice: 4_990_000, total: 4_990_000 },
    { name: 'Phí kích hoạt tài khoản', description: 'Một lần duy nhất', qty: 1, unitPrice: 0, total: 0 },
  ],
  subtotal: 4_990_000,
  tax: 499_000,
  total: 5_489_000,
  payments: [
    { date: '2025-08-01', method: 'VNPay', amount: 5_489_000, status: 'SUCCESS', ref: 'VNPAY20250801109843' },
  ],
}

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ElementType; className: string }> = {
  PENDING:   { label: 'Chờ xác nhận', icon: ClockIcon,        className: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMED: { label: 'Đã xác nhận',  icon: CheckCircleIcon,  className: 'bg-blue-50 text-blue-700 border-blue-200' },
  COMPLETED: { label: 'Hoàn thành',   icon: CheckCircleIcon,  className: 'bg-green-50 text-green-700 border-green-200' },
  CANCELLED: { label: 'Đã huỷ',       icon: XCircleIcon,      className: 'bg-gray-100 text-gray-500 border-gray-200' },
}

const fmt = (n: number) => n.toLocaleString('vi-VN') + ' ₫'

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  use(params)
  const order = MOCK_ORDER
  const cfg = STATUS_CONFIG[order.status]
  const StatusIcon = cfg.icon

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Back + Header */}
      <div>
        <Link href="/employer/billing/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeftIcon className="h-4 w-4" /> Danh sách đơn hàng
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{order.orderNumber}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Ngày tạo: {new Date(order.createdAt).toLocaleString('vi-VN', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
          </div>
          <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold', cfg.className)}>
            <StatusIcon className="h-4 w-4" />
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Order items */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3.5">
          <PackageIcon className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Chi tiết dịch vụ</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Dịch vụ</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">SL</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Đơn giá</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {order.items.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                  </td>
                  <td className="px-5 py-3.5 text-center text-gray-600">{item.qty}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums text-gray-600">{fmt(item.unitPrice)}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums font-semibold text-gray-900">{fmt(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Totals */}
        <div className="border-t border-gray-100 px-5 py-4 space-y-2 bg-gray-50/40">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tạm tính</span><span className="tabular-nums">{fmt(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>VAT (10%)</span><span className="tabular-nums">{fmt(order.tax)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
            <span>Tổng cộng</span><span className="tabular-nums text-brand">{fmt(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Invoice & Notes */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Hóa đơn liên quan</h2>
          {order.invoiceId ? (
            <Link
              href={`/employer/billing/invoices/${order.id}`}
              className="flex items-center gap-2 text-sm text-brand hover:underline font-medium"
            >
              <FileTextIcon className="h-4 w-4" />
              {order.invoiceId}
            </Link>
          ) : (
            <p className="text-sm text-gray-400">Chưa có hóa đơn</p>
          )}
        </div>
        {order.notes && (
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Ghi chú</h2>
            <p className="text-sm text-gray-600">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Payment history */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-gray-700">Lịch sử thanh toán</h2>
          <button className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
            <PrinterIcon className="h-3.5 w-3.5" /> In
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/60">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ngày</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Phương thức</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Mã GD</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Số tiền</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {order.payments.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3.5 text-gray-600">{new Date(p.date).toLocaleDateString('vi-VN')}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-800">{p.method}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{p.ref}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums font-semibold text-gray-900">{fmt(p.amount)}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                      Thành công
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
