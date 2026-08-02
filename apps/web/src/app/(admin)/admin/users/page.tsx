'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  SearchIcon, UserIcon, BriefcaseIcon, ShieldIcon, ChevronDownIcon,
  ChevronUpIcon, ChevronsUpDownIcon, CheckSquareIcon, SquareIcon, MinusSquareIcon,
  KeyRoundIcon, XIcon, EyeIcon, EyeOffIcon, RefreshCwIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const ROLE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  CANDIDATE: { label: 'Ứng viên',       icon: UserIcon,      color: 'bg-blue-100 text-blue-700' },
  EMPLOYER:  { label: 'Nhà tuyển dụng', icon: BriefcaseIcon, color: 'bg-purple-100 text-purple-700' },
  ADMIN:     { label: 'Admin',           icon: ShieldIcon,    color: 'bg-red-100 text-red-700' },
}

type SortField = 'name' | 'role' | 'status' | 'createdAt'
type SortDir   = 'asc' | 'desc'

function SortIcon({ field, sortBy, sortDir }: { field: SortField; sortBy: SortField; sortDir: SortDir }) {
  if (sortBy !== field) return <ChevronsUpDownIcon className="h-3.5 w-3.5 text-gray-300" />
  return sortDir === 'asc'
    ? <ChevronUpIcon className="h-3.5 w-3.5 text-brand" />
    : <ChevronDownIcon className="h-3.5 w-3.5 text-brand" />
}

function generatePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$'
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map(b => charset[b % charset.length])
    .join('')
}

interface PasswordModal {
  userId: string
  email: string
  name: string
}

function ResetPasswordModal({ target, onClose }: { target: PasswordModal; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [showCf, setShowCf]       = useState(false)
  const [success, setSuccess]     = useState(false)

  const mutation = useMutation({
    mutationFn: (pw: string) => api.patch(`/admin/users/${target.userId}/reset-password`, { password: pw }),
    onSuccess: () => {
      setSuccess(true)
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const handleGenerate = () => {
    const pw = generatePassword()
    setPassword(pw)
    setConfirm(pw)
    setShowPw(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) return
    if (password !== confirm) return
    mutation.mutate(password)
  }

  const mismatch = confirm.length > 0 && password !== confirm

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10">
              <KeyRoundIcon className="h-4.5 w-4.5 text-brand" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Đặt lại mật khẩu</p>
              <p className="text-xs text-gray-500">{target.name} · {target.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
              <CheckSquareIcon className="h-6 w-6 text-brand" />
            </div>
            <p className="font-semibold text-gray-900">Đổi mật khẩu thành công</p>
            <p className="mt-1 text-sm text-gray-500">Mật khẩu mới đã được cập nhật cho <span className="font-medium">{target.email}</span></p>
            <button onClick={onClose}
              className="mt-5 rounded-xl bg-brand px-6 py-2 text-sm font-semibold text-white hover:bg-brand/90 transition">
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Generate button */}
            <button type="button" onClick={handleGenerate}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:border-brand hover:text-brand transition">
              <RefreshCwIcon className="h-4 w-4" />
              Tạo mật khẩu ngẫu nhiên
            </button>

            {/* New password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className={cn('input pr-10 w-full', password.length > 0 && password.length < 6 && 'border-red-400 focus:ring-red-400')}
                  required
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && password.length < 6 && (
                <p className="mt-1 text-xs text-red-500">Mật khẩu phải có ít nhất 6 ký tự</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
              <div className="relative">
                <input
                  type={showCf ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className={cn('input pr-10 w-full', mismatch && 'border-red-400 focus:ring-red-400')}
                  required
                />
                <button type="button" onClick={() => setShowCf(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCf ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {mismatch && <p className="mt-1 text-xs text-red-500">Mật khẩu không khớp</p>}
            </div>

            {mutation.isError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {(mutation.error as any)?.message ?? 'Đã có lỗi xảy ra'}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                Hủy
              </button>
              <button
                type="submit"
                disabled={mutation.isPending || password.length < 6 || mismatch}
                className="flex-1 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-50 transition">
                {mutation.isPending ? 'Đang lưu...' : 'Xác nhận'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [keyword, setKeyword]         = useState('')
  const [role, setRole]               = useState('')
  const [page, setPage]               = useState(1)
  const [sortBy, setSortBy]           = useState<SortField>('createdAt')
  const [sortDir, setSortDir]         = useState<SortDir>('desc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pwModal, setPwModal]         = useState<PasswordModal | null>(null)

  const { data, isLoading } = useQuery<any>({
    queryKey: ['admin-users', keyword, role, page],
    queryFn: () => {
      const p = new URLSearchParams()
      if (keyword) p.set('keyword', keyword)
      if (role)    p.set('role', role)
      p.set('page', String(page))
      p.set('limit', '20')
      return api.get(`/admin/users?${p.toString()}`)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/toggle-active`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-users'] }); setSelectedIds(new Set()) },
  })

  const rawUsers: any[] = data?.data ?? []
  const meta = data?.meta

  const users = useMemo(() => {
    return [...rawUsers].sort((a, b) => {
      const nameA = a.profile?.fullName ?? a.employer?.companyName ?? a.email
      const nameB = b.profile?.fullName ?? b.employer?.companyName ?? b.email
      let av: any, bv: any
      if (sortBy === 'name')        { av = nameA; bv = nameB }
      else if (sortBy === 'role')   { av = a.role; bv = b.role }
      else if (sortBy === 'status') { av = a.isActive ? 1 : 0; bv = b.isActive ? 1 : 0 }
      else                          { av = new Date(a.createdAt).getTime(); bv = new Date(b.createdAt).getTime() }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [rawUsers, sortBy, sortDir])

  const handleSort = (field: SortField) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('desc') }
  }

  const allSelected  = users.length > 0 && users.every(u => selectedIds.has(u.id))
  const someSelected = users.some(u => selectedIds.has(u.id)) && !allSelected
  const selectedCount = selectedIds.size

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(users.filter(u => u.role !== 'ADMIN').map(u => u.id)))
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

  const bulkDelete = () => {
    if (!confirm(`Xóa ${selectedCount} tài khoản đã chọn?`)) return
    Promise.all([...selectedIds].map(id => api.delete(`/admin/users/${id}`))).then(() => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setSelectedIds(new Set())
    })
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-60">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1) }}
            className="input pl-9" placeholder="Tìm theo email, họ tên..." />
        </div>
        <div className="relative">
          <select value={role} onChange={e => { setRole(e.target.value); setPage(1) }}
            className="input pr-8 appearance-none">
            <option value="">Tất cả vai trò</option>
            <option value="CANDIDATE">Ứng viên</option>
            <option value="EMPLOYER">Nhà tuyển dụng</option>
            <option value="ADMIN">Admin</option>
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Bulk bar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-brand/20 bg-brand/5 px-4 py-2.5">
          <span className="text-sm font-medium text-brand">Đã chọn {selectedCount}</span>
          <div className="h-4 w-px bg-brand/20" />
          <button onClick={bulkDelete}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition">
            Xóa đã chọn
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
                <ThCol field="name">Người dùng</ThCol>
                <ThCol field="role">Vai trò</ThCol>
                <ThCol field="status">Trạng thái</ThCol>
                <ThCol field="createdAt">Ngày tham gia</ThCol>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i}>{[...Array(5)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-gray-100 animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="py-14 text-center text-gray-400">Không tìm thấy người dùng</td></tr>
              ) : (
                users.map((user: any) => {
                  const roleInfo = ROLE_LABELS[user.role] ?? ROLE_LABELS.CANDIDATE
                  const RoleIcon = roleInfo.icon
                  const isAdmin  = user.role === 'ADMIN'
                  const name     = user.profile?.fullName ?? user.employer?.companyName ?? user.email
                  const isChecked = selectedIds.has(user.id)

                  return (
                    <tr key={user.id} className={cn('group relative transition', isChecked ? 'bg-brand/5' : 'hover:bg-gray-50/80')}>
                      {/* Checkbox */}
                      <td className="w-10 px-4 py-3">
                        <button
                          onClick={() => !isAdmin && toggleOne(user.id)}
                          disabled={isAdmin}
                          className={cn('flex items-center justify-center transition', isAdmin ? 'opacity-20 cursor-not-allowed' : isChecked ? 'text-brand' : 'text-gray-300 hover:text-brand')}>
                          {isChecked ? <CheckSquareIcon className="h-4 w-4" /> : <SquareIcon className="h-4 w-4" />}
                        </button>
                      </td>

                      {/* User info + row actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.profile?.avatarUrl || user.employer?.logoUrl ? (
                            <img src={user.profile?.avatarUrl ?? user.employer?.logoUrl} alt=""
                              className="h-8 w-8 shrink-0 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-400">
                              {name[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800">{name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>

                            {/* Row actions */}
                            <div className="invisible mt-1 flex items-center text-xs group-hover:visible">
                              {!isAdmin ? (
                                <>
                                  <button
                                    onClick={() => toggleMutation.mutate(user.id)}
                                    disabled={toggleMutation.isPending}
                                    className={cn('hover:underline', user.isActive ? 'text-orange-600' : 'text-brand')}
                                  >
                                    {user.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                                  </button>
                                  <span className="mx-1.5 text-gray-300">|</span>
                                  <button
                                    onClick={() => setPwModal({ userId: user.id, email: user.email, name })}
                                    className="text-brand hover:underline">
                                    Đổi mật khẩu
                                  </button>
                                  <span className="mx-1.5 text-gray-300">|</span>
                                  <button
                                    onClick={() => { if (confirm(`Xóa "${user.email}"?`)) deleteMutation.mutate(user.id) }}
                                    className="text-red-600 hover:underline">Xóa</button>
                                </>
                              ) : (
                                <span className="text-gray-300 italic">Không thể chỉnh sửa Admin</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold', roleInfo.color)}>
                          <RoleIcon className="h-3 w-3" />
                          {roleInfo.label}
                        </span>
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
            <p className="text-sm text-gray-500">{meta.total} người dùng · trang {page}/{meta.totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40 hover:border-brand hover:text-brand transition">← Trước</button>
              <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40 hover:border-brand hover:text-brand transition">Sau →</button>
            </div>
          </div>
        )}
      </div>

      {/* Reset password modal */}
      {pwModal && <ResetPasswordModal target={pwModal} onClose={() => setPwModal(null)} />}
    </div>
  )
}
