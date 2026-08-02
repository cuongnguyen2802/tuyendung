'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  BriefcaseIcon, FileTextIcon, BellIcon, LockIcon, StarIcon,
  ChevronDownIcon, BookmarkIcon, ThumbsUpIcon, SlidersIcon,
  PenLineIcon, UsersIcon, EyeIcon, UserCircleIcon, ShieldIcon,
  SparklesIcon, LayoutDashboardIcon, CheckCircleIcon, MessageSquareIcon,
  ZapIcon, CrownIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { UserPlan } from '@tuyendung/types'

interface SidebarStats {
  newConnections: number
  newProfileViews: number
  activeApplications: number
  newApplicationResponses: number
}

const PLAN_BADGE: Record<UserPlan, { label: string; cls: string; Icon: React.ElementType } | null> = {
  [UserPlan.FREE]: null,
  [UserPlan.PRO]: { label: 'Pro', cls: 'bg-blue-100 text-blue-700', Icon: ZapIcon },
  [UserPlan.PREMIUM]: { label: 'Premium', cls: 'bg-amber-100 text-amber-700', Icon: CrownIcon },
}

type NavItem = {
  href: string
  label: string
  icon: React.ElementType
  badgeKey?: keyof SidebarStats
}

const NAV_SECTIONS: { id: string; label: string; icon: React.ElementType; items: NavItem[] }[] = [
  {
    id: 'jobs',
    label: 'Quản lý tìm việc',
    icon: BriefcaseIcon,
    items: [
      { href: '/saved-jobs',            label: 'Việc làm đã lưu',              icon: BookmarkIcon },
      { href: '/applications',          label: 'Việc làm đã ứng tuyển',        icon: FileTextIcon },
      { href: '/jobs?recommended=true', label: 'Việc làm phù hợp với bạn',     icon: ThumbsUpIcon },
      { href: '/settings/job-alerts',   label: 'Cài đặt gợi ý việc làm',       icon: SlidersIcon },
    ],
  },
  {
    id: 'cv',
    label: 'Quản lý CV & Cover letter',
    icon: FileTextIcon,
    items: [
      { href: '/resumes',       label: 'CV của tôi',         icon: FileTextIcon },
      { href: '/cover-letters', label: 'Cover Letter của tôi', icon: PenLineIcon },
      { href: '/connections',   label: 'NTD muốn kết nối với bạn', icon: UsersIcon,  badgeKey: 'newConnections' },
      { href: '/profile-views', label: 'NTD xem hồ sơ của bạn',   icon: EyeIcon,    badgeKey: 'newProfileViews' },
    ],
  },
  {
    id: 'noti',
    label: 'Cài đặt email & thông báo',
    icon: BellIcon,
    items: [
      { href: '/settings/notifications', label: 'Cài đặt thông báo', icon: BellIcon },
    ],
  },
  {
    id: 'security',
    label: 'Cá nhân & Bảo mật',
    icon: LockIcon,
    items: [
      { href: '/profile',           label: 'Thông tin cá nhân',  icon: UserCircleIcon },
      { href: '/settings/security', label: 'Bảo mật tài khoản',  icon: ShieldIcon },
    ],
  },
  {
    id: 'upgrade',
    label: 'Nâng cấp tài khoản',
    icon: StarIcon,
    items: [
      { href: '/upgrade', label: 'Xem gói nâng cấp', icon: SparklesIcon },
    ],
  },
]

export function CandidateSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const email = session?.user?.email

  const { data: stats } = useQuery<SidebarStats>({
    queryKey: ['candidate-sidebar-stats'],
    queryFn:  () => api.get('/users/me/sidebar-stats'),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    enabled: !!session,
  })

  const { data: planInfo } = useQuery<{ plan: UserPlan }>({
    queryKey: ['my-plan'],
    queryFn:  () => api.get('/users/me/plan'),
    staleTime: 5 * 60_000,
    enabled: !!session,
  })

  const planBadge = planInfo ? PLAN_BADGE[planInfo.plan] : null

  const getDefaultExpanded = () =>
    NAV_SECTIONS.filter(s => s.items.some(i => pathname.startsWith(i.href.split('?')[0]))).map(s => s.id)

  const [expanded, setExpanded] = useState<string[]>(() => {
    const active = getDefaultExpanded()
    return active.length ? active : ['jobs', 'cv']
  })

  const toggle = (id: string) =>
    setExpanded(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const initial = email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {/* User header */}
      <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-4 py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-bold text-gray-900">{email?.split('@')[0]}</p>
            {planBadge && (
              <span className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${planBadge.cls}`}>
                <planBadge.Icon className="h-2.5 w-2.5" />
                {planBadge.label}
              </span>
            )}
          </div>
          <p className="flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircleIcon className="h-3 w-3 shrink-0" /> Tài khoản đã xác thực
          </p>
        </div>
      </div>

      {/* Dashboard & Messages links */}
      <Link
        href="/dashboard"
        className={cn(
          'flex items-center gap-2.5 border-b border-gray-100 px-4 py-3 text-sm font-semibold transition',
          pathname === '/dashboard'
            ? 'bg-brand/5 text-brand'
            : 'text-gray-700 hover:bg-gray-50 hover:text-brand',
        )}
      >
        <LayoutDashboardIcon className={cn('h-4 w-4 shrink-0', pathname === '/dashboard' ? 'text-brand' : 'text-gray-400')} />
        Tổng quan
      </Link>
      <Link
        href="/messages"
        className={cn(
          'flex items-center gap-2.5 border-b border-gray-100 px-4 py-3 text-sm font-semibold transition',
          pathname === '/messages'
            ? 'bg-brand/5 text-brand'
            : 'text-gray-700 hover:bg-gray-50 hover:text-brand',
        )}
      >
        <MessageSquareIcon className={cn('h-4 w-4 shrink-0', pathname === '/messages' ? 'text-brand' : 'text-gray-400')} />
        Tin nhắn
      </Link>

      {/* Accordion nav */}
      <nav className="divide-y divide-gray-50">
        {NAV_SECTIONS.map(({ id, label, icon: Icon, items }) => {
          const isOpen = expanded.includes(id)
          const hasActive = items.some(i => pathname.startsWith(i.href.split('?')[0]))

          return (
            <div key={id}>
              <button
                onClick={() => toggle(id)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-3 text-left transition',
                  hasActive ? 'bg-brand/5' : 'hover:bg-gray-50',
                )}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className={cn('h-4 w-4 shrink-0', hasActive ? 'text-brand' : 'text-gray-400')} />
                  <span className={cn('text-sm font-semibold', hasActive ? 'text-brand' : 'text-gray-700')}>
                    {label}
                  </span>
                </span>
                <ChevronDownIcon className={cn(
                  'h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200',
                  isOpen && 'rotate-180',
                )} />
              </button>

              {isOpen && (
                <div className="pb-1">
                  {items.map(({ href, label: l, icon: ItemIcon, badgeKey }) => {
                    const active = pathname.startsWith(href.split('?')[0]) && !href.includes('?')
                      || pathname === href.split('?')[0]
                    const badge = badgeKey && stats ? stats[badgeKey] : 0
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          'flex items-center gap-2.5 py-2 pl-10 pr-4 text-sm transition',
                          active
                            ? 'font-semibold text-brand'
                            : 'text-gray-600 hover:bg-brand/5 hover:text-brand',
                        )}
                      >
                        <ItemIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="flex-1">{l}</span>
                        {badge > 0 && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
                            {badge > 99 ? '99+' : badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}
