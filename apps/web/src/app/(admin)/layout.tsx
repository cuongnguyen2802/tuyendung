'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboardIcon, BriefcaseIcon, UsersIcon,
  Building2Icon, ShieldIcon, HomeIcon, LogOutIcon, MenuIcon,
  PanelRightIcon, NewspaperIcon, TagsIcon, UserCircleIcon, ImagesIcon,
  ChevronRightIcon, BadgeDollarSignIcon, WrenchIcon, StarIcon, FileTextIcon,
  ActivityIcon, BarChart3Icon, SparklesIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_GROUPS = [
  {
    label: 'Tổng quan',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
    ],
  },
  {
    label: 'Nội dung',
    items: [
      { href: '/admin/jobs',           label: 'Tin tuyển dụng',     icon: BriefcaseIcon    },
      { href: '/admin/news',           label: 'Tin tức',            icon: NewspaperIcon    },
      { href: '/admin/job-categories', label: 'Danh mục việc làm',  icon: TagsIcon         },
    ],
  },
  {
    label: 'Người dùng',
    items: [
      { href: '/admin/candidates',          label: 'Ứng viên',           icon: UserCircleIcon, exact: true },
      { href: '/admin/candidates/analysis', label: 'Phân tích ứng viên', icon: BarChart3Icon  },
      { href: '/admin/employers',           label: 'Nhà tuyển dụng',     icon: Building2Icon  },
      { href: '/admin/users',               label: 'Tất cả tài khoản',   icon: UsersIcon      },
    ],
  },
  {
    label: 'Vận hành',
    items: [
      { href: '/admin/activity', label: 'Lịch sử hoạt động', icon: ActivityIcon         },
      { href: '/admin/matching', label: 'Module Matching',    icon: SparklesIcon         },
      { href: '/admin/revenue',  label: 'Doanh thu & Gói',   icon: BadgeDollarSignIcon  },
      { href: '/admin/skills',   label: 'Quản lý kỹ năng',   icon: StarIcon             },
    ],
  },
  {
    label: 'Trang nội dung',
    items: [
      { href: '/admin/pages', label: 'Quản lý trang tĩnh', icon: FileTextIcon },
    ],
  },
  {
    label: 'Cấu hình',
    items: [
      { href: '/admin/settings', label: 'Cài đặt hệ thống', icon: WrenchIcon     },
      { href: '/admin/media',    label: 'Thư viện media',    icon: ImagesIcon     },
      { href: '/admin/menu',     label: 'Quản lý menu',      icon: MenuIcon       },
      { href: '/admin/widgets',  label: 'Nút nổi',           icon: PanelRightIcon },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const initial = session?.user?.email?.[0]?.toUpperCase() ?? 'A'

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className="flex w-60 shrink-0 flex-col bg-slate-900">

        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand">
            <ShieldIcon className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">Admin Panel</p>
            <p className="text-[10px] font-medium text-slate-500">TuyenDung.vn</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="scrollbar-dark flex-1 overflow-y-auto px-2 py-3">
          {NAV_GROUPS.map(({ label, items }) => (
            <div key={label} className="mb-4">
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                {label}
              </p>
              {items.map(({ href, label: itemLabel, icon: Icon, exact }: any) => {
                const active = exact ? pathname === href : pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                      active
                        ? 'bg-brand text-white'
                        : 'text-slate-400 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {itemLabel}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* User + footer actions */}
        <div className="border-t border-white/10 px-2 py-3">
          {session?.user && (
            <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-white/5 px-3 py-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-200">
                  {session.user.name || session.user.email?.split('@')[0]}
                </p>
                <p className="text-[10px] text-slate-500">Quản trị viên</p>
              </div>
            </div>
          )}
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-white/10 hover:text-white"
          >
            <HomeIcon className="h-4 w-4" />
            Về trang chủ
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOutIcon className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Content ──────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Topbar */}
        <header className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6 py-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
            <span>Admin</span>
            <ChevronRightIcon className="h-3.5 w-3.5" />
            <span className="font-medium text-slate-700 capitalize">
              {pathname.split('/').filter(Boolean).slice(1).join(' / ') || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">
              {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
