'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { NotificationsBell } from '@/components/layout/NotificationsBell'
import {
  BriefcaseIcon, PlusCircleIcon, UsersIcon, MessageSquareIcon,
  BarChart3Icon, UserCircleIcon, LogOutIcon, ChevronDownIcon,
  LayoutDashboardIcon, Building2Icon, FolderOpenIcon, MenuIcon,
} from 'lucide-react'

const NAV_ITEMS = [
  {
    href: '/employer/jobs/new',
    label: 'Đăng tin',
    icon: PlusCircleIcon,
    exact: true,
    highlight: true,
  },
  {
    href: '/employer/candidates',
    label: 'Tìm CV',
    icon: UsersIcon,
  },
  {
    href: '/employer/messages',
    label: 'Connect',
    icon: MessageSquareIcon,
    badge: 'unread',
  },
  {
    href: '/employer/insights',
    label: 'Insights',
    icon: BarChart3Icon,
  },
]

function isActive(href: string, pathname: string, exact?: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(href + '/')
}

export function EmployerTopbar({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const email = session?.user?.email

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ['unread-messages-count'],
    queryFn:  () => api.get('/messages/unread-count').then((res: any) => res?.count ?? 0),
    refetchInterval: 15000,
    enabled: !!session,
  })

  return (
    <header className="sticky top-0 z-50 bg-[#1e2d3d] shadow-lg">
      <div className="flex h-14 w-full items-center gap-2 px-4 lg:px-6">

        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 transition lg:hidden"
          aria-label="Mở menu"
        >
          <MenuIcon className="h-5 w-5" />
        </button>

        {/* Logo */}
        <Link
          href="/employer/dashboard"
          className="flex shrink-0 items-center gap-2 text-white lg:mr-3"
        >
          <BriefcaseIcon className="h-5 w-5 text-brand" />
          <span className="text-base font-bold tracking-tight">
            TuyenDung<span className="text-brand">.vn</span>
          </span>
        </Link>

        <div className="mx-2 hidden h-5 w-px bg-white/20 lg:block" />

        {/* Nav items — hidden on mobile (accessible via sidebar drawer) */}
        <nav className="hidden flex-1 items-center gap-0.5 lg:flex">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact, highlight, soon, badge }) => {
            const active = isActive(href, pathname, exact)
            const count  = badge === 'unread' ? (unreadCount as number) : 0

            if (highlight) {
              return (
                <Link
                  key={href}
                  href={href}
                  className="mr-2 flex items-center gap-1.5 rounded-full border border-brand/60 px-4 py-1.5 text-sm font-semibold text-brand/60 transition hover:bg-brand/70/10"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              )
            }

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition',
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
                {soon && (
                  <span className="rounded bg-white/10 px-1 py-0.5 text-[9px] font-bold uppercase text-white/50">
                    Beta
                  </span>
                )}
                {count > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right: notifications + avatar */}
        <div className="flex items-center gap-1">
          <div className="[&_button]:text-white/80 [&_button:hover]:text-white [&_button:hover]:bg-white/10 [&_.absolute]:text-gray-800">
            <NotificationsBell messageCount={unreadCount} showSystemNotifs notifInboxHref="/employer/notifications" />
          </div>
          {email && <EmployerUserMenu email={email} />}
        </div>
      </div>
    </header>
  )
}

function EmployerUserMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initial = email[0]?.toUpperCase() ?? 'E'

  const enter = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
    setOpen(true)
  }
  const leave = () => { timer.current = setTimeout(() => setOpen(false), 180) }

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
        aria-label="Tài khoản"
      >
        <span className="text-sm font-bold">{initial}</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
          <div className="border-b border-gray-100 bg-gray-50/70 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1e2d3d] text-sm font-bold text-white">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-gray-900">{email.split('@')[0]}</p>
                <p className="truncate text-[10px] text-gray-400">{email}</p>
              </div>
            </div>
          </div>

          <div className="py-1.5">
            <DropItem href="/employer/dashboard"  icon={LayoutDashboardIcon} onClose={() => setOpen(false)}>Dashboard</DropItem>
            <DropItem href="/employer/jobs"       icon={BriefcaseIcon}       onClose={() => setOpen(false)}>Tin tuyển dụng</DropItem>
            <DropItem href="/employer/company"    icon={Building2Icon}       onClose={() => setOpen(false)}>Thông tin công ty</DropItem>
            <DropItem href="/employer/candidates" icon={UsersIcon}           onClose={() => setOpen(false)}>Quản lý CV</DropItem>
            <DropItem href="/employer/messages"   icon={MessageSquareIcon}   onClose={() => setOpen(false)}>Tin nhắn</DropItem>
          </div>

          <div className="border-t border-gray-100">
            <button
              onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }) }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 transition hover:bg-red-50"
            >
              <LogOutIcon className="h-4 w-4" />Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DropItem({
  href, icon: Icon, children, onClose,
}: {
  href: string
  icon: React.ElementType
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-brand"
    >
      <Icon className="h-4 w-4 shrink-0 text-gray-400" />
      {children}
    </Link>
  )
}
