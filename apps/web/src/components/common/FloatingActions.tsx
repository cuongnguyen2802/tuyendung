'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  HeartIcon, UserPlusIcon, MessageCircleIcon, HeadphonesIcon,
  XIcon, SendIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingItem {
  id: string
  label: string
  icon: string
  href: string
  visible: boolean
  showBadge: boolean
}

const ICON_MAP: Record<string, React.ElementType> = {
  heart: HeartIcon,
  'user-plus': UserPlusIcon,
  'message-circle': MessageCircleIcon,
  headset: HeadphonesIcon,
}

/* ── Feedback modal ─────────────────────────────────── */
function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState('')
  const [sent, setSent] = useState(false)

  const submit = () => {
    if (!text.trim()) return
    setSent(true)
    setTimeout(onClose, 1800)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-end p-4 sm:items-center sm:justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Góp ý cho chúng tôi</h2>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {sent ? (
          <div className="py-6 text-center">
            <div className="mb-2 text-4xl">🎉</div>
            <p className="font-semibold text-brand">Cảm ơn bạn đã góp ý!</p>
          </div>
        ) : (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Chia sẻ ý kiến, báo lỗi hoặc đề xuất tính năng..."
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-brand"
            />
            <button
              onClick={submit}
              disabled={!text.trim()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:opacity-40"
            >
              <SendIcon className="h-4 w-4" />
              Gửi góp ý
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Support chat panel ─────────────────────────────── */
function SupportPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-end p-4 sm:items-center sm:justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Hỗ trợ khách hàng</h2>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          <a
            href="tel:19001234"
            className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 transition hover:border-brand hover:text-brand"
          >
            <HeadphonesIcon className="h-5 w-5 shrink-0 text-brand" />
            <div>
              <p className="font-semibold">Hotline</p>
              <p className="text-xs text-gray-400">1900 1234 — T2–T6, 8:00–18:00</p>
            </div>
          </a>
          <a
            href="mailto:support@tuyendung.vn"
            className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 transition hover:border-brand hover:text-brand"
          >
            <MessageCircleIcon className="h-5 w-5 shrink-0 text-brand" />
            <div>
              <p className="font-semibold">Email hỗ trợ</p>
              <p className="text-xs text-gray-400">support@tuyendung.vn</p>
            </div>
          </a>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          Thời gian phản hồi trung bình: <strong className="text-gray-600">dưới 2 giờ</strong>
        </p>
      </div>
    </div>
  )
}

/* ── Main FloatingActions ───────────────────────────── */
export function FloatingActions({ initialItems = [] }: { initialItems?: FloatingItem[] }) {
  const [modal, setModal] = useState<'feedback' | 'support' | null>(null)
  const [savedCount] = useState(0)

  const visibleItems = initialItems.filter((i) => i.visible)

  if (visibleItems.length === 0) return null

  const handleClick = (item: FloatingItem) => {
    if (item.id === 'feedback') { setModal('feedback'); return }
    if (item.id === 'support') { setModal('support'); return }
  }

  return (
    <>
      <div className="fixed right-4 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-2">
        {visibleItems.map((item) => {
          const Icon = ICON_MAP[item.icon] ?? MessageCircleIcon
          const isInteractive = item.id === 'feedback' || item.id === 'support'
          const isLink = !isInteractive && item.href

          const inner = (
            <div className="relative flex flex-col items-center">
              <div className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition',
                'text-brand hover:bg-brand hover:text-white hover:shadow-lg',
              )}>
                <Icon className="h-5 w-5" />
                {item.showBadge && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                    {savedCount}
                  </span>
                )}
              </div>
              {item.label && (
                <span className="mt-1 text-[10px] font-semibold text-white drop-shadow">
                  {item.label}
                </span>
              )}
            </div>
          )

          if (isLink) {
            return (
              <Link key={item.id} href={item.href} className="group flex flex-col items-center">
                {inner}
              </Link>
            )
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item)}
              className="group flex flex-col items-center"
            >
              {inner}
            </button>
          )
        })}
      </div>

      {modal === 'feedback' && <FeedbackModal onClose={() => setModal(null)} />}
      {modal === 'support' && <SupportPanel onClose={() => setModal(null)} />}
    </>
  )
}
