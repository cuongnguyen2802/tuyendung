import Link from 'next/link'
import type { Metadata } from 'next'
import { type LucideIcon,
  ChevronRightIcon, StarIcon, ArrowRightIcon, FileTextIcon,
  MonitorIcon, BarChart2Icon, BadgeDollarSignIcon, HandshakeIcon,
  UsersIcon, PaletteIcon, WrenchIcon, HeartPulseIcon,
  GraduationCapIcon, TruckIcon, ShoppingBagIcon, BuildingIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Thư viện CV theo ngành nghề — TuyenDung.vn',
  description:
    'Hàng trăm mẫu CV chuyên nghiệp phân loại theo ngành nghề: IT, Marketing, Tài chính, Kinh doanh, Nhân sự, Thiết kế... Tải miễn phí và tạo CV ngay.',
}

// ── Types ────────────────────────────────────────────────────────────────────

interface CVJob {
  title: string
  tag: string | null
  layout: 'sidebar' | 'bold' | 'classic' | 'top'
  href: string
}

interface Industry {
  id: string
  label: string
  icon: LucideIcon
  color: string
  accent: string
  accentText: string
  border: string
  count: number
  jobs: CVJob[]
}

// ── Industry catalog ─────────────────────────────────────────────────────────

const INDUSTRIES: Industry[] = [
  {
    id: 'it',
    label: 'Công nghệ thông tin',
    icon: MonitorIcon,
    color: 'bg-brand/10 text-brand',
    accent: 'bg-brand',
    accentText: 'text-brand',
    border: 'border-brand/20',
    count: 24,
    jobs: [
      { title: 'Frontend Developer', tag: 'Phổ biến', layout: 'sidebar', href: '/resumes/templates/developer' },
      { title: 'Backend Developer', tag: 'Phổ biến', layout: 'bold', href: '/resumes/templates/developer' },
      { title: 'Fullstack Developer', tag: null, layout: 'sidebar', href: '/resumes/templates/developer' },
      { title: 'DevOps / Cloud Engineer', tag: null, layout: 'top', href: '/resumes/templates/developer' },
      { title: 'Data Scientist / ML Engineer', tag: null, layout: 'bold', href: '/resumes/templates/developer' },
      { title: 'Mobile Developer (iOS/Android)', tag: null, layout: 'classic', href: '/resumes/templates/developer' },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing & Truyền thông',
    icon: BarChart2Icon,
    color: 'bg-pink-50 text-pink-600',
    accent: 'bg-pink-500',
    accentText: 'text-pink-600',
    border: 'border-pink-200',
    count: 18,
    jobs: [
      { title: 'Digital Marketing Specialist', tag: 'Phổ biến', layout: 'sidebar', href: '/resumes/templates/marketing' },
      { title: 'Content Writer / Copywriter', tag: null, layout: 'top', href: '/resumes/templates/marketing' },
      { title: 'SEO / SEM Specialist', tag: null, layout: 'bold', href: '/resumes/templates/marketing' },
      { title: 'PR & Truyền thông', tag: null, layout: 'sidebar', href: '/resumes/templates/marketing' },
      { title: 'Social Media Manager', tag: null, layout: 'top', href: '/resumes/templates/marketing' },
      { title: 'Brand Manager', tag: null, layout: 'classic', href: '/resumes/templates/marketing' },
    ],
  },
  {
    id: 'finance',
    label: 'Tài chính & Kế toán',
    icon: BadgeDollarSignIcon,
    color: 'bg-teal-50 text-teal-700',
    accent: 'bg-teal-600',
    accentText: 'text-teal-700',
    border: 'border-teal-200',
    count: 16,
    jobs: [
      { title: 'Kế toán tổng hợp', tag: 'Phổ biến', layout: 'classic', href: '/resumes/templates/accountant' },
      { title: 'Kế toán trưởng', tag: null, layout: 'bold', href: '/resumes/templates/accountant' },
      { title: 'Kiểm toán viên', tag: null, layout: 'classic', href: '/resumes/templates/accountant' },
      { title: 'Chuyên viên tài chính', tag: null, layout: 'top', href: '/resumes/templates/accountant' },
      { title: 'Chuyên viên ngân hàng', tag: null, layout: 'sidebar', href: '/resumes/templates/accountant' },
      { title: 'Phân tích tài chính (FA)', tag: null, layout: 'bold', href: '/resumes/templates/accountant' },
    ],
  },
  {
    id: 'sales',
    label: 'Kinh doanh & Bán hàng',
    icon: HandshakeIcon,
    color: 'bg-orange-50 text-orange-600',
    accent: 'bg-orange-500',
    accentText: 'text-orange-600',
    border: 'border-orange-200',
    count: 15,
    jobs: [
      { title: 'Nhân viên kinh doanh (B2B)', tag: 'Phổ biến', layout: 'sidebar', href: '/resumes/templates/sales' },
      { title: 'Key Account Manager', tag: null, layout: 'bold', href: '/resumes/templates/sales' },
      { title: 'Trưởng phòng kinh doanh', tag: null, layout: 'classic', href: '/resumes/templates/sales' },
      { title: 'Sales Executive', tag: null, layout: 'top', href: '/resumes/templates/sales' },
      { title: 'Business Development Manager', tag: null, layout: 'sidebar', href: '/resumes/templates/sales' },
      { title: 'Telesale / Tư vấn khách hàng', tag: null, layout: 'bold', href: '/resumes/templates/sales' },
    ],
  },
  {
    id: 'hr',
    label: 'Nhân sự & Hành chính',
    icon: UsersIcon,
    color: 'bg-violet-50 text-violet-600',
    accent: 'bg-violet-500',
    accentText: 'text-violet-600',
    border: 'border-violet-200',
    count: 12,
    jobs: [
      { title: 'Chuyên viên tuyển dụng', tag: 'Phổ biến', layout: 'top', href: '/resumes/templates/simple' },
      { title: 'Trưởng phòng nhân sự (HRM)', tag: null, layout: 'bold', href: '/resumes/templates/simple' },
      { title: 'Chuyên viên C&B', tag: null, layout: 'classic', href: '/resumes/templates/simple' },
      { title: 'Chuyên viên đào tạo (L&D)', tag: null, layout: 'sidebar', href: '/resumes/templates/simple' },
      { title: 'Hành chính văn phòng', tag: null, layout: 'top', href: '/resumes/templates/simple' },
      { title: 'HR Business Partner', tag: null, layout: 'bold', href: '/resumes/templates/simple' },
    ],
  },
  {
    id: 'design',
    label: 'Thiết kế & Sáng tạo',
    icon: PaletteIcon,
    color: 'bg-fuchsia-50 text-fuchsia-600',
    accent: 'bg-fuchsia-500',
    accentText: 'text-fuchsia-600',
    border: 'border-fuchsia-200',
    count: 14,
    jobs: [
      { title: 'UI/UX Designer', tag: 'Phổ biến', layout: 'sidebar', href: '/resumes/templates/developer' },
      { title: 'Graphic Designer', tag: null, layout: 'bold', href: '/resumes/templates/developer' },
      { title: 'Product Designer', tag: null, layout: 'sidebar', href: '/resumes/templates/developer' },
      { title: 'Motion Designer / Video Editor', tag: null, layout: 'top', href: '/resumes/templates/developer' },
      { title: 'Creative Director', tag: null, layout: 'classic', href: '/resumes/templates/developer' },
      { title: 'Brand Identity Designer', tag: null, layout: 'bold', href: '/resumes/templates/developer' },
    ],
  },
  {
    id: 'engineering',
    label: 'Kỹ thuật & Sản xuất',
    icon: WrenchIcon,
    color: 'bg-slate-100 text-slate-700',
    accent: 'bg-slate-600',
    accentText: 'text-slate-700',
    border: 'border-slate-200',
    count: 20,
    jobs: [
      { title: 'Kỹ sư xây dựng', tag: 'Phổ biến', layout: 'classic', href: '/resumes/templates/simple' },
      { title: 'Kỹ sư cơ khí', tag: null, layout: 'top', href: '/resumes/templates/simple' },
      { title: 'Kỹ sư điện / điện tử', tag: null, layout: 'classic', href: '/resumes/templates/simple' },
      { title: 'Kỹ sư hóa học / môi trường', tag: null, layout: 'bold', href: '/resumes/templates/simple' },
      { title: 'Quản lý sản xuất', tag: null, layout: 'top', href: '/resumes/templates/simple' },
      { title: 'Kỹ sư QA / QC', tag: null, layout: 'sidebar', href: '/resumes/templates/simple' },
    ],
  },
  {
    id: 'healthcare',
    label: 'Y tế & Dược phẩm',
    icon: HeartPulseIcon,
    color: 'bg-red-50 text-red-600',
    accent: 'bg-red-500',
    accentText: 'text-red-600',
    border: 'border-red-200',
    count: 10,
    jobs: [
      { title: 'Bác sĩ đa khoa / chuyên khoa', tag: null, layout: 'classic', href: '/resumes/templates/simple' },
      { title: 'Dược sĩ / Trình dược viên', tag: 'Phổ biến', layout: 'top', href: '/resumes/templates/simple' },
      { title: 'Điều dưỡng / Y tá', tag: null, layout: 'classic', href: '/resumes/templates/simple' },
      { title: 'Nhân viên y tế cộng đồng', tag: null, layout: 'bold', href: '/resumes/templates/simple' },
      { title: 'Chuyên viên dinh dưỡng', tag: null, layout: 'top', href: '/resumes/templates/simple' },
      { title: 'Clinical Research Associate', tag: null, layout: 'sidebar', href: '/resumes/templates/simple' },
    ],
  },
  {
    id: 'education',
    label: 'Giáo dục & Đào tạo',
    icon: GraduationCapIcon,
    color: 'bg-amber-50 text-amber-700',
    accent: 'bg-amber-500',
    accentText: 'text-amber-700',
    border: 'border-amber-200',
    count: 8,
    jobs: [
      { title: 'Giáo viên tiểu học / THCS', tag: null, layout: 'classic', href: '/resumes/templates/simple' },
      { title: 'Giảng viên đại học', tag: null, layout: 'classic', href: '/resumes/templates/simple' },
      { title: 'Giáo viên tiếng Anh (ESL)', tag: 'Phổ biến', layout: 'top', href: '/resumes/templates/simple' },
      { title: 'Chuyên viên tư vấn tuyển sinh', tag: null, layout: 'sidebar', href: '/resumes/templates/simple' },
      { title: 'Trainer / Huấn luyện viên', tag: null, layout: 'bold', href: '/resumes/templates/simple' },
      { title: 'Gia sư / Tutor', tag: null, layout: 'top', href: '/resumes/templates/simple' },
    ],
  },
  {
    id: 'logistics',
    label: 'Logistics & Xuất nhập khẩu',
    icon: TruckIcon,
    color: 'bg-cyan-50 text-cyan-700',
    accent: 'bg-cyan-600',
    accentText: 'text-cyan-700',
    border: 'border-cyan-200',
    count: 10,
    jobs: [
      { title: 'Chuyên viên xuất nhập khẩu', tag: 'Phổ biến', layout: 'top', href: '/resumes/templates/simple' },
      { title: 'Supply Chain Manager', tag: null, layout: 'bold', href: '/resumes/templates/simple' },
      { title: 'Nhân viên kho vận (Warehouse)', tag: null, layout: 'classic', href: '/resumes/templates/simple' },
      { title: 'Chuyên viên mua hàng', tag: null, layout: 'top', href: '/resumes/templates/simple' },
      { title: 'Logistics Coordinator', tag: null, layout: 'sidebar', href: '/resumes/templates/simple' },
      { title: 'Trưởng phòng logistics', tag: null, layout: 'bold', href: '/resumes/templates/simple' },
    ],
  },
  {
    id: 'ecommerce',
    label: 'Thương mại điện tử & Bán lẻ',
    icon: ShoppingBagIcon,
    color: 'bg-indigo-50 text-indigo-600',
    accent: 'bg-indigo-500',
    accentText: 'text-indigo-600',
    border: 'border-indigo-200',
    count: 12,
    jobs: [
      { title: 'Vận hành sàn TMĐT', tag: 'Phổ biến', layout: 'sidebar', href: '/resumes/templates/sales' },
      { title: 'Category Manager', tag: null, layout: 'bold', href: '/resumes/templates/sales' },
      { title: 'E-commerce Executive', tag: null, layout: 'top', href: '/resumes/templates/sales' },
      { title: 'Quản lý cửa hàng', tag: null, layout: 'classic', href: '/resumes/templates/sales' },
      { title: 'Customer Service Specialist', tag: null, layout: 'sidebar', href: '/resumes/templates/sales' },
      { title: 'Merchandiser', tag: null, layout: 'top', href: '/resumes/templates/sales' },
    ],
  },
  {
    id: 'realestate',
    label: 'Bất động sản & Xây dựng',
    icon: BuildingIcon,
    color: 'bg-lime-50 text-lime-700',
    accent: 'bg-lime-600',
    accentText: 'text-lime-700',
    border: 'border-lime-200',
    count: 9,
    jobs: [
      { title: 'Nhân viên môi giới BĐS', tag: 'Phổ biến', layout: 'sidebar', href: '/resumes/templates/sales' },
      { title: 'Quản lý dự án BĐS', tag: null, layout: 'bold', href: '/resumes/templates/simple' },
      { title: 'Thiết kế nội thất', tag: null, layout: 'top', href: '/resumes/templates/developer' },
      { title: 'Kiến trúc sư', tag: null, layout: 'classic', href: '/resumes/templates/simple' },
      { title: 'Giám sát thi công', tag: null, layout: 'top', href: '/resumes/templates/simple' },
      { title: 'Định giá BĐS', tag: null, layout: 'bold', href: '/resumes/templates/accountant' },
    ],
  },
]

// ── Mini CV preview ───────────────────────────────────────────────────────────

const LINES_A = [88, 72, 84, 68, 90, 76, 60, 82, 70, 86, 74, 64]
const LINES_B = [76, 60, 82, 70, 64, 88, 72, 84, 90, 62, 80, 74]

function MiniPreview({ layout, accent }: { layout: string; accent: string }) {
  if (layout === 'sidebar') {
    return (
      <div className="flex h-full overflow-hidden">
        <div className={cn('w-[36%] shrink-0 p-1.5', accent)}>
          <div className="mx-auto mb-1.5 h-5 w-5 rounded-full bg-white/30" />
          <div className="mb-2 space-y-0.5">
            <div className="h-1 rounded bg-white/50" />
            <div className="h-0.5 w-3/4 rounded bg-white/30" />
          </div>
          <div className="space-y-0.5">
            {[78, 60, 70, 50, 65].map((w, i) => (
              <div key={i} className="h-0.5 rounded bg-white/25" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
        <div className="flex-1 bg-white p-1.5">
          <div className="mb-1.5">
            <div className="mb-0.5 h-1 w-3/4 rounded bg-gray-200" />
            <div className="h-0.5 w-1/2 rounded bg-gray-100" />
          </div>
          <div className="space-y-0.5">
            {LINES_A.map((w, i) => (
              <div key={i} className="h-0.5 rounded bg-gray-100" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }
  if (layout === 'bold') {
    return (
      <div className="flex h-full flex-col overflow-hidden bg-white">
        <div className={cn('p-2', accent)}>
          <div className="mb-0.5 h-1.5 w-2/3 rounded bg-white/50" />
          <div className="h-0.5 w-1/2 rounded bg-white/30" />
        </div>
        <div className="flex-1 p-1.5">
          <div className="mb-1 flex gap-1.5">
            {[30, 28, 32].map((w, i) => (
              <div key={i} className="h-0.5 rounded bg-gray-200" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="space-y-0.5">
            {LINES_B.map((w, i) => (
              <div key={i} className="h-0.5 rounded bg-gray-100" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }
  if (layout === 'classic') {
    return (
      <div className="flex h-full flex-col overflow-hidden bg-white p-1.5">
        <div className="mb-1.5 text-center">
          <div className="mx-auto mb-0.5 h-1 w-1/2 rounded bg-gray-800" />
          <div className="mx-auto h-0.5 w-1/3 rounded bg-gray-400" />
          <div className="mx-auto mt-0.5 h-px w-full bg-gray-300" />
        </div>
        <div className="space-y-0.5">
          {LINES_A.map((w, i) => (
            <div key={i} className="h-0.5 rounded bg-gray-200" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    )
  }
  // top / simple
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className={cn('flex h-10 flex-col justify-end p-1.5', accent)}>
        <div className="mb-0.5 h-1.5 w-1/2 rounded bg-white/50" />
        <div className="h-0.5 w-1/3 rounded bg-white/30" />
      </div>
      <div className="flex-1 p-1.5">
        <div className="space-y-0.5">
          {LINES_B.map((w, i) => (
            <div key={i} className="h-0.5 rounded bg-gray-100" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── CV Job Card ───────────────────────────────────────────────────────────────

function CVJobCard({ job, accent, accentText }: { job: CVJob; accent: string; accentText: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {job.tag && (
        <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
          <StarIcon className="h-2.5 w-2.5 fill-amber-500 stroke-none" />
          {job.tag}
        </div>
      )}

      {/* Preview */}
      <div className="relative h-40 overflow-hidden border-b border-gray-100 bg-gray-50">
        <div className="absolute inset-2 overflow-hidden rounded-lg shadow-sm">
          <MiniPreview layout={job.layout} accent={accent} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/10">
          <Link
            href={job.href}
            className="translate-y-2 scale-90 rounded-xl bg-white px-4 py-1.5 text-xs font-semibold text-gray-900 opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100"
          >
            Xem trước
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-3.5">
        <p className="mb-2.5 text-sm font-semibold leading-snug text-gray-900">{job.title}</p>
        <Link
          href={job.href}
          className={cn('block w-full rounded-xl py-1.5 text-center text-xs font-semibold text-white transition hover:opacity-90', accent)}
        >
          Dùng mẫu này
        </Link>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CVLibraryPage() {
  const totalCount = INDUSTRIES.reduce((s, ind) => s + ind.count, 0)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <nav className="mb-5 flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-brand">Trang chủ</Link>
            <ChevronRightIcon className="h-3.5 w-3.5" />
            <span className="text-gray-600">Thư viện CV theo ngành nghề</span>
          </nav>

          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-bold leading-snug text-gray-900 md:text-3xl">
                Thư viện CV theo{' '}
                <span className="text-brand">ngành nghề</span>
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-500">
                Hơn <strong className="text-gray-700">{totalCount}+ mẫu CV</strong> phân loại theo{' '}
                <strong className="text-gray-700">{INDUSTRIES.length} nhóm ngành</strong>.
                Chọn đúng ngành, tải về PDF — miễn phí hoàn toàn.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Link
                href="/resumes/builder"
                className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90"
              >
                Tạo CV từ đầu
              </Link>
              <Link
                href="/resumes/templates"
                className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand hover:text-brand"
              >
                Mẫu theo phong cách
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { value: `${totalCount}+`, label: 'Mẫu CV miễn phí' },
              { value: `${INDUSTRIES.length}`, label: 'Nhóm ngành nghề' },
              { value: '100%', label: 'Miễn phí tải về' },
              { value: 'PDF', label: 'Chất lượng cao' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2">
                <span className="text-sm font-bold text-brand">{s.value}</span>
                <span className="text-xs text-gray-500">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">

        {/* ── Industry quick-nav ───────────────────────────────────── */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex min-w-max gap-2 pb-1">
            {INDUSTRIES.map((ind) => {
              const Icon = ind.icon
              return (
                <a
                  key={ind.id}
                  href={`#${ind.id}`}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition hover:shadow-sm',
                    ind.color,
                    ind.border,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {ind.label}
                  <span className="rounded-full bg-white/60 px-1.5 py-0.5 text-[10px] font-bold">
                    {ind.count}
                  </span>
                </a>
              )
            })}
          </div>
        </div>

        {/* ── Industry sections ───────────────────────────────────── */}
        <div className="space-y-14">
          {INDUSTRIES.map((ind) => {
            const Icon = ind.icon
            return (
              <section key={ind.id} id={ind.id} className="scroll-mt-20">
                {/* Section header */}
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', ind.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{ind.label}</h2>
                      <p className={cn('text-xs font-medium', ind.accentText)}>
                        {ind.count} mẫu CV phù hợp
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/resumes/templates"
                    className={cn('hidden items-center gap-1 text-sm font-semibold transition hover:underline sm:flex', ind.accentText)}
                  >
                    Xem tất cả <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Cards */}
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                  {ind.jobs.map((job) => (
                    <CVJobCard
                      key={job.title}
                      job={job}
                      accent={ind.accent}
                      accentText={ind.accentText}
                    />
                  ))}
                </div>

                <div className="mt-4 sm:hidden">
                  <Link
                    href="/resumes/templates"
                    className={cn('flex items-center gap-1 text-sm font-semibold', ind.accentText)}
                  >
                    Xem tất cả mẫu CV ngành {ind.label}
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </section>
            )
          })}
        </div>

        {/* ── Tips banner ─────────────────────────────────────────── */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-brand/20 bg-brand/5 p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <FileTextIcon className="h-5 w-5 text-brand" />
                <h3 className="font-bold text-gray-900">Mẹo chọn mẫu CV phù hợp ngành nghề</h3>
              </div>
              <ul className="space-y-1.5 text-sm text-gray-600">
                {[
                  'Ngành IT, Kỹ thuật: chọn mẫu 2 cột hoặc bold header — nhà tuyển dụng tìm tech stack nhanh',
                  'Ngành Thiết kế: mẫu có màu sắc phong phú để thể hiện cá tính sáng tạo',
                  'Ngành Tài chính, Pháp lý: mẫu classic/Harvard tạo cảm giác chuyên nghiệp và đáng tin',
                  'Ngành Bán hàng, Marketing: mẫu sidebar nổi bật phần thành tích và KPI',
                  'Ứng tuyển qua ATS: ưu tiên mẫu đơn giản (simple) để hệ thống đọc được toàn bộ nội dung',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              <Link
                href="/resumes/builder"
                className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand/90"
              >
                Tạo CV ngay
              </Link>
              <Link href="/blog/cv" className="text-center text-sm font-medium text-brand hover:underline">
                Đọc hướng dẫn viết CV →
              </Link>
            </div>
          </div>
        </div>

        {/* ── Related links ───────────────────────────────────────── */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: 'Review CV miễn phí',
              desc: 'Chuyên gia HR đánh giá CV của bạn và gợi ý cải thiện',
              href: '/cv-review',
              colorClass: 'border-brand/30 bg-brand/5',
              textClass: 'text-brand',
            },
            {
              title: 'Hướng dẫn viết CV A–Z',
              desc: 'Từ cấu trúc, cách viết đến tối ưu ATS — mọi thứ bạn cần biết',
              href: '/blog/cv',
              colorClass: 'border-violet-200 bg-violet-50/50',
              textClass: 'text-violet-600',
            },
            {
              title: 'Mẫu CV theo phong cách',
              desc: 'Đơn giản, Ấn tượng, Chuyên nghiệp, Harvard — chọn theo gu thiết kế',
              href: '/resumes/templates',
              colorClass: 'border-amber-200 bg-amber-50/50',
              textClass: 'text-amber-700',
            },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className={cn('group rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-sm', card.colorClass)}
            >
              <p className={cn('mb-1 font-semibold', card.textClass)}>{card.title}</p>
              <p className="text-xs leading-relaxed text-gray-500">{card.desc}</p>
              <p className={cn('mt-3 flex items-center gap-1 text-xs font-semibold', card.textClass)}>
                Xem ngay <ArrowRightIcon className="h-3 w-3 transition group-hover:translate-x-0.5" />
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
