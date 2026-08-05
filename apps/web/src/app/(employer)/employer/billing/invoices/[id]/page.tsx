'use client'

import Link from 'next/link'
import { use } from 'react'
import { ArrowLeftIcon, PrinterIcon, DownloadIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const MOCK_INVOICE = {
  invoiceNumber: 'INV-2025-0047',
  orderNumber: 'ORD-2025-0051',
  orderId: '3',
  status: 'PAID' as const,
  issuedAt: '2025-08-01',
  dueDate: '2025-08-15',
  paidAt: '2025-08-01',
  seller: {
    name: 'Công ty TNHH TuyenDung Vietnam',
    address: 'Tầng 20, Tòa nhà Keangnam, Phạm Hùng, Nam Từ Liêm, Hà Nội',
    taxCode: '0123456789',
    phone: '1900 1234',
    email: 'billing@tuyendung.vn',
  },
  buyer: {
    name: 'TechCorp Vietnam',
    address: 'Tầng 12, Tòa nhà TechCorp, 21 Lý Thái Tổ, Hoàn Kiếm, Hà Nội',
    taxCode: '0312345678',
    contact: 'hr@techcorp.vn',
  },
  items: [
    { name: 'Gói PREMIUM 3 tháng', description: 'Hiệu lực từ 01/08/2025 đến 01/11/2025', qty: 1, unitPrice: 4_990_000, total: 4_990_000 },
  ],
  subtotal: 4_990_000,
  tax: 499_000,
  total: 5_489_000,
}

const STATUS_CONFIG = {
  PAID:      { label: 'Đã thanh toán', className: 'bg-green-50 text-green-700 border-green-200' },
  SENT:      { label: 'Chờ thanh toán', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  OVERDUE:   { label: 'Quá hạn', className: 'bg-red-50 text-red-600 border-red-200' },
  DRAFT:     { label: 'Nháp', className: 'bg-gray-100 text-gray-500 border-gray-200' },
  CANCELLED: { label: 'Đã huỷ', className: 'bg-gray-100 text-gray-400 border-gray-200' },
}

const fmt = (n: number) => n.toLocaleString('vi-VN') + ' ₫'

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  use(params)
  const inv = MOCK_INVOICE
  const cfg = STATUS_CONFIG[inv.status]

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link href="/employer/billing/invoices" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeftIcon className="h-4 w-4" /> Danh sách hóa đơn
        </Link>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
            <PrinterIcon className="h-3.5 w-3.5" /> In
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand/90 transition">
            <DownloadIcon className="h-3.5 w-3.5" /> Tải PDF
          </button>
        </div>
      </div>

      {/* Invoice document */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-100 bg-gray-50/60 px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-brand tracking-tight">TuyenDung.vn</h1>
              <p className="text-xs text-gray-500 mt-0.5">Nền tảng tuyển dụng hàng đầu Việt Nam</p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Hóa đơn dịch vụ</h2>
              <p className="font-mono text-sm font-semibold text-gray-600 mt-1">{inv.invoiceNumber}</p>
              <span className={cn('mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold', cfg.className)}>
                {cfg.label}
              </span>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Parties */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Bên bán</p>
              <p className="font-semibold text-gray-900">{inv.seller.name}</p>
              <p className="text-xs text-gray-500 mt-1">{inv.seller.address}</p>
              <p className="text-xs text-gray-500 mt-0.5">MST: {inv.seller.taxCode}</p>
              <p className="text-xs text-gray-500 mt-0.5">SĐT: {inv.seller.phone}</p>
              <p className="text-xs text-gray-500 mt-0.5">Email: {inv.seller.email}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Bên mua</p>
              <p className="font-semibold text-gray-900">{inv.buyer.name}</p>
              <p className="text-xs text-gray-500 mt-1">{inv.buyer.address}</p>
              <p className="text-xs text-gray-500 mt-0.5">MST: {inv.buyer.taxCode}</p>
              <p className="text-xs text-gray-500 mt-0.5">Email: {inv.buyer.contact}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex gap-6 text-xs">
            <div><span className="text-gray-400">Ngày phát hành: </span><span className="font-medium text-gray-700">{new Date(inv.issuedAt).toLocaleDateString('vi-VN', { dateStyle: 'long' })}</span></div>
            <div><span className="text-gray-400">Hạn thanh toán: </span><span className="font-medium text-gray-700">{new Date(inv.dueDate).toLocaleDateString('vi-VN', { dateStyle: 'long' })}</span></div>
            {inv.paidAt && <div><span className="text-gray-400">Ngày thanh toán: </span><span className="font-medium text-green-600">{new Date(inv.paidAt).toLocaleDateString('vi-VN', { dateStyle: 'long' })}</span></div>}
          </div>

          {/* Linked order */}
          <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-2 text-xs text-gray-500">
            Đơn hàng:{' '}
            <Link href={`/employer/billing/orders/${inv.orderId}`} className="font-semibold text-brand hover:underline">
              {inv.orderNumber}
            </Link>
          </div>

          {/* Items */}
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Mô tả</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">SL</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Đơn giá</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {inv.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                    </td>
                    <td className="px-4 py-4 text-center text-gray-600">{item.qty}</td>
                    <td className="px-4 py-4 text-right tabular-nums text-gray-600">{fmt(item.unitPrice)}</td>
                    <td className="px-4 py-4 text-right tabular-nums font-semibold text-gray-900">{fmt(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-gray-100 bg-gray-50/40 px-4 py-3 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600"><span>Tiền hàng</span><span className="tabular-nums">{fmt(inv.subtotal)}</span></div>
              <div className="flex justify-between text-sm text-gray-600"><span>Thuế GTGT (10%)</span><span className="tabular-nums">{fmt(inv.tax)}</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                <span>TỔNG CỘNG</span><span className="text-brand tabular-nums">{fmt(inv.total)}</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Hóa đơn này được phát hành điện tử và có giá trị pháp lý theo quy định hiện hành.
          </p>
        </div>
      </div>
    </div>
  )
}
