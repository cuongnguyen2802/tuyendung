'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeftIcon, ChevronRightIcon,
  ShoppingBagIcon, MegaphoneIcon, HeadphonesIcon, UsersIcon,
  LaptopIcon, LandmarkIcon, HomeIcon, CalculatorIcon,
  TruckIcon, HeartPulseIcon, GraduationCapIcon, PaletteIcon,
  HammerIcon, UtensilsIcon, NewspaperIcon, FactoryIcon,
  BriefcaseIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { JobCategoryDto } from '@tuyendung/types'

// ── Icon + color map (matched by keywords in category name) ───────────────

const STYLE_MAP: Array<{
  keywords: string[]
  icon: React.ElementType
  gradient: string
  iconColor: string
  iconBg: string
}> = [
  { keywords: ['kinh doanh', 'bán hàng'],        icon: ShoppingBagIcon,   gradient: 'from-orange-50 to-white',   iconColor: 'text-orange-500',  iconBg: 'bg-orange-100' },
  { keywords: ['marketing', 'truyền thông', 'quảng cáo', 'pr'], icon: MegaphoneIcon, gradient: 'from-purple-50 to-white', iconColor: 'text-purple-500', iconBg: 'bg-purple-100' },
  { keywords: ['chăm sóc khách hàng'],             icon: HeadphonesIcon,    gradient: 'from-brand-50 to-white',    iconColor: 'text-brand',   iconBg: 'bg-brand-100' },
  { keywords: ['nhân sự', 'hành chính'],           icon: UsersIcon,         gradient: 'from-blue-50 to-white',     iconColor: 'text-blue-500',    iconBg: 'bg-blue-100' },
  { keywords: ['công nghệ', 'it', 'phần mềm', 'outsourcing'], icon: LaptopIcon, gradient: 'from-emerald-50 to-white', iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100' },
  { keywords: ['tài chính', 'ngân hàng', 'bảo hiểm'], icon: LandmarkIcon, gradient: 'from-yellow-50 to-white',   iconColor: 'text-yellow-600',  iconBg: 'bg-yellow-100' },
  { keywords: ['bất động sản'],                    icon: HomeIcon,          gradient: 'from-teal-50 to-white',     iconColor: 'text-teal-600',    iconBg: 'bg-teal-100' },
  { keywords: ['kế toán', 'kiểm toán', 'thuế'],   icon: CalculatorIcon,    gradient: 'from-indigo-50 to-white',   iconColor: 'text-indigo-500',  iconBg: 'bg-indigo-100' },
  { keywords: ['vận tải', 'logistics'],            icon: TruckIcon,         gradient: 'from-slate-50 to-white',    iconColor: 'text-slate-600',   iconBg: 'bg-slate-100' },
  { keywords: ['y tế', 'dược', 'sức khỏe'],       icon: HeartPulseIcon,    gradient: 'from-rose-50 to-white',     iconColor: 'text-rose-500',    iconBg: 'bg-rose-100' },
  { keywords: ['giáo dục', 'đào tạo'],            icon: GraduationCapIcon, gradient: 'from-amber-50 to-white',    iconColor: 'text-amber-600',   iconBg: 'bg-amber-100' },
  { keywords: ['thiết kế', 'đồ họa', 'mỹ thuật'], icon: PaletteIcon,      gradient: 'from-pink-50 to-white',     iconColor: 'text-pink-500',    iconBg: 'bg-pink-100' },
  { keywords: ['xây dựng', 'kiến trúc', 'kỹ thuật'], icon: HammerIcon,    gradient: 'from-stone-50 to-white',    iconColor: 'text-stone-600',   iconBg: 'bg-stone-100' },
  { keywords: ['nhà hàng', 'khách sạn', 'ẩm thực'], icon: UtensilsIcon,   gradient: 'from-amber-50 to-white',    iconColor: 'text-amber-500',   iconBg: 'bg-amber-100' },
  { keywords: ['báo chí', 'nội dung', 'truyền thông'], icon: NewspaperIcon, gradient: 'from-cyan-50 to-white',  iconColor: 'text-cyan-600',    iconBg: 'bg-cyan-100' },
  { keywords: ['sản xuất', 'chế biến'],            icon: FactoryIcon,       gradient: 'from-gray-50 to-white',     iconColor: 'text-gray-600',    iconBg: 'bg-gray-200' },
]

function getStyle(name: string) {
  const lower = name.toLowerCase()
  return (
    STYLE_MAP.find((s) => s.keywords.some((k) => lower.includes(k))) ?? {
      icon: BriefcaseIcon,
      gradient: 'from-gray-50 to-white',
      iconColor: 'text-gray-500',
      iconBg: 'bg-gray-100',
    }
  )
}

// ── Component ─────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 8

export function TopIndustries({ categories }: { categories: JobCategoryDto[] }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE)

  if (categories.length === 0) return null

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Top ngành nghề nổi bật</h2>
            <p className="mt-1 text-sm text-gray-500">
              Bạn muốn tìm việc mới?{' '}
              <Link href="/jobs" className="font-medium text-brand hover:underline">
                Xem danh sách việc làm tại đây
              </Link>
            </p>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border transition',
                  page === 0
                    ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                    : 'border-gray-200 text-gray-500 hover:border-brand hover:text-brand',
                )}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border transition',
                  page === totalPages - 1
                    ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                    : 'border-gray-200 text-gray-500 hover:border-brand hover:text-brand',
                )}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {Array.from({ length: totalPages }).map((_, pageIdx) => {
              const items = categories.slice(pageIdx * ITEMS_PER_PAGE, (pageIdx + 1) * ITEMS_PER_PAGE)
              return (
                <div key={pageIdx} className="grid w-full shrink-0 grid-cols-2 gap-3 sm:grid-cols-4">
                  {items.map((cat) => {
                    const style = getStyle(cat.name)
                    const Icon = style.icon
                    const jobCount = cat.jobCount ?? 0
                    return (
                      <Link
                        key={cat.id}
                        href={`/jobs/${cat.slug}`}
                        className={cn(
                          'group relative flex flex-col justify-center gap-3 overflow-hidden rounded-2xl border-2 border-brand/20 bg-gradient-to-br p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-lg',
                          style.gradient,
                        )}
                        style={{ minHeight: 120 }}
                      >
                        {/* Icon */}
                        <div className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
                          style.iconBg,
                        )}>
                          <Icon className={cn('h-6 w-6', style.iconColor)} />
                        </div>

                        {/* Text */}
                        <div className="min-w-0">
                          <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-800">
                            {cat.name}
                          </p>
                          <p className={cn('mt-1 text-xs font-bold', jobCount > 0 ? 'text-brand' : 'text-gray-400')}>
                            {jobCount > 0
                              ? `${jobCount.toLocaleString('vi-VN')} việc làm`
                              : 'Chưa có tin'}
                          </p>
                        </div>

                        {/* Decorative circle */}
                        <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-current opacity-[0.04]" />
                      </Link>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Dot indicators */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === page ? 'w-6 bg-brand' : 'w-2 bg-gray-200 hover:bg-gray-300',
                )}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
