'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  BellIcon, BriefcaseIcon, UserIcon, StarIcon, InfoIcon,
  CheckCheckIcon, Trash2Icon, Loader2Icon, InboxIcon,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: string
  type: string
  title: string
  body: string
  link: string | null
  isRead: boolean
  createdAt: string
}

interface NotifData {
  data: Notification[]
  meta: { total: number; page: number; limit: number; totalPages: number; unreadCount: number }
}

// ── Icon map ──────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<string, { Icon: React.ElementType; bg: string; color: string }> = {
  APPLICATION_RECEIVED:       { Icon: BriefcaseIcon, bg: 'bg-blue-100',   color: 'text-blue-600' },
  APPLICATION_STATUS_CHANGED: { Icon: BriefcaseIcon, bg: 'bg-emerald-100', color: 'text-emerald-600' },
  JOB_ALERT:                  { Icon: BellIcon,      bg: 'bg-amber-100',  color: 'text-amber-600' },
  PROFILE_VIEWED:             { Icon: UserIcon,      bg: 'bg-purple-100', color: 'text-purple-600' },
  JOB_INVITATION:             { Icon: StarIcon,      bg: 'bg-pink-100',   color: 'text-pink-600' },
  SYSTEM:                     { Icon: InfoIcon,      bg: 'bg-gray-100',   color: 'text-gray-500' },
}

function notifIcon(type: string) {
  return TYPE_ICON[type] ?? { Icon: BellIcon, bg: 'bg-gray-100', color: 'text-gray-400' }
}

function groupByDate(items: Notification[]) {
  const groups: Record<string, Notification[]> = {}
  const now = new Date()
  for (const n of items) {
    const d = new Date(n.createdAt)
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
    const label = diffDays === 0 ? 'Hôm nay' : diffDays === 1 ? 'Hôm qua' : diffDays < 7 ? 'Tuần này' : 'Cũ hơn'
    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  }
  return groups
}

// ── Main component ────────────────────────────────────────────────────────────

export function NotificationsInbox() {
  const qc = useRouter()
  const queryClient = useQueryClient()
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery<NotifData>({
    queryKey: ['notifications-inbox', filter, page],
    queryFn: () => api.get(`/notifications?page=${page}&limit=20`),
    refetchInterval: 30_000,
  })

  const markAll = useMutation({
    mutationFn: () => api.patch('/notifications/read-all', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications-inbox'] }),
  })

  const markOne = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications-inbox'] }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications-inbox'] }),
  })

  function handleClick(n: Notification) {
    if (!n.isRead) markOne.mutate(n.id)
    if (n.link) router.push(n.link)
  }

  const allItems = data?.data ?? []
  const items = filter === 'unread' ? allItems.filter(n => !n.isRead) : allItems
  const grouped = groupByDate(items)
  const unreadCount = data?.meta.unreadCount ?? 0

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Thông báo</h1>
          {unreadCount > 0 && (
            <p className="mt-0.5 text-sm text-gray-500">{unreadCount} thông báo chưa đọc</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            {markAll.isPending
              ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" />
              : <CheckCheckIcon className="h-3.5 w-3.5" />}
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-gray-100 bg-gray-50 p-1">
        {(['all', 'unread'] as const).map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1) }}
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-semibold transition',
              filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {f === 'all' ? 'Tất cả' : `Chưa đọc${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2Icon className="h-7 w-7 animate-spin text-gray-300" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <InboxIcon className="h-12 w-12 text-gray-200" />
          <div>
            <p className="font-semibold text-gray-400">
              {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
            </p>
            <p className="mt-1 text-sm text-gray-400">Các thông báo mới sẽ xuất hiện tại đây</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([label, notifs]) => (
            <div key={label}>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                {notifs.map((n, i) => {
                  const { Icon, bg, color } = notifIcon(n.type)
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        'group flex items-start gap-4 px-5 py-4 transition hover:bg-gray-50/60',
                        i > 0 && 'border-t border-gray-50',
                        !n.isRead && 'bg-brand/[0.025]',
                      )}
                    >
                      {/* Icon */}
                      <div className={cn('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', bg)}>
                        <Icon className={cn('h-5 w-5', color)} />
                      </div>

                      {/* Content */}
                      <button
                        className="min-w-0 flex-1 text-left"
                        onClick={() => handleClick(n)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn('text-sm', n.isRead ? 'font-medium text-gray-700' : 'font-semibold text-gray-900')}>
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">{n.body}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: vi })}
                        </p>
                      </button>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {!n.isRead && (
                          <button
                            onClick={() => markOne.mutate(n.id)}
                            title="Đánh dấu đã đọc"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand"
                          >
                            <CheckCheckIcon className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => remove.mutate(n.id)}
                          title="Xóa thông báo"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2Icon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-gray-400">Trang {data.meta.page}/{data.meta.totalPages}</p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              Trước
            </button>
            <button
              disabled={page >= data.meta.totalPages}
              onClick={() => setPage(p => p + 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
