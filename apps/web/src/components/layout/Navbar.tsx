'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useRef, useCallback, useMemo } from 'react'
import {
  BriefcaseIcon, UserCircleIcon, ChevronDownIcon, MenuIcon, XIcon,
  SearchIcon, BookmarkIcon, FileTextIcon, ThumbsUpIcon,
  Building2Icon, UsersIcon, MessageSquareIcon,
  ShieldIcon, PlusCircleIcon, LayoutDashboardIcon, LogOutIcon,
  MapPinIcon, FileIcon, UploadIcon, BookOpenIcon, PenLineIcon, WrenchIcon,
  CompassIcon, LightbulbIcon, BanknoteIcon, TrendingUpIcon, PackageIcon, GraduationCapIcon,
  BellIcon, CheckCircleIcon, StarIcon, LockIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NotificationsBell } from './NotificationsBell'
import { ChatBadge } from './ChatBadge'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { JobCategoryDto } from '@tuyendung/types'
import { DB_TO_URL } from '@/lib/handbook'

// ── Static data ──────────────────────────────────────────────────────────────

const HOT_CITIES = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Bình Dương', 'Đồng Nai']

const DEFAULT_POSITIONS = [
  'Nhân viên kinh doanh', 'Kế toán', 'Marketing', 'Hành chính nhân sự',
  'Chăm sóc khách hàng', 'Ngân hàng', 'IT - Phần mềm', 'Lao động phổ thông',
  'Senior / Manager', 'Kỹ sư xây dựng', 'Thiết kế đồ họa', 'Bất động sản',
]


const CV_STYLES = [
  { label: 'Mẫu CV Đơn giản',      href: '/resumes/templates?style=simple' },
  { label: 'Mẫu CV Ấn tượng',      href: '/resumes/templates?style=impressive' },
  { label: 'Mẫu CV Chuyên nghiệp', href: '/resumes/templates?style=professional' },
  { label: 'Mẫu CV Harvard',       href: '/resumes/templates?style=harvard' },
]

const CV_POSITIONS = [
  { label: 'Nhân viên kinh doanh', href: '/resumes/templates?position=sales' },
  { label: 'Lập trình viên',       href: '/resumes/templates?position=developer' },
  { label: 'Nhân viên kế toán',    href: '/resumes/templates?position=accountant' },
  { label: 'Chuyên viên marketing', href: '/resumes/templates?position=marketing' },
]

const CV_RIGHT = [
  { label: 'Quản lý CV',          href: '/resumes',                    icon: FileIcon },
  { label: 'Tải CV lên',          href: '/resumes/upload',             icon: UploadIcon },
  { label: 'Hướng dẫn viết CV',   href: '/blog/cv',                icon: BookOpenIcon },
  { label: 'Quản lý Cover Letter', href: '/cover-letters',             icon: PenLineIcon },
  { label: 'Mẫu Cover Letter',     href: '/cover-letters/templates',   icon: PenLineIcon },
]

const HANDBOOK_CATS = [
  { label: 'Định hướng nghề nghiệp',      href: '/blog/career',      icon: CompassIcon },
  { label: 'Bí kíp tìm việc',             href: '/blog/tips',        icon: LightbulbIcon },
  { label: 'Chế độ lương thưởng',         href: '/blog/salary',      icon: BanknoteIcon },
  { label: 'Kiến thức chuyên ngành',      href: '/blog/knowledge',   icon: GraduationCapIcon },
  { label: 'Hành trang nghề nghiệp',      href: '/blog/preparation', icon: PackageIcon },
  { label: 'Thị trường & xu hướng tuyển dụng', href: '/blog/market', icon: TrendingUpIcon },
]

const HANDBOOK_FEATURED = [
  {
    title: 'Telesales là gì? Những công việc Telesales HOT nhất bạn cần biết',
    excerpt: 'Nhắc tới công việc Telesales, không ít người gắn ngay cho nghề này "cái mác" gọi điện...',
    href: '/blog/telesales',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=80&fit=crop&q=70',
  },
  {
    title: 'Nhân viên kinh doanh/Sales là gì? Từ A đến Z về nghề Sales',
    excerpt: 'Theo Báo cáo thị trường tuyển dụng 2023 & Nhu cầu tuyển dụng 2024 từ TopCV, Kinh...',
    href: '/blog/sales',
    img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=80&fit=crop&q=70',
  },
]

const CANDIDATE_NAV: {
  id: string; label: string; icon: React.ElementType
  items: { href: string; label: string; badgeKey?: keyof SidebarStats }[]
}[] = [
  {
    id: 'jobs', label: 'Quản lý tìm việc', icon: BriefcaseIcon,
    items: [
      { href: '/saved-jobs',           label: 'Việc làm đã lưu' },
      { href: '/applications',         label: 'Việc làm đã ứng tuyển' },
      { href: '/jobs?recommended=true', label: 'Việc làm phù hợp với bạn' },
      { href: '/settings/job-alerts',  label: 'Cài đặt gợi ý việc làm' },
    ],
  },
  {
    id: 'cv', label: 'Quản lý CV & Cover letter', icon: FileTextIcon,
    items: [
      { href: '/resumes',       label: 'CV của tôi' },
      { href: '/cover-letters', label: 'Cover Letter của tôi' },
      { href: '/connections',   label: 'NTD muốn kết nối với bạn',  badgeKey: 'newConnections' },
      { href: '/profile-views', label: 'NTD xem hồ sơ của bạn',    badgeKey: 'newProfileViews' },
    ],
  },
  {
    id: 'noti', label: 'Cài đặt email & thông báo', icon: BellIcon,
    items: [
      { href: '/settings/notifications', label: 'Cài đặt thông báo' },
    ],
  },
  {
    id: 'security', label: 'Cá nhân & Bảo mật', icon: LockIcon,
    items: [
      { href: '/profile',            label: 'Thông tin cá nhân' },
      { href: '/settings/security',  label: 'Bảo mật tài khoản' },
    ],
  },
  {
    id: 'upgrade', label: 'Nâng cấp tài khoản', icon: StarIcon,
    items: [
      { href: '/upgrade', label: 'Xem gói nâng cấp' },
    ],
  },
]

// ── Navbar ───────────────────────────────────────────────────────────────────

interface MegaSectionItem { id: string; label: string; href: string; visible: boolean }
interface MegaSection { id: string; title: string; href?: string; items: MegaSectionItem[] }

interface NavConfig {
  items: Array<{ id: string; label?: string; visible: boolean; sections?: MegaSection[] }>
}

interface FeaturedArticle {
  title: string
  excerpt?: string | null
  slug: string
  imageUrl?: string | null
  category?: { slug: string }
}

export function Navbar({ navConfig: navConfigData, categories = [], featuredArticles = [] }: {
  navConfig?: NavConfig
  categories?: JobCategoryDto[]
  featuredArticles?: FeaturedArticle[]
}) {
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navMap = useMemo(() => {
    const map: Record<string, boolean> = {}
    navConfigData?.items?.forEach(item => { map[item.id] = item.visible })
    return map
  }, [navConfigData])

  const getItemSections = (id: string) =>
    navConfigData?.items?.find(i => i.id === id)?.sections

  const isVisible = useCallback((id: string) => navMap[id] !== false, [navMap])
  const role = session?.user?.role

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 text-xl font-bold text-brand">
          <BriefcaseIcon className="h-6 w-6" />
          <span>TuyenDung<span className="text-gray-400">.vn</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center gap-0.5 text-sm font-medium md:flex">

          {isVisible('jobs') && (
            <NavDropdown label={navConfigData?.items?.find(i => i.id === 'jobs')?.label ?? 'Việc làm'} href="/jobs">
              <JobsMegaMenu categories={categories} sections={getItemSections('jobs')} />
            </NavDropdown>
          )}

          {isVisible('cv') && (
            <NavDropdown label="Tạo CV" href="/resumes/templates">
              <CvMegaMenu sections={getItemSections('cv')} />
            </NavDropdown>
          )}

          {isVisible('tools') && (
            <NavDropdown label="Công cụ" href="/tools/salary">
              <SimpleDropdown items={[
                { href: '/tools/salary',      label: 'Tính lương',               icon: WrenchIcon },
                { href: '/tools/interview',   label: 'Cẩm nang phỏng vấn',       icon: BookOpenIcon },
                { href: '/tools/career-test', label: 'Trắc nghiệm nghề nghiệp',  icon: FileTextIcon },
              ]} />
            </NavDropdown>
          )}

          {isVisible('handbook') && (
            <NavDropdown label="Cẩm nang nghề nghiệp" href="/blog" align="right">
              <HandbookMegaMenu featuredArticles={featuredArticles} />
            </NavDropdown>
          )}

          {isVisible('companies') && (
            <NavDropdown label="Công ty" href="/companies" align="right">
              <SimpleDropdown items={[
                { href: '/companies', label: 'Danh sách công ty', icon: Building2Icon },
              ]} />
            </NavDropdown>
          )}

          {role === 'EMPLOYER' && (
            <>
              <NavLink href="/employer/jobs/new">
                <PlusCircleIcon className="h-4 w-4 text-brand" />Đăng tin
              </NavLink>
              <NavLink href="/employer/candidates">Tìm ứng viên</NavLink>
            </>
          )}
          {role === 'ADMIN' && (
            <NavLink href="/admin/dashboard">
              <ShieldIcon className="h-4 w-4 text-brand" />Admin
            </NavLink>
          )}
        </nav>

        {/* Right */}
        <div className="flex shrink-0 items-center gap-2">
          {session && <NotificationsBell />}
          {session && <ChatBadge />}
          {session ? (
            <UserMenu role={role} email={session.user?.email} onSignOut={() => signOut({ callbackUrl: '/' })} />
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login" className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 transition hover:border-brand hover:text-brand">
                Đăng nhập
              </Link>
              <Link href="/register" className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-brand/90">
                Đăng ký
              </Link>
            </div>
          )}
          <button
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <MobileMenu session={session} role={role} onClose={() => setMobileOpen(false)} />
      )}
    </header>
  )
}

// ── NavLink ───────────────────────────────────────────────────────────────────

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href}
      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-gray-600 transition hover:bg-gray-50 hover:text-brand">
      {children}
    </Link>
  )
}

// ── NavDropdown (hover + clickable label) ────────────────────────────────────

function NavDropdown({ label, href, children, align = 'left' }: {
  label: string
  href?: string
  children: React.ReactNode
  align?: 'left' | 'right'
}) {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const enter = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
    setOpen(true)
  }
  const leave = () => {
    timer.current = setTimeout(() => setOpen(false), 150)
  }

  const activeClass = open ? 'text-brand' : 'text-gray-600'

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <div className={cn(
        'flex items-center rounded-lg transition',
        open ? 'bg-brand/10' : 'hover:bg-gray-50',
      )}>
        {href ? (
          <Link
            href={href}
            className={cn('py-2 pl-3 text-sm font-medium transition hover:text-brand', activeClass)}
          >
            {label}
          </Link>
        ) : (
          <span className={cn('py-2 pl-3 text-sm font-medium', activeClass)}>{label}</span>
        )}
        <button
          className={cn('py-2 pr-2.5 pl-0.5 transition hover:text-brand', activeClass)}
          aria-label="Mở menu"
        >
          <ChevronDownIcon className={cn('h-4 w-4 transition-transform duration-200', open && 'rotate-180')} />
        </button>
      </div>

      {open && (
        <div
          className={cn(
            'absolute top-full z-50 mt-1',
            align === 'right' ? 'right-0' : 'left-0',
          )}
          style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.10))' }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

// ── Mega menu: Việc làm ───────────────────────────────────────────────────────

function JobsMegaMenu({ categories, sections }: { categories: JobCategoryDto[]; sections?: MegaSection[] }) {
  const half = Math.ceil(categories.length / 2)
  const col1 = categories.slice(0, half)
  const col2 = categories.slice(half)
  const hasCats = categories.length > 0

  const QUICK_LINK_ICONS: Record<string, React.ElementType> = {
    '/jobs': SearchIcon,
    '/saved-jobs': BookmarkIcon,
    '/applications': FileTextIcon,
    '/jobs?recommended=true': ThumbsUpIcon,
  }

  const quickLinksSection = sections?.find(s => s.id === 'quick-links')
  const quickLinks = quickLinksSection?.items.filter(i => i.visible) ?? [
    { id: 'find', label: 'Tìm việc làm', href: '/jobs', visible: true },
    { id: 'saved', label: 'Việc làm đã lưu', href: '/saved-jobs', visible: true },
    { id: 'applied', label: 'Việc đã ứng tuyển', href: '/applications', visible: true },
    { id: 'recommended', label: 'Việc làm phù hợp', href: '/jobs?recommended=true', visible: true },
  ]
  const quickTitle = quickLinksSection?.title ?? 'Việc làm'

  return (
    <div className="w-[780px] rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
      <div className="grid grid-cols-3 gap-6">
        {/* Col 1 — Quick links + cities */}
        <div className="space-y-5">
          <div>
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">{quickTitle}</p>
            <div className="space-y-0.5">
              {quickLinks.map(({ href, label }) => {
                const Icon = QUICK_LINK_ICONS[href] ?? SearchIcon
                return (
                  <Link key={href} href={href}
                    className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-brand/5 hover:text-brand">
                    <Icon className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-brand" />{label}
                  </Link>
                )
              })}
            </div>
          </div>
          <div>
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">Theo thành phố</p>
            <div className="flex flex-wrap gap-1.5">
              {HOT_CITIES.map(city => (
                <Link key={city} href={`/jobs?city=${encodeURIComponent(city)}`}
                  className="flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:border-brand hover:text-brand">
                  <MapPinIcon className="h-3 w-3" />{city}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2 — Categories part 1 */}
        <div>
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            Theo phân loại
          </p>
          <div className="space-y-0.5">
            {(hasCats ? col1 : DEFAULT_POSITIONS.slice(0, 8)).map((item) => {
              const isDto = typeof item === 'object'
              const label = isDto ? (item as JobCategoryDto).name : item as string
              const href  = isDto
                ? `/jobs/${(item as JobCategoryDto).slug}`
                : `/jobs?keyword=${encodeURIComponent(label)}`
              const icon  = isDto ? (item as JobCategoryDto).icon : undefined
              return (
                <Link key={href} href={href}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-brand/5 hover:text-brand">
                  {icon && <span className="text-base leading-none">{icon}</span>}
                  Việc làm {label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Col 3 — Categories part 2 + CTA */}
        <div>
          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-gray-400">&nbsp;</p>
          <div className="space-y-0.5">
            {(hasCats ? col2 : DEFAULT_POSITIONS.slice(8)).map((item) => {
              const isDto = typeof item === 'object'
              const label = isDto ? (item as JobCategoryDto).name : item as string
              const href  = isDto
                ? `/jobs/${(item as JobCategoryDto).slug}`
                : `/jobs?keyword=${encodeURIComponent(label)}`
              const icon  = isDto ? (item as JobCategoryDto).icon : undefined
              return (
                <Link key={href} href={href}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-brand/5 hover:text-brand">
                  {icon && <span className="text-base leading-none">{icon}</span>}
                  Việc làm {label}
                </Link>
              )
            })}
          </div>
          <div className="mt-4 rounded-xl bg-brand/5 p-4">
            <p className="mb-1 text-xs font-semibold text-brand">Bạn là nhà tuyển dụng?</p>
            <p className="mb-3 text-xs text-gray-500">Đăng tin miễn phí, tiếp cận hàng nghìn ứng viên.</p>
            <Link href="/register?role=EMPLOYER"
              className="block rounded-lg bg-brand px-3 py-1.5 text-center text-xs font-semibold text-white transition hover:bg-brand/90">
              Đăng ký tuyển dụng →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Mega menu: Tạo CV ─────────────────────────────────────────────────────────

function CvMegaMenu({ sections }: { sections?: MegaSection[] }) {
  const stylesSection = sections?.find(s => s.id === 'cv-styles')
  const positionsSection = sections?.find(s => s.id === 'cv-positions')
  const toolsSection = sections?.find(s => s.id === 'cv-tools')

  const cvStyles = stylesSection?.items.filter(i => i.visible) ?? CV_STYLES.map((s, i) => ({ id: String(i), ...s, visible: true }))
  const cvPositions = positionsSection?.items.filter(i => i.visible) ?? CV_POSITIONS.map((s, i) => ({ id: String(i), ...s, visible: true }))
  const cvRight = toolsSection?.items.filter(i => i.visible) ?? CV_RIGHT.map((s, i) => ({ id: String(i), ...s }))

  const stylesTitle = stylesSection?.title ?? 'Mẫu CV theo style'
  const stylesHref = stylesSection?.href ?? '/resumes/templates'
  const positionsTitle = positionsSection?.title ?? 'Mẫu CV theo vị trí ứng tuyển'
  const positionsHref = positionsSection?.href ?? '/resumes/templates?by=position'

  const RIGHT_ICONS: Record<string, React.ElementType> = {
    '/resumes': FileIcon,
    '/resumes/upload': UploadIcon,
    '/blog/cv': BookOpenIcon,
    '/cover-letters': PenLineIcon,
    '/cover-letters/templates': PenLineIcon,
  }

  return (
    <div className="w-[560px] rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Link href={stylesHref}
              className="mb-2 flex items-center gap-1 text-sm font-bold text-brand hover:underline">
              {stylesTitle} →
            </Link>
            <div className="space-y-0.5">
              {cvStyles.map(({ href, label }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-brand/5 hover:text-brand">
                  <FileIcon className="h-4 w-4 shrink-0 text-gray-400" />{label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <Link href={positionsHref}
              className="mb-2 flex items-center gap-1 text-sm font-bold text-brand hover:underline">
              {positionsTitle} →
            </Link>
            <div className="space-y-0.5">
              {cvPositions.map(({ href, label }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-brand/5 hover:text-brand">
                  <BriefcaseIcon className="h-4 w-4 shrink-0 text-gray-400" />{label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-0.5 border-l border-gray-100 pl-6">
          {cvRight.map(({ href, label }) => {
            const Icon = RIGHT_ICONS[href] ?? FileIcon
            return (
              <Link key={href} href={href}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition hover:bg-brand/5 hover:text-brand">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 transition group-hover:bg-brand/10">
                  <Icon className="h-4 w-4 text-gray-500 group-hover:text-brand" />
                </div>
                {label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Mega menu: Cẩm nang nghề nghiệp ─────────────────────────────────────────

function HandbookMegaMenu({ featuredArticles }: { featuredArticles: { title: string; excerpt?: string | null; slug: string; imageUrl?: string | null; category?: { slug: string } }[] }) {
  const articles = featuredArticles.length > 0 ? featuredArticles : HANDBOOK_FEATURED.map(a => ({
    title: a.title, excerpt: a.excerpt, slug: a.href.replace('/blog/', ''), imageUrl: a.img,
  }))

  return (
    <div className="w-[620px] rounded-2xl border border-gray-100 bg-white shadow-xl">
      {/* Header tab */}
      <div className="border-b border-gray-100 px-6 pt-4 pb-0">
        <span className="inline-block border-b-2 border-brand pb-2.5 text-sm font-semibold text-brand">
          Blog
        </span>
      </div>

      <div className="grid grid-cols-[1fr_260px] gap-0 p-6">
        {/* Left: categories */}
        <div className="space-y-0.5 pr-5">
          {HANDBOOK_CATS.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href}
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-brand/5 hover:text-brand">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 transition group-hover:bg-brand/10">
                <Icon className="h-4 w-4 text-gray-500 group-hover:text-brand" />
              </div>
              {label}
            </Link>
          ))}
        </div>

        {/* Right: featured articles */}
        <div className="border-l border-gray-100 pl-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Bài viết nổi bật</p>
          <div className="space-y-4">
            {articles.slice(0, 2).map((article) => {
              const catUrl = article.category?.slug
                ? (DB_TO_URL[article.category.slug] ?? article.category.slug)
                : null
              const articleHref = catUrl ? `/blog/${catUrl}/${article.slug}` : '/blog'
              return (
              <Link key={article.slug} href={articleHref}
                className="group flex gap-3 transition hover:opacity-80">
                {article.imageUrl && (
                  <img src={article.imageUrl} alt=""
                    className="h-16 w-20 shrink-0 rounded-lg object-cover" />
                )}
                <div className="min-w-0">
                  <p className="line-clamp-2 text-xs font-semibold leading-snug text-gray-800 group-hover:text-brand">
                    {article.title}
                  </p>
                  {article.excerpt && (
                    <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-gray-400">{article.excerpt}</p>
                  )}
                </div>
              </Link>
              )
            })}
          </div>
          <Link href="/blog"
            className="mt-4 block text-xs font-semibold text-brand hover:underline">
            Xem thêm bài viết nổi bật →
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Simple dropdown ───────────────────────────────────────────────────────────

function SimpleDropdown({ items }: {
  items: { href: string; label: string; icon?: React.ElementType }[]
}) {
  return (
    <div className="w-60 rounded-xl border border-gray-100 bg-white py-1.5 shadow-lg">
      {items.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href}
          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-brand">
          {Icon && <Icon className="h-4 w-4 shrink-0 text-gray-400" />}
          {label}
        </Link>
      ))}
    </div>
  )
}

// ── User menu ─────────────────────────────────────────────────────────────────

function UserMenu({ role, email, onSignOut }: { role?: string; email?: string | null; onSignOut: () => void }) {
  if (role === 'CANDIDATE') return <CandidateMenu email={email} onSignOut={onSignOut} />
  return <DefaultMenu role={role} email={email} onSignOut={onSignOut} />
}

interface SidebarStats { newConnections: number; newProfileViews: number }

function CandidateMenu({ email, onSignOut }: { email?: string | null; onSignOut: () => void }) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string[]>(['jobs', 'cv'])
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initial = email?.[0]?.toUpperCase() ?? '?'
  const toggle = (id: string) => setExpanded(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const { data: stats } = useQuery<SidebarStats>({
    queryKey: ['candidate-sidebar-stats'],
    queryFn:  () => api.get('/users/me/sidebar-stats'),
    staleTime: 30_000,
    enabled: open,
  })

  const enter = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
    setOpen(true)
  }
  const leave = () => { timer.current = setTimeout(() => setOpen(false), 180) }

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-brand hover:bg-brand/5 hover:text-brand"
        aria-label="Tài khoản của tôi"
      >
        <UserCircleIcon className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/70 px-4 py-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-xl font-bold text-white">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-gray-900">{email?.split('@')[0]}</p>
              <p className="flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircleIcon className="h-3 w-3 shrink-0" /> Tài khoản đã xác thực
              </p>
              <p className="mt-0.5 truncate text-xs text-gray-400">{email}</p>
            </div>
          </div>

          {/* Accordion sections */}
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-50">
            {CANDIDATE_NAV.map(({ id, label, icon: Icon, items }) => (
              <div key={id}>
                <button onClick={() => toggle(id)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-gray-50">
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0 text-brand" />
                    <span className="text-sm font-semibold text-gray-700">{label}</span>
                  </span>
                  <ChevronDownIcon className={cn(
                    'h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200',
                    expanded.includes(id) && 'rotate-180',
                  )} />
                </button>
                {expanded.includes(id) && (
                  <div className="pb-1.5">
                    {items.map(({ href, label: l, badgeKey }) => {
                      const badge = badgeKey && stats ? stats[badgeKey as keyof SidebarStats] : 0
                      return (
                        <Link key={href} href={href} onClick={() => setOpen(false)}
                          className="flex items-center py-2 pl-11 pr-4 text-sm text-gray-600 transition hover:bg-brand/5 hover:text-brand">
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
            ))}
          </div>

          {/* Sign out */}
          <div className="border-t border-gray-100">
            <button onClick={() => { setOpen(false); onSignOut() }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50">
              <LogOutIcon className="h-4 w-4" /> Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function DefaultMenu({ role, email, onSignOut }: { role?: string; email?: string | null; onSignOut: () => void }) {
  const [open, setOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const enter = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
    setOpen(true)
  }
  const leave = () => { timer.current = setTimeout(() => setOpen(false), 180) }

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-brand hover:bg-brand/5 hover:text-brand"
        aria-label="Tài khoản của tôi"
      >
        <UserCircleIcon className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-1.5 shadow-lg">
          <div className="mb-1 px-4 py-2">
            <p className="truncate text-xs text-gray-400">{email}</p>
            <span className={cn(
              'mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase',
              role === 'ADMIN'    && 'bg-red-100 text-red-600',
              role === 'EMPLOYER' && 'bg-blue-100 text-blue-600',
            )}>
              {role === 'ADMIN' ? 'Quản trị viên' : 'Nhà tuyển dụng'}
            </span>
          </div>
          <div className="mb-1 border-t border-gray-100" />

          {role === 'EMPLOYER' && (<>
            <DropItem href="/employer/dashboard"  icon={LayoutDashboardIcon} onClick={() => setOpen(false)}>Dashboard</DropItem>
            <DropItem href="/employer/jobs"       icon={BriefcaseIcon}       onClick={() => setOpen(false)}>Quản lý tin đăng</DropItem>
            <DropItem href="/employer/jobs/new"   icon={PlusCircleIcon}      onClick={() => setOpen(false)}>Đăng tin mới</DropItem>
            <DropItem href="/employer/candidates" icon={UsersIcon}           onClick={() => setOpen(false)}>Tìm ứng viên</DropItem>
            <DropItem href="/messages"            icon={MessageSquareIcon}   onClick={() => setOpen(false)}>Tin nhắn</DropItem>
          </>)}
          {role === 'ADMIN' && (<>
            <DropItem href="/admin/dashboard"  icon={ShieldIcon}    onClick={() => setOpen(false)}>Admin Dashboard</DropItem>
            <DropItem href="/admin/jobs"       icon={BriefcaseIcon} onClick={() => setOpen(false)}>Quản lý tin</DropItem>
            <DropItem href="/admin/users"      icon={UsersIcon}     onClick={() => setOpen(false)}>Quản lý users</DropItem>
            <DropItem href="/admin/employers"  icon={Building2Icon} onClick={() => setOpen(false)}>Nhà tuyển dụng</DropItem>
          </>)}

          <div className="mt-1 border-t border-gray-100" />
          <button onClick={() => { setOpen(false); onSignOut() }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 transition hover:bg-red-50">
            <LogOutIcon className="h-4 w-4" /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}

function DropItem({ href, icon: Icon, children, onClick }: {
  href: string; icon: React.ElementType; children: React.ReactNode; onClick?: () => void
}) {
  return (
    <Link href={href} onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50 hover:text-brand">
      <Icon className="h-4 w-4 shrink-0 text-gray-400" />{children}
    </Link>
  )
}

// ── Mobile menu ───────────────────────────────────────────────────────────────

function MobileMenu({ session, role, onClose }: { session: any; role?: string; onClose: () => void }) {
  const [expand, setExpand] = useState<string | null>(null)
  const toggle = (id: string) => setExpand(prev => prev === id ? null : id)

  const sections = [
    { id: 'jobs', label: 'Việc làm', links: [
      { href: '/jobs', label: 'Tìm việc làm' },
      { href: '/saved-jobs', label: 'Việc đã lưu' },
      { href: '/applications', label: 'Đã ứng tuyển' },
    ]},
    { id: 'cv', label: 'Tạo CV', links: [
      { href: '/resumes/templates', label: 'Mẫu CV' },
      { href: '/resumes', label: 'Quản lý CV' },
      { href: '/resumes/upload', label: 'Tải CV lên' },
    ]},
    { id: 'tools', label: 'Công cụ', links: [
      { href: '/tools/salary', label: 'Tính lương' },
      { href: '/tools/career-test', label: 'Trắc nghiệm nghề nghiệp' },
    ]},
    { id: 'handbook', label: 'Cẩm nang', links: HANDBOOK_CATS.map(c => ({ href: c.href, label: c.label })) },
    { id: 'companies', label: 'Công ty', links: [
      { href: '/companies', label: 'Danh sách công ty' },
    ]},
  ]

  return (
    <div className="max-h-[80vh] overflow-y-auto border-t border-gray-100 bg-white md:hidden">
      <div className="space-y-1 px-4 py-3">
        {sections.map(({ id, label, links }) => (
          <div key={id}>
            <button onClick={() => toggle(id)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {label}
              <ChevronDownIcon className={cn('h-4 w-4 transition-transform', expand === id && 'rotate-180')} />
            </button>
            {expand === id && (
              <div className="ml-3 space-y-0.5 border-l-2 border-brand/20 pl-3">
                {links.map(({ href, label }) => (
                  <Link key={href} href={href} onClick={onClose}
                    className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:text-brand">
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {role === 'EMPLOYER' && (<>
          <Link href="/employer/dashboard" onClick={onClose}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Dashboard
          </Link>
          <Link href="/employer/jobs/new" onClick={onClose}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-brand hover:bg-brand/5">
            <PlusCircleIcon className="h-4 w-4" />Đăng tin mới
          </Link>
        </>)}
        {role === 'ADMIN' && (
          <Link href="/admin/dashboard" onClick={onClose}
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
            <ShieldIcon className="h-4 w-4" />Admin Panel
          </Link>
        )}

        {!session && (
          <div className="flex gap-2 pt-2">
            <Link href="/login" onClick={onClose}
              className="flex-1 rounded-full border border-gray-300 py-2 text-center text-sm font-medium text-gray-700">
              Đăng nhập
            </Link>
            <Link href="/register" onClick={onClose}
              className="flex-1 rounded-full bg-brand py-2 text-center text-sm font-semibold text-white">
              Đăng ký
            </Link>
          </div>
        )}
        {session && (
          <button onClick={() => { onClose(); signOut({ callbackUrl: '/' }) }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50">
            <LogOutIcon className="h-4 w-4" />Đăng xuất
          </button>
        )}
      </div>
    </div>
  )
}
