import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckIcon, XIcon } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Bảng giá dịch vụ — TuyenDung.vn',
  description: 'Gói dịch vụ tuyển dụng cho doanh nghiệp từ cơ bản đến Pro. Minh bạch, không phát sinh.',
}

const PLANS = [
  {
    name: 'Cơ bản',
    price: null,
    priceLabel: 'Miễn phí',
    desc: 'Phù hợp để bắt đầu và tuyển dụng quy mô nhỏ.',
    cta: 'Đăng ký ngay',
    ctaHref: '/register?role=EMPLOYER',
    highlight: false,
    features: [
      { label: '3 tin tuyển dụng / tháng', ok: true },
      { label: 'Xem tối đa 50 hồ sơ / tin', ok: true },
      { label: 'Tìm kiếm ứng viên cơ bản', ok: true },
      { label: 'Quản lý ứng viên theo pipeline', ok: true },
      { label: 'Gợi ý ứng viên bằng AI', ok: false },
      { label: 'Nổi bật trong tìm kiếm', ok: false },
      { label: 'Báo cáo & thống kê nâng cao', ok: false },
      { label: 'Hỗ trợ ưu tiên', ok: false },
    ],
  },
  {
    name: 'Tiêu chuẩn',
    price: 990000,
    priceLabel: '990.000₫',
    period: '/ tháng',
    desc: 'Dành cho doanh nghiệp đang tăng trưởng cần tuyển dụng thường xuyên.',
    cta: 'Dùng thử 7 ngày miễn phí',
    ctaHref: '/register?role=EMPLOYER&plan=standard',
    highlight: true,
    badge: 'Phổ biến nhất',
    features: [
      { label: '15 tin tuyển dụng / tháng', ok: true },
      { label: 'Hồ sơ không giới hạn', ok: true },
      { label: 'Tìm kiếm ứng viên nâng cao', ok: true },
      { label: 'Quản lý ứng viên theo pipeline', ok: true },
      { label: 'Gợi ý ứng viên bằng AI', ok: true },
      { label: 'Nổi bật trong tìm kiếm', ok: true },
      { label: 'Báo cáo & thống kê nâng cao', ok: false },
      { label: 'Hỗ trợ ưu tiên', ok: false },
    ],
  },
  {
    name: 'Pro',
    price: 2490000,
    priceLabel: '2.490.000₫',
    period: '/ tháng',
    desc: 'Cho doanh nghiệp lớn và đội tuyển dụng chuyên nghiệp.',
    cta: 'Liên hệ tư vấn',
    ctaHref: '/contact',
    highlight: false,
    features: [
      { label: 'Tin tuyển dụng không giới hạn', ok: true },
      { label: 'Hồ sơ không giới hạn', ok: true },
      { label: 'Tìm kiếm ứng viên nâng cao', ok: true },
      { label: 'Quản lý ứng viên theo pipeline', ok: true },
      { label: 'Gợi ý ứng viên bằng AI', ok: true },
      { label: 'Nổi bật trong tìm kiếm', ok: true },
      { label: 'Báo cáo & thống kê nâng cao', ok: true },
      { label: 'Hỗ trợ ưu tiên 24/7', ok: true },
    ],
  },
]

const FAQS = [
  { q: 'Tôi có thể hủy gói bất kỳ lúc nào không?', a: 'Có. Bạn có thể hủy đăng ký bất kỳ lúc nào. Gói vẫn còn hiệu lực đến hết chu kỳ thanh toán hiện tại.' },
  { q: 'Có hợp đồng ràng buộc không?', a: 'Không. Tất cả gói đều thanh toán theo tháng, không có cam kết dài hạn. Gói Pro có thể đàm phán hợp đồng năm để được giá tốt hơn.' },
  { q: 'Phương thức thanh toán nào được chấp nhận?', a: 'Chuyển khoản ngân hàng, Visa/Mastercard, MoMo, ZaloPay và VNPay.' },
  { q: 'Tôi có được hóa đơn VAT không?', a: 'Có. Vui lòng cung cấp thông tin xuất hóa đơn khi thanh toán hoặc liên hệ billing@tuyendung.vn.' },
]

export default function PricingPage() {
  return (
    <>
      <div className="border-b border-gray-100 bg-gradient-to-br from-brand/5 via-white to-emerald-50">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">Bảng giá</p>
          <h1 className="mb-3 text-3xl font-extrabold text-gray-900">Đơn giản, minh bạch</h1>
          <p className="text-gray-500">Không phí ẩn. Không hợp đồng phức tạp. Chỉ trả tiền cho những gì bạn dùng.</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12">

        {/* Plans */}
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                plan.highlight
                  ? 'border-brand bg-brand/5 shadow-lg shadow-brand/10'
                  : 'border-gray-200 bg-white shadow-sm'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">
                  {plan.badge}
                </span>
              )}

              <div className="mb-5">
                <h2 className="mb-1 text-lg font-bold text-gray-900">{plan.name}</h2>
                <div className="mb-1 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-gray-900">{plan.priceLabel}</span>
                  {plan.period && <span className="text-sm text-gray-400">{plan.period}</span>}
                </div>
                <p className="text-sm text-gray-500">{plan.desc}</p>
              </div>

              <ul className="mb-6 flex-1 space-y-2.5">
                {plan.features.map(f => (
                  <li key={f.label} className="flex items-center gap-2.5 text-sm">
                    {f.ok
                      ? <CheckIcon className="h-4 w-4 shrink-0 text-brand" />
                      : <XIcon className="h-4 w-4 shrink-0 text-gray-300" />
                    }
                    <span className={f.ok ? 'text-gray-700' : 'text-gray-400'}>{f.label}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaHref}
                className={`block rounded-xl py-2.5 text-center text-sm font-bold transition ${
                  plan.highlight
                    ? 'bg-brand text-white hover:bg-brand/90'
                    : 'border border-gray-300 text-gray-700 hover:border-brand hover:text-brand'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Enterprise */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Gói Enterprise — Tùy chỉnh theo nhu cầu</h3>
              <p className="mt-1 text-sm text-gray-500">
                Dành cho tập đoàn lớn, chuỗi bán lẻ và đơn vị tuyển dụng hàng trăm vị trí mỗi tháng. Tích hợp API, SSO, đào tạo đội nhóm và SLA cam kết.
              </p>
            </div>
            <Link
              href="/contact"
              className="shrink-0 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition"
            >
              Liên hệ ngay
            </Link>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-12">
          <h2 className="mb-6 text-center text-xl font-bold text-gray-900">Câu hỏi thường gặp về giá</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FAQS.map(faq => (
              <div key={faq.q} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="mb-1.5 font-semibold text-gray-800 text-sm">{faq.q}</p>
                <p className="text-sm text-gray-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
