'use client'

import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { resolveMediaUrl } from '@/lib/media'
import {
  Building2Icon, MapPinIcon, BriefcaseIcon, BadgeCheckIcon,
  HeartIcon, ExternalLinkIcon, SearchIcon,
} from 'lucide-react'

interface FollowedCompany {
  followedAt: string
  employer: {
    id: string
    companyName: string
    slug: string
    logoUrl?: string
    city?: string
    industry?: string
    verified: boolean
    activeJobCount: number
  }
}

const INDUSTRY_LABELS: Record<string, string> = {
  technology: 'Công nghệ thông tin',
  finance: 'Tài chính - Ngân hàng',
  healthcare: 'Y tế',
  education: 'Giáo dục',
  retail: 'Bán lẻ',
  manufacturing: 'Sản xuất',
  construction: 'Xây dựng',
  consulting: 'Tư vấn',
  media: 'Truyền thông',
  logistics: 'Vận tải - Logistics',
}

export default function FollowedCompaniesPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery<{ data: FollowedCompany[]; meta: { total: number } }>({
    queryKey: ['followed-companies'],
    queryFn: () => api.get('/users/me/followed-companies?limit=50'),
  })

  const unfollowMutation = useMutation({
    mutationFn: (employerId: string) => api.post(`/users/me/follow-companies/${employerId}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['followed-companies'] }),
  })

  const companies = data?.data ?? []

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Doanh nghiệp theo dõi</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Theo dõi công ty để cập nhật tin tuyển dụng mới nhất
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Building2Icon className="h-8 w-8 text-gray-300" />
          </div>
          <div>
            <p className="font-semibold text-gray-600">Chưa theo dõi công ty nào</p>
            <p className="mt-1 text-sm text-gray-400">
              Hãy theo dõi các công ty bạn quan tâm để không bỏ lỡ tin tuyển dụng mới
            </p>
          </div>
          <Link
            href="/companies"
            className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90"
          >
            <SearchIcon className="h-4 w-4" /> Khám phá công ty
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            Đang theo dõi <strong className="text-gray-900">{companies.length}</strong> công ty
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {companies.map(({ employer, followedAt }) => (
              <div
                key={employer.id}
                className="card group flex flex-col gap-4 p-5 transition-shadow hover:shadow-md"
              >
                {/* top row: logo + name */}
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white flex items-center justify-center">
                    {employer.logoUrl ? (
                      <img
                        src={resolveMediaUrl(employer.logoUrl) ?? ''}
                        alt={employer.companyName}
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <Building2Icon className="h-6 w-6 text-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <Link
                        href={`/companies/${employer.slug}`}
                        className="font-semibold text-gray-900 hover:text-brand leading-tight"
                      >
                        {employer.companyName}
                      </Link>
                      {employer.verified && (
                        <BadgeCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-400">
                      {employer.city && (
                        <span className="flex items-center gap-1">
                          <MapPinIcon className="h-3 w-3" /> {employer.city}
                        </span>
                      )}
                      {employer.industry && (
                        <span>{INDUSTRY_LABELS[employer.industry] ?? employer.industry}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* active jobs badge */}
                <div className="flex items-center justify-between">
                  <Link
                    href={`/companies/${employer.slug}`}
                    className={
                      employer.activeJobCount > 0
                        ? 'flex items-center gap-1.5 rounded-lg bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand/20 transition'
                        : 'flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-xs text-gray-400'
                    }
                  >
                    <BriefcaseIcon className="h-3.5 w-3.5" />
                    {employer.activeJobCount > 0
                      ? `${employer.activeJobCount} việc đang tuyển`
                      : 'Không có tin mới'}
                  </Link>

                  <p className="text-[10px] text-gray-300">
                    Theo dõi từ {new Date(followedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                </div>

                {/* actions */}
                <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                  <Link
                    href={`/companies/${employer.slug}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
                  >
                    <ExternalLinkIcon className="h-3.5 w-3.5" /> Xem trang công ty
                  </Link>
                  <button
                    onClick={() => unfollowMutation.mutate(employer.id)}
                    disabled={unfollowMutation.isPending}
                    className="flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-100 transition disabled:opacity-50"
                  >
                    <HeartIcon className="h-3.5 w-3.5 fill-red-400 text-red-400" />
                    Bỏ theo dõi
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
