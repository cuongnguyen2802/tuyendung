'use client'

import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  Trash2Icon, SearchIcon, LayoutGridIcon, ListIcon,
  CopyIcon, CheckIcon, ImageIcon, Loader2Icon, UploadCloudIcon,
  CheckSquareIcon, SquareIcon, XIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import DropZone from '@/components/common/DropZone'

interface MediaItem {
  id: string; filename: string; url: string
  mimeType: string; size: number; folder: string; createdAt: string
}

interface Stats { total: number; images: number; totalSize: number }

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} title="Sao chép URL"
      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-500 transition hover:bg-gray-100">
      {copied ? <CheckIcon className="h-3.5 w-3.5 text-brand" /> : <CopyIcon className="h-3.5 w-3.5" />}
      {copied ? 'Đã copy' : 'Copy URL'}
    </button>
  )
}

export default function AdminMediaPage() {
  const queryClient = useQueryClient()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [keyword, setKeyword] = useState('')
  const [typeFilter, setTypeFilter] = useState<'' | 'image' | 'document'>('')
  const [page, setPage] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [preview, setPreview] = useState<MediaItem | null>(null)

  // Bulk select
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)

  const { data: statsData } = useQuery<any>({
    queryKey: ['media-stats'],
    queryFn: () => api.get('/media/stats'),
  })
  const stats: Stats = statsData ?? { total: 0, images: 0, totalSize: 0 }

  const { data, isLoading } = useQuery<any>({
    queryKey: ['admin-media', page, typeFilter],
    queryFn: () => {
      const p = new URLSearchParams({ page: String(page), limit: '48' })
      if (typeFilter) p.set('type', typeFilter)
      return api.get(`/media?${p}`)
    },
  })

  const items: MediaItem[] = data?.data ?? []
  const meta = data?.meta
  const filtered = keyword ? items.filter((i) => i.filename.toLowerCase().includes(keyword.toLowerCase())) : items

  const toggleSelectMode = () => {
    setSelectMode((v) => !v)
    setSelectedIds(new Set())
    setPreview(null)
  }

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => setSelectedIds(new Set(filtered.map((i) => i.id)))
  const clearSelection = () => setSelectedIds(new Set())

  const allSelected = filtered.length > 0 && filtered.every((i) => selectedIds.has(i.id))

  const handleUpload = useCallback(async (files: File[]) => {
    setUploading(true)
    setUploadError('')
    setUploadSuccess(0)
    try {
      const formData = new FormData()
      files.forEach((f) => formData.append('files', f))
      const result: any = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const count = Array.isArray(result) ? result.length : 1
      setUploadSuccess(count)
      queryClient.invalidateQueries({ queryKey: ['admin-media'] })
      queryClient.invalidateQueries({ queryKey: ['media-stats'] })
      setTimeout(() => setUploadSuccess(0), 3000)
    } catch (err: any) {
      setUploadError(err.message ?? 'Upload thất bại')
    } finally {
      setUploading(false)
    }
  }, [queryClient])

  const handleDelete = async () => {
    if (!deletingId) return
    setDeleting(true)
    try {
      await api.delete(`/media/${deletingId}`)
      if (preview?.id === deletingId) setPreview(null)
      queryClient.invalidateQueries({ queryKey: ['admin-media'] })
      queryClient.invalidateQueries({ queryKey: ['media-stats'] })
    } finally {
      setDeleting(false)
      setDeletingId(null)
    }
  }

  const handleBulkDelete = async () => {
    setBulkDeleting(true)
    try {
      await Promise.allSettled(Array.from(selectedIds).map((id) => api.delete(`/media/${id}`)))
      if (preview && selectedIds.has(preview.id)) setPreview(null)
      setSelectedIds(new Set())
      setSelectMode(false)
      queryClient.invalidateQueries({ queryKey: ['admin-media'] })
      queryClient.invalidateQueries({ queryKey: ['media-stats'] })
    } finally {
      setBulkDeleting(false)
      setConfirmBulkDelete(false)
    }
  }

  const handleItemClick = (item: MediaItem) => {
    if (selectMode) {
      toggleItem(item.id)
    } else {
      setPreview(item)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thư viện media</h1>
          <p className="mt-0.5 text-sm text-gray-400">
            {stats.total} file · {stats.images} ảnh · {formatSize(stats.totalSize)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
        {/* Main content */}
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Type filter */}
            <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
              {([
                { value: '', label: 'Tất cả' },
                { value: 'image', label: 'Ảnh' },
                { value: 'document', label: 'Tài liệu' },
              ] as const).map((t) => (
                <button key={t.value} onClick={() => { setTypeFilter(t.value); setPage(1) }}
                  className={cn('rounded-lg px-4 py-1.5 text-sm font-medium transition',
                    typeFilter === t.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo tên file..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand" />
            </div>

            {/* Select mode button */}
            <button
              onClick={toggleSelectMode}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition',
                selectMode
                  ? 'border-brand bg-brand/5 text-brand'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
              )}
            >
              <CheckSquareIcon className="h-4 w-4" />
              Chọn nhiều
            </button>

            {/* View toggle */}
            <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
              <button onClick={() => setView('grid')}
                className={cn('rounded-lg p-1.5 transition', view === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600')}>
                <LayoutGridIcon className="h-4 w-4" />
              </button>
              <button onClick={() => setView('list')}
                className={cn('rounded-lg p-1.5 transition', view === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600')}>
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Bulk action bar */}
          {selectMode && (
            <div className="flex items-center justify-between rounded-xl border border-brand/30 bg-brand/5 px-4 py-2.5">
              <div className="flex items-center gap-3">
                {/* Select all checkbox */}
                <button
                  onClick={allSelected ? clearSelection : selectAll}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  {allSelected
                    ? <CheckSquareIcon className="h-4 w-4 text-brand" />
                    : <SquareIcon className="h-4 w-4 text-gray-400" />}
                  Chọn tất cả
                </button>
                <span className="text-sm text-gray-500">
                  {selectedIds.size > 0 ? (
                    <span className="font-semibold text-brand">{selectedIds.size} file đã chọn</span>
                  ) : 'Chưa chọn file nào'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedIds.size > 0 && (
                  <>
                    <button
                      onClick={clearSelection}
                      className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-gray-500 transition hover:bg-white"
                    >
                      <XIcon className="h-3.5 w-3.5" /> Bỏ chọn
                    </button>
                    <button
                      onClick={() => setConfirmBulkDelete(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700"
                    >
                      <Trash2Icon className="h-4 w-4" />
                      Xóa {selectedIds.size} file
                    </button>
                  </>
                )}
                <button onClick={toggleSelectMode} className="rounded-lg p-1.5 text-gray-400 hover:bg-white transition">
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Upload feedback */}
          {uploadError && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{uploadError}</div>
          )}
          {uploadSuccess > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand">
              <CheckIcon className="h-4 w-4" /> Đã tải lên {uploadSuccess} file thành công
            </div>
          )}

          {/* Grid / List view */}
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2Icon className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <ImageIcon className="mb-3 h-14 w-14 text-gray-200" />
              <p className="text-sm text-gray-400">Chưa có file nào</p>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
              {filtered.map((item) => {
                const isImg = item.mimeType.startsWith('image/')
                const isSelected = selectedIds.has(item.id)
                return (
                  <div key={item.id} className="group relative">
                    <button
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        'relative w-full overflow-hidden rounded-xl border-2 bg-gray-50 transition',
                        selectMode && isSelected
                          ? 'border-brand shadow-md'
                          : selectMode
                          ? 'border-gray-200 hover:border-brand/50'
                          : 'border-transparent hover:border-brand/40 hover:shadow-md',
                      )}
                    >
                      {isImg ? (
                        <img src={item.url} alt={item.filename} className="aspect-square w-full object-cover" />
                      ) : (
                        <div className="flex aspect-square w-full items-center justify-center">
                          <span className="text-3xl">📄</span>
                        </div>
                      )}

                      {/* Selection overlay */}
                      {selectMode && (
                        <div className={cn(
                          'absolute inset-0 flex items-center justify-center transition',
                          isSelected ? 'bg-brand/20' : 'bg-transparent group-hover:bg-black/10',
                        )}>
                          <span className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full border-2 transition',
                            isSelected
                              ? 'border-brand bg-brand'
                              : 'border-white bg-white/70',
                          )}>
                            {isSelected && <CheckIcon className="h-3.5 w-3.5 text-white" />}
                          </span>
                        </div>
                      )}
                    </button>

                    {/* Single delete button (not in select mode) */}
                    {!selectMode && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeletingId(item.id) }}
                        className="absolute right-1.5 top-1.5 hidden rounded-lg bg-white/90 p-1 text-red-500 shadow-sm hover:bg-red-50 group-hover:flex"
                      >
                        <Trash2Icon className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <p className="mt-1 truncate text-[10px] text-gray-500">{item.filename}</p>
                    <p className="truncate text-[10px] text-gray-300">{formatSize(item.size)}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    {selectMode && (
                      <th className="w-10 px-4 py-3">
                        <button onClick={allSelected ? clearSelection : selectAll}>
                          {allSelected
                            ? <CheckSquareIcon className="h-4 w-4 text-brand" />
                            : <SquareIcon className="h-4 w-4 text-gray-400" />}
                        </button>
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">File</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Loại</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Kích thước</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Ngày tải</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((item) => {
                    const isImg = item.mimeType.startsWith('image/')
                    const isSelected = selectedIds.has(item.id)
                    return (
                      <tr
                        key={item.id}
                        onClick={() => selectMode && toggleItem(item.id)}
                        className={cn(
                          'group transition',
                          selectMode ? 'cursor-pointer' : '',
                          isSelected ? 'bg-brand/5' : 'hover:bg-gray-50/60',
                        )}
                      >
                        {selectMode && (
                          <td className="px-4 py-3">
                            <span className={cn(
                              'flex h-4 w-4 items-center justify-center rounded border',
                              isSelected ? 'border-brand bg-brand' : 'border-gray-300',
                            )}>
                              {isSelected && <CheckIcon className="h-3 w-3 text-white" />}
                            </span>
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {isImg ? (
                              <img src={item.url} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover border border-gray-100" />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xl">📄</div>
                            )}
                            <span className="font-medium text-gray-800 truncate max-w-48">{item.filename}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{item.mimeType}</td>
                        <td className="px-4 py-3 text-right text-xs text-gray-500 tabular-nums">{formatSize(item.size)}</td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: vi })}
                        </td>
                        <td className="px-4 py-3">
                          {!selectMode && (
                            <div className="invisible flex items-center justify-end gap-1 group-hover:visible">
                              <CopyUrlButton url={item.url} />
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeletingId(item.id) }}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition">
                                <Trash2Icon className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{meta.total} file · trang {page}/{meta.totalPages}</p>
              <div className="flex gap-1">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40 hover:border-brand hover:text-brand transition">
                  ← Trước
                </button>
                <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40 hover:border-brand hover:text-brand transition">
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Upload + Preview */}
        <div className="space-y-4">
          {/* Upload zone */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <UploadCloudIcon className="h-4 w-4 text-brand" /> Tải lên
            </h3>
            <DropZone
              onFiles={handleUpload}
              accept="image/*,application/pdf,video/*"
              multiple
              uploading={uploading}
              compact
            />
            <p className="mt-2 text-xs text-gray-400 text-center">
              JPG, PNG, GIF, WebP, PDF, MP4 · Tối đa 10 MB
            </p>
          </div>

          {/* Preview panel */}
          {!selectMode && preview && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Chi tiết</h3>
                <button onClick={() => setPreview(null)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
              </div>
              {preview.mimeType.startsWith('image/') && (
                <div className="mb-3 overflow-hidden rounded-lg border border-gray-100">
                  <img src={preview.url} alt={preview.filename} className="w-full object-contain max-h-48" />
                </div>
              )}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tên file</span>
                  <span className="font-medium text-gray-700 text-right max-w-36 truncate">{preview.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Loại</span>
                  <span className="font-medium text-gray-700">{preview.mimeType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Kích thước</span>
                  <span className="font-medium text-gray-700">{formatSize(preview.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ngày tải</span>
                  <span className="font-medium text-gray-700">
                    {formatDistanceToNow(new Date(preview.createdAt), { addSuffix: true, locale: vi })}
                  </span>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <input
                  readOnly value={preview.url}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 outline-none"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <div className="flex gap-2">
                  <CopyUrlButton url={preview.url} />
                  <button
                    onClick={() => setDeletingId(preview.id)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs text-red-500 transition hover:bg-red-50"
                  >
                    <Trash2Icon className="h-3.5 w-3.5" /> Xóa
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Selection summary in select mode */}
          {selectMode && selectedIds.size > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="mb-3 text-sm font-semibold text-red-800">
                Đã chọn {selectedIds.size} file
              </p>
              <button
                onClick={() => setConfirmBulkDelete(true)}
                className="w-full rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <span className="flex items-center justify-center gap-2">
                  <Trash2Icon className="h-4 w-4" />
                  Xóa {selectedIds.size} file đã chọn
                </span>
              </button>
              <button
                onClick={clearSelection}
                className="mt-2 w-full rounded-xl border border-red-200 py-2 text-sm text-red-600 transition hover:bg-red-100"
              >
                Bỏ chọn tất cả
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Single delete confirm */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900">Xóa file này?</h3>
            <p className="mt-1.5 text-sm text-gray-500">File sẽ bị xóa vĩnh viễn và không thể khôi phục.</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setDeletingId(null)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                Hủy
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50">
                {deleting ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk delete confirm */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2Icon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              Xóa {selectedIds.size} file?
            </h3>
            <p className="mt-1.5 text-sm text-gray-500">
              Tất cả {selectedIds.size} file đã chọn sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setConfirmBulkDelete(false)}
                disabled={bulkDeleting}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {bulkDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2Icon className="h-4 w-4 animate-spin" /> Đang xóa...
                  </span>
                ) : `Xóa ${selectedIds.size} file`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
