'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  CheckCircleIcon, TrashIcon,
  SearchIcon, ChevronDownIcon, ChevronUpIcon, ChevronsUpDownIcon,
  CheckSquareIcon, SquareIcon, MinusSquareIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT:            { label: 'Nháp',          color: 'bg-gray-100 text-gray-600' },
  PENDING_APPROVAL: { label: 'Chờ duyệt',     color: 'bg-amber-100 text-amber-700' },
  PUBLISHED:        { label: 'Đang hiển thị', color: 'bg-brand-100 text-brand' },
  CLOSED:           { label: 'Đã đóng',       color: 'bg-gray-100 text-gray-500' },
  REJECTED:         { label: 'Từ chối',       color: 'bg-red-100 text-red-600' },
  EXPIRED:          { label: 'Hết hạn',       color: 'bg-orange-100 text-orange-600' },
}

type SortField = 'title' | 'status' | 'applications' | 'createdAt'
type SortDir   = 'asc' | 'desc'

function SortIcon({ field, sortBy, sortDir }: { field: SortField; sortBy: SortField; sortDir: SortDir }) {
  if (sortBy !== field) return <ChevronsUpDownIcon className="h-3.5 w-3.5 text-gray-300" />
  return sortDir === 'asc'
    ? <ChevronUpIcon className="h-3.5 w-3.5 text-brand" />
    : <ChevronDownIcon className="h-3.5 w-3.5 text-brand" />
}

export default function AdminJobsPage() {
  const queryClient = useQueryClient()

  // Filters
  const [keyword, setKeyword] = useState('')
  const [status, setStatus]   = useState('')
  const [page, setPage]       = useState(1)

  // Sort (client-side on current page)
  const [sortBy, setSortBy]   = useState<SortField>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Reject modal
  const [rejectModal, setRejectModal]   = useState<{ jobId: string; title: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading, isError, error } = useQuery<any>({
    queryKey: ['admin-jobs', keyword, status, page],
    queryFn: () => {
      const p = new URLSearchParams()
      if (keyword) p.set('keyword', keyword)
      if (status)  p.set('status', status)
      p.set('page', String(page))
      p.set('limit', '15')
      return api.get(`/admin/jobs?${p.toString()}`)
    },
    retry: 1,
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/jobs/${id}/approve`, {}),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['admin-jobs'] }),
  })
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/admin/jobs/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
      setRejectModal(null)
      setRejectReason('')
    },
  })
  const closeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/jobs/${id}/close`, {}),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['admin-jobs'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/jobs/${id}`),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
      setSelectedIds(new Set())
    },
  })

  const rawJobs: any[] = data?.data ?? []
  const meta = data?.meta

  // Client-side sort
  const jobs = useMemo(() => {
    return [...rawJobs].sort((a, b) => {
      let av: any, bv: any
      if (sortBy === 'title')        { av = a.title; bv = b.title }
      else if (sortBy === 'status')  { av = a.status; bv = b.status }
      else if (sortBy === 'applications') { av = a._count?.applications ?? 0; bv = b._count?.applications ?? 0 }
      else                           { av = new Date(a.createdAt).getTime(); bv = new Date(b.createdAt).getTime() }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [rawJobs, sortBy, sortDir])

  const handleSort = (field: SortField) => {
    if (sortBy === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(field); setSortDir('desc') }
  }

  // Selection helpers
  const allSelected   = jobs.length > 0 && jobs.every(j => selectedIds.has(j.id))
  const someSelected  = jobs.some(j => selectedIds.has(j.id)) && !allSelected
  const selectedCount = selectedIds.size

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(jobs.map(j => j.id)))
  }
  const toggleOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const bulkDelete = () => {
    if (!confirm(`Xóa ${selectedCount} tin tuyển dụng đã chọn?`)) return
    Promise.all([...selectedIds].map(id => api.delete(`/admin/jobs/${id}`))).then(() => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
      setSelectedIds(new Set())
    })
  }
  const bulkApprove = () => {
    Promise.all([...selectedIds]
      .filter(id => jobs.find(j => j.id === id)?.status === 'PENDING_APPROVAL')
      .map(id => api.patch(`/admin/jobs/${id}/approve`, {}))
    ).then(() => {
      queryClient.invalidateQueries({ queryKey: ['admin-jobs'] })
      setSelectedIds(new Set())
    })
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <p className="text-red-500 font-medium text-lg">Không thể tải dữ liệu</p>
        <p className="text-sm text-gray-400">{(error as Error)?.message}</p>
      </div>
    )
  }

  const ThCol = ({
    field, children, className,
  }: { field: SortField; children: React.ReactNode; className?: string }) => (
    <th
      onClick={() => handleSort(field)}
      className={cn(
        'cursor-pointer select-none px-4 py-3 text-left text-sm font-medium text-gray-600 transition hover:text-gray-900',
        className,
      )}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        <SortIcon field={field} sortBy={sortBy} sortDir={sortDir} />
      </span>
    </th>
  )

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Quản lý tin tuyển dụng</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-60">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(1) }}
            className="input pl-9"
            placeholder="Tìm theo tiêu đề, công ty..."
          />
        </div>
        <div className="relative">
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="input pr-8 appearance-none"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-brand/20 bg-brand/5 px-4 py-2.5">
          <span className="text-sm font-medium text-brand">
            Đã chọn {selectedCount} tin
          </span>
          <div className="h-4 w-px bg-brand/20" />
          {jobs.some(j => selectedIds.has(j.id) && j.status === 'PENDING_APPROVAL') && (
            <button
              onClick={bulkApprove}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 transition"
            >
              <CheckCircleIcon className="h-3.5 w-3.5" />
              Duyệt đã chọn
            </button>
          )}
          <button
            onClick={bulkDelete}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
          >
            <TrashIcon className="h-3.5 w-3.5" />
            Xóa đã chọn
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto text-xs text-gray-500 hover:text-gray-700 transition"
          >
            Bỏ chọn tất cả
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {/* Checkbox all */}
                <th className="w-10 px-4 py-3">
                  <button onClick={toggleAll} className="flex items-center justify-center text-gray-400 hover:text-brand transition">
                    {allSelected
                      ? <CheckSquareIcon className="h-4.5 w-4.5 text-brand" />
                      : someSelected
                        ? <MinusSquareIcon className="h-4.5 w-4.5 text-brand" />
                        : <SquareIcon className="h-4.5 w-4.5" />
                    }
                  </button>
                </th>
                <ThCol field="title">Tin tuyển dụng</ThCol>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Công ty</th>
                <ThCol field="status">Trạng thái</ThCol>
                <ThCol field="applications">Đơn ứng tuyển</ThCol>
                <ThCol field="createdAt">Ngày tạo</ThCol>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded bg-gray-100 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-gray-400">
                    Không có tin tuyển dụng nào
                  </td>
                </tr>
              ) : (
                jobs.map((job: any) => {
                  const s         = STATUS_LABELS[job.status] ?? { label: job.status, color: 'bg-gray-100 text-gray-600' }
                  const isChecked = selectedIds.has(job.id)

                  return (
                    <tr
                      key={job.id}
                      className={cn(
                        'group relative transition',
                        isChecked ? 'bg-brand/5' : 'hover:bg-gray-50/80',
                      )}
                    >
                      {/* Checkbox */}
                      <td className="w-10 px-4 py-3">
                        <button
                          onClick={() => toggleOne(job.id)}
                          className={cn(
                            'flex items-center justify-center transition',
                            isChecked ? 'text-brand' : 'text-gray-300 hover:text-brand',
                          )}
                        >
                          {isChecked
                            ? <CheckSquareIcon className="h-4.5 w-4.5" />
                            : <SquareIcon className="h-4.5 w-4.5" />}
                        </button>
                      </td>

                      {/* Title + inline row actions */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800 line-clamp-1">{job.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{job.city} · {job.jobType}</p>

                        {/* WordPress-style row actions */}
                        <div className="invisible mt-1.5 flex flex-wrap items-center gap-x-0 text-xs group-hover:visible">
                          <a href={`/jobs/${job.slug}`} target="_blank" rel="noopener noreferrer"
                            className="text-brand hover:underline">Xem</a>

                          {job.status === 'PENDING_APPROVAL' && (
                            <>
                              <span className="mx-1.5 text-gray-300">|</span>
                              <button onClick={() => approveMutation.mutate(job.id)} disabled={approveMutation.isPending}
                                className="text-brand hover:underline">Duyệt</button>
                              <span className="mx-1.5 text-gray-300">|</span>
                              <button onClick={() => setRejectModal({ jobId: job.id, title: job.title })}
                                className="text-orange-600 hover:underline">Từ chối</button>
                            </>
                          )}

                          {job.status === 'PUBLISHED' && (
                            <>
                              <span className="mx-1.5 text-gray-300">|</span>
                              <button onClick={() => closeMutation.mutate(job.id)}
                                className="text-gray-600 hover:underline">Đóng tin</button>
                            </>
                          )}

                          <span className="mx-1.5 text-gray-300">|</span>
                          <button
                            onClick={() => { if (confirm(`Xóa "${job.title}"?`)) deleteMutation.mutate(job.id) }}
                            className="text-red-600 hover:underline">Xóa</button>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {job.employer?.logoUrl ? (
                            <img src={job.employer.logoUrl} alt="" className="h-7 w-7 rounded-lg object-cover" />
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-400">
                              {job.employer?.companyName?.[0]}
                            </div>
                          )}
                          <span className="text-gray-700 line-clamp-1">{job.employer?.companyName}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', s.color)}>
                          {s.label}
                        </span>
                      </td>

                      {/* Applications */}
                      <td className="px-4 py-3 text-gray-600 tabular-nums">
                        {job._count?.applications ?? 0}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: vi })}
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-sm text-gray-500">
              {meta.total} tin · trang {page}/{meta.totalPages}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40 hover:border-brand hover:text-brand transition"
              >
                ← Trước
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page === meta.totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40 hover:border-brand hover:text-brand transition"
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-1 text-lg font-semibold text-gray-900">Từ chối tin tuyển dụng</h3>
            <p className="mb-4 text-sm text-gray-500">"{rejectModal.title}"</p>
            <label className="label">Lý do từ chối (tùy chọn)</label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              className="input mb-4 resize-none"
              placeholder="Ví dụ: Tin không đầy đủ thông tin..."
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason('') }} className="btn-outline">
                Hủy
              </button>
              <button
                onClick={() => rejectMutation.mutate({ id: rejectModal.jobId, reason: rejectReason })}
                disabled={rejectMutation.isPending}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                {rejectMutation.isPending ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
