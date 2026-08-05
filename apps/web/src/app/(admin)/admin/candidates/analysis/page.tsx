'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  SearchIcon, UserCircleIcon, ChevronDownIcon,
  CheckCircleIcon, AlertCircleIcon, XCircleIcon,
  BarChart3Icon, GraduationCapIcon, ZapIcon, LockIcon, LockOpenIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

type CompletenessFilter = '' | 'complete' | 'partial' | 'none'

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-400' : score >= 20 ? 'bg-orange-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-medium text-gray-500">{score}%</span>
    </div>
  )
}

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: number; sub?: string; icon: any; color: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className={cn('rounded-xl p-2.5', color)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  )
}

export default function CandidateAnalysisPage() {
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [degree, setDegree] = useState('')
  const [completeness, setCompleteness] = useState<CompletenessFilter>('')
  const [page, setPage] = useState(1)

  const { data: stats } = useQuery<any>({
    queryKey: ['admin-candidate-stats'],
    queryFn: () => api.get('/admin/candidates/stats'),
  })

  const { data, isLoading } = useQuery<any>({
    queryKey: ['admin-candidate-analysis', keyword, degree, completeness, page],
    queryFn: () => {
      const p = new URLSearchParams()
      if (keyword) p.set('keyword', keyword)
      if (degree) p.set('degree', degree)
      if (completeness) p.set('completeness', completeness)
      p.set('page', String(page))
      p.set('limit', '20')
      return api.get(`/admin/candidates/analysis?${p.toString()}`)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (userId: string) => api.patch(`/admin/users/${userId}/toggle-active`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-candidate-analysis'] })
      queryClient.invalidateQueries({ queryKey: ['admin-candidate-stats'] })
    },
  })

  const candidates: any[] = data?.data ?? []
  const meta = data?.meta

  const degrees = useMemo(() => {
    return stats?.degreeBreakdown?.map((d: any) => d.degree).filter(Boolean) ?? []
  }, [stats])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Phân tích dữ liệu ứng viên</h1>
        <p className="mt-0.5 text-sm text-gray-500">Phân loại, xác thực và đánh giá hồ sơ ứng viên</p>
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Tổng ứng viên" value={stats.total} icon={UserCircleIcon} color="bg-blue-500" />
          <StatCard label="Có hồ sơ đầy đủ" value={stats.completeProfiles}
            sub={`${Math.round((stats.completeProfiles / Math.max(stats.total, 1)) * 100)}% tổng số`}
            icon={CheckCircleIcon} color="bg-green-500" />
          <StatCard label="Sẵn sàng tìm việc" value={stats.openToWork} icon={ZapIcon} color="bg-brand" />
          <StatCard label="Có CV đính kèm" value={stats.withResume} icon={BarChart3Icon} color="bg-purple-500" />
        </div>
      )}

      {/* Charts row */}
      {stats && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Top skills */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-gray-800">Top 10 kỹ năng phổ biến</h3>
            <div className="space-y-2.5">
              {stats.topSkills?.map((s: any, i: number) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="w-5 text-center text-xs font-bold text-gray-300">{i + 1}</span>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">{s.name}</span>
                      <span className="text-xs text-gray-400">{s.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${Math.round((s.count / (stats.topSkills[0]?.count || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Degree breakdown */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-gray-800">Phân loại theo trình độ học vấn</h3>
            <div className="space-y-2.5">
              {stats.degreeBreakdown?.map((d: any) => (
                <div key={d.degree} className="flex items-center gap-3">
                  <GraduationCapIcon className="h-3.5 w-3.5 shrink-0 text-brand" />
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">{d.degree}</span>
                      <span className="text-xs text-gray-400">{d.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-indigo-400"
                        style={{ width: `${Math.round((d.count / (stats.degreeBreakdown[0]?.count || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {stats.degreeBreakdown?.length === 0 && (
                <p className="py-4 text-center text-sm text-gray-400">Chưa có dữ liệu học vấn</p>
              )}
            </div>

            {/* Profile completeness summary */}
            <div className="mt-5 grid grid-cols-3 gap-3 border-t pt-4">
              <div className="text-center">
                <p className="text-lg font-bold text-green-600">{stats.completeProfiles}</p>
                <p className="text-xs text-gray-400">Hoàn chỉnh</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-yellow-500">{stats.hasProfile - stats.completeProfiles}</p>
                <p className="text-xs text-gray-400">Thiếu thông tin</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-500">{stats.noProfile}</p>
                <p className="text-xs text-gray-400">Chưa có hồ sơ</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-60">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1) }}
            className="input pl-9" placeholder="Tìm theo tên, email..." />
        </div>
        <div className="relative">
          <select value={completeness} onChange={e => { setCompleteness(e.target.value as CompletenessFilter); setPage(1) }}
            className="input pr-8 appearance-none">
            <option value="">Mọi mức độ xác thực</option>
            <option value="complete">Hồ sơ hoàn chỉnh</option>
            <option value="partial">Hồ sơ thiếu thông tin</option>
            <option value="none">Chưa có hồ sơ</option>
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
        {degrees.length > 0 && (
          <div className="relative">
            <select value={degree} onChange={e => { setDegree(e.target.value); setPage(1) }}
              className="input pr-8 appearance-none">
              <option value="">Mọi trình độ</option>
              {degrees.map((d: string) => <option key={d} value={d}>{d}</option>)}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Table — 4.3.5: Công cụ xác thực hồ sơ */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2.5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Công cụ xác thực hồ sơ ứng viên
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Ứng viên</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Học vấn</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Kỹ năng</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Độ hoàn thiện</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-gray-100 animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : candidates.length === 0 ? (
                <tr><td colSpan={6} className="py-14 text-center text-gray-400">Không tìm thấy ứng viên</td></tr>
              ) : (
                candidates.map((u: any) => {
                  const p = u.profile
                  const edu = p?.educations?.[0]
                  const skills = p?.skills?.map((s: any) => s.skill?.name).filter(Boolean) ?? []
                  return (
                    <tr key={u.id} className="group hover:bg-gray-50/80 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p?.avatarUrl ? (
                            <img src={p.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-400">
                              {(p?.fullName ?? u.email)?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800">{p?.fullName ?? '—'}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {edu ? (
                          <div>
                            <p className="text-xs font-medium text-gray-700">{edu.degree}</p>
                            <p className="text-xs text-gray-400">{edu.major ?? edu.school}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">Chưa nhập</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {skills.slice(0, 3).map((s: string) => (
                            <span key={s} className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium text-brand">{s}</span>
                          ))}
                          {skills.length > 3 && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-400">+{skills.length - 3}</span>
                          )}
                          {skills.length === 0 && <span className="text-xs text-gray-300">Chưa nhập</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ScoreBar score={u.completenessScore} />
                      </td>
                      <td className="px-4 py-3">
                        {u.completenessScore >= 80 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">
                            <CheckCircleIcon className="h-3 w-3" /> Đủ điều kiện
                          </span>
                        ) : u.completenessScore >= 40 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-600">
                            <AlertCircleIcon className="h-3 w-3" /> Thiếu thông tin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-500">
                            <XCircleIcon className="h-3 w-3" /> Chưa hoàn thiện
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleMutation.mutate(u.id)}
                          disabled={toggleMutation.isPending}
                          className={cn(
                            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50',
                            u.isActive
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100',
                          )}
                        >
                          {u.isActive ? (
                            <><LockIcon className="h-3 w-3" /> Khóa</>
                          ) : (
                            <><LockOpenIcon className="h-3 w-3" /> Mở khóa</>
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-sm text-gray-500">{meta.total} ứng viên · trang {page}/{meta.totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40 hover:border-brand hover:text-brand transition">← Trước</button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40 hover:border-brand hover:text-brand transition">Sau →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
