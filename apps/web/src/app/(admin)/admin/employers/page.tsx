'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  SearchIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, ChevronsUpDownIcon,
  CheckSquareIcon, SquareIcon, MinusSquareIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

type SortField = 'companyName' | 'jobs' | 'verified' | 'createdAt'
type SortDir   = 'asc' | 'desc'

function SortIcon({ field, sortBy, sortDir }: { field: SortField; sortBy: SortField; sortDir: SortDir }) {
  if (sortBy !== field) return <ChevronsUpDownIcon className="h-3.5 w-3.5 text-gray-300" />
  return sortDir === 'asc'
    ? <ChevronUpIcon className="h-3.5 w-3.5 text-brand" />
    : <ChevronDownIcon className="h-3.5 w-3.5 text-brand" />
}

export default function AdminEmployersPage() {
  const queryClient = useQueryClient()
  const [keyword, setKeyword]   = useState('')
  const [verified, setVerified] = useState('')
  const [page, setPage]         = useState(1)
  const [sortBy, setSortBy]     = useState<SortField>('createdAt')
  const [sortDir, setSortDir]   = useState<SortDir>('desc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { data, isLoading, isError, error } = useQuery<any>({
    queryKey: ['admin-employers', keyword, verified, page],
    queryFn: () => {
      const p = new URLSearchParams()
      if (keyword)      p.set('keyword', keyword)
      if (verified !== '') p.set('verified', verified)
      p.set('page', String(page))
      p.set('limit', '20')
      return api.get(`/admin/employers?${p.toString()}`)
    },
    retry: 1,
  })

  const verifyMutation = useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
      api.patch(`/admin/employers/${id}/verify`, { verified }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-employers'] }),
  })

  const rawEmployers: any[] = data?.data ?? []
  const meta = data?.meta

  const employers = useMemo(() => {
    return [...rawEmployers].sort((a, b) => {
      let av: any, bv: any
      if (sortBy === 'companyName')  { av = a.companyName; bv = b.companyName }
      else if (sortBy === 'jobs')    { av = a._count?.jobs ?? 0; bv = b._count?.jobs ?? 0 }
      else if (sortBy === 'verified'){ av = a.verified ? 1 : 0; bv = b.verified ? 1 : 0 }
      else { av = new Date(a.user?.createdAt ?? a.createdAt).getTime(); bv = new Date(b.user?.createdAt ?? b.createdAt).getTime() }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [rawEmployers, sortBy, sortDir])

  const handleSort = (field: SortField) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('desc') }
  }

  const allSelected  = employers.length > 0 && employers.every(e => selectedIds.has(e.id))
  const someSelected = employers.some(e => selectedIds.has(e.id)) && !allSelected
  const selectedCount = selectedIds.size

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(employers.map(e => e.id)))
  }
  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const ThCol = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th onClick={() => handleSort(field)}
      className="cursor-pointer select-none px-4 py-3 text-left text-sm font-medium text-gray-600 transition hover:text-gray-900">
      <span className="inline-flex items-center gap-1">
        {children}
        <SortIcon field={field} sortBy={sortBy} sortDir={sortDir} />
      </span>
    </th>
  )

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <p className="text-red-500 font-medium text-lg">Không thể tải dữ liệu</p>
        <p className="text-sm text-gray-400">{(error as Error)?.message}</p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-employers'] })}
          className="mt-2 rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand/90"
        >
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý nhà tuyển dụng</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-60">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1) }}
            className="input pl-9" placeholder="Tìm theo tên công ty, email..." />
        </div>
        <div className="relative">
          <select value={verified} onChange={e => { setVerified(e.target.value); setPage(1) }}
            className="input pr-8 appearance-none">
            <option value="">Tất cả</option>
            <option value="false">Chưa xác minh</option>
            <option value="true">Đã xác minh</option>
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Bulk bar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-brand/20 bg-brand/5 px-4 py-2.5">
          <span className="text-sm font-medium text-brand">Đã chọn {selectedCount}</span>
          <div className="h-4 w-px bg-brand/20" />
          <button
            onClick={() => {
              Promise.all([...selectedIds]
                .filter(id => !employers.find(e => e.id === id)?.verified)
                .map(id => api.patch(`/admin/employers/${id}/verify`, { verified: true }))
              ).then(() => { queryClient.invalidateQueries({ queryKey: ['admin-employers'] }); setSelectedIds(new Set()) })
            }}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 transition"
          >
            <CheckCircleIcon className="h-3.5 w-3.5" /> Xác minh đã chọn
          </button>
          <button onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-xs text-gray-500 hover:text-gray-700 transition">
            Bỏ chọn tất cả
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="w-10 px-4 py-3">
                  <button onClick={toggleAll} className="flex items-center justify-center text-gray-400 hover:text-brand transition">
                    {allSelected ? <CheckSquareIcon className="h-4 w-4 text-brand" />
                      : someSelected ? <MinusSquareIcon className="h-4 w-4 text-brand" />
                      : <SquareIcon className="h-4 w-4" />}
                  </button>
                </th>
                <ThCol field="companyName">Công ty</ThCol>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ngành nghề</th>
                <ThCol field="verified">Xác minh</ThCol>
                <ThCol field="jobs">Tin đăng</ThCol>
                <ThCol field="createdAt">Ngày tham gia</ThCol>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-gray-100 animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : employers.length === 0 ? (
                <tr><td colSpan={6} className="py-14 text-center text-gray-400">Không tìm thấy nhà tuyển dụng</td></tr>
              ) : (
                employers.map((emp: any) => {
                  const isChecked = selectedIds.has(emp.id)
                  return (
                    <tr key={emp.id} className={cn('group relative transition', isChecked ? 'bg-brand/5' : 'hover:bg-gray-50/80')}>
                      <td className="w-10 px-4 py-3">
                        <button onClick={() => toggleOne(emp.id)}
                          className={cn('flex items-center justify-center transition', isChecked ? 'text-brand' : 'text-gray-300 hover:text-brand')}>
                          {isChecked ? <CheckSquareIcon className="h-4 w-4" /> : <SquareIcon className="h-4 w-4" />}
                        </button>
                      </td>

                      {/* Company + row actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {emp.logoUrl ? (
                            <img src={emp.logoUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-400">
                              {emp.companyName?.[0]}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800">{emp.companyName}</p>
                            <p className="text-xs text-gray-400">{emp.user?.email}</p>

                            {/* Row actions */}
                            <div className="invisible mt-1 flex items-center text-xs group-hover:visible">
                              <a href={`/companies/${emp.slug}`} target="_blank" rel="noopener noreferrer"
                                className="text-brand hover:underline">Xem trang</a>
                              <span className="mx-1.5 text-gray-300">|</span>
                              {emp.verified ? (
                                <button onClick={() => verifyMutation.mutate({ id: emp.id, verified: false })}
                                  className="text-orange-600 hover:underline">Hủy xác minh</button>
                              ) : (
                                <button onClick={() => verifyMutation.mutate({ id: emp.id, verified: true })}
                                  className="text-brand hover:underline">Xác minh</button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-500 text-xs">{emp.industry ?? '—'}</td>

                      <td className="px-4 py-3">
                        {emp.verified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand">
                            <CheckCircleIcon className="h-3 w-3" /> Đã xác minh
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">Chưa xác minh</span>
                        )}
                      </td>

                      <td className="px-4 py-3 tabular-nums text-gray-600">{emp._count?.jobs ?? 0}</td>

                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(emp.user?.createdAt ?? emp.createdAt), { addSuffix: true, locale: vi })}
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
            <p className="text-sm text-gray-500">{meta.total} nhà tuyển dụng · trang {page}/{meta.totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40 hover:border-brand hover:text-brand transition">← Trước</button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40 hover:border-brand hover:text-brand transition">Sau →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
