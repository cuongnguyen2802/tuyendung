'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  ShieldCheckIcon, PlusIcon, PencilIcon, Trash2Icon,
  CrownIcon, UserIcon, MailIcon, XIcon, CheckIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────────────────────

type MemberRole   = 'OWNER' | 'ADMIN' | 'RECRUITER'
type MemberStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE'

interface Member {
  id: string
  email: string
  fullName?: string | null
  role: MemberRole
  status: MemberStatus
  invitedAt: string
  joinedAt?: string | null
  note?: string | null
}

// ─── Config ──────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<MemberRole, { label: string; description: string; className: string; dot: string }> = {
  OWNER:     { label: 'Chủ sở hữu',   description: 'Toàn quyền, không thể xóa',            className: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-500' },
  ADMIN:     { label: 'Quản trị viên', description: 'Quản lý tin đăng, hồ sơ, cài đặt',      className: 'bg-brand/10 text-brand border-brand/30',        dot: 'bg-brand' },
  RECRUITER: { label: 'Tuyển dụng viên', description: 'Xem và xử lý hồ sơ ứng tuyển',       className: 'bg-blue-50 text-blue-700 border-blue-200',      dot: 'bg-blue-500' },
}

const STATUS_CONFIG: Record<MemberStatus, { label: string; className: string }> = {
  PENDING:  { label: 'Chờ xác nhận', className: 'bg-gray-100 text-gray-500' },
  ACTIVE:   { label: 'Hoạt động',    className: 'bg-green-100 text-green-700' },
  INACTIVE: { label: 'Vô hiệu hóa', className: 'bg-red-100 text-red-600' },
}

function getInitial(name?: string | null, email?: string) {
  return (name ?? email ?? '?')[0].toUpperCase()
}

const AVATAR_BG = ['bg-blue-500','bg-violet-500','bg-green-500','bg-rose-500','bg-orange-500','bg-teal-500']
function avatarColor(id: string) {
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % AVATAR_BG.length
  return AVATAR_BG[h]
}

// ─── Add / Edit Modal ────────────────────────────────────────────────────────

interface ModalProps {
  mode: 'add' | 'edit'
  initial?: Partial<Member>
  onClose: () => void
  onSave: (data: { email?: string; fullName?: string; role: string; note?: string }) => void
  loading?: boolean
}

function MemberModal({ mode, initial, onClose, onSave, loading }: ModalProps) {
  const [email, setEmail]       = useState(initial?.email ?? '')
  const [fullName, setFullName] = useState(initial?.fullName ?? '')
  const [role, setRole]         = useState<'ADMIN' | 'RECRUITER'>(
    initial?.role === 'ADMIN' ? 'ADMIN' : 'RECRUITER',
  )
  const [note, setNote]         = useState(initial?.note ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ email: mode === 'add' ? email : undefined, fullName, role, note })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-bold text-gray-900">
            {mode === 'add' ? 'Thêm quản trị viên' : 'Sửa thông tin'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Email (chỉ khi add) */}
          {mode === 'add' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ten@congty.vn"
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">Nhập email của người cần thêm vào hệ thống</p>
            </div>
          )}

          {/* Full name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Họ và tên <span className="text-gray-400 text-xs">(tuỳ chọn)</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full rounded-xl border border-gray-200 py-2.5 px-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
            <div className="grid grid-cols-2 gap-2">
              {(['ADMIN', 'RECRUITER'] as const).map(r => {
                const cfg = ROLE_CONFIG[r]
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      'relative rounded-xl border-2 p-3 text-left transition',
                      role === r
                        ? 'border-brand bg-brand/5'
                        : 'border-gray-200 hover:border-gray-300',
                    )}
                  >
                    {role === r && (
                      <CheckIcon className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-brand" />
                    )}
                    <p className="text-sm font-semibold text-gray-800">{cfg.label}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{cfg.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ghi chú <span className="text-gray-400 text-xs">(tuỳ chọn)</span>
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ví dụ: phụ trách tuyển dụng khu vực miền Nam..."
              className="w-full resize-none rounded-xl border border-gray-200 py-2 px-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-60 transition"
            >
              {loading ? 'Đang lưu...' : mode === 'add' ? 'Thêm thành viên' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ member, onConfirm, onCancel, loading }: {
  member: Member; onConfirm: () => void; onCancel: () => void; loading?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
          <Trash2Icon className="h-5 w-5 text-red-600" />
        </div>
        <h3 className="text-base font-bold text-gray-900">Xóa quản trị viên?</h3>
        <p className="mt-1.5 text-sm text-gray-500">
          Bạn có chắc muốn xóa <strong>{member.fullName ?? member.email}</strong> khỏi danh sách quản trị viên? Hành động này không thể hoàn tác.
        </p>
        <div className="mt-5 flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Giữ lại
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition"
          >
            {loading ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd]     = useState(false)
  const [editTarget, setEditTarget] = useState<Member | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null)

  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ['employer-members'],
    queryFn: () => api.get('/employers/me/members'),
  })

  const addMutation = useMutation({
    mutationFn: (dto: { email: string; fullName?: string; role: string; note?: string }) =>
      api.post('/employers/me/members', dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employer-members'] }); setShowAdd(false) },
  })

  const editMutation = useMutation({
    mutationFn: ({ id, ...dto }: { id: string; role?: string; fullName?: string; note?: string }) =>
      api.patch(`/employers/me/members/${id}`, dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employer-members'] }); setEditTarget(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/employers/me/members/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employer-members'] }); setDeleteTarget(null) },
  })

  const totalActive = members.filter(m => m.status === 'ACTIVE').length

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý quản trị viên</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Thêm, sửa hoặc xóa tài khoản quản trị viên của công ty
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand/90 transition"
        >
          <PlusIcon className="h-4 w-4" />
          Thêm quản trị viên
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tổng thành viên',      value: members.length,                                   color: 'text-gray-900' },
          { label: 'Đang hoạt động',        value: totalActive,                                      color: 'text-green-600' },
          { label: 'Chờ xác nhận',          value: members.filter(m => m.status === 'PENDING').length, color: 'text-amber-600' },
        ].map(c => (
          <div key={c.label} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm text-center">
            <p className={cn('text-2xl font-bold', c.color)}>{isLoading ? '—' : c.value}</p>
            <p className="mt-0.5 text-xs text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Role legend */}
      <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-gray-400">Phân quyền theo vai trò</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {(['OWNER', 'ADMIN', 'RECRUITER'] as MemberRole[]).map(r => {
            const cfg = ROLE_CONFIG[r]
            return (
              <div key={r} className="flex items-start gap-2.5 rounded-xl bg-white border border-gray-100 p-3">
                <div className={cn('mt-0.5 h-2 w-2 shrink-0 rounded-full', cfg.dot)} />
                <div>
                  <p className="text-xs font-semibold text-gray-800">{cfg.label}</p>
                  <p className="text-xs text-gray-500">{cfg.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Member list */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3.5 flex items-center gap-2">
          <ShieldCheckIcon className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-700">Danh sách tài khoản</h2>
          <span className="ml-auto text-xs text-gray-400">{members.length} thành viên</span>
        </div>

        {isLoading ? (
          <div className="space-y-0 divide-y divide-gray-50">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <UserIcon className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">Chưa có quản trị viên nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {members.map(member => {
              const roleCfg   = ROLE_CONFIG[member.role]
              const statusCfg = STATUS_CONFIG[member.status]
              const isOwner   = member.id === '__owner__'
              const color     = avatarColor(member.id)

              return (
                <div key={member.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition">
                  {/* Avatar */}
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold', color)}>
                    {getInitial(member.fullName, member.email)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">
                        {member.fullName ?? member.email}
                      </p>
                      <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold', roleCfg.className)}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', roleCfg.dot)} />
                        {roleCfg.label}
                      </span>
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusCfg.className)}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {member.fullName ? member.email + ' · ' : ''}
                      Tham gia {new Date(member.joinedAt ?? member.invitedAt).toLocaleDateString('vi-VN', { dateStyle: 'long' })}
                    </p>
                    {member.note && (
                      <p className="text-xs text-gray-400 mt-0.5 italic">{member.note}</p>
                    )}
                  </div>

                  {/* Actions — không cho chỉnh sửa owner */}
                  {!isOwner && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setEditTarget(member)}
                        title="Sửa"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-brand hover:text-brand transition"
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(member)}
                        title="Xóa"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-500 transition"
                      >
                        <Trash2Icon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {isOwner && (
                    <div className="shrink-0">
                      <CrownIcon className="h-4 w-4 text-amber-400" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAdd && (
        <MemberModal
          mode="add"
          onClose={() => setShowAdd(false)}
          onSave={dto => addMutation.mutate(dto as any)}
          loading={addMutation.isPending}
        />
      )}
      {editTarget && (
        <MemberModal
          mode="edit"
          initial={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={dto => editMutation.mutate({ id: editTarget.id, ...dto })}
          loading={editMutation.isPending}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          member={deleteTarget}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
