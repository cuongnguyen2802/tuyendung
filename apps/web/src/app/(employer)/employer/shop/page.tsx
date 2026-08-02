'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { CheckIcon, ZapIcon, SparklesIcon, StarIcon, CrownIcon, BriefcaseIcon, UsersRoundIcon, BarChart3Icon } from 'lucide-react'
import { toast } from 'sonner'

// ── Packages ──────────────────────────────────────────────────────────────────

const PACKAGES = [
  {
    id: 'basic',
    name: 'Cơ bản',
    badge: null,
    price: 0,
    unit: 'miễn phí',
    icon: BriefcaseIcon,
    color: 'from-gray-400 to-gray-300',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
    features: [
      '5 tin tuyển dụng/tháng',
      'Xem CV ứng viên cơ bản',
      'Hỗ trợ email',
      'Trang công ty cơ bản',
    ],
    disabled: true,
    btnLabel: 'Gói hiện tại',
  },
  {
    id: 'standard',
    name: 'Standard',
    badge: 'Phổ biến',
    price: 990000,
    unit: 'tháng',
    icon: StarIcon,
    color: 'from-brand to-blue-500',
    iconBg: 'bg-brand/10',
    iconColor: 'text-brand',
    features: [
      '30 tin tuyển dụng/tháng',
      'Nổi bật trong tìm kiếm',
      'Xem hồ sơ đầy đủ',
      'Báo cáo cơ bản',
      'Hỗ trợ ưu tiên',
    ],
    disabled: false,
    btnLabel: 'Nâng cấp ngay',
  },
  {
    id: 'premium',
    name: 'Premium',
    badge: 'Đề xuất',
    price: 2490000,
    unit: 'tháng',
    icon: SparklesIcon,
    color: 'from-violet-600 to-brand',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    features: [
      'Tin tuyển dụng không giới hạn',
      'Featured job 5 lần/tháng',
      'AI gợi ý ứng viên',
      'Báo cáo phân tích chi tiết',
      'Quản lý chiến dịch',
      'Hỗ trợ 24/7',
    ],
    disabled: false,
    btnLabel: 'Nâng cấp Premium',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    badge: null,
    price: null,
    unit: 'liên hệ',
    icon: CrownIcon,
    color: 'from-amber-500 to-orange-400',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    features: [
      'Tất cả tính năng Premium',
      'Tài khoản quản lý riêng',
      'Đào tạo & onboarding',
      'SLA cam kết',
      'API tích hợp',
      'Custom branding',
    ],
    disabled: false,
    btnLabel: 'Liên hệ tư vấn',
  },
]

const ADD_ONS = [
  {
    icon: ZapIcon,
    name: 'Đẩy tin nổi bật',
    desc: 'Tin tuyển dụng xuất hiện đầu trong kết quả tìm kiếm trong 7 ngày',
    price: 199000,
    unit: '/tin',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    icon: UsersRoundIcon,
    name: 'Gói tìm CV',
    desc: 'Xem và tải xuống 50 hồ sơ ứng viên phù hợp với vị trí tuyển dụng',
    price: 499000,
    unit: '/50 CV',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: BarChart3Icon,
    name: 'Báo cáo tuyển dụng',
    desc: 'Báo cáo phân tích chi tiết hiệu quả đăng tin trong 1 tháng',
    price: 299000,
    unit: '/tháng',
    color: 'bg-brand-100 text-brand',
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ShopPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  function formatPrice(p: number) {
    return new Intl.NumberFormat('vi-VN').format(billing === 'yearly' ? Math.round(p * 10) : p)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Chọn gói phù hợp</h1>
        <p className="mt-1.5 text-gray-500">Nâng cấp để tiếp cận nhiều ứng viên và tính năng cao cấp hơn</p>

        {/* Billing toggle */}
        <div className="mt-4 inline-flex items-center rounded-xl border border-gray-200 bg-white p-1">
          <button
            onClick={() => setBilling('monthly')}
            className={cn('rounded-lg px-4 py-1.5 text-sm font-medium transition', billing === 'monthly' ? 'bg-brand text-white' : 'text-gray-600')}
          >
            Theo tháng
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={cn('rounded-lg px-4 py-1.5 text-sm font-medium transition', billing === 'yearly' ? 'bg-brand text-white' : 'text-gray-600')}
          >
            Theo năm <span className="ml-1 rounded bg-brand-100 px-1 py-0.5 text-[10px] font-bold text-brand">–17%</span>
          </button>
        </div>
      </div>

      {/* Package cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PACKAGES.map(pkg => {
          const Icon = pkg.icon
          const isPopular = pkg.badge === 'Đề xuất'
          return (
            <div
              key={pkg.id}
              className={cn(
                'relative flex flex-col overflow-hidden rounded-2xl border bg-white transition',
                isPopular ? 'border-brand shadow-lg shadow-brand/10 ring-1 ring-brand/20' : 'border-gray-200',
              )}
            >
              {pkg.badge && (
                <div className={cn(
                  'absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold',
                  isPopular ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600',
                )}>
                  {pkg.badge}
                </div>
              )}

              <div className="p-5">
                <div className={cn('mb-3 w-fit rounded-xl p-2.5', pkg.iconBg)}>
                  <Icon className={cn('h-5 w-5', pkg.iconColor)} />
                </div>
                <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                <div className="mt-2">
                  {pkg.price === null ? (
                    <p className="text-xl font-extrabold text-gray-900">Liên hệ</p>
                  ) : pkg.price === 0 ? (
                    <p className="text-xl font-extrabold text-gray-900">Miễn phí</p>
                  ) : (
                    <div>
                      <span className="text-2xl font-extrabold text-gray-900">{formatPrice(pkg.price)}</span>
                      <span className="ml-1 text-sm text-gray-400">đ/{billing === 'yearly' ? 'năm' : pkg.unit}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 border-t border-gray-100 p-5">
                <ul className="space-y-2">
                  {pkg.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 pt-0">
                <button
                  disabled={pkg.disabled}
                  onClick={() => !pkg.disabled && toast.info('Tính năng thanh toán sắp ra mắt')}
                  className={cn(
                    'w-full rounded-xl py-2.5 text-sm font-semibold transition',
                    pkg.disabled
                      ? 'cursor-default bg-gray-100 text-gray-400'
                      : isPopular
                        ? 'bg-brand text-white hover:bg-brand/90'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
                  )}
                >
                  {pkg.btnLabel}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add-ons */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-gray-900">Tiện ích bổ sung</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {ADD_ONS.map(addon => {
            const Icon = addon.icon
            return (
              <div key={addon.name} className="card p-5 flex gap-4">
                <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', addon.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{addon.name}</p>
                  <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">{addon.desc}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold text-brand">
                      {new Intl.NumberFormat('vi-VN').format(addon.price)}đ
                      <span className="text-xs font-normal text-gray-400"> {addon.unit}</span>
                    </span>
                    <button
                      onClick={() => toast.info('Tính năng thanh toán sắp ra mắt')}
                      className="rounded-lg bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand/20"
                    >
                      Mua ngay
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="rounded-2xl bg-gray-50 p-6">
        <h2 className="mb-4 font-semibold text-gray-900">Câu hỏi thường gặp</h2>
        <div className="space-y-3">
          {[
            { q: 'Tôi có thể hủy gói bất cứ lúc nào không?', a: 'Có, bạn có thể hủy gói bất kỳ lúc nào. Gói sẽ vẫn có hiệu lực đến hết kỳ thanh toán hiện tại.' },
            { q: 'Thanh toán theo năm tiết kiệm bao nhiêu?', a: 'Thanh toán theo năm giúp tiết kiệm 17% so với thanh toán theo tháng.' },
            { q: 'Tôi cần hỗ trợ thêm, liên hệ ai?', a: 'Gửi email support@tuyendung.vn hoặc gọi hotline 1800-xxxx (miễn phí) từ 8h–18h các ngày trong tuần.' },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="font-medium text-gray-900">{q}</p>
              <p className="mt-1 text-sm text-gray-500">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
