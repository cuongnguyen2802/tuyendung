'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ArrowRightIcon, CalendarIcon, ExternalLinkIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SuggestionItem {
  id: string
  title: string
  description?: string
  category?: string
  link?: string
}

interface WorkshopItem {
  id: string
  title: string
  description?: string
  date?: string
  organizer?: string
  link?: string
}

interface SuggestionsData {
  groupA: SuggestionItem[]
  groupB: SuggestionItem[]
  workshops: WorkshopItem[]
}

const CATEGORY_COLOR: Record<string, string> = {
  'Visa & Di trú':          'bg-blue-50 text-blue-600',
  'Thuế & Kế toán':         'bg-orange-50 text-orange-600',
  'Tư vấn doanh nghiệp':    'bg-purple-50 text-purple-600',
  'Pháp lý':                'bg-red-50 text-red-600',
  'Tuyển dụng chuyên sâu':  'bg-brand/10 text-brand',
  'Mẫu CV':                 'bg-green-50 text-green-600',
  'Hướng dẫn tạo CV':       'bg-teal-50 text-teal-600',
  'Kỹ năng phỏng vấn':      'bg-violet-50 text-violet-600',
  'Khóa học':               'bg-indigo-50 text-indigo-600',
  'Chứng chỉ':              'bg-amber-50 text-amber-600',
}

function SuggestionCard({ item }: { item: SuggestionItem }) {
  const catColor = item.category ? (CATEGORY_COLOR[item.category] ?? 'bg-gray-100 text-gray-500') : ''
  return (
    <div className="group rounded-xl border border-gray-100 bg-white p-4 transition hover:border-brand/30 hover:shadow-sm">
      {item.category && (
        <span className={cn('mb-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold', catColor)}>
          {item.category}
        </span>
      )}
      <p className="text-sm font-semibold text-gray-800 leading-snug">{item.title}</p>
      {item.description && (
        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{item.description}</p>
      )}
      {item.link && (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
        >
          Tìm hiểu thêm <ArrowRightIcon className="h-3 w-3" />
        </a>
      )}
    </div>
  )
}

function WorkshopCard({ item }: { item: WorkshopItem }) {
  return (
    <div className="group rounded-xl border border-purple-100 bg-purple-50/40 p-4 transition hover:border-purple-200 hover:bg-purple-50">
      <div className="mb-2 flex items-center gap-2">
        <CalendarIcon className="h-3.5 w-3.5 text-purple-500" />
        {item.date && (
          <span className="text-xs font-medium text-purple-600">
            {new Date(item.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        )}
      </div>
      <p className="text-sm font-semibold text-gray-800 leading-snug">{item.title}</p>
      {item.description && (
        <p className="mt-1 text-xs text-gray-500 line-clamp-2">{item.description}</p>
      )}
      {item.organizer && (
        <p className="mt-1 text-xs text-gray-400">Tổ chức bởi: {item.organizer}</p>
      )}
      {item.link && (
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:underline"
        >
          Đăng ký tham dự <ExternalLinkIcon className="h-3 w-3" />
        </a>
      )}
    </div>
  )
}

interface Props {
  /** 'groupA' for employers, 'groupB' for candidates */
  group: 'groupA' | 'groupB'
  /** also show workshops (for candidates) */
  showWorkshops?: boolean
}

export function SuggestionsWidget({ group, showWorkshops = false }: Props) {
  const { data } = useQuery<SuggestionsData>({
    queryKey: ['public-suggestions'],
    queryFn: () => api.get('/users/suggestions'),
    staleTime: 5 * 60_000, // 5 min cache
  })

  const groupItems: SuggestionItem[] = data?.[group] ?? []
  const workshops: WorkshopItem[] = data?.workshops ?? []

  if (groupItems.length === 0 && (!showWorkshops || workshops.length === 0)) return null

  return (
    <div className="space-y-4">
      {groupItems.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4">
          <h3 className="mb-3 text-sm font-bold text-gray-700">
            {group === 'groupA' ? '💼 Dịch vụ hỗ trợ doanh nghiệp' : '📄 Tài nguyên tìm việc'}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {groupItems.map(item => (
              <SuggestionCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {showWorkshops && workshops.length > 0 && (
        <section className="rounded-2xl border border-purple-100 bg-purple-50/30 p-4">
          <h3 className="mb-3 text-sm font-bold text-purple-700">🎓 Hội thảo & Sự kiện dành cho bạn</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {workshops.map(item => (
              <WorkshopCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
