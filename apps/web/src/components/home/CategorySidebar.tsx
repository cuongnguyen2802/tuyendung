'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  'Kinh doanh/Bán hàng',
  'Marketing/PR/Quảng cáo',
  'Chăm sóc khách hàng',
  'Nhân sự/Hành chính/Pháp chế',
  'Công nghệ Thông tin',
  'Lao động phổ thông',
  'Kế toán/Kiểm toán/Thuế',
  'Tài chính/Ngân hàng/Bảo hiểm',
  'Bất động sản',
  'Thiết kế/Mỹ thuật',
  'Sản xuất/Vận hành',
  'Vận tải/Logistics',
  'Y tế/Dược phẩm',
  'Giáo dục/Đào tạo',
  'Nhà hàng/Khách sạn/Du lịch',
  'Xây dựng/Kiến trúc',
  'Truyền thông/Báo chí',
  'Nông nghiệp/Thực phẩm',
  'Luật/Pháp lý',
  'Bán lẻ/Tiêu dùng',
  'Năng lượng/Môi trường',
  'Thể thao/Giải trí',
  'Hàng không/Hải quan',
  'Quản lý điều hành',
  'Khác',
]

const QUERIES: Record<string, string> = {
  'Kinh doanh/Bán hàng': 'Kinh doanh',
  'Marketing/PR/Quảng cáo': 'Marketing',
  'Chăm sóc khách hàng': 'Chăm sóc khách hàng',
  'Nhân sự/Hành chính/Pháp chế': 'Nhân sự',
  'Công nghệ Thông tin': 'IT',
  'Lao động phổ thông': 'Lao động',
  'Kế toán/Kiểm toán/Thuế': 'Kế toán',
  'Tài chính/Ngân hàng/Bảo hiểm': 'Tài chính',
  'Bất động sản': 'Bất động sản',
  'Thiết kế/Mỹ thuật': 'Thiết kế',
  'Sản xuất/Vận hành': 'Sản xuất',
  'Vận tải/Logistics': 'Logistics',
  'Y tế/Dược phẩm': 'Y tế',
  'Giáo dục/Đào tạo': 'Giáo dục',
  'Nhà hàng/Khách sạn/Du lịch': 'Nhà hàng',
  'Xây dựng/Kiến trúc': 'Xây dựng',
  'Truyền thông/Báo chí': 'Truyền thông',
}

const PER_PAGE = 5
const TOTAL_PAGES = Math.ceil(CATEGORIES.length / PER_PAGE)

export function CategorySidebar() {
  const [page, setPage] = useState(0)
  const [activeIdx, setActiveIdx] = useState(0)

  const visible = CATEGORIES.slice(page * PER_PAGE, (page + 1) * PER_PAGE)

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex-1 divide-y divide-gray-50">
        {visible.map((cat, i) => {
          const globalIdx = page * PER_PAGE + i
          const isActive = globalIdx === activeIdx
          const query = QUERIES[cat] ?? cat
          return (
            <Link
              key={cat}
              href={`/jobs?keyword=${encodeURIComponent(query)}`}
              onClick={() => setActiveIdx(globalIdx)}
              className={cn(
                'flex items-center justify-between px-5 py-3.5 text-sm transition',
                isActive
                  ? 'bg-brand/5 font-semibold text-brand'
                  : 'text-gray-700 hover:bg-gray-50',
              )}
            >
              <span>{cat}</span>
              <ChevronRightIcon className={cn('h-4 w-4 shrink-0', isActive ? 'text-brand' : 'text-gray-300')} />
            </Link>
          )
        })}
      </div>

      {/* Pagination footer */}
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
        <span className="text-xs text-gray-400">{page + 1}/{TOTAL_PAGES}</span>
        <div className="flex gap-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full border transition',
              page === 0 ? 'border-gray-100 text-gray-300' : 'border-gray-200 text-gray-500 hover:border-brand hover:text-brand',
            )}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(TOTAL_PAGES - 1, p + 1))}
            disabled={page === TOTAL_PAGES - 1}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-full border transition',
              page === TOTAL_PAGES - 1 ? 'border-gray-100 text-gray-300' : 'border-gray-200 text-gray-500 hover:border-brand hover:text-brand',
            )}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
