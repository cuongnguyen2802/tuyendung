'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CheckIcon, ZapIcon, CrownIcon, SparklesIcon, CheckCircleIcon,
  UsersIcon, FileTextIcon, StarIcon, BrainCircuitIcon,
} from 'lucide-react'
import { api } from '@/lib/api'
import { UserPlan, EMPLOYER_PLAN_LIMITS, EMPLOYER_PLAN_PRICES } from '@tuyendung/types'
import { CheckoutModal } from '@/components/candidate/CheckoutModal'

interface PlanInfo {
  plan: UserPlan
  planExpiresAt: string | null
  limits: typeof EMPLOYER_PLAN_LIMITS[keyof typeof EMPLOYER_PLAN_LIMITS]
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

const fmt = (n: number) => n.toLocaleString('vi-VN')

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
      `Đăng tối đa ${EMPLOYER_PLAN_LIMITS.FREE.maxActiveJobs} tin đang hoạt động`,
      'Nhận đơn ứng tuyển không giới hạn',
      'Xem hồ sơ ứng viên cơ bản',
      'Quản lý ứng tuyển',
    ],
    locked: [
      'Xem thông tin liên hệ ứng viên',
      'Tin tuyển dụng nổi bật',
      'Đề xuất ứng viên AI',
    ],
  },
  {
    id: UserPlan.PRO,
    name: 'Pro',
    price: EMPLOYER_PLAN_PRICES[UserPlan.PRO],
    icon: ZapIcon,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    badgeCls: 'bg-blue-100 text-blue-700',
    borderCls: 'border-blue-200',
    ctaLabel: 'Nâng cấp Pro',
    ctaActiveCls: 'bg-blue-600 text-white hover:bg-blue-700',
    features: [
      `Đăng tối đa ${EMPLOYER_PLAN_LIMITS.PRO.maxActiveJobs} tin đang hoạt động`,
      'Xem thông tin liên hệ ứng viên (SĐT, email)',
      `${EMPLOYER_PLAN_LIMITS.PRO.featuredJobsPerMonth} tin nổi bật/tháng`,
      'Nhận đơn ứng tuyển không giới hạn',
      'Tìm kiếm & lọc ứng viên nâng cao',
      'Báo cáo & thống kê tuyển dụng',
    ],
    locked: ['Đề xuất ứng viên bằng AI', 'Tin nổi bật không giới hạn'],
  },
  {
    id: UserPlan.PREMIUM,
    name: 'Premium',
    price: EMPLOYER_PLAN_PRICES[UserPlan.PREMIUM],
    icon: CrownIcon,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    badgeCls: 'bg-amber-100 text-amber-700',
    borderCls: 'border-amber-300',
    highlight: true,
    ctaLabel: 'Nâng cấp Premium',
    ctaActiveCls: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90',
    features: [
      'Đăng tin không giới hạn',
      'Xem thông tin liên hệ ứng viên (SĐT, email)',
      'Tin nổi bật không giới hạn',
      'Đề xuất ứng viên phù hợp bằng AI',
      'Phân tích hành vi & insights ứng viên',
      'Hỗ trợ ưu tiên 24/7',
      'Huy hiệu nhà tuyển dụng cao cấp',
    ],
    locked: [],
  },
]

const BENEFITS = [
  { icon: UsersIcon,       title: 'Tiếp cận ứng viên chất lượng', desc: 'Xem số điện thoại & email để liên hệ trực tiếp' },
  { icon: FileTextIcon,    title: 'Đăng tin không giới hạn',       desc: 'Đăng bao nhiêu tin cũng được, không lo hết slot' },
  { icon: StarIcon,        title: 'Tin tuyển dụng nổi bật',        desc: 'Hiển thị ở vị trí đầu trang, tăng lượt xem' },
  { icon: BrainCircuitIcon,title: 'AI đề xuất ứng viên',           desc: 'Tự động gợi ý ứng viên phù hợp với yêu cầu' },
]

export default function EmployerUpgradePage() {
  const queryClient = useQueryClient()
  const [upgraded, setUpgraded] = useState<UserPlan | null>(null)
  const [checkoutPlan, setCheckoutPlan] = useState<{ id: 'PRO' | 'PREMIUM'; name: string; price: number } | null>(null)

  const { data: planInfo } = useQuery<PlanInfo>({
    queryKey: ['employer-plan'],
    queryFn: () => api.get('/employers/me/plan'),
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
            Tài khoản đã được nâng cấp lên <strong>{upgraded}</strong>.
            Bắt đầu đăng tin và tiếp cận ứng viên ngay bây giờ.
          </p>
        </div>
        <button
          onClick={() => {
            setUpgraded(null)
            queryClient.invalidateQueries({ queryKey: ['employer-plan'] })
          }}
          className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand/90"
        >
          Xem lại các gói
        </button>
      </div>
    )
  }

  return (
    <>
      {checkoutPlan && (
        <CheckoutModal
          plan={checkoutPlan}
          upgradeEndpoint="/employers/me/upgrade"
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
            <SparklesIcon className="h-4 w-4" /> Nâng cấp tài khoản nhà tuyển dụng
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Tuyển dụng hiệu quả hơn với gói nâng cấp</h1>
          <p className="mt-2 text-gray-500">
            Tiếp cận nhiều ứng viên hơn, đăng tin không giới hạn và nhận đề xuất AI thông minh
          </p>
          {planInfo?.planExpiresAt && currentPlan !== UserPlan.FREE && (
            <p className="mt-2 text-sm font-medium text-brand">
              Gói {currentPlan} còn hiệu lực đến{' '}
              {new Date(planInfo.planExpiresAt).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-gray-100 bg-white p-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                <Icon className="h-5 w-5 text-brand" />
              </div>
              <p className="text-xs font-bold text-gray-800">{title}</p>
              <p className="mt-1 text-[11px] text-gray-400">{desc}</p>
            </div>
          ))}
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
                  <div className="mb-4 flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${plan.iconBg}`}>
                      <Icon className={`h-5 w-5 ${plan.iconColor}`} />
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${plan.badgeCls}`}>
                      {plan.name}
                    </span>
                  </div>

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
              { q: 'Tôi có thể hủy đăng ký bất kỳ lúc nào không?', a: 'Có. Sau khi hủy, tài khoản vẫn ở gói nâng cấp đến hết chu kỳ thanh toán hiện tại.' },
              { q: 'Thông tin liên hệ ứng viên được hiển thị như thế nào?', a: 'Gói Pro và Premium cho phép xem số điện thoại và email của ứng viên đã nộp đơn, giúp liên hệ trực tiếp mà không qua trung gian.' },
              { q: 'Tin nổi bật hoạt động ra sao?', a: 'Tin nổi bật được ưu tiên hiển thị ở đầu danh sách tìm kiếm và trang chủ, tăng đáng kể lượt xem và đơn ứng tuyển.' },
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
