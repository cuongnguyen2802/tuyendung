'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { TrophyIcon, StarIcon, ZapIcon, ShieldCheckIcon, CrownIcon, GiftIcon } from 'lucide-react'

// ── Tier config ────────────────────────────────────────────────────────────────

const TIERS = [
  {
    name: 'Đồng',
    min: 0, max: 499,
    color: 'from-amber-700 to-amber-500',
    badge: 'bg-amber-100 text-amber-800',
    icon: ShieldCheckIcon,
    perks: ['Đăng 5 tin/tháng', 'Hiển thị cơ bản', 'Hỗ trợ email'],
  },
  {
    name: 'Bạc',
    min: 500, max: 1999,
    color: 'from-gray-400 to-gray-300',
    badge: 'bg-gray-100 text-gray-700',
    icon: StarIcon,
    perks: ['Đăng 15 tin/tháng', 'Nổi bật tìm kiếm', 'Hỗ trợ ưu tiên', 'Xem CV ẩn danh'],
  },
  {
    name: 'Vàng',
    min: 2000, max: 4999,
    color: 'from-yellow-500 to-amber-400',
    badge: 'bg-yellow-100 text-yellow-800',
    icon: TrophyIcon,
    perks: ['Đăng không giới hạn', 'Featured job 2x/tháng', 'Báo cáo chi tiết', 'AI gợi ý ứng viên'],
  },
  {
    name: 'Kim cương',
    min: 5000, max: Infinity,
    color: 'from-blue-500 to-violet-500',
    badge: 'bg-blue-100 text-blue-800',
    icon: CrownIcon,
    perks: ['Tất cả tính năng Vàng', 'Quản lý tài khoản riêng', 'Featured job không giới hạn', 'API tích hợp'],
  },
]

const EARN_WAYS = [
  { label: 'Đăng tin tuyển dụng', points: '+50 điểm/tin', icon: '📋' },
  { label: 'Tin được duyệt và xuất bản', points: '+100 điểm/tin', icon: '✅' },
  { label: 'Tuyển dụng thành công', points: '+500 điểm/vị trí', icon: '🎉' },
  { label: 'Hồ sơ công ty đầy đủ', points: '+200 điểm (1 lần)', icon: '🏢' },
  { label: 'Xác minh tài khoản', points: '+300 điểm (1 lần)', icon: '🛡️' },
]

export default function RewardsPage() {
  const { data: stats } = useQuery<{ totalJobs: number; publishedJobs: number; totalApplications: number }>({
    queryKey: ['employer-dashboard'],
    queryFn: () => api.get('/employers/me/dashboard'),
  })

  const { data: company } = useQuery<{ verified: boolean; companyName?: string; description?: string; logoUrl?: string }>({
    queryKey: ['my-company'],
    queryFn: () => api.get('/employers/me/company'),
  })

  // Simple points calculation from existing data
  const points = Math.round(
    (stats?.publishedJobs ?? 0) * 150 +
    (stats?.totalApplications ?? 0) * 5 +
    (company?.verified ? 300 : 0) +
    (company?.description ? 200 : 0)
  )

  const currentTier = TIERS.find(t => points >= t.min && points <= t.max) ?? TIERS[0]
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1]
  const progress = nextTier
    ? ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100

  const TierIcon = currentTier.icon

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Phần thưởng</h1>
        <p className="mt-0.5 text-sm text-gray-500">Tích điểm qua hoạt động tuyển dụng để mở khoá quyền lợi</p>
      </div>

      {/* Points card */}
      <div className={cn('relative overflow-hidden rounded-2xl bg-gradient-to-r p-6 text-white', currentTier.color)}>
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 right-16 h-24 w-24 rounded-full bg-white/10" />

        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TierIcon className="h-5 w-5 text-white/80" />
              <span className="text-sm font-semibold text-white/80">Hạng {currentTier.name}</span>
            </div>
            <p className="mt-2 text-4xl font-extrabold">{points.toLocaleString()}</p>
            <p className="text-sm text-white/80">điểm tích lũy</p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <TierIcon className="h-8 w-8 text-white" />
          </div>
        </div>

        {nextTier && (
          <div className="relative mt-4">
            <div className="mb-1.5 flex justify-between text-xs text-white/70">
              <span>{points.toLocaleString()} điểm</span>
              <span>Hạng {nextTier.name}: {nextTier.min.toLocaleString()} điểm</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white/80 transition-all duration-700"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
            <p className="mt-1 text-right text-xs text-white/70">
              Cần thêm {(nextTier.min - points).toLocaleString()} điểm để lên hạng {nextTier.name}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Tier benefits */}
        <div className="card overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3">
            <p className="text-sm font-semibold text-gray-700">Quyền lợi hạng {currentTier.name}</p>
          </div>
          <div className="p-5 space-y-2.5">
            {currentTier.perks.map(perk => (
              <div key={perk} className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100">
                  <svg viewBox="0 0 12 12" className="h-3 w-3 text-brand" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Earn ways */}
        <div className="card overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3">
            <p className="text-sm font-semibold text-gray-700">Cách tích điểm</p>
          </div>
          <div className="divide-y divide-gray-100">
            {EARN_WAYS.map(w => (
              <div key={w.label} className="flex items-center gap-3 px-5 py-3">
                <span className="text-xl">{w.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{w.label}</p>
                </div>
                <span className="text-xs font-semibold text-brand">{w.points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All tiers comparison */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3">
          <p className="text-sm font-semibold text-gray-700">Bảng hạng thành viên</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 lg:grid-cols-4">
          {TIERS.map(tier => {
            const Icon = tier.icon
            const isCurrentTier = tier.name === currentTier.name
            return (
              <div key={tier.name} className={cn('p-5', isCurrentTier && 'bg-brand/3')}>
                <div className={cn('mb-3 w-fit rounded-xl bg-gradient-to-br p-2.5', tier.color)}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className={cn('font-bold', isCurrentTier ? 'text-brand' : 'text-gray-900')}>
                  Hạng {tier.name}
                  {isCurrentTier && <span className="ml-1 text-xs">(hiện tại)</span>}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {tier.max === Infinity ? `≥ ${tier.min.toLocaleString()}` : `${tier.min.toLocaleString()} – ${tier.max.toLocaleString()}`} điểm
                </p>
                <ul className="mt-3 space-y-1">
                  {tier.perks.slice(0, 3).map(p => (
                    <li key={p} className="flex items-start gap-1.5 text-xs text-gray-500">
                      <span className="mt-0.5 text-brand">✓</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
