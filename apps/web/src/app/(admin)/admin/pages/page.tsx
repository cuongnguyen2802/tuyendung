'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  ExternalLinkIcon, PencilIcon, CheckCircleIcon, ClockIcon, Loader2Icon,
} from 'lucide-react'

const PAGE_META: Record<string, { title: string; desc: string; editable: boolean }> = {
  about:     { title: 'Giới thiệu',            desc: 'Câu chuyện, số liệu và giá trị cốt lõi',    editable: true  },
  contact:   { title: 'Liên hệ',               desc: 'Thông tin liên hệ, hotline, địa chỉ',        editable: true  },
  faq:       { title: 'Hỏi đáp',               desc: 'Câu hỏi thường gặp theo chủ đề',             editable: true  },
  pricing:   { title: 'Bảng giá',              desc: 'Gói dịch vụ cho nhà tuyển dụng',             editable: true  },
  careers:   { title: 'Tuyển dụng nội bộ',     desc: 'Phúc lợi và vị trí đang mở',                 editable: true  },
  press:     { title: 'Góc báo chí',           desc: 'Tin tức, thông cáo báo chí',                 editable: true  },
  'cv-review': { title: 'Review CV',           desc: 'Trang landing dịch vụ review CV',             editable: false },
  privacy:   { title: 'Chính sách bảo mật',   desc: 'Nội dung pháp lý — chỉnh sửa qua code',      editable: false },
  terms:     { title: 'Điều khoản dịch vụ',   desc: 'Nội dung pháp lý — chỉnh sửa qua code',      editable: false },
}

interface PageStatus {
  slug: string
  updatedAt: string | null
  hasContent: boolean
}

export default function AdminPagesPage() {
  const { data: pages, isLoading } = useQuery<PageStatus[]>({
    queryKey: ['admin-pages'],
    queryFn: () => api.get('/admin/pages'),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Quản lý trang tĩnh</h1>
        <p className="mt-0.5 text-sm text-gray-500">Chỉnh sửa nội dung các trang thông tin trên website</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2Icon className="h-7 w-7 animate-spin text-gray-300" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(pages ?? Object.keys(PAGE_META).map(slug => ({ slug, updatedAt: null, hasContent: false }))).map(page => {
            const meta = PAGE_META[page.slug]
            if (!meta) return null
            return (
              <div
                key={page.slug}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-gray-900">{meta.title}</h2>
                    <p className="mt-0.5 text-xs text-gray-400">{meta.desc}</p>
                  </div>
                  <span className={`shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    page.hasContent
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {page.hasContent
                      ? <><CheckCircleIcon className="h-3 w-3" />Đã cấu hình</>
                      : <><ClockIcon className="h-3 w-3" />Mặc định</>
                    }
                  </span>
                </div>

                {page.updatedAt && (
                  <p className="mb-3 text-[11px] text-gray-400">
                    Cập nhật: {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(page.updatedAt))}
                  </p>
                )}

                <div className="mt-auto flex items-center gap-2">
                  <Link
                    href={`/${page.slug}`}
                    target="_blank"
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
                  >
                    <ExternalLinkIcon className="h-3 w-3" />
                    Xem trang
                  </Link>
                  {meta.editable ? (
                    <Link
                      href={`/admin/pages/${page.slug}`}
                      className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand/90"
                    >
                      <PencilIcon className="h-3 w-3" />
                      Chỉnh sửa
                    </Link>
                  ) : (
                    <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-400">
                      Chỉnh sửa qua code
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
