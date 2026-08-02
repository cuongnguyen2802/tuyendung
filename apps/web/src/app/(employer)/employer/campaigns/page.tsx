'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  MegaphoneIcon, PlusCircleIcon, CalendarIcon, TrashIcon,
  PencilIcon, PlayIcon, PauseIcon, CheckCircleIcon,
} from 'lucide-react'
import { toast } from 'sonner'

// ── Types ─────────────────────────────────────────────────────────────────────

type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'ENDED'

interface Campaign {
  id: string; name: string; description?: string; budget?: number
  startDate: string; endDate: string; status: CampaignStatus
  createdAt: string
}

interface CampaignResponse { data: Campaign[]; meta: { total: number } }

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CampaignStatus, { label: string; color: string; icon: React.ElementType }> = {
  ACTIVE: { label: 'Đang chạy', color: 'text-brand bg-brand-50',  icon: PlayIcon },
  PAUSED: { label: 'Tạm dừng', color: 'text-yellow-700 bg-yellow-50', icon: PauseIcon },
  ENDED:  { label: 'Kết thúc', color: 'text-gray-600 bg-gray-100',    icon: CheckCircleIcon },
}

// ── Create form ────────────────────────────────────────────────────────────────

function CreateModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    name: '', description: '', budget: '', startDate: '', endDate: '',
  })

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/campaigns', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      toast.success('Đã tạo chiến dịch')
      onClose()
    },
    onError: () => toast.error('Có lỗi xảy ra'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      name: form.name,
      description: form.description || undefined,
      budget: form.budget ? parseFloat(form.budget) : undefined,
      startDate: form.startDate,
      endDate: form.endDate,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Tạo chiến dịch mới</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Tên chiến dịch <span className="text-red-500">*</span></label>
            <input className="input" placeholder="VD: Tuyển dụng Q3/2026" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Mô tả</label>
            <textarea className="input min-h-[80px]" placeholder="Mục tiêu chiến dịch..." value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Ngày bắt đầu <span className="text-red-500">*</span></label>
              <input type="date" className="input" value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Ngày kết thúc <span className="text-red-500">*</span></label>
              <input type="date" className="input" value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="label">Ngân sách (VND)</label>
            <input type="number" className="input" placeholder="VD: 10000000" value={form.budget}
              onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Hủy</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">
              {mutation.isPending ? 'Đang tạo...' : 'Tạo chiến dịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState<CampaignStatus | 'ALL'>('ALL')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery<CampaignResponse>({
    queryKey: ['campaigns', filter],
    queryFn: () => api.get(`/campaigns${filter !== 'ALL' ? `?status=${filter}` : ''}`),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/campaigns/${id}`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Đã cập nhật') },
  })

  const deleteCampaign = useMutation({
    mutationFn: (id: string) => api.delete(`/campaigns/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Đã xóa chiến dịch') },
  })

  const campaigns = data?.data ?? []

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  function formatBudget(n?: number) {
    if (!n) return '—'
    return new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(n) + ' đ'
  }

  return (
    <div className="space-y-5">
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Chiến dịch tuyển dụng</h1>
          <p className="mt-0.5 text-sm text-gray-500">Quản lý và theo dõi hiệu quả các chiến dịch</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <PlusCircleIcon className="h-4 w-4" /> Tạo chiến dịch
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['ALL', 'ACTIVE', 'PAUSED', 'ENDED'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-medium transition',
              filter === s
                ? 'border-brand bg-brand text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
            )}
          >
            {s === 'ALL' ? 'Tất cả' : STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      {/* Campaign cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-5">
              <div className="mb-3 h-4 w-2/3 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
              <div className="mt-4 h-3 w-1/3 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="card py-16 text-center">
          <MegaphoneIcon className="mx-auto mb-4 h-12 w-12 text-gray-200" />
          <p className="font-medium text-gray-500">Chưa có chiến dịch nào</p>
          <p className="mt-1 text-sm text-gray-400">Tạo chiến dịch để quản lý tuyển dụng hiệu quả hơn</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary mx-auto mt-4">
            <PlusCircleIcon className="h-4 w-4" /> Tạo chiến dịch đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {campaigns.map(c => {
            const cfg = STATUS_CONFIG[c.status]
            const Icon = cfg.icon
            const isActive = c.status === 'ACTIVE'
            const isPaused = c.status === 'PAUSED'
            const totalDays = Math.ceil(
              (new Date(c.endDate).getTime() - new Date(c.startDate).getTime()) / 86400000
            )
            const elapsed = Math.max(0, Math.min(totalDays,
              Math.ceil((Date.now() - new Date(c.startDate).getTime()) / 86400000)
            ))
            const progress = totalDays > 0 ? (elapsed / totalDays) * 100 : 0

            return (
              <div key={c.id} className="card p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 leading-snug">{c.name}</p>
                    {c.description && (
                      <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{c.description}</p>
                    )}
                  </div>
                  <span className={cn('flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold', cfg.color)}>
                    <Icon className="h-3 w-3" />{cfg.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" />{formatDate(c.startDate)}</span>
                    <span>{formatDate(c.endDate)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', isActive ? 'bg-brand' : isPaused ? 'bg-yellow-400' : 'bg-gray-400')}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-[10px] text-gray-400">{elapsed}/{totalDays} ngày</p>
                </div>

                {/* Budget */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Ngân sách:</span>
                  <span className="font-semibold text-gray-900">{formatBudget(c.budget)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1 border-t border-gray-100">
                  {isActive && (
                    <button
                      onClick={() => updateStatus.mutate({ id: c.id, status: 'PAUSED' })}
                      className="flex items-center gap-1 rounded-lg border border-yellow-200 px-3 py-1.5 text-xs font-medium text-yellow-600 transition hover:bg-yellow-50"
                    >
                      <PauseIcon className="h-3.5 w-3.5" /> Tạm dừng
                    </button>
                  )}
                  {isPaused && (
                    <button
                      onClick={() => updateStatus.mutate({ id: c.id, status: 'ACTIVE' })}
                      className="flex items-center gap-1 rounded-lg border border-brand/30 px-3 py-1.5 text-xs font-medium text-brand transition hover:bg-brand-50"
                    >
                      <PlayIcon className="h-3.5 w-3.5" /> Tiếp tục
                    </button>
                  )}
                  {c.status !== 'ENDED' && (
                    <button
                      onClick={() => updateStatus.mutate({ id: c.id, status: 'ENDED' })}
                      className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-gray-50"
                    >
                      <CheckCircleIcon className="h-3.5 w-3.5" /> Kết thúc
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm('Xóa chiến dịch này?')) deleteCampaign.mutate(c.id)
                    }}
                    className="ml-auto flex items-center gap-1 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
