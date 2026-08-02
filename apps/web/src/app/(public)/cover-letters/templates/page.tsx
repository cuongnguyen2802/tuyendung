import Link from 'next/link'
import { ChevronRightIcon, StarIcon } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mẫu thư xin việc — TuyenDung.vn',
  description: 'Mẫu cover letter chuyên nghiệp, miễn phí cho mọi ngành nghề.',
}

const TEMPLATES = [
  {
    id: 'classic',
    name: 'Thư xin việc Cổ điển',
    desc: 'Định dạng truyền thống, lịch sự và chuyên nghiệp cho mọi ngành',
    accent: 'bg-gray-800',
    textAccent: 'text-gray-800',
    popular: true,
    href: '/cover-letters/templates/classic',
  },
  {
    id: 'modern',
    name: 'Thư xin việc Hiện đại',
    desc: 'Phong cách hiện đại với điểm nhấn màu sắc, phù hợp với môi trường sáng tạo',
    accent: 'bg-brand',
    textAccent: 'text-brand',
    popular: false,
    href: '/cover-letters/templates/modern',
  },
  {
    id: 'minimal',
    name: 'Thư xin việc Tối giản',
    desc: 'Ngắn gọn, súc tích, nhấn mạnh điểm mạnh cá nhân',
    accent: 'bg-sky-600',
    textAccent: 'text-sky-700',
    popular: false,
    href: '/cover-letters/templates/minimal',
  },
  {
    id: 'academic',
    name: 'Thư xin việc Học thuật',
    desc: 'Dành cho vị trí nghiên cứu, giảng dạy và môi trường học thuật',
    accent: 'bg-violet-700',
    textAccent: 'text-violet-700',
    popular: false,
    href: '/cover-letters/templates/academic',
  },
  {
    id: 'tech',
    name: 'Thư xin việc IT',
    desc: 'Tối ưu cho lập trình viên, kỹ sư phần mềm và ngành công nghệ',
    accent: 'bg-emerald-600',
    textAccent: 'text-emerald-700',
    popular: true,
    href: '/cover-letters/templates/tech',
  },
  {
    id: 'sales',
    name: 'Thư xin việc Kinh doanh',
    desc: 'Nhấn mạnh thành tích bán hàng, kỹ năng thuyết phục và kết quả số liệu',
    accent: 'bg-orange-500',
    textAccent: 'text-orange-600',
    popular: false,
    href: '/cover-letters/templates/sales',
  },
]

// ── Letter mini preview ───────────────────────────────────────────────────────

function LetterPreview({ accent }: { accent: string }) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white p-3">
      {/* Date + address */}
      <div className="mb-2 space-y-0.5">
        <div className="h-0.5 w-16 rounded bg-gray-200" />
        <div className="h-0.5 w-24 rounded bg-gray-200" />
      </div>
      {/* Subject */}
      <div className={`mb-2 h-1.5 w-2/3 rounded ${accent}`} />
      {/* Body lines */}
      <div className="flex-1 space-y-0.5">
        {[90, 85, 80, 88, 75, 82, 70, 85, 78, 65, 88, 80].map((w, i) => (
          <div key={i} className="h-0.5 rounded bg-gray-100" style={{ width: `${w}%` }} />
        ))}
      </div>
      {/* Signature */}
      <div className="mt-2 space-y-0.5">
        <div className="h-0.5 w-24 rounded bg-gray-200" />
        <div className={`h-1 w-20 rounded ${accent} opacity-60`} />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CoverLetterTemplatesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 text-center">
          <nav className="mb-4 flex justify-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-brand">Trang chủ</Link>
            <ChevronRightIcon className="h-3.5 w-3.5 self-center" />
            <span className="text-gray-600">Mẫu thư xin việc</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">
            Mẫu <span className="text-brand">thư xin việc</span> chuyên nghiệp
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-gray-500">
            Chọn mẫu phù hợp với phong cách và ngành nghề của bạn. Chỉnh sửa nội dung và tải về trong vài phút.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Tips bar */}
        <div className="mb-8 flex items-start gap-3 rounded-2xl bg-amber-50 p-4">
          <span className="text-xl">💡</span>
          <div className="text-sm text-amber-800">
            <strong>Mẹo:</strong> Thư xin việc tốt nhất là ngắn gọn (dưới 1 trang), cá nhân hóa cho từng công ty,
            và nhấn mạnh cách bạn giải quyết vấn đề cụ thể của nhà tuyển dụng.
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* Preview */}
              <div className="relative h-48 overflow-hidden border-b border-gray-100 bg-gray-50">
                <div className="absolute inset-2 overflow-hidden rounded-lg shadow-sm">
                  <LetterPreview accent={tpl.accent} />
                </div>
                {tpl.popular && (
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    <StarIcon className="h-3 w-3 fill-amber-500 stroke-none" /> Phổ biến
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="mb-1 font-semibold text-gray-900">{tpl.name}</h3>
                <p className="mb-4 text-xs leading-relaxed text-gray-500">{tpl.desc}</p>
                <Link
                  href={tpl.href}
                  className={`block w-full rounded-xl py-2 text-center text-sm font-semibold text-white transition hover:opacity-90 ${tpl.accent}`}
                >
                  Dùng mẫu này
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 overflow-hidden rounded-2xl bg-brand px-8 py-10 text-center text-white">
          <h2 className="mb-2 text-xl font-bold">Kết hợp CV và thư xin việc ấn tượng</h2>
          <p className="mb-6 text-sm text-white/80">
            Ứng tuyển với bộ hồ sơ hoàn chỉnh — tăng cơ hội được phỏng vấn lên đáng kể.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/cover-letters"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-brand hover:bg-gray-50"
            >
              Viết thư của tôi
            </Link>
            <Link
              href="/resumes/templates"
              className="rounded-xl border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Xem mẫu CV
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
