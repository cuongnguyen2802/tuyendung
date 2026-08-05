'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  SearchIcon, ChevronDownIcon, ChevronUpIcon, ChevronsUpDownIcon,
  CheckSquareIcon, SquareIcon, MinusSquareIcon,
  FileTextIcon, BriefcaseIcon, UserCheckIcon, UserXIcon, KeyRoundIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ResetPasswordModal } from '@/components/admin/ResetPasswordModal'

type SortField = 'name' | 'applications' | 'resumes' | 'status' | 'createdAt'
type SortDir   = 'asc' | 'desc'

function SortIcon({ field, sortBy, sortDir }: { field: SortField; sortBy: SortField; sortDir: SortDir }) {
  if (sortBy !== field) return <ChevronsUpDownIcon className="h-3.5 w-3.5 text-gray-300" />
  return sortDir === 'asc'
    ? <ChevronUpIcon className="h-3.5 w-3.5 text-brand" />
    : <ChevronDownIcon className="h-3.5 w-3.5 text-brand" />
}

export default function AdminCandidatesPage() {
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [status, setStatus]   = useState('')
  const [page, setPage]       = useState(1)
  const [sortBy, setSortBy]   = useState<SortField>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string } | null>(null)

  const { data, isLoading } = useQuery<any>({
    queryKey: ['admin-candidates', keyword, status, page],
    queryFn: () => {
      const p = new URLSearchParams()
      p.set('role', 'CANDIDATE')
      if (keyword) p.set('keyword', keyword)
      if (status)  p.set('isActive', status)
      p.set('page', String(page))
      p.set('limit', '20')
      return api.get(`/admin/users?${p.toString()}`)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/toggle-active`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-candidates'] }),
  })

  const rawUsers: any[] = data?.data ?? []
  const meta = data?.meta

  const users = useMemo(() => {
    return [...rawUsers].sort((a, b) => {
      const nameA = a.profile?.fullName ?? a.email
      const nameB = b.profile?.fullName ?? b.email
      let av: any, bv: any
      if (sortBy === 'name')         { av = nameA; bv = nameB }
      else if (sortBy === 'applications') { av = a._count?.applications ?? 0; bv = b._count?.applications ?? 0 }
      else if (sortBy === 'resumes') { av = a._count?.resumes ?? 0; bv = b._count?.resumes ?? 0 }
      else if (sortBy === 'status')  { av = a.isActive ? 1 : 0; bv = b.isActive ? 1 : 0 }
      else { av = new Date(a.createdAt).getTime(); bv = new Date(b.createdAt).getTime() }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [rawUsers, sortBy, sortDir])

  const handleSort = (field: SortField) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('desc') }
  }

  const allSelected   = users.length > 0 && users.every(u => selectedIds.has(u.id))
  const someSelected  = users.some(u => selectedIds.has(u.id)) && !allSelected
  const selectedCount = selectedIds.size

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(users.map(u => u.id)))
  }
  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const bulkToggle = (_active: boolean) => {
    Promise.all([...selectedIds].map(id => api.patch(`/admin/users/${id}/toggle-active`, {}))).then(() => {
      queryClient.invalidateQueries({ queryKey: ['admin-candidates'] })
      setSelectedIds(new Set())
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

  return (
    <div className="space-y-4">
      {resetTarget && (
        <ResetPasswordModal
          userId={resetTarget.id}
          userName={resetTarget.name}
          onClose={() => setResetTarget(null)}
        />
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý ứng viên</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {meta ? `${meta.total} ứng viên trong hệ thống` : 'Danh sách ứng viên đã đăng ký'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Tổng ứng viên', value: meta?.total ?? '—', color: 'bg-blue-50 text-blue-700' },
          { label: 'Đang hoạt động', value: rawUsers.filter(u => u.isActive).length, color: 'bg-emerald-50 text-emerald-700' },
          { label: 'Đã bị khóa', value: rawUsers.filter(u => !u.isActive).length, color: 'bg-red-50 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl px-4 py-3 ${s.color}`}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="mt-0.5 text-2xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-60">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1) }}
            className="input pl-9" placeholder="Tìm theo email, họ tên..." />
        </div>
        <div className="relative">
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="input pr-8 appearance-none">
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang hoạt động</option>
            <option value="false">Bị khóa</option>
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Bulk bar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-brand/20 bg-brand/5 px-4 py-2.5">
          <span className="text-sm font-medium text-brand">Đã chọn {selectedCount}</span>
          <div className="h-4 w-px bg-brand/20" />
          <button onClick={() => bulkToggle(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition">
            <UserCheckIcon className="h-3.5 w-3.5" /> Mở khóa
          </button>
          <button onClick={() => bulkToggle(false)}
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition">
            <UserXIcon className="h-3.5 w-3.5" /> Khóa
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
                <ThCol field="name">Ứng viên</ThCol>
                <ThCol field="resumes">CV</ThCol>
                <ThCol field="applications">Đơn ứng tuyển</ThCol>
                <ThCol field="status">Trạng thái</ThCol>
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
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="py-14 text-center text-gray-400">Không tìm thấy ứng viên</td></tr>
              ) : (
                users.map((user: any) => {
                  const name     = user.profile?.fullName ?? user.email
                  const isChecked = selectedIds.has(user.id)

                  return (
                    <tr key={user.id} className={cn('group relative transition', isChecked ? 'bg-brand/5' : 'hover:bg-gray-50/80')}>
                      <td className="w-10 px-4 py-3">
                        <button onClick={() => toggleOne(user.id)}
                          className={cn('flex items-center justify-center transition', isChecked ? 'text-brand' : 'text-gray-300 hover:text-brand')}>
                          {isChecked ? <CheckSquareIcon className="h-4 w-4" /> : <SquareIcon className="h-4 w-4" />}
                        </button>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.profile?.avatarUrl ? (
                            <img src={user.profile.avatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                              {name[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800">{name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                            {user.profile?.title && (
                              <p className="text-xs text-brand">{user.profile.title}</p>
                            )}
                            <div className="invisible mt-1 flex items-center gap-2 text-xs group-hover:visible">
                              <button
                                onClick={() => toggleMutation.mutate(user.id)}
                                disabled={toggleMutation.isPending}
                                className={cn('hover:underline', user.isActive ? 'text-orange-600' : 'text-brand')}
                              >
                                {user.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                              </button>
                              <span className="text-gray-200">·</span>
                              <button
                                onClick={() => setResetTarget({ id: user.id, name: user.profile?.fullName ?? user.email })}
                                className="flex items-center gap-1 text-gray-500 hover:text-orange-600 hover:underline transition"
                              >
                                <KeyRoundIcon className="h-3 w-3" /> Reset mật khẩu
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <FileTextIcon className="h-3.5 w-3.5 text-gray-400" />
                          {user._count?.resumes ?? 0}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <BriefcaseIcon className="h-3.5 w-3.5 text-gray-400" />
                          {user._count?.applications ?? 0}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          user.isActive ? 'bg-brand-100 text-brand' : 'bg-red-100 text-red-600')}>
                          {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: vi })}
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
