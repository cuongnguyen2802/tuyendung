import Link from 'next/link'
import { ChevronRightIcon, StarIcon, FileIcon } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mẫu CV miễn phí — TuyenDung.vn',
  description: 'Hàng trăm mẫu CV chuyên nghiệp, miễn phí. Chọn mẫu phù hợp và tạo CV ngay.',
}

// ── Template data ─────────────────────────────────────────────────────────────

const STYLE_TEMPLATES = [
  {
    id: 'simple',
    name: 'CV Đơn giản',
    desc: 'Thiết kế tối giản, rõ ràng, phù hợp với mọi ngành nghề',
    accent: 'bg-sky-600',
    accentLight: 'bg-sky-50',
    accentText: 'text-sky-600',
    layout: 'top',
    popular: false,
    href: '/resumes/templates/simple',
  },
  {
    id: 'impressive',
    name: 'CV Ấn tượng',
    desc: 'Bố cục 2 cột nổi bật, ưu tiên kỹ năng và kinh nghiệm',
    accent: 'bg-brand',
    accentLight: 'bg-brand/10',
    accentText: 'text-brand',
    layout: 'sidebar',
    popular: true,
    href: '/resumes/templates/developer',
  },
  {
    id: 'professional',
    name: 'CV Chuyên nghiệp',
    desc: 'Header đậm màu, bố cục hiện đại cho vị trí cấp cao',
    accent: 'bg-violet-600',
    accentLight: 'bg-violet-50',
    accentText: 'text-violet-600',
    layout: 'bold',
    popular: false,
    href: '/resumes/templates/sales',
  },
  {
    id: 'harvard',
    name: 'CV Harvard',
    desc: 'Chuẩn học thuật, thanh lịch, dành cho môi trường đại học và nghiên cứu',
    accent: 'bg-gray-800',
    accentLight: 'bg-gray-50',
    accentText: 'text-gray-800',
    layout: 'classic',
    popular: false,
    href: '/resumes/templates/accountant',
  },
]

const POSITION_TEMPLATES = [
  {
    id: 'sales',
    name: 'Nhân viên kinh doanh',
    desc: 'Nhấn mạnh chỉ số doanh số, kỹ năng thuyết phục khách hàng',
    accent: 'bg-orange-500',
    accentLight: 'bg-orange-50',
    accentText: 'text-orange-600',
    layout: 'sidebar',
    popular: true,
    href: '/resumes/templates/sales',
  },
  {
    id: 'developer',
    name: 'Lập trình viên',
    desc: 'Làm nổi bật tech stack, dự án và kinh nghiệm kỹ thuật',
    accent: 'bg-brand',
    accentLight: 'bg-brand/10',
    accentText: 'text-brand',
    layout: 'bold',
    popular: true,
    href: '/resumes/templates/developer',
  },
  {
    id: 'accountant',
    name: 'Nhân viên kế toán',
    desc: 'Tập trung vào số liệu, chứng chỉ tài chính và kinh nghiệm',
    accent: 'bg-teal-600',
    accentLight: 'bg-teal-50',
    accentText: 'text-teal-600',
    layout: 'top',
    popular: false,
    href: '/resumes/templates/accountant',
  },
  {
    id: 'marketing',
    name: 'Chuyên viên marketing',
    desc: 'Sáng tạo, trực quan, thể hiện chiến dịch và kết quả đạt được',
    accent: 'bg-pink-500',
    accentLight: 'bg-pink-50',
    accentText: 'text-pink-600',
    layout: 'sidebar',
    popular: false,
    href: '/resumes/templates/marketing',
  },
]

// ── Mini CV preview ───────────────────────────────────────────────────────────

const LINES = [88, 72, 84, 68, 80, 62, 90, 76, 60, 82, 70, 86, 74, 64, 92]

function MiniPreview({ accent, layout }: { accent: string; layout: string }) {
  if (layout === 'sidebar') {
    return (
      <div className="flex h-full overflow-hidden">
        <div className={`w-[38%] shrink-0 ${accent} p-1.5`}>
          <div className="mx-auto mb-1.5 h-6 w-6 rounded-full bg-white/25" />
          <div className="mb-2.5 space-y-1">
            <div className="h-1 rounded bg-white/50" />
            <div className="h-0.5 w-3/4 rounded bg-white/30" />
          </div>
          <div className="mb-1 h-0.5 w-full bg-white/20 rounded" />
          <div className="space-y-0.5">
            {[80, 60, 75, 55, 70].map((w, i) => (
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
            {LINES.slice(0, 12).map((w, i) => (
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
        <div className={`${accent} p-2`}>
          <div className="mb-0.5 h-1.5 w-2/3 rounded bg-white/50" />
          <div className="h-0.5 w-1/2 rounded bg-white/30" />
        </div>
        <div className="flex-1 p-1.5">
          <div className="mb-1 flex gap-2">
            <div className="h-0.5 w-8 rounded bg-gray-200" />
            <div className="h-0.5 w-8 rounded bg-gray-200" />
            <div className="h-0.5 w-8 rounded bg-gray-200" />
          </div>
          <div className="space-y-0.5">
            {LINES.map((w, i) => (
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
          <div className="mx-auto mt-0.5 h-0.5 w-2/5 rounded bg-gray-300" />
        </div>
        <div className="mb-1 h-px bg-gray-800" />
        <div className="space-y-0.5">
          {LINES.map((w, i) => (
            <div key={i} className="h-0.5 rounded bg-gray-200" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    )
  }

  // top (simple)
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className={`h-12 ${accent} flex flex-col justify-end p-1.5`}>
        <div className="mb-0.5 h-1.5 w-1/2 rounded bg-white/50" />
        <div className="h-0.5 w-1/3 rounded bg-white/30" />
      </div>
      <div className="flex-1 p-1.5">
        <div className="space-y-0.5">
          {LINES.map((w, i) => (
            <div key={i} className="h-0.5 rounded bg-gray-100" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Template card ─────────────────────────────────────────────────────────────

function TemplateCard({ tpl }: { tpl: typeof STYLE_TEMPLATES[0] }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
      {tpl.popular && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
          <StarIcon className="h-3 w-3 fill-amber-500 stroke-none" /> Phổ biến
        </div>
      )}

      {/* Preview area */}
      <div className="relative h-52 overflow-hidden border-b border-gray-100 bg-gray-50">
        <div className="absolute inset-2 overflow-hidden rounded-lg shadow-sm">
          <MiniPreview accent={tpl.accent} layout={tpl.layout} />
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/10">
          <Link
            href={tpl.href}
            className="translate-y-2 scale-90 rounded-xl bg-white px-5 py-2 text-sm font-semibold text-gray-900 opacity-0 shadow-lg transition group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100"
          >
            Xem trước
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="mb-1 flex items-center gap-2">
          <FileIcon className={`h-4 w-4 ${tpl.accentText}`} />
          <h3 className="font-semibold text-gray-900">{tpl.name}</h3>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-gray-500">{tpl.desc}</p>
        <Link
          href={tpl.href}
          className={`block w-full rounded-xl py-2 text-center text-sm font-semibold text-white transition hover:opacity-90 ${tpl.accent}`}
        >
          Dùng mẫu này
        </Link>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CVTemplatesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center">
          <nav className="mb-4 flex justify-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-brand">Trang chủ</Link>
            <ChevronRightIcon className="h-3.5 w-3.5 self-center" />
            <span className="text-gray-600">Mẫu CV</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">
            Mẫu CV <span className="text-brand">miễn phí</span>, chuyên nghiệp
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-gray-500">
            Hơn 50 mẫu CV được thiết kế bởi chuyên gia. Chọn mẫu phù hợp, điền thông tin và tải về PDF chỉ trong vài phút.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/resumes/builder"
              className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90"
            >
              Tạo CV từ đầu
            </Link>
            <Link
              href="/resumes/upload"
              className="rounded-xl border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand hover:text-brand"
            >
              Tải CV của tôi lên
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* By style section */}
        <div className="mb-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Mẫu CV theo phong cách</h2>
              <p className="mt-0.5 text-sm text-gray-500">Thiết kế đa dạng, phù hợp với sở thích cá nhân</p>
            </div>
            <Link href="/resumes/templates?by=style" className="text-sm font-semibold text-brand hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STYLE_TEMPLATES.map((tpl) => (
              <TemplateCard key={tpl.id} tpl={tpl} />
            ))}
          </div>
        </div>

        {/* By position section */}
        <div className="mb-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Mẫu CV theo vị trí ứng tuyển</h2>
              <p className="mt-0.5 text-sm text-gray-500">Được tối ưu cho từng ngành nghề cụ thể</p>
            </div>
            <Link href="/resumes/templates?by=position" className="text-sm font-semibold text-brand hover:underline">
              Xem tất cả →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {POSITION_TEMPLATES.map((tpl) => (
              <TemplateCard key={tpl.id} tpl={tpl} />
            ))}
          </div>
        </div>

        {/* CTA banner */}
        <div className="overflow-hidden rounded-2xl bg-brand px-8 py-10 text-center text-white">
          <h2 className="mb-2 text-2xl font-bold">Bắt đầu tạo CV của bạn ngay hôm nay</h2>
          <p className="mb-6 text-sm text-white/80">Miễn phí, không cần tài khoản. Tạo CV chuyên nghiệp trong 10 phút.</p>
          <div className="flex justify-center gap-3">
            <Link
              href="/resumes/builder"
              className="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-brand transition hover:bg-gray-50"
            >
              Tạo CV ngay
            </Link>
            <Link
              href="/blog/cv"
              className="rounded-xl border border-white/40 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Hướng dẫn viết CV
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
