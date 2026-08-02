'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckIcon, StarIcon, ZapIcon, CrownIcon, SparklesIcon, CheckCircleIcon } from 'lucide-react'
import { api } from '@/lib/api'
import { UserPlan, PLAN_LIMITS } from '@tuyendung/types'
import { CheckoutModal } from '@/components/candidate/CheckoutModal'

interface PlanInfo {
  plan: UserPlan
  planExpiresAt: string | null
}

interface PlanConfig {
  id: UserPlan
  name: string
  price: number
  icon: React.ElementType
  iconBg: string
  iconColor: string
  badgeCls: string
  borderCls: string
  highlight?: boolean
  ctaLabel: string
  ctaActiveCls?: string
  features: string[]
  locked: string[]
}

const PLANS: PlanConfig[] = [
  {
    id: UserPlan.FREE,
    name: 'Cơ bản',
    price: 0,
    icon: StarIcon,
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-500',
    badgeCls: 'bg-gray-100 text-gray-700',
    borderCls: 'border-gray-200',
    ctaLabel: 'Gói hiện tại',
    features: [
      '1 CV online',
      `Ứng tuyển tối đa ${PLAN_LIMITS.FREE.maxApplyPerMonth} tin/tháng`,
      'Xem tin tuyển dụng',
      'Gợi ý việc làm cơ bản',
    ],
    locked: ['Hồ sơ nổi bật', 'Xem ai đã xem hồ sơ', 'Ưu tiên trong tìm kiếm', 'Hỗ trợ viết CV'],
  },
  {
    id: UserPlan.PRO,
    name: 'Pro',
    price: 99_000,
    icon: ZapIcon,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    badgeCls: 'bg-blue-100 text-blue-700',
    borderCls: 'border-blue-200',
    ctaLabel: 'Dùng thử 7 ngày miễn phí',
    ctaActiveCls: 'bg-blue-600 text-white hover:bg-blue-700',
    features: [
      '3 CV online + upload không giới hạn',
      'Ứng tuyển không giới hạn',
      'Hồ sơ nổi bật cho NTD',
      'Gợi ý việc làm thông minh (AI)',
      'Xem ai đã xem hồ sơ bạn',
      'Hỗ trợ viết CV bởi AI',
    ],
    locked: ['Ưu tiên hiển thị #1 trong tìm kiếm', 'Tư vấn nghề nghiệp 1-1'],
  },
  {
    id: UserPlan.PREMIUM,
    name: 'Premium',
    price: 199_000,
    icon: CrownIcon,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    badgeCls: 'bg-amber-100 text-amber-700',
    borderCls: 'border-amber-300',
    highlight: true,
    ctaLabel: 'Nâng cấp ngay',
    ctaActiveCls: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90',
    features: [
      'CV online không giới hạn',
      'Ứng tuyển không giới hạn',
      'Hồ sơ nổi bật ưu tiên #1',
      'Gợi ý việc làm AI cá nhân hóa',
      'Xem toàn bộ lịch sử xem hồ sơ',
      'Hỗ trợ viết CV chuyên nghiệp',
      'Tư vấn nghề nghiệp 1-1 (2 buổi/tháng)',
      'Huy hiệu ứng viên cao cấp',
    ],
    locked: [],
  },
]

function fmt(n: number) {
  return n.toLocaleString('vi-VN')
}

export default function UpgradePage() {
  const [upgraded, setUpgraded] = useState<UserPlan | null>(null)
  const [checkoutPlan, setCheckoutPlan] = useState<{ id: 'PRO' | 'PREMIUM'; name: string; price: number } | null>(null)

  const { data: planInfo } = useQuery<PlanInfo>({
    queryKey: ['my-plan'],
    queryFn: () => api.get('/users/me/plan'),
  })

  const currentPlan = planInfo?.plan ?? UserPlan.FREE

  if (upgraded) {
    return (
      <div className="flex flex-col items-center gap-6 py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand/10">
          <CheckCircleIcon className="h-10 w-10 text-brand" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Thanh toán thành công! 🎉</h2>
          <p className="mt-2 text-gray-500">
            Tài khoản của bạn đã được nâng cấp lên <strong>{upgraded}</strong>.
            Tận hưởng các quyền lợi mới ngay bây giờ.
          </p>
        </div>
        <button
          onClick={() => setUpgraded(null)}
          className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand/90"
        >
          Xem lại các gói
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Checkout modal */}
      {checkoutPlan && (
        <CheckoutModal
          plan={checkoutPlan}
          onClose={() => setCheckoutPlan(null)}
          onSuccess={(plan) => {
            setCheckoutPlan(null)
            setUpgraded(plan)
          }}
        />
      )}

      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-700">
            <SparklesIcon className="h-4 w-4" /> Nâng cấp tài khoản
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Tăng cơ hội có việc làm mơ ước</h1>
          <p className="mt-2 text-gray-500">
            Tài khoản nâng cấp giúp hồ sơ của bạn nổi bật hơn trong mắt nhà tuyển dụng
          </p>
          {planInfo?.planExpiresAt && currentPlan !== UserPlan.FREE && (
            <p className="mt-2 text-sm font-medium text-brand">
              Gói {currentPlan} còn hiệu lực đến{' '}
              {new Date(planInfo.planExpiresAt).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            const isCurrent = currentPlan === plan.id
            const canUpgrade =
              plan.id !== UserPlan.FREE &&
              (currentPlan === UserPlan.FREE ||
                (currentPlan === UserPlan.PRO && plan.id === UserPlan.PREMIUM))

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white transition ${plan.borderCls} ${
                  plan.highlight ? 'shadow-lg shadow-amber-100' : ''
                } ${isCurrent ? 'ring-2 ring-brand ring-offset-2' : ''}`}
              >
                {plan.highlight && !isCurrent && (
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 py-1.5 text-center text-xs font-bold text-white">
                    PHỔ BIẾN NHẤT
                  </div>
                )}
                {isCurrent && (
                  <div className="bg-brand py-1.5 text-center text-xs font-bold text-white">
                    GÓI HIỆN TẠI
                  </div>
                )}

                <div className="flex flex-1 flex-col p-6">
                  {/* Header */}
                  <div className="mb-4 flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${plan.iconBg}`}>
                      <Icon className={`h-5 w-5 ${plan.iconColor}`} />
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${plan.badgeCls}`}>
                      {plan.name}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    {plan.price === 0 ? (
                      <span className="text-3xl font-extrabold text-gray-900">Miễn phí</span>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-gray-900">
                          {fmt(plan.price)}đ
                        </span>
                        <span className="text-sm text-gray-500">/tháng</span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="flex-1 space-y-2.5">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        {f}
                      </div>
                    ))}
                    {plan.locked.map((f) => (
                      <div key={f} className="flex items-start gap-2.5 text-sm text-gray-400">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-200" />
                        {f}
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    disabled={!canUpgrade}
                    onClick={() => {
                      if (canUpgrade) {
                        setCheckoutPlan({ id: plan.id as 'PRO' | 'PREMIUM', name: plan.name, price: plan.price })
                      }
                    }}
                    className={`mt-6 w-full rounded-xl py-3 text-sm font-bold transition ${
                      isCurrent
                        ? 'cursor-default bg-brand/10 text-brand'
                        : canUpgrade
                          ? `${plan.ctaActiveCls} active:scale-[0.98]`
                          : 'cursor-not-allowed bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCurrent ? '✓ Đang sử dụng' : plan.ctaLabel}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
          {['🔒 Thanh toán bảo mật SSL', '💳 Hỗ trợ đa phương thức', '↩️ Hoàn tiền trong 7 ngày', '🎧 Hỗ trợ 24/7'].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>

        {/* FAQ */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 font-bold text-gray-900">Câu hỏi thường gặp</h2>
          <div className="space-y-3">
            {[
              { q: 'Tôi có thể hủy đăng ký bất kỳ lúc nào không?', a: 'Có. Sau khi hủy, tài khoản vẫn ở gói nâng cấp đến hết chu kỳ thanh toán.' },
              { q: 'Hồ sơ nổi bật hoạt động như thế nào?', a: 'Hồ sơ được ưu tiên hiển thị trong kết quả tìm kiếm của nhà tuyển dụng, tăng khả năng được liên hệ.' },
              { q: 'Tôi có thể dùng thử trước khi trả tiền không?', a: 'Gói Pro có 7 ngày dùng thử miễn phí. Hủy trước khi kết thúc mà không bị tính phí.' },
              { q: 'Các phương thức thanh toán được chấp nhận?', a: 'Thẻ ATM nội địa, Visa/Mastercard, ví điện tử (MoMo, ZaloPay, VNPay) và chuyển khoản ngân hàng.' },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-gray-100 p-4">
                <p className="mb-1 text-sm font-semibold text-gray-800">{q}</p>
                <p className="text-sm text-gray-500">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
