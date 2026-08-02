'use client'

import { useRef, useState, useCallback } from 'react'
import { UploadCloudIcon, Loader2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  onFiles: (files: File[]) => void
  accept?: string
  multiple?: boolean
  uploading?: boolean
  className?: string
  children?: React.ReactNode
  compact?: boolean
}

export default function DropZone({
  onFiles, accept = 'image/*', multiple = false,
  uploading = false, className, children, compact = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) onFiles(multiple ? files : [files[0]])
  }, [onFiles, multiple])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length) onFiles(files)
    e.target.value = ''
  }

  if (children) {
    return (
      <div
        className={cn('relative', className)}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {dragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-brand bg-brand/5">
            <p className="text-sm font-semibold text-brand">Thả ảnh vào đây</p>
          </div>
        )}
        {children}
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={handleChange} />
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition',
        compact ? 'gap-1.5 py-4' : 'gap-3 py-10',
        dragging ? 'border-brand bg-brand/5' : 'border-gray-200 bg-gray-50 hover:border-brand/60 hover:bg-brand/5',
        uploading && 'pointer-events-none opacity-60',
        className,
      )}
    >
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={handleChange} />
      {uploading ? (
        <Loader2Icon className={cn('animate-spin text-brand', compact ? 'h-6 w-6' : 'h-10 w-10')} />
      ) : (
        <UploadCloudIcon className={cn('text-gray-300', compact ? 'h-6 w-6' : 'h-10 w-10')} />
      )}
      <div className={cn('text-center', compact ? 'space-y-0.5' : 'space-y-1')}>
        <p className={cn('font-semibold text-gray-700', compact ? 'text-xs' : 'text-sm')}>
          {uploading ? 'Đang tải lên...' : 'Kéo thả hoặc click để chọn'}
        </p>
        {!compact && (
          <p className="text-xs text-gray-400">
            {multiple ? 'Có thể chọn nhiều file' : 'Chọn 1 file'} · Tối đa 10 MB
          </p>
        )}
      </div>
    </div>
  )
}
