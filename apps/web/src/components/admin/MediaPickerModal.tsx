'use client'

import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { XIcon, CheckIcon, UploadCloudIcon, Trash2Icon, SearchIcon, Loader2Icon, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import DropZone from '@/components/common/DropZone'

interface MediaItem {
  id: string
  filename: string
  url: string
  mimeType: string
  size: number
  createdAt: string
}

interface Props {
  onSelect: (url: string) => void
  onClose: () => void
  multiple?: boolean
  onSelectMultiple?: (urls: string[]) => void
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function MediaPickerModal({ onSelect, onClose, multiple = false, onSelectMultiple }: Props) {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'library' | 'upload'>('library')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [keyword, setKeyword] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const { data, isLoading, refetch } = useQuery<any>({
    queryKey: ['media-library', page],
    queryFn: () => api.get(`/media?page=${page}&limit=40`),
  })

  const items: MediaItem[] = data?.data ?? []
  const meta = data?.meta
  const filtered = keyword
    ? items.filter((i) => i.filename.toLowerCase().includes(keyword.toLowerCase()))
    : items

  const toggleSelect = (item: MediaItem) => {
    if (!multiple) {
      onSelect(item.url)
      onClose()
      return
    }
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(item.url)) next.delete(item.url)
      else next.add(item.url)
      return next
    })
  }

  const handleUpload = useCallback(async (files: File[]) => {
    setUploading(true)
    setUploadError('')
    try {
      const formData = new FormData()
      files.forEach((f) => formData.append('files', f))
      await api.post('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      await refetch()
      setTab('library')
    } catch (err: any) {
      setUploadError(err.message ?? 'Upload thất bại')
    } finally {
      setUploading(false)
    }
  }, [refetch])

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/media/${id}`)
      queryClient.invalidateQueries({ queryKey: ['media-library'] })
    } finally {
      setDeletingId(null)
    }
  }

  const confirmInsert = () => {
    if (multiple && onSelectMultiple) {
      onSelectMultiple(Array.from(selected))
    } else if (selected.size === 1) {
      onSelect(Array.from(selected)[0])
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-gray-900">Thư viện ảnh</h2>
          <div className="flex items-center gap-3">
            {multiple && selected.size > 0 && (
              <button
                onClick={confirmInsert}
                className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
              >
                <CheckIcon className="h-4 w-4" />
                Chèn {selected.size} ảnh
              </button>
            )}
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition">
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-100 px-6 pt-3 pb-0">
          <button
            onClick={() => setTab('library')}
            className={cn(
              'border-b-2 px-4 pb-2.5 text-sm font-medium transition',
              tab === 'library' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            Thư viện
          </button>
          <button
            onClick={() => setTab('upload')}
            className={cn(
              'border-b-2 px-4 pb-2.5 text-sm font-medium transition',
              tab === 'upload' ? 'border-brand text-brand' : 'border-transparent text-gray-500 hover:text-gray-700',
            )}
          >
            <span className="flex items-center gap-1.5">
              <UploadCloudIcon className="h-4 w-4" /> Tải lên
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'upload' ? (
            <div className="p-6">
              <DropZone
                onFiles={handleUpload}
                accept="image/*,video/*,application/pdf"
                multiple
                uploading={uploading}
                className="min-h-60"
              />
              {uploadError && (
                <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{uploadError}</p>
              )}
              <p className="mt-3 text-xs text-gray-400 text-center">
                Hỗ trợ: JPG, PNG, GIF, WebP, SVG, PDF · Tối đa 10 MB mỗi file · Có thể chọn nhiều file
              </p>
            </div>
          ) : (
            <div className="p-4">
              {/* Search */}
              <div className="relative mb-4">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm theo tên file..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand"
                />
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2Icon className="h-8 w-8 animate-spin text-brand" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ImageIcon className="mb-3 h-12 w-12 text-gray-200" />
                  <p className="text-sm text-gray-400">Chưa có ảnh nào</p>
                  <button
                    onClick={() => setTab('upload')}
                    className="mt-2 text-sm font-semibold text-brand hover:underline"
                  >
                    Tải ảnh lên
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
                  {filtered.map((item) => {
                    const isImg = item.mimeType.startsWith('image/')
                    const isSelected = selected.has(item.url)
                    return (
                      <div
                        key={item.id}
                        className="group relative"
                      >
                        <button
                          onClick={() => toggleSelect(item)}
                          className={cn(
                            'relative w-full overflow-hidden rounded-xl border-2 transition',
                            isSelected ? 'border-brand shadow-md' : 'border-transparent hover:border-gray-300',
                          )}
                        >
                          {isImg ? (
                            <img
                              src={item.url}
                              alt={item.filename}
                              className="aspect-square w-full object-cover"
                            />
                          ) : (
                            <div className="flex aspect-square w-full items-center justify-center bg-gray-100">
                              <span className="text-2xl">📄</span>
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-brand/20">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand">
                                <CheckIcon className="h-4 w-4 text-white" />
                              </span>
                            </div>
                          )}
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeletingId(item.id) }}
                          className="absolute right-1 top-1 hidden rounded-lg bg-white/90 p-1 text-red-500 shadow hover:bg-red-50 group-hover:flex"
                          title="Xóa"
                        >
                          <Trash2Icon className="h-3.5 w-3.5" />
                        </button>

                        <p className="mt-1 truncate px-0.5 text-[10px] text-gray-400">{item.filename}</p>
                        <p className="truncate px-0.5 text-[10px] text-gray-300">{formatSize(item.size)}</p>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40 hover:border-brand hover:text-brand transition">
                    ← Trước
                  </button>
                  <span className="text-sm text-gray-500">{page}/{meta.totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm disabled:opacity-40 hover:border-brand hover:text-brand transition">
                    Sau →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      {deletingId && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900">Xóa file này?</h3>
            <p className="mt-1 text-sm text-gray-500">Hành động này không thể hoàn tác.</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setDeletingId(null)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium hover:bg-gray-50 transition">
                Hủy
              </button>
              <button onClick={() => handleDelete(deletingId)}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition">
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
