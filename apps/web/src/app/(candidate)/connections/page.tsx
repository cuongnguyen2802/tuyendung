'use client'

import Link from 'next/link'
import { UsersIcon, SparklesIcon } from 'lucide-react'

export default function ConnectionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Nhà tuyển dụng muốn kết nối</h1>
        <p className="mt-0.5 text-sm text-gray-500">Các nhà tuyển dụng đã gửi lời mời kết nối với bạn</p>
      </div>

      <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-gray-200 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <UsersIcon className="h-8 w-8 text-gray-300" />
        </div>
        <div>
          <p className="font-semibold text-gray-600">Chưa có lời mời kết nối nào</p>
          <p className="mt-1 text-sm text-gray-400">Nâng cấp hồ sơ để nhà tuyển dụng chủ động tìm đến bạn</p>
        </div>
        <Link
          href="/upgrade"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <SparklesIcon className="h-4 w-4" /> Nâng cấp tài khoản
        </Link>
      </div>
    </div>
  )
}
