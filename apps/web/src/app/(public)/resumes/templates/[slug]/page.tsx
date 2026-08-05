'use client'

import { useState, useRef } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRightIcon, ChevronLeftIcon, CheckIcon, ArrowRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CVTemplatePreview,
  CVTemplateThumbnail,
  POSITIONS,
  POSITION_VARIANTS,
  type Variant,
  type PositionData,
} from '@/components/cv/CVTemplateEngine'

export default function TemplateDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug   = params?.slug ?? ''
  const data   = POSITIONS[slug] as PositionData | undefined
  if (!data) return notFound()

  const variants = POSITION_VARIANTS[slug] ?? POSITION_VARIANTS.simple

  const [selectedId, setSelectedId]       = useState(variants[0].id)
  const [lang, setLang]                   = useState<'vi' | 'en'>('vi')
  const [createOption, setCreateOption]   = useState<'template' | 'blank'>('template')
  const stripRef = useRef<HTMLDivElement>(null)

  const selectedVariant: Variant = variants.find(v => v.id === selectedId) ?? variants[0]

  function scrollStrip(dir: -1 | 1) {
    if (stripRef.current) stripRef.current.scrollLeft += dir * 200
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-[1200px] gap-8 px-4 py-8 lg:flex-row flex-col">

        {/* LEFT: preview + carousel */}
        <div className="flex-1 lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
            <CVTemplatePreview variant={selectedVariant} data={data} />
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">
                {data.count} mẫu cho {data.title}
              </span>
              <div className="flex gap-1">
                {[-1, 1].map((d) => (
                  <button key={d} onClick={() => scrollStrip(d as -1 | 1)} className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
                    {d === -1 ? <ChevronLeftIcon className="h-3.5 w-3.5" /> : <ChevronRightIcon className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </div>
            <div ref={stripRef} className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {variants.map((v) => (
                <CVTemplateThumbnail
                  key={v.id}
                  variant={v}
                  data={data}
                  selected={v.id === selectedId}
                  onClick={() => setSelectedId(v.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: controls */}
        <div className="w-full lg:w-[380px] shrink-0">
          <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-gray-400">
            <Link href="/" className="hover:text-brand transition">Trang chủ</Link>
            <ChevronRightIcon className="h-3 w-3" />
            <Link href="/resumes/templates" className="hover:text-brand transition">{data.category}</Link>
            <ChevronRightIcon className="h-3 w-3" />
            <span className="text-gray-600 truncate">{data.title}</span>
          </nav>

          <h1 className="mb-4 text-2xl font-bold text-gray-900">{data.title}</h1>

          <div className="mb-4 flex gap-2">
            {(['vi', 'en'] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={cn('rounded-full border px-5 py-1.5 text-sm font-semibold transition', lang === l ? 'border-brand text-brand' : 'border-gray-300 text-gray-600 hover:border-gray-400')}>
                {l === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'}
              </button>
            ))}
          </div>

          <p className="mb-5 text-sm leading-relaxed text-gray-600">{data.desc}</p>

          {/* Color picker */}
          <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Màu sắc & thiết kế</p>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => (
                <button key={v.id} title={v.label} onClick={() => setSelectedId(v.id)}
                  className={cn('h-8 w-8 rounded-full border-2 transition flex items-center justify-center', v.id === selectedId ? 'border-gray-400 scale-110' : 'border-transparent hover:border-gray-300')}
                  style={{ background: v.sidebar }}>
                  {v.id === selectedId && <CheckIcon className="h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-400">Đang chọn: {selectedVariant.label}</p>
          </div>

          {/* Creation options */}
          <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-3 text-sm font-bold text-gray-800">Bạn muốn tạo CV từ?</p>
            <div className="space-y-3">
              {[{ value: 'template', label: 'Mẫu nội dung + Thiết kế như ảnh', desc: 'Nội dung mẫu sẵn, bạn chỉ cần chỉnh sửa' },
                { value: 'blank',    label: 'Chỉ lấy thiết kế, tôi tạo từ đầu', desc: 'Bắt đầu trang trắng, giữ nguyên layout' }].map(({ value, label, desc }) => (
                <label key={value}
                  className={cn('flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition', createOption === value ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-gray-300')}
                  onClick={() => setCreateOption(value as 'template' | 'blank')}>
                  <div className="mt-0.5 flex-shrink-0 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition"
                    style={{ borderColor: createOption === value ? 'var(--brand)' : '#d1d5db', background: createOption === value ? 'var(--brand)' : 'transparent' }}>
                    {createOption === value && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{label}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Link
            href={`/resumes/builder?template=${slug}&variant=${selectedId}&mode=${createOption}&lang=${lang}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand/90"
          >
            Tạo CV <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <p className="mt-2 text-center text-xs text-gray-400">Miễn phí · Không cần tài khoản · Xuất PDF ngay</p>

          <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="mb-2 text-xs font-bold text-amber-700">Mẹo tạo CV hiệu quả</p>
            <ul className="space-y-1.5 text-xs text-amber-700/80">
              <li>• Thay thế toàn bộ nội dung mẫu bằng thông tin thực của bạn</li>
              <li>• Giữ CV trong 1–2 trang với kinh nghiệm dưới 8 năm</li>
              <li>• Dùng số liệu cụ thể để minh chứng thành tích (%, doanh số)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
