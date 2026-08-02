'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { UserPlan, EMPLOYER_PLAN_PRICES } from '@tuyendung/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  SearchIcon, TrendingUpIcon, UsersIcon, CrownIcon,
  ZapIcon, Loader2Icon, ChevronDownIcon, CheckIcon,
  BadgeDollarSignIcon, BarChart3Icon,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

interface RevenueChart {
  label: string
  pro: number
  premium: number
  revenue: number
}

interface Summary {
  totalEmployers: number
  proCount: number
  premiumCount: number
  freeCount: number
  mrr: number
  activeSubscriptions: number
}

interface Subscriber {
  id: string
  email: string
  plan: UserPlan
  planExpiresAt: string | null
  createdAt: string
  employer?: { companyName: string; logoUrl?: string; slug: string; verified: boolean } | null
}

interface RevenueData {
  summary: Summary
  revenueChart: RevenueChart[]
  data: Subscriber[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}tr`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

function fmtVnd(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
}

const PLAN_BADGE: Record<UserPlan, { label: string; className: string }> = {
  [UserPlan.FREE]:    { label: 'Free',    className: 'bg-gray-100 text-gray-500' },
  [UserPlan.PRO]:     { label: 'Pro',     className: 'bg-blue-50 text-blue-600 border border-blue-200' },
  [UserPlan.PREMIUM]: { label: 'Premium', className: 'bg-amber-50 text-amber-600 border border-amber-200' },
}

// ── Edit plan modal ───────────────────────────────────────────────────────────

function EditPlanModal({
  user,
  onClose,
}: {
  user: Subscriber
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [plan, setPlan]     = useState<UserPlan>(user.plan)
  const [months, setMonths] = useState(1)

  const mutation = useMutation({
    mutationFn: () => api.patch(`/admin/users/${user.id}/plan`, { plan, months }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-revenue'] }); onClose() },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-bold text-gray-900">Cập nhật gói dịch vụ</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">✕</button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <p className="mb-1 text-sm font-medium text-gray-500">Nhà tuyển dụng</p>
            <p className="font-semibold text-gray-900">{user.employer?.companyName ?? user.email}</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Gói</label>
            <div className="space-y-2">
              {Object.values(UserPlan).map(p => (
                <label
                  key={p}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition',
                    plan === p ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-gray-300',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <input type="radio" className="accent-brand" checked={plan === p} onChange={() => setPlan(p)} />
                    <span className="font-medium text-gray-800">{p}</span>
                  </div>
                  <span className="text-sm text-gray-500">{fmtVnd(EMPLOYER_PLAN_PRICES[p])}/tháng</span>
                </label>
              ))}
            </div>
          </div>
          {plan !== UserPlan.FREE && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Số tháng</label>
              <select
                value={months}
                onChange={e => setMonths(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              >
                {[1, 3, 6, 12].map(m => (
                  <option key={m} value={m}>{m} tháng — {fmtVnd(EMPLOYER_PLAN_PRICES[plan] * m)}</option>
                ))}
              </select>
            </div>
          )}
          {mutation.isError && (
            <p className="text-sm text-red-500">{(mutation.error as Error).message}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Hủy
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
            >
              {mutation.isPending ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <CheckIcon className="h-4 w-4" />}
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Revenue chart ─────────────────────────────────────────────────────────────

function RevenueBarChart({ data }: { data: RevenueChart[] }) {
  const max = Math.max(...data.map(d => d.revenue), 1)
  return (
    <div className="flex h-40 items-end gap-2">
      {data.map(d => (
        <div key={d.label} className="group relative flex flex-1 flex-col items-center gap-1">
          <div className="relative w-full flex flex-col justify-end" style={{ height: '120px' }}>
            <div
              className="w-full rounded-t-md bg-brand/70 transition-all"
              style={{ height: `${Math.max((d.revenue / max) * 100, d.revenue > 0 ? 4 : 0)}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-400">{d.label}</span>
          {/* Tooltip */}
          <div className="pointer-events-none absolute bottom-full mb-2 hidden w-max rounded-lg bg-gray-900 px-2.5 py-1.5 text-[11px] text-white shadow group-hover:block">
            <p className="font-bold">{fmtVnd(d.revenue)}</p>
            <p className="text-gray-300">Pro: {d.pro} · Premium: {d.premium}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminRevenuePage() {
  const [keyword, setKeyword] = useState('')
  const [planFilter, setPlan] = useState('')
  const [page, setPage]       = useState(1)
  const [editing, setEditing] = useState<Subscriber | null>(null)

  const { data, isLoading } = useQuery<RevenueData>({
    queryKey: ['admin-revenue', keyword, planFilter, page],
    queryFn: () => {
      const params = new URLSearchParams()
      if (keyword)    params.set('keyword', keyword)
      if (planFilter) params.set('plan', planFilter)
      params.set('page', String(page))
      params.set('limit', '20')
      return api.get(`/admin/revenue?${params}`)
    },
  })

  const summary = data?.summary
  const chart   = data?.revenueChart ?? []
  const rows    = data?.data ?? []
  const meta    = data?.meta

  const KPI_CARDS = [
    {
      label: 'Nhà tuyển dụng',
      value: summary?.totalEmployers ?? 0,
      icon: UsersIcon,
      color: 'bg-blue-50 text-blue-500',
    },
    {
      label: 'Đang dùng Pro',
      value: summary?.proCount ?? 0,
      icon: ZapIcon,
      color: 'bg-violet-50 text-violet-500',
    },
    {
      label: 'Đang dùng Premium',
      value: summary?.premiumCount ?? 0,
      icon: CrownIcon,
      color: 'bg-amber-50 text-amber-500',
    },
    {
      label: 'MRR (ước tính)',
      value: fmtVnd(summary?.mrr ?? 0),
      icon: BadgeDollarSignIcon,
      color: 'bg-emerald-50 text-emerald-500',
      wide: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Doanh thu & Gói dịch vụ</h1>
        <p className="mt-0.5 text-sm text-gray-500">Quản lý subscription và theo dõi doanh thu nhà tuyển dụng</p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPI_CARDS.map(card => (
          <div key={card.label} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5">
            <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', card.color)}>
              <card.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3Icon className="h-5 w-5 text-brand" />
          <p className="font-semibold text-gray-900">Doanh thu ước tính 6 tháng gần đây</p>
        </div>
        {chart.length > 0 ? (
          <RevenueBarChart data={chart} />
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-gray-400">Chưa có dữ liệu</div>
        )}
        <p className="mt-2 text-[11px] text-gray-400">* Dựa trên số lượng gói Pro/Premium còn hiệu lực trong tháng × đơn giá</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-56">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(1) }}
            placeholder="Tìm theo email hoặc tên công ty"
            className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div className="relative">
          <select
            value={planFilter}
            onChange={e => { setPlan(e.target.value); setPage(1) }}
            className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-4 pr-9 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-brand/30"
          >
            <option value="">Tất cả gói</option>
            <option value="FREE">Free</option>
            <option value="PRO">Pro</option>
            <option value="PREMIUM">Premium</option>
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2Icon className="h-7 w-7 animate-spin text-gray-300" />
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">Không tìm thấy kết quả</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">Công ty / Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Gói</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Hết hạn</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Giá trị</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Ngày đăng ký</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rows.map(row => {
                    const badge = PLAN_BADGE[row.plan]
                    const expired = row.planExpiresAt && new Date(row.planExpiresAt) < new Date()
                    return (
                      <tr key={row.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-900">
                            {row.employer?.companyName ?? '—'}
                          </p>
                          <p className="text-xs text-gray-400">{row.email}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', badge.className)}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {row.planExpiresAt ? (
                            <span className={cn('text-sm', expired ? 'text-red-500' : 'text-gray-700')}>
                              {format(new Date(row.planExpiresAt), 'dd/MM/yyyy')}
                              {expired && <span className="ml-1 text-xs text-red-400">(hết hạn)</span>}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-800">
                          {row.plan === UserPlan.FREE ? (
                            <span className="text-gray-400">Miễn phí</span>
                          ) : fmtVnd(EMPLOYER_PLAN_PRICES[row.plan])}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-500">
                          {format(new Date(row.createdAt), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setEditing(row)}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-brand hover:text-brand transition"
                          >
                            Đổi gói
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
                <p className="text-xs text-gray-400">
                  Trang {meta.page}/{meta.totalPages} · {meta.total} nhà tuyển dụng
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Trước
                  </button>
                  <button
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {editing && <EditPlanModal user={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
