'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Link from 'next/link'
import {
  PlusIcon, UploadIcon, FileTextIcon, TrashIcon,
  DownloadIcon, StarIcon, CheckIcon, BriefcaseIcon, PencilIcon,
} from 'lucide-react'
import { useState } from 'react'
import { timeAgo } from '@/lib/utils'

interface Resume {
  id: string
  title: string
  fileUrl?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
  type?: 'uploaded' | 'built'
}

export default function ResumesPage() {
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null)

  const { data: resumes = [], isLoading } = useQuery<Resume[]>({
    queryKey: ['my-resumes'],
    queryFn: () => api.get('/resumes'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/resumes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-resumes'] })
      setDeletingId(null)
    },
  })

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/resumes/${id}/default`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-resumes'] })
      setSettingDefaultId(null)
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">CV của tôi</h1>
          <p className="mt-0.5 text-sm text-gray-500">Quản lý tất cả CV đã tạo và tải lên</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/resumes/upload"
            className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-brand hover:text-brand"
          >
            <UploadIcon className="h-4 w-4" />
            Tải CV lên
          </Link>
          <Link
            href="/resumes/builder"
            className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
          >
            <PlusIcon className="h-4 w-4" />
            Tạo CV mới
          </Link>
        </div>
      </div>

      {/* Template suggestion */}
      <div className="flex items-center gap-4 rounded-2xl border border-dashed border-brand/30 bg-brand/5 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <FileTextIcon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">Chưa có CV? Bắt đầu từ mẫu có sẵn</p>
          <p className="mt-0.5 text-xs text-gray-500">Hơn 50 mẫu CV chuyên nghiệp, miễn phí</p>
        </div>
        <Link
          href="/resumes/templates"
          className="shrink-0 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
        >
          Xem mẫu CV
        </Link>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && resumes.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <BriefcaseIcon className="h-14 w-14 text-gray-200" />
          <div>
            <p className="font-semibold text-gray-500">Bạn chưa có CV nào</p>
            <p className="mt-1 text-sm text-gray-400">Tạo CV mới hoặc tải CV có sẵn lên</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/resumes/templates"
              className="rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand/90"
            >
              Chọn mẫu CV
            </Link>
            <Link
              href="/resumes/upload"
              className="rounded-xl border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 transition hover:border-brand hover:text-brand"
            >
              Tải CV lên
            </Link>
          </div>
        </div>
      )}

      {/* CV list */}
      {!isLoading && resumes.length > 0 && (
        <div className="space-y-3">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="group relative flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-brand/40 hover:shadow-sm"
            >
              {/* Clickable area: icon + info → open viewer */}
              <Link
                href={resume.fileUrl ? resume.fileUrl : `/resumes/builder?id=${resume.id}`}
                target={resume.fileUrl ? '_blank' : undefined}
                rel={resume.fileUrl ? 'noopener noreferrer' : undefined}
                className="flex flex-1 min-w-0 items-center gap-4"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${resume.isDefault ? 'bg-brand/10 text-brand' : 'bg-gray-100 text-gray-500'}`}>
                  <FileTextIcon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate group-hover:text-brand transition">
                      {resume.title}
                    </p>
                    {resume.isDefault && (
                      <span className="shrink-0 flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
                        <StarIcon className="h-3 w-3 fill-brand stroke-none" /> Mặc định
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {resume.fileUrl ? 'Đã tải lên' : 'Tạo bằng CV Builder'} •{' '}
                    Cập nhật {timeAgo(resume.updatedAt)}
                  </p>
                </div>
              </Link>

              {/* Actions (always visible, shrink-0) */}
              <div className="flex shrink-0 items-center gap-1.5">
                {!resume.isDefault && (
                  <button
                    onClick={() => { setSettingDefaultId(resume.id); setDefaultMutation.mutate(resume.id) }}
                    disabled={settingDefaultId === resume.id}
                    title="Đặt làm mặc định"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition hover:border-brand hover:text-brand"
                  >
                    <StarIcon className="h-4 w-4" />
                  </button>
                )}
                {!resume.fileUrl && (
                  <Link
                    href={`/resumes/builder?id=${resume.id}`}
                    title="Xem / Chỉnh sửa"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition hover:border-brand hover:text-brand"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                )}
                {resume.fileUrl && (
                  <a
                    href={resume.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Tải về"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition hover:border-brand hover:text-brand"
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </a>
                )}
                <button
                  onClick={() => setDeletingId(resume.id)}
                  title="Xóa"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition hover:border-red-300 hover:text-red-500"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 font-bold text-gray-900">Xóa CV này?</h3>
            <p className="mb-5 text-sm text-gray-500">Thao tác này không thể hoàn tác.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingId)}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CV tips */}
      <div className="rounded-2xl bg-gray-50 p-5">
        <p className="mb-3 text-sm font-bold text-gray-700">Mẹo tạo CV hiệu quả</p>
        <ul className="space-y-2 text-sm text-gray-500">
          {[
            'Giữ CV trong 1-2 trang, tập trung vào kinh nghiệm liên quan',
            'Cập nhật CV thường xuyên, ít nhất 3-6 tháng/lần',
            'Đặt CV mặc định để nhà tuyển dụng tìm thấy bạn dễ hơn',
            'Tải CV dạng PDF để giữ nguyên định dạng khi gửi cho nhà tuyển dụng',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
