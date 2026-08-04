'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  SearchIcon, RotateCcwIcon, MapPinIcon, MailIcon, MessageSquareIcon,
  UserIcon, BriefcaseIcon, LockIcon, ChevronLeftIcon, ChevronRightIcon,
  BadgeCheckIcon, DollarSignIcon, ZapIcon,
} from 'lucide-react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { EMPLOYER_PLAN_LIMITS } from '@tuyendung/types'

interface Skill { id: string; name: string }
interface Candidate {
  id: string
  email: string
  profile?: {
    fullName?: string
    avatarUrl?: string
    title?: string
    city?: string
    summary?: string
    openToWork?: boolean
    expectedSalaryMin?: number
    expectedSalaryMax?: number
    skills?: { skill: Skill }[]
  }
  resumes?: { id: string; title: string }[]
}

interface PlanInfo {
  plan: string
  limits: typeof EMPLOYER_PLAN_LIMITS['FREE']
}

const AVATAR_COLORS = [
  'bg-rose-500', 'bg-amber-500', 'bg-emerald-600', 'bg-blue-600',
  'bg-violet-600', 'bg-pink-500', 'bg-teal-600', 'bg-indigo-600',
]
function avatarColor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
function initials(name?: string, email?: string) {
  const src = name || email || '?'
  return src.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
function fmtSalary(min?: number, max?: number) {
  if (!min && !max) return null
  const f = (n: number) => (n >= 1_000_000 ? `${n / 1_000_000}tr` : `${n / 1000}k`)
  if (min && max) return `${f(min)} – ${f(max)}`
  if (min) return `Từ ${f(min)}`
  return `Đến ${f(max!)}`
}

export default function TalentSearchPage() {
  const [keyword, setKeyword]     = useState('')
  const [city, setCity]           = useState('')
  const [openToWork, setOpenToWork] = useState(false)
  const [page, setPage]           = useState(1)

  const params = new URLSearchParams({ page: String(page), limit: '20' })
  if (keyword)    params.set('keyword', keyword)
  if (city)       params.set('city', city)
  if (openToWork) params.set('openToWork', 'true')

  const { data, isLoading } = useQuery<{ data: Candidate[]; meta: any }>({
    queryKey: ['talent-search', keyword, city, openToWork, page],
    queryFn: () => api.get(`/candidates?${params}`),
  })

  const { data: planInfo } = useQuery<PlanInfo>({
    queryKey: ['employer-plan'],
    queryFn: () => api.get('/employers/me/plan'),
    staleTime: 5 * 60_000,
  })

  const canViewContact = planInfo?.limits?.canViewContactInfo ?? false
  const candidates = data?.data ?? []
  const meta = data?.meta

  function handleReset() {
    setKeyword(''); setCity(''); setOpenToWork(false); setPage(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Tìm kiếm ứng viên</h1>
        {meta && (
          <span className="text-sm text-gray-500">
            <span className="font-bold text-brand">{meta.total}</span> ứng viên trong hệ thống
          </span>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3.5">
        <div className="relative min-w-[240px] flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(1) }}
            placeholder="Tìm theo tên, vị trí, kỹ năng..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 transition"
          />
        </div>

        <div className="relative">
          <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            value={city}
            onChange={e => { setCity(e.target.value); setPage(1) }}
            placeholder="Thành phố..."
            className="w-36 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20 transition"
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:border-gray-300 transition select-none">
          <input
            type="checkbox"
            checked={openToWork}
            onChange={e => { setOpenToWork(e.target.checked); setPage(1) }}
            className="accent-brand"
          />
          Đang tìm việc
        </label>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition"
        >
          <RotateCcwIcon className="h-3.5 w-3.5" />
          Đặt lại
        </button>
      </div>

      {/* ── Contact-info gate banner ── */}
      {!canViewContact && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <LockIcon className="h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-sm text-gray-700">
            Gói <strong>Cơ bản</strong> không hiển thị email & SĐT ứng viên.{' '}
            <Link href="/employer/upgrade" className="font-semibold text-brand hover:underline">
              Nâng cấp lên Pro
            </Link>{' '}
            để xem thông tin liên hệ và liên lạc trực tiếp.
          </p>
        </div>
      )}

      {/* ── Grid ── */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 shrink-0 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="h-3 w-24 rounded bg-gray-200" />
                  <div className="h-3 w-20 rounded bg-gray-200" />
                </div>
              </div>
              <div className="mt-3 flex gap-1.5">
                <div className="h-5 w-16 rounded-full bg-gray-100" />
                <div className="h-5 w-20 rounded-full bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="py-20 text-center">
          <UserIcon className="mx-auto h-10 w-10 text-gray-200" />
          <p className="mt-3 text-sm text-gray-400">Không tìm thấy ứng viên phù hợp</p>
          {(keyword || city || openToWork) && (
            <button onClick={handleReset} className="mt-2 text-sm text-brand hover:underline">
              Xoá bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {candidates.map(c => (
            <CandidateCard
              key={c.id}
              candidate={c}
              canViewContact={canViewContact}
              canInitiateMessage={planInfo?.plan !== 'FREE'}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:border-gray-300 disabled:opacity-40"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Trước
          </button>

          {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
            .filter(p => p === 1 || p === meta.totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | '...')[]>((acc, p, i, arr) => {
              if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '...' ? (
                <span key={`e${i}`} className="px-1 text-sm text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p as number)}
                  className={cn(
                    'h-9 min-w-[36px] rounded-lg border px-2 text-sm font-medium transition',
                    page === p
                      ? 'border-brand bg-brand text-white'
                      : 'border-gray-200 text-gray-700 hover:border-brand hover:text-brand',
                  )}
                >
                  {p}
                </button>
              ),
            )}

          <button
            onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
            disabled={page === meta.totalPages}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:border-gray-300 disabled:opacity-40"
          >
            Sau
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}

function CandidateCard({
  candidate: c,
  canViewContact,
  canInitiateMessage,
}: {
  candidate: Candidate
  canViewContact: boolean
  canInitiateMessage: boolean
}) {
  const p = c.profile
  const name = p?.fullName || c.email.split('@')[0]
  const skills = p?.skills?.map(s => s.skill) ?? []
  const salary = fmtSalary(p?.expectedSalaryMin, p?.expectedSalaryMax)
  const color = avatarColor(c.id)
  const inits = initials(p?.fullName, c.email)

  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-brand/30 hover:shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3">
        {p?.avatarUrl ? (
          <img src={p.avatarUrl} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" />
        ) : (
          <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold text-white', color)}>
            {inits}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-bold text-gray-900">{name}</p>
            {p?.openToWork && (
              <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                Tìm việc
              </span>
            )}
          </div>

          {p?.title && (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
              <BriefcaseIcon className="h-3 w-3 shrink-0" />
              <span className="truncate">{p.title}</span>
            </div>
          )}

          {p?.city && (
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <MapPinIcon className="h-3 w-3 shrink-0" />
              <span>{p.city}</span>
            </div>
          )}
        </div>
      </div>

      {/* Contact info */}
      <div className="mt-3 space-y-1">
        {canViewContact ? (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <MailIcon className="h-3 w-3 shrink-0 text-gray-400" />
            <span className="truncate">{c.email}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <LockIcon className="h-3 w-3 shrink-0" />
            <span className="select-none blur-[3px]">email@hidden.com</span>
          </div>
        )}
      </div>

      {/* Salary */}
      {salary && (
        <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-brand">
          <DollarSignIcon className="h-3 w-3 shrink-0" />
          <span>Mức lương mong muốn: {salary}</span>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skills.slice(0, 5).map(s => (
            <span key={s.id} className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-600">
              {s.name}
            </span>
          ))}
          {skills.length > 5 && (
            <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[11px] text-gray-400">
              +{skills.length - 5}
            </span>
          )}
        </div>
      )}

      {/* CV count */}
      {(c.resumes?.length ?? 0) > 0 && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
          <BadgeCheckIcon className="h-3.5 w-3.5 text-brand" />
          <span>{c.resumes!.length} CV online</span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
        {canInitiateMessage ? (
          <Link
            href={`/employer/messages?to=${c.id}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand py-2 text-xs font-semibold text-brand hover:bg-brand/5 transition"
          >
            <MessageSquareIcon className="h-3.5 w-3.5" />
            Nhắn tin
          </Link>
        ) : (
          <Link
            href="/employer/upgrade"
            title="Nâng cấp lên Pro để nhắn tin trực tiếp với ứng viên"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition"
          >
            <ZapIcon className="h-3.5 w-3.5" />
            Nâng cấp
          </Link>
        )}
        <Link
          href={`/employer/candidates/${c.id}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand py-2 text-xs font-semibold text-white hover:bg-brand/90 transition"
        >
          <UserIcon className="h-3.5 w-3.5" />
          Xem hồ sơ
        </Link>
      </div>
    </div>
  )
}
