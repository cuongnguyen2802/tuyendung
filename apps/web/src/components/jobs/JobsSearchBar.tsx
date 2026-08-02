'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SearchIcon, ChevronDownIcon, XIcon, LayoutGridIcon } from 'lucide-react'
import { LocationPicker } from '@/components/common/LocationPicker'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  'Kinh doanh/Bán hàng',
  'Marketing/PR/Quảng cáo',
  'Chăm sóc khách hàng',
  'Nhân sự/Hành chính/Pháp chế',
  'Công nghệ Thông tin',
  'Kế toán/Kiểm toán/Thuế',
  'Tài chính/Ngân hàng/Bảo hiểm',
  'Thiết kế/Mỹ thuật',
  'Sản xuất/Vận hành',
  'Vận tải/Logistics',
  'Y tế/Dược phẩm',
  'Giáo dục/Đào tạo',
  'Nhà hàng/Khách sạn/Du lịch',
  'Xây dựng/Kiến trúc',
  'Bất động sản',
  'Quản lý điều hành',
]

interface Props {
  defaultKeyword?: string
  defaultCity?: string
}

export function JobsSearchBar({ defaultKeyword = '', defaultCity = '' }: Props) {
  const router = useRouter()
  useSearchParams()
  const [keyword, setKeyword] = useState(defaultKeyword)
  const [city, setCity] = useState(defaultCity)
  const [catOpen, setCatOpen] = useState(false)
  const catRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    const p = new URLSearchParams()
    if (keyword.trim()) p.set('keyword', keyword.trim())
    if (city) p.set('city', city)
    p.set('page', '1')
    router.push(`/jobs?${p.toString()}`)
  }

  const selectCategory = (cat: string) => {
    setKeyword(cat)
    setCatOpen(false)
    const p = new URLSearchParams()
    p.set('keyword', cat)
    if (city) p.set('city', city)
    p.set('page', '1')
    router.push(`/jobs?${p.toString()}`)
  }

  return (
    <div className="sticky top-0 z-30 bg-brand shadow-lg">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <form onSubmit={submit} className="flex items-center gap-2">
          {/* Category dropdown */}
          <div ref={catRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setCatOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/25"
            >
              <LayoutGridIcon className="h-4 w-4" />
              Danh mục Nghề
              <ChevronDownIcon className={cn('h-4 w-4 transition-transform', catOpen && 'rotate-180')} />
            </button>
            {catOpen && (
              <div className="absolute left-0 top-full z-50 mt-1.5 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
                <div className="max-h-80 overflow-y-auto py-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => selectCategory(cat)}
                      className="flex w-full items-center px-4 py-2.5 text-sm text-gray-700 transition hover:bg-brand/5 hover:text-brand"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search input + location picker */}
          <div className="flex flex-1 items-center rounded-xl bg-white">
            <div className="flex flex-1 items-center px-4">
              <SearchIcon className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Vị trí tuyển dụng, tên công ty..."
                className="h-11 flex-1 bg-transparent px-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none"
              />
              {keyword && (
                <button type="button" onClick={() => setKeyword('')} className="shrink-0 p-1 text-gray-400 hover:text-gray-600">
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="h-7 w-px shrink-0 bg-gray-200" />
            <div className="relative h-11 w-52 shrink-0">
              <LocationPicker value={city} onChange={setCity} placeholder="Địa điểm" className="h-full" />
            </div>
          </div>

          <button
            type="submit"
            className="shrink-0 rounded-xl bg-[#27ae60] px-7 py-2.5 text-sm font-bold text-white transition hover:bg-[#219150]"
          >
            Tìm kiếm
          </button>
        </form>
      </div>
    </div>
  )
}
