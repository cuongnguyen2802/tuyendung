'use client'

import { EmployerDto } from '@tuyendung/types'

// Clearbit đã ngừng hoạt động — dùng Simple Icons CDN (không cần API key) và
// Wikipedia Wikimedia thumbnails (hotlink được phép) cho VN companies.
const FAMOUS: { name: string; logo: string }[] = [
  // ── Việt Nam ──────────────────────────────────────────────────────────────
  { name: 'FPT Software',    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/FPT_logo_2010.svg/200px-FPT_logo_2010.svg.png' },
  { name: 'VNG Corporation', logo: 'https://upload.wikimedia.org/wikipedia/vi/thumb/4/47/VNG_Corporation_logo_2022.svg/200px-VNG_Corporation_logo_2022.svg.png' },
  { name: 'Viettel',         logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Viettel_logo.svg/200px-Viettel_logo.svg.png' },
  { name: 'Tiki',            logo: 'https://upload.wikimedia.org/wikipedia/vi/thumb/7/7c/Tiki_logo.svg/200px-Tiki_logo.svg.png' },
  { name: 'Vingroup',        logo: 'https://upload.wikimedia.org/wikipedia/vi/thumb/b/b2/Logo_vingroup.png/200px-Logo_vingroup.png' },
  { name: 'Masan Group',     logo: 'https://upload.wikimedia.org/wikipedia/vi/thumb/f/f5/Logo_Masan_Group.png/200px-Logo_Masan_Group.png' },
  { name: 'Techcombank',     logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Techcombank_logo.svg/200px-Techcombank_logo.svg.png' },
  { name: 'MB Bank',         logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/MB_bank_logo.svg/200px-MB_bank_logo.svg.png' },
  { name: 'VPBank',          logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/VPBank_logo.svg/200px-VPBank_logo.svg.png' },
  // ── Quốc tế ───────────────────────────────────────────────────────────────
  { name: 'Shopee',          logo: 'https://cdn.simpleicons.org/shopee/EE4D2D' },
  { name: 'Grab',            logo: 'https://cdn.simpleicons.org/grab/00B14F' },
  { name: 'Google',          logo: 'https://cdn.simpleicons.org/google/4285F4' },
  { name: 'Samsung',         logo: 'https://cdn.simpleicons.org/samsung/1428A0' },
  { name: 'Intel',           logo: 'https://cdn.simpleicons.org/intel/0071C5' },
  { name: 'Microsoft',       logo: 'https://cdn.simpleicons.org/microsoft/0078D4' },
  { name: 'Unilever',        logo: 'https://cdn.simpleicons.org/unilever/1F36C7' },
  { name: 'Nestlé',          logo: 'https://cdn.simpleicons.org/nestle/009A44' },
]

export function CompanyMarquee({ companies: _ = [] }: { companies?: EmployerDto[] }) {
  // Chỉ dùng danh sách curated — không mix với DB seed data (có thể có logo sai/thiếu)
  const doubled = [...FAMOUS, ...FAMOUS]

  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-5xl px-4">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
          Được tin dùng bởi 2,000+ doanh nghiệp hàng đầu
        </p>

        <div className="relative overflow-hidden rounded-xl">
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />

          <div className="flex animate-marquee items-center gap-12 py-1">
            {doubled.map((item, i) => (
              <img
                key={i}
                src={item.logo}
                alt={item.name}
                title={item.name}
                className="h-8 w-auto max-w-[100px] shrink-0 object-contain grayscale opacity-50 transition-all duration-300 hover:grayscale-0 hover:opacity-100"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
