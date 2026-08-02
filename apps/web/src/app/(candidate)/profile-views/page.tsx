'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { EyeIcon, SparklesIcon, BuildingIcon, ClockIcon } from 'lucide-react'
import { api } from '@/lib/api'
import { timeAgo } from '@/lib/utils'

interface ViewerCompany {
  companyName: string
  logoUrl?: string
  slug: string
}

interface ProfileView {
  id: string
  createdAt: string
  viewer: ViewerCompany | null
}

interface ProfileViewsResponse {
  canSeeViewers: boolean
  data: ProfileView[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

export default function ProfileViewsPage() {
  const { data, isLoading } = useQuery<ProfileViewsResponse>({
    queryKey: ['profile-views'],
    queryFn: () => api.get('/users/me/profile-views'),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Nhà tuyển dụng xem hồ sơ</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {data ? `${data.meta.total} lượt xem hồ sơ` : 'Theo dõi ai đã xem hồ sơ ứng viên của bạn'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : !data?.canSeeViewers ? (
        /* Free plan — upgrade prompt */
        <div className="space-y-4">
          {/* Blurred preview */}
          {data && data.meta.total > 0 && (
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="pointer-events-none select-none blur-sm">
                {[...Array(Math.min(3, data.meta.total))].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 border-b border-gray-100 p-4 last:border-0">
                    <div className="h-12 w-12 rounded-xl bg-gray-200" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-40 rounded bg-gray-200" />
                      <div className="h-3 w-24 rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-[2px]">
                <p className="text-sm font-semibold text-gray-700">
                  {data.meta.total} nhà tuyển dụng đã xem hồ sơ của bạn
                </p>
                <p className="text-xs text-gray-500">Nâng cấp Pro để xem danh sách</p>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <EyeIcon className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Tính năng dành cho tài khoản Pro</p>
              <p className="mt-1 text-sm text-gray-500">
                Nâng cấp lên Pro để xem tên và logo công ty đã xem hồ sơ bạn
              </p>
            </div>
            <Link
              href="/upgrade"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <SparklesIcon className="h-4 w-4" /> Nâng cấp tài khoản
            </Link>
          </div>
        </div>
      ) : data.data.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <EyeIcon className="h-8 w-8 text-gray-300" />
          </div>
          <div>
            <p className="font-semibold text-gray-600">Chưa có ai xem hồ sơ của bạn</p>
            <p className="mt-1 text-sm text-gray-400">
              Cập nhật hồ sơ đầy đủ để tăng khả năng được nhà tuyển dụng tìm thấy
            </p>
          </div>
          <Link
            href="/profile"
            className="rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90"
          >
            Cập nhật hồ sơ
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {data.data.map((view, i) => (
            <div
              key={view.id}
              className={`flex items-center gap-4 p-4 ${i < data.data.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              {/* Logo / anonymous */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                {view.viewer?.logoUrl ? (
                  <Image
                    src={view.viewer.logoUrl}
                    alt={view.viewer.companyName}
                    width={48}
                    height={48}
                    className="h-full w-full object-contain p-1"
                  />
                ) : (
                  <BuildingIcon className="h-6 w-6 text-gray-300" />
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                {view.viewer ? (
                  <>
                    <Link
                      href={`/companies/${view.viewer.slug}`}
                      className="font-semibold text-gray-900 transition hover:text-brand"
                    >
                      {view.viewer.companyName}
                    </Link>
                    <p className="mt-0.5 text-xs text-gray-400">đã xem hồ sơ của bạn</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-gray-500">Nhà tuyển dụng ẩn danh</p>
                    <p className="mt-0.5 text-xs text-gray-400">đã xem hồ sơ của bạn</p>
                  </>
                )}
              </div>

              {/* Time */}
              <div className="flex shrink-0 items-center gap-1 text-xs text-gray-400">
                <ClockIcon className="h-3.5 w-3.5" />
                {timeAgo(view.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.canSeeViewers && data.data.length > 0 && (
        <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4 text-sm text-gray-600">
          <strong className="text-brand">Mẹo:</strong> Khi NTD xem hồ sơ, hãy chủ động ứng tuyển vào các vị trí phù hợp tại công ty đó.{' '}
          <Link href="/jobs" className="font-medium text-brand hover:underline">
            Tìm việc ngay →
          </Link>
        </div>
      )}
    </div>
  )
}
