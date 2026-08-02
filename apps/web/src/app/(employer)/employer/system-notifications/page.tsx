'use client'

import { useState } from 'react'
import { BellIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SYSTEM_NOTIFICATIONS, NEW_SYSTEM_NOTIFICATIONS } from '@/lib/system-notifications'
import { useSystemNotifStore } from '@/store/systemNotifStore'

export default function SystemNotificationsPage() {
  const [openId, setOpenId] = useState<number | null>(null)
  const { markRead, isRead, unreadCount } = useSystemNotifStore()

  function handleOpen(id: number) {
    const isOpening = openId !== id
    setOpenId(isOpening ? id : null)
    if (isOpening) markRead(id)
  }

  const remaining = unreadCount()

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Thông báo từ hệ thống</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Thông báo, chính sách và cập nhật từ nền tảng
        </p>
      </div>

      {/* Notification list */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {SYSTEM_NOTIFICATIONS.map((notif, idx) => {
          const isOpen   = openId === notif.id
          const showNew  = notif.isNew && !isRead(notif.id)
          return (
            <div key={notif.id} className={cn(idx > 0 && 'border-t border-gray-100')}>
              <button
                onClick={() => handleOpen(notif.id)}
                className={cn(
                  'flex w-full flex-col gap-1.5 px-5 py-4 text-left transition hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4',
                  isOpen && 'bg-gray-50',
                )}
              >
                {/* Category + date row (stacks on mobile) */}
                <span className="flex items-center gap-2 sm:contents">
                  <span className="shrink-0 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">
                    {notif.category}
                  </span>
                  <span className="shrink-0 text-xs text-gray-400 tabular-nums sm:text-sm">
                    {notif.date}
                  </span>
                </span>

                {/* Title */}
                <span className={cn('flex-1 text-sm text-gray-800', isOpen && 'font-semibold')}>
                  {notif.title}
                </span>

                {/* New badge — hides after read */}
                {showNew && (
                  <span className="self-start shrink-0 rounded-md bg-brand px-2 py-0.5 text-[11px] font-bold text-white sm:self-auto">
                    Mới
                  </span>
                )}
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BellIcon className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Nội dung thông báo
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700">{notif.content}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-gray-400">
        Hiển thị {SYSTEM_NOTIFICATIONS.length} thông báo
        {remaining > 0 && ` • ${remaining} thông báo chưa đọc`}
      </p>
    </div>
  )
}
