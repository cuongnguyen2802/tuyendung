import Link from 'next/link'
import { SearchIcon, HomeIcon, BriefcaseIcon, BuildingIcon } from 'lucide-react'
import { BackButton } from '@/components/common/BackButton'

const QUICK_LINKS = [
  { href: '/jobs', icon: BriefcaseIcon, label: 'Tìm việc làm', desc: 'Hàng nghìn tin tuyển dụng mới nhất' },
  { href: '/companies', icon: BuildingIcon, label: 'Khám phá công ty', desc: 'Xem profile và đánh giá công ty' },
  { href: '/blog', icon: SearchIcon, label: 'Cẩm nang nghề nghiệp', desc: 'Bí quyết xin việc & phát triển sự nghiệp' },
]

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-gray-50 px-4 py-16">

      {/* Illustration */}
      <div className="relative mb-8 select-none">
        {/* Background circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-64 w-64 rounded-full bg-brand/5" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-44 w-44 rounded-full bg-brand/8" />
        </div>

        {/* SVG Illustration */}
        <svg
          viewBox="0 0 320 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative h-56 w-56"
        >
          {/* Ground */}
          <ellipse cx="160" cy="210" rx="100" ry="10" fill="#e5e7eb" />

          {/* Person standing */}
          {/* Body */}
          <rect x="142" y="130" width="36" height="50" rx="6" fill="#d1fae5" stroke="#19734E" strokeWidth="2" />
          {/* Head */}
          <circle cx="160" cy="115" r="18" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5" />
          {/* Eyes - confused */}
          <circle cx="154" cy="113" r="2" fill="#374151" />
          <circle cx="166" cy="113" r="2" fill="#374151" />
          {/* Mouth - sad */}
          <path d="M154 120 Q160 116 166 120" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {/* Legs */}
          <rect x="148" y="178" width="10" height="28" rx="4" fill="#6b7280" />
          <rect x="162" y="178" width="10" height="28" rx="4" fill="#6b7280" />
          {/* Arms */}
          <path d="M142 140 L120 155" stroke="#d1fae5" strokeWidth="8" strokeLinecap="round" />
          <path d="M178 140 L200 130" stroke="#d1fae5" strokeWidth="8" strokeLinecap="round" />
          {/* Scratch head hand */}
          <circle cx="204" cy="126" r="6" fill="#fde68a" stroke="#f59e0b" strokeWidth="1.5" />

          {/* Big 404 text */}
          <text x="160" y="76" textAnchor="middle" fontSize="52" fontWeight="800" fill="#19734E" opacity="0.15" fontFamily="Arial">404</text>

          {/* Road sign post */}
          <rect x="58" y="90" width="4" height="110" rx="2" fill="#9ca3af" />
          {/* Sign board */}
          <rect x="20" y="70" width="80" height="36" rx="6" fill="#ffffff" stroke="#d1d5db" strokeWidth="1.5" />
          <text x="60" y="84" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="Arial" fontWeight="600">Trang bạn tìm</text>
          <text x="60" y="97" textAnchor="middle" fontSize="9" fill="#ef4444" fontFamily="Arial" fontWeight="700">KHÔNG TỒN TẠI</text>

          {/* Question marks floating */}
          <text x="230" y="80" fontSize="28" fill="#19734E" opacity="0.3" fontFamily="Arial" fontWeight="800">?</text>
          <text x="252" y="110" fontSize="18" fill="#19734E" opacity="0.2" fontFamily="Arial" fontWeight="800">?</text>
          <text x="214" y="108" fontSize="14" fill="#19734E" opacity="0.25" fontFamily="Arial" fontWeight="800">?</text>
        </svg>
      </div>

      {/* Text */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-5xl font-extrabold tracking-tight text-gray-900">
          404
        </h1>
        <p className="text-xl font-semibold text-gray-700">Trang không tồn tại</p>
        <p className="mt-2 text-sm text-gray-500">
          Trang bạn đang tìm kiếm đã bị xóa, đổi tên hoặc chưa bao giờ tồn tại.
        </p>
      </div>

      {/* Search bar suggestion */}
      <div className="mb-8 w-full max-w-md">
        <form action="/jobs" method="get" className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
          <SearchIcon className="ml-4 h-5 w-5 shrink-0 text-gray-400" />
          <input
            name="keyword"
            type="text"
            placeholder="Tìm kiếm việc làm..."
            className="h-12 flex-1 bg-transparent px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none"
          />
          <button
            type="submit"
            className="mr-2 rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-brand/90"
          >
            Tìm
          </button>
        </form>
      </div>

      {/* Quick links */}
      <div className="mb-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
        {QUICK_LINKS.map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm transition hover:border-brand/30 hover:shadow-md"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
              <Icon className="h-5 w-5 text-brand" />
            </span>
            <span className="text-sm font-semibold text-gray-800">{label}</span>
            <span className="text-xs text-gray-400">{desc}</span>
          </Link>
        ))}
      </div>

      {/* Back / Home buttons */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90"
        >
          <HomeIcon className="h-4 w-4" />
          Về trang chủ
        </Link>
        <BackButton />
      </div>

    </div>
  )
}
