'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Link from 'next/link'
import {
  UploadCloudIcon, FileTextIcon, XIcon, CheckCircleIcon,
  AlertCircleIcon, ChevronRightIcon,
} from 'lucide-react'

const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
const ACCEPT = '.pdf,.doc,.docx'

type FileStatus = 'idle' | 'uploading' | 'success' | 'error'

export default function UploadCVPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [status, setStatus] = useState<FileStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [title, setTitle] = useState('')

  const validate = (f: File): string | null => {
    if (f.size > MAX_SIZE_BYTES) return `File quá lớn. Tối đa ${MAX_SIZE_MB}MB.`
    const ext = f.name.split('.').pop()?.toLowerCase()
    if (!['pdf', 'doc', 'docx'].includes(ext ?? '')) return 'Chỉ hỗ trợ file PDF, DOC, DOCX.'
    return null
  }

  const selectFile = useCallback((f: File) => {
    const err = validate(f)
    if (err) { setErrorMsg(err); return }
    setErrorMsg('')
    setFile(f)
    setTitle(f.name.replace(/\.[^/.]+$/, ''))
    setStatus('idle')
  }, [])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) selectFile(f)
  }

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) return
      const form = new FormData()
      form.append('file', file)
      form.append('title', title || file.name)
      return api.post('/resumes/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onMutate: () => setStatus('uploading'),
    onSuccess: () => {
      setStatus('success')
      queryClient.invalidateQueries({ queryKey: ['my-resumes'] })
      setTimeout(() => router.push('/resumes'), 1500)
    },
    onError: (e: Error) => {
      setStatus('error')
      setErrorMsg(e.message || 'Tải lên thất bại, vui lòng thử lại.')
    },
  })

  const sizeKB = file ? (file.size / 1024).toFixed(0) : null

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/resumes" className="hover:text-brand">CV của tôi</Link>
        <ChevronRightIcon className="h-3.5 w-3.5" />
        <span className="text-gray-600">Tải CV lên</span>
      </nav>

      <div>
        <h1 className="text-xl font-bold text-gray-900">Tải CV lên</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Hỗ trợ PDF, DOC, DOCX • Tối đa {MAX_SIZE_MB}MB
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 text-center transition
          ${dragOver ? 'border-brand bg-brand/5' : 'border-gray-200 bg-gray-50 hover:border-brand/50 hover:bg-brand/5'}
          ${file ? 'cursor-default' : ''}`}
      >
        {!file ? (
          <>
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${dragOver ? 'bg-brand text-white' : 'bg-white text-gray-400 shadow-sm'} transition`}>
              <UploadCloudIcon className="h-8 w-8" />
            </div>
            <div>
              <p className="font-semibold text-gray-700">
                {dragOver ? 'Thả file vào đây' : 'Kéo thả file CV vào đây'}
              </p>
              <p className="mt-1 text-sm text-gray-400">hoặc click để chọn file từ máy tính</p>
            </div>
            <div className="flex gap-2">
              {['PDF', 'DOC', 'DOCX'].map((ext) => (
                <span key={ext} className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-gray-500 shadow-sm">
                  {ext}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="flex w-full max-w-sm flex-col items-center gap-3">
            {status === 'success' ? (
              <CheckCircleIcon className="h-12 w-12 text-brand" />
            ) : (
              <FileTextIcon className={`h-12 w-12 ${status === 'error' ? 'text-red-400' : 'text-brand'}`} />
            )}
            <div className="w-full">
              <p className="truncate font-semibold text-gray-800">{file.name}</p>
              <p className="text-xs text-gray-400">{sizeKB} KB</p>
            </div>
            {status === 'idle' && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); setStatus('idle') }}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500"
              >
                <XIcon className="h-3.5 w-3.5" /> Chọn file khác
              </button>
            )}
            {status === 'uploading' && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full animate-pulse rounded-full bg-brand" style={{ width: '60%' }} />
              </div>
            )}
            {status === 'success' && (
              <p className="text-sm font-semibold text-brand">Tải lên thành công! Đang chuyển hướng...</p>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) selectFile(f) }}
        />
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircleIcon className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Title input */}
      {file && status !== 'success' && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Đặt tên cho CV</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: CV Senior Frontend 2025"
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
      )}

      {/* Submit */}
      {file && status !== 'success' && (
        <button
          onClick={() => uploadMutation.mutate()}
          disabled={status === 'uploading' || !title.trim()}
          className="w-full rounded-xl bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'uploading' ? 'Đang tải lên...' : 'Tải CV lên'}
        </button>
      )}

      {/* Tips */}
      <div className="rounded-2xl bg-amber-50 p-5">
        <p className="mb-2 text-sm font-bold text-amber-800">Lưu ý khi tải CV</p>
        <ul className="space-y-1.5 text-sm text-amber-700">
          <li>• Ưu tiên dùng định dạng <strong>PDF</strong> để đảm bảo hiển thị đúng</li>
          <li>• Tên file không nên chứa ký tự đặc biệt</li>
          <li>• CV tải lên được hiển thị với nhà tuyển dụng khi bạn ứng tuyển</li>
          <li>• Có thể tải nhiều phiên bản CV và chọn CV mặc định</li>
        </ul>
      </div>

      <div className="text-center text-sm text-gray-400">
        Chưa có CV?{' '}
        <Link href="/resumes/templates" className="font-semibold text-brand hover:underline">
          Tạo CV từ mẫu có sẵn →
        </Link>
      </div>
    </div>
  )
}
