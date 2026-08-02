'use client'

import { useState, useEffect, useRef } from 'react'
import { BellIcon, MessageSquareIcon, MegaphoneIcon } from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { NEW_SYSTEM_NOTIFICATIONS } from '@/lib/system-notifications'
import { useSystemNotifStore } from '@/store/systemNotifStore'

interface Notification {
  id: string
  type: string
  title: string
  body: string
  link?: string
  isRead: boolean
  createdAt: string
}

export function NotificationsBell({
  messageCount = 0,
  messagesHref = '/employer/messages',
  showSystemNotifs = false,
  notifInboxHref = '/notifications',
}: {
  messageCount?: number
  messagesHref?: string
  showSystemNotifs?: boolean
  notifInboxHref?: string
}) {
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { unreadCount: sysUnreadCount, markRead: markSysRead, isRead: isSysRead } = useSystemNotifStore()
  const [storeMounted, setStoreMounted] = useState(false)
  useEffect(() => { setStoreMounted(true) }, [])
  const systemCount = showSystemNotifs && storeMounted ? sysUnreadCount() : 0
  const totalBadge = unreadCount + messageCount + systemCount

  useEffect(() => {
    fetchUnreadCount()
    // Poll every 90s, but skip when tab is hidden to avoid wasted requests
    const interval = setInterval(() => {
      if (!document.hidden) fetchUnreadCount()
    }, 90_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchUnreadCount() {
    try {
      const res = await api.get('/notifications/unread-count')
      setUnreadCount((res as any).count ?? 0)
    } catch {}
  }

  async function fetchNotifications() {
    setLoading(true)
    try {
      const res = await api.get('/notifications?limit=10')
      setNotifications((res as any).data ?? [])
      setUnreadCount((res as any).meta?.unreadCount ?? 0)
    } catch {}
    setLoading(false)
  }

  async function handleOpen() {
    setOpen(!open)
    if (!open) await fetchNotifications()
  }

  async function markAllRead() {
    try {
      await api.patch('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch {}
  }

  async function markRead(id: string) {
    try {
      await api.patch(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch {}
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 transition"
        aria-label="Thông báo"
      >
        <BellIcon className="h-5 w-5" />
        {totalBadge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold text-white">
            {totalBadge > 99 ? '99+' : totalBadge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-gray-100 bg-white shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="font-semibold text-gray-800">Thông báo</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand hover:underline">
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {/* System notifications — only show unread ones */}
            {showSystemNotifs && NEW_SYSTEM_NOTIFICATIONS.filter(sn => !isSysRead(sn.id)).map(sn => (
              <Link
                key={sn.id}
                href="/employer/system-notifications"
                onClick={() => { markSysRead(sn.id); setOpen(false) }}
                className="flex items-start gap-3 border-b border-gray-100 bg-amber-50 px-4 py-3 transition hover:bg-amber-100"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white">
                  <MegaphoneIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-amber-700 mb-0.5">Thông báo hệ thống</p>
                  <p className="text-sm text-gray-800 line-clamp-2">{sn.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sn.date}</p>
                </div>
                <span className="shrink-0 rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                  Mới
                </span>
              </Link>
            ))}

            {/* Unread messages shortcut */}
            {messageCount > 0 && (
              <Link
                href={messagesHref}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 border-b border-gray-100 bg-blue-50 px-4 py-3 transition hover:bg-blue-100"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                  <MessageSquareIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {messageCount} tin nhắn chưa đọc
                  </p>
                  <p className="text-xs text-gray-500">Nhấn để xem</p>
                </div>
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white">
                  {messageCount > 99 ? '99+' : messageCount}
                </span>
              </Link>
            )}

            {loading ? (
              <div className="py-8 text-center text-sm text-gray-400">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">Không có thông báo</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) markRead(n.id)
                    if (n.link) window.location.href = n.link
                    setOpen(false)
                  }}
                  className={cn(
                    'flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-50',
                    !n.isRead && 'bg-brand-50',
                  )}
                >
                  <div className={cn('mt-1 h-2 w-2 rounded-full shrink-0', !n.isRead ? 'bg-brand' : 'bg-transparent')} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: vi })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-100 px-4 py-2 text-center">
            <a href={notifInboxHref} className="text-xs text-brand hover:underline">
              Xem tất cả thông báo
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
