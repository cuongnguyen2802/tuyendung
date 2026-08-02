'use client'

import { EmployerDto } from '@tuyendung/types'

// Hardcoded famous Vietnamese companies with Clearbit logos
const FAMOUS: { name: string; logo: string }[] = [
  { name: 'FPT Software',     logo: 'https://logo.clearbit.com/fpt.com.vn' },
  { name: 'Vingroup',         logo: 'https://logo.clearbit.com/vingroup.net' },
  { name: 'VNG Corporation',  logo: 'https://logo.clearbit.com/vng.com.vn' },
  { name: 'Masan Group',      logo: 'https://logo.clearbit.com/masangroup.com' },
  { name: 'Techcombank',      logo: 'https://logo.clearbit.com/techcombank.com' },
  { name: 'VPBank',           logo: 'https://logo.clearbit.com/vpbank.com.vn' },
  { name: 'MB Bank',          logo: 'https://logo.clearbit.com/mbbank.com.vn' },
  { name: 'Grab',             logo: 'https://logo.clearbit.com/grab.com' },
  { name: 'Shopee',           logo: 'https://logo.clearbit.com/shopee.vn' },
  { name: 'Tiki',             logo: 'https://logo.clearbit.com/tiki.vn' },
  { name: 'Viettel',          logo: 'https://logo.clearbit.com/viettel.com.vn' },
  { name: 'Samsung',          logo: 'https://logo.clearbit.com/samsung.com' },
  { name: 'Intel',            logo: 'https://logo.clearbit.com/intel.com' },
  { name: 'Nestlé',           logo: 'https://logo.clearbit.com/nestle.com' },
  { name: 'Unilever',         logo: 'https://logo.clearbit.com/unilever.com' },
  { name: 'Google',           logo: 'https://logo.clearbit.com/google.com' },
]

interface LogoItem {
  name: string
  logo: string | null
}

function LogoSlot({ item }: { item: LogoItem }) {
  if (item.logo) {
    return (
      <img
        src={item.logo}
        alt={item.name}
        title={item.name}
        className="h-8 w-auto max-w-[96px] shrink-0 object-contain grayscale opacity-50 transition-all duration-300 hover:grayscale-0 hover:opacity-100"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
      />
    )
  }

  // Letter fallback for companies without logoUrl
  return (
    <span
      title={item.name}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-400 grayscale opacity-50 transition-all duration-300 hover:grayscale-0 hover:opacity-100"
    >
      {item.name.charAt(0)}
    </span>
  )
}

export function CompanyMarquee({ companies = [] }: { companies?: EmployerDto[] }) {
  // DB companies that have logos come first, then famous list
  const dbItems: LogoItem[] = companies.map((c) => ({ name: c.companyName, logo: c.logoUrl ?? null }))
  const allItems: LogoItem[] = [...dbItems, ...FAMOUS]
  const doubled = [...allItems, ...allItems]

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

          <div className="flex animate-marquee items-center gap-10 py-1">
            {doubled.map((item, i) => (
              <LogoSlot key={i} item={item} />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
