'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeftIcon, CheckIcon, ShoppingCartIcon, ZapIcon, CrownIcon, StarIcon, InfoIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Package {
  id: string
  name: string
  price: number
  originalPrice?: number
  unit: string
  duration: string
  icon: React.ElementType
  color: string
  features: string[]
  highlight?: boolean
  badge?: string
}

const PACKAGES: Package[] = [
  {
    id: 'pkg-1',
    name: 'Gói PRO 1 tháng',
    price: 1_490_000,
    unit: 'tháng',
    duration: '30 ngày',
    icon: ZapIcon,
    color: 'blue',
    features: [
      'Đăng tối đa 10 tin tuyển dụng/tháng',
      'Xem thông tin liên hệ ứng viên',
      'Nhắn tin chủ động với ứng viên',
      'Gợi ý CV bằng AI cơ bản',
    ],
  },
  {
    id: 'pkg-2',
    name: 'Gói PRO 3 tháng',
    price: 3_990_000,
    originalPrice: 4_470_000,
    unit: 'quý',
    duration: '90 ngày',
    icon: StarIcon,
    color: 'brand',
    badge: 'Tiết kiệm 11%',
    highlight: true,
    features: [
      'Đăng tối đa 10 tin tuyển dụng/tháng',
      'Xem thông tin liên hệ ứng viên',
      'Nhắn tin chủ động với ứng viên',
      'Gợi ý CV bằng AI cơ bản',
      'Báo cáo hiệu quả tuyển dụng',
    ],
  },
  {
    id: 'pkg-3',
    name: 'Gói PREMIUM 3 tháng',
    price: 5_970_000,
    originalPrice: 7_470_000,
    unit: 'quý',
    duration: '90 ngày',
    icon: CrownIcon,
    color: 'amber',
    badge: 'Phổ biến nhất',
    features: [
      'Đăng không giới hạn tin tuyển dụng',
      'Xem thông tin liên hệ ứng viên',
      'Nhắn tin chủ động không giới hạn',
      'Gợi ý CV bằng AI nâng cao',
      'Báo cáo chi tiết & xuất Excel',
      '3 tin nổi bật miễn phí/tháng',
    ],
  },
  {
    id: 'pkg-4',
    name: 'Tin nổi bật × 5',
    price: 1_500_000,
    unit: 'gói',
    duration: 'Không giới hạn',
    icon: StarIcon,
    color: 'orange',
    features: [
      '5 lượt đẩy tin lên TOP',
      'Hiển thị banner màu nổi bật',
      'Thời hạn sử dụng 60 ngày',
    ],
  },
]

const COLOR_MAP: Record<string, { card: string; icon: string; check: string; btn: string }> = {
  blue:  { card: 'border-blue-200 bg-blue-50/30',  icon: 'bg-blue-100 text-blue-600',  check: 'text-blue-500',  btn: 'bg-blue-600 hover:bg-blue-700 text-white' },
  brand: { card: 'border-brand/30 bg-brand/5',     icon: 'bg-brand/10 text-brand',     check: 'text-brand',    btn: 'bg-brand hover:bg-brand/90 text-white' },
  amber: { card: 'border-amber-200 bg-amber-50/30',icon: 'bg-amber-100 text-amber-600',check: 'text-amber-500', btn: 'bg-amber-500 hover:bg-amber-600 text-white' },
  orange:{ card: 'border-orange-200 bg-orange-50/30',icon:'bg-orange-100 text-orange-600',check:'text-orange-500',btn:'bg-orange-500 hover:bg-orange-600 text-white' },
}

const fmt = (n: number) => n.toLocaleString('vi-VN') + ' ₫'

export default function NewOrderPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [notes, setNotes] = useState('')

  const selectedPkg = PACKAGES.find(p => p.id === selected)
  const total = selectedPkg ? selectedPkg.price * qty : 0

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <Link href="/employer/billing/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeftIcon className="h-4 w-4" /> Danh sách đơn hàng
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Thêm đơn hàng mới</h1>
        <p className="mt-0.5 text-sm text-gray-500">Chọn gói dịch vụ phù hợp với nhu cầu tuyển dụng của bạn</p>
      </div>

      {/* Package selection */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">1. Chọn gói dịch vụ</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {PACKAGES.map(pkg => {
            const colors = COLOR_MAP[pkg.color]
            const Icon = pkg.icon
            const isSelected = selected === pkg.id

            return (
              <button
                key={pkg.id}
                onClick={() => { setSelected(pkg.id); setQty(1) }}
                className={cn(
                  'relative rounded-xl border-2 p-4 text-left transition',
                  isSelected ? `${colors.card} border-current shadow-sm` : 'border-gray-200 bg-white hover:border-gray-300',
                )}
              >
                {pkg.badge && (
                  <span className={cn(
                    'absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold',
                    pkg.color === 'amber' ? 'bg-amber-500 text-white' : 'bg-brand text-white',
                  )}>
                    {pkg.badge}
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', colors.icon)}>
                    <Icon className="h-4.5 w-4.5 h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{pkg.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{pkg.duration}</p>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-lg font-bold text-gray-900">{fmt(pkg.price)}</span>
                      {pkg.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">{fmt(pkg.originalPrice)}</span>
                      )}
                      <span className="text-xs text-gray-500">/{pkg.unit}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckIcon className={cn('h-5 w-5 shrink-0', colors.check)} />
                  )}
                </div>
                <ul className="mt-3 space-y-1 pl-12">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <CheckIcon className={cn('h-3.5 w-3.5 shrink-0', colors.check)} />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </div>
      </div>

      {/* Quantity & Notes */}
      {selected && selectedPkg && (
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">2. Chi tiết đơn hàng</h2>

          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-600 w-28">Số lượng</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="h-8 w-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center font-bold">−</button>
              <span className="w-10 text-center font-semibold text-gray-900">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="h-8 w-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center font-bold">+</button>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Ghi chú đơn hàng <span className="text-gray-400">(tuỳ chọn)</span></label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ví dụ: Đăng ký cho chiến dịch tuyển dụng Q3/2025..."
              className="mt-1.5 w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand resize-none"
            />
          </div>

          {/* Order summary */}
          <div className="rounded-xl bg-gray-50 p-4 space-y-2 border border-gray-100">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{selectedPkg.name} × {qty}</span>
              <span className="tabular-nums">{fmt(selectedPkg.price * qty)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>VAT (10%)</span>
              <span className="tabular-nums">{fmt(Math.round(selectedPkg.price * qty * 0.1))}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
              <span>Tổng thanh toán</span>
              <span className="text-brand tabular-nums">{fmt(Math.round(selectedPkg.price * qty * 1.1))}</span>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-700 border border-blue-100">
            <InfoIcon className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Sau khi đặt hàng, đội ngũ hỗ trợ sẽ liên hệ xác nhận và gửi thông tin thanh toán trong vòng 30 phút trong giờ hành chính.</span>
          </div>

          <div className="flex gap-3 pt-1">
            <Link href="/employer/billing/orders" className="flex-1 rounded-xl border border-gray-200 py-2.5 text-center text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Huỷ
            </Link>
            <button className={cn('flex-1 rounded-xl py-2.5 text-sm font-semibold transition flex items-center justify-center gap-2', COLOR_MAP[selectedPkg.color].btn)}>
              <ShoppingCartIcon className="h-4 w-4" />
              Đặt hàng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
