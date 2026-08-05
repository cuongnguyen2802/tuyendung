'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  LayoutDashboardIcon, BarChart3Icon, SparklesIcon, UsersRoundIcon,
  BriefcaseIcon, Building2Icon, PlusCircleIcon, ChevronRightIcon,
  BadgeCheckIcon, ShieldAlertIcon, FolderOpenIcon, TrophyIcon,
  ShoppingCartIcon, MegaphoneIcon, MessageSquareIcon, HistoryIcon,
  SettingsIcon, BellIcon, ZapIcon,
  ReceiptIcon, FileTextIcon, CreditCardIcon, TrendingUpIcon, UsersIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import { UserPlan } from '@tuyendung/types'
import { cn } from '@/lib/utils'
import { useSystemNotifStore } from '@/store/systemNotifStore'

interface Company {
  companyName: string
  logoUrl?: string
  verified: boolean
}

interface DashboardStats {
  totalJobs: number
  publishedJobs: number
  totalApplications: number
  newApplications: number
}

interface PlanInfo {
  plan: UserPlan
  planExpiresAt: string | null
  limits: { maxActiveJobs: number | typeof Infinity; canViewContactInfo: boolean; featuredJobsPerMonth: number | typeof Infinity; aiSuggestions: boolean }
}

type NavItem = {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
  soon?: boolean
  badgeKey?: 'totalApplications' | 'newApplications'
  staticBadge?: number
}

type NavSection = { divider?: boolean; items: NavItem[] }

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { href: '/employer/dashboard', label: 'Bảng tin',     icon: LayoutDashboardIcon, exact: true },
      { href: '/employer/insights',  label: 'Insights',      icon: BarChart3Icon },
      { href: '/employer/rewards',   label: 'Phần thưởng',   icon: TrophyIcon },
      { href: '/employer/shop',      label: 'Đổi quà',       icon: ShoppingCartIcon },
    ],
  },
  {
    divider: true,
    items: [
      { href: '/employer/ai',        label: 'AI - Đề xuất',  icon: SparklesIcon,   badgeKey: 'newApplications' as const },
      { href: '/employer/candidates',label: 'CV đề xuất',   icon: UsersRoundIcon, badgeKey: 'newApplications' as const },
      { href: '/employer/campaigns', label: 'Chiến dịch',   icon: MegaphoneIcon },
      { href: '/employer/jobs',      label: 'Tin tuyển dụng',     icon: BriefcaseIcon },
      { href: '/employer/jobs/new',  label: 'Đăng tin mới',       icon: PlusCircleIcon,       exact: true },
    ],
  },
  {
    divider: true,
    items: [
      { href: '/employer/billing/orders',   label: 'Đơn hàng / Dịch vụ',      icon: ReceiptIcon },
      { href: '/employer/billing/invoices', label: 'Hóa đơn',                  icon: FileTextIcon },
      { href: '/employer/billing/payments', label: 'Lịch sử thanh toán',       icon: CreditCardIcon },
    ],
  },
  {
    divider: true,
    items: [
      { href: '/employer/reports/jobs',       label: 'Báo cáo việc làm',   icon: TrendingUpIcon },
      { href: '/employer/reports/candidates', label: 'Báo cáo ứng viên',   icon: UsersIcon },
    ],
  },
  {
    divider: true,
    items: [
      { href: '/employer/team',                    label: 'Quản trị viên',         icon: ShieldCheckIcon },
      { href: '/employer/messages',               label: 'Tin nhắn',              icon: MessageSquareIcon },
      { href: '/employer/company',                label: 'Thông tin công ty',     icon: Building2Icon },
      { href: '/employer/resumes',                label: 'Tìm ứng viên',          icon: FolderOpenIcon },
      { href: '/employer/activity',               label: 'Lịch sử hoạt động',    icon: HistoryIcon },
      { href: '/employer/system-notifications',   label: 'Thông báo hệ thống',   icon: BellIcon },
      { href: '/employer/settings',               label: 'Cài đặt tài khoản',    icon: SettingsIcon },
    ],
  },
]

function isActive(href: string, pathname: string, exact?: boolean) {
  if (exact) return pathname === href
  if (href === '/employer/jobs') {
    return pathname === '/employer/jobs' ||
      (pathname.startsWith('/employer/jobs/') && !pathname.startsWith('/employer/jobs/new'))
  }
  return pathname === href || pathname.startsWith(href + '/')
}

export function EmployerSidebar() {
  const pathname = usePathname()
  const { unreadCount: sysUnreadCount } = useSystemNotifStore()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const { data: company } = useQuery<Company>({
    queryKey: ['my-company'],
    queryFn: () => api.get('/employers/me/company'),
  })

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['employer-dashboard'],
    queryFn: () => api.get('/employers/me/dashboard'),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  })

  const { data: planInfo } = useQuery<PlanInfo>({
    queryKey: ['employer-plan'],
    queryFn: () => api.get('/employers/me/plan'),
    staleTime: 5 * 60_000,
  })

  const initial = company?.companyName?.[0]?.toUpperCase() ?? 'E'

  const getBadge = (key?: 'newApplications' | 'totalApplications') => {
    if (!key || !stats) return undefined
    return stats[key]
  }

  return (
    <div className="flex flex-col">

      {/* ── Company profile ─────────────────────────────────────── */}
      <div className="border-b border-gray-100 pb-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0">
            <div className="h-12 w-12 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {company?.logoUrl ? (
                <img src={company.logoUrl} alt="" className="h-full w-full object-contain p-0.5" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand/10 text-base font-bold text-brand">
                  {initial}
                </div>
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-gray-900">
              {company?.companyName ?? 'Nhà tuyển dụng'}
            </p>
            <p className="text-xs text-gray-400">Nhà tuyển dụng</p>
          </div>
        </div>

        {/* Verification */}
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {company?.verified ? (
            <>
              <BadgeCheckIcon className="h-3.5 w-3.5 shrink-0 text-brand" />
              <span className="font-medium text-brand">Tài khoản đã xác minh</span>
            </>
          ) : (
            <>
              <ShieldAlertIcon className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span className="font-medium text-amber-600">Chưa xác minh</span>
            </>
          )}
        </div>

        {/* Safety warning */}
        {!company?.verified && (
          <Link
            href="/employer/company"
            className="mt-2 flex w-full items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
          >
            <span>🔒 Tài khoản chưa đủ an toàn</span>
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* ── Plan badge ──────────────────────────────────────────── */}
      <div className="mb-2 border-b border-gray-100 pb-4">
        {planInfo && planInfo.plan !== UserPlan.FREE ? (
          <Link
            href="/employer/upgrade"
            className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs transition hover:bg-amber-100"
          >
            <span className="flex items-center gap-1.5 font-bold text-amber-700">
              <ZapIcon className="h-3.5 w-3.5" />
              Gói {planInfo.plan}
            </span>
            {planInfo.planExpiresAt && (
              <span className="text-amber-600">
                đến {new Date(planInfo.planExpiresAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
              </span>
            )}
          </Link>
        ) : (
          <Link
            href="/employer/upgrade"
            className="flex items-center justify-between rounded-xl border border-dashed border-brand/40 bg-brand/5 px-3 py-2.5 text-xs font-semibold text-brand transition hover:bg-brand/10"
          >
            <span className="flex items-center gap-1.5">
              <ZapIcon className="h-3.5 w-3.5" />
              Nâng cấp tài khoản
            </span>
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* ── Navigation ──────────────────────────────────────────── */}
      <nav className="flex-1">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si}>
            {section.divider && si > 0 && (
              <div className="my-1.5 border-t border-gray-100" />
            )}
            {section.items.map(({ href, label, icon: Icon, exact, soon, badgeKey, staticBadge }) => {
              const active = isActive(href, pathname, exact)
              const badge = href === '/employer/system-notifications'
                ? (mounted ? sysUnreadCount() : 0)
                : (staticBadge ?? getBadge(badgeKey))
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    active
                      ? 'bg-brand/10 font-semibold text-brand'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className={cn('h-4 w-4 shrink-0 transition', active ? 'text-brand' : 'text-gray-400 group-hover:text-gray-600')} />
                    {label}
                    {soon && (
                      <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
                        Sắp có
                      </span>
                    )}
                  </span>
                  {badge != null && badge > 0 && (
                    <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-800 px-1.5 text-[10px] font-bold text-white">
                      {badge > 999 ? '999+' : badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* ── Quick stats footer ──────────────────────────────────── */}
      {stats && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <p className="text-base font-bold text-gray-900">{stats.publishedJobs}</p>
              <p className="text-[10px] text-gray-500">Tin đang tuyển</p>
            </div>
            <div>
              <p className="text-base font-bold text-brand">{stats.newApplications}</p>
              <p className="text-[10px] text-gray-500">CV mới 7 ngày</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
