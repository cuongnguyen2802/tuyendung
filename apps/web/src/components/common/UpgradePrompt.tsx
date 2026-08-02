'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { SparklesIcon, XIcon, ZapIcon, CrownIcon } from 'lucide-react'

interface Props {
  message?: string
  onClose?: () => void
}

export function UpgradePrompt({ message, onClose }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
        <SparklesIcon className="h-7 w-7 text-amber-500" />
      </div>
      <div>
        <p className="font-semibold text-gray-800">
          {message ?? 'Tính năng này dành cho tài khoản nâng cấp'}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Nâng cấp lên Pro hoặc Premium để mở khóa toàn bộ quyền lợi
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/upgrade"
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <ZapIcon className="h-4 w-4" /> Xem gói Pro
        </Link>
        <Link
          href="/upgrade"
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <CrownIcon className="h-4 w-4" /> Xem gói Premium
        </Link>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">
          Để sau
        </button>
      )}
    </div>
  )
}

// Toast-style upgrade prompt — show when API returns 403
export function UpgradeToast({
  message,
  visible,
  onClose,
}: {
  message: string
  visible: boolean
  onClose: () => void
}) {
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(onClose, 6000)
    return () => clearTimeout(t)
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-amber-200 bg-white p-4 shadow-xl animate-in slide-in-from-bottom-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
        <SparklesIcon className="h-5 w-5 text-amber-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-800">{message}</p>
        <Link
          href="/upgrade"
          className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:underline"
        >
          Nâng cấp ngay →
        </Link>
      </div>
      <button onClick={onClose} className="shrink-0 text-gray-400 hover:text-gray-600">
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  )
}
