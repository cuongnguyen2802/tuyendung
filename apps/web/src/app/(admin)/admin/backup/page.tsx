'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  DatabaseIcon, DownloadIcon, Trash2Icon, RefreshCwIcon,
  CheckCircle2Icon, XCircleIcon, ClockIcon, HardDriveIcon,
  ToggleLeftIcon, ToggleRightIcon, ShieldCheckIcon, AlertTriangleIcon,
  CalendarClockIcon, ServerIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BackupRecord {
  filename: string
  createdAt: string
  sizeBytes: number
  type: 'manual' | 'auto'
  status: 'success' | 'failed'
  note?: string
}

interface BackupStatus {
  autoEnabled: boolean
  lastBackupAt: string | null
  totalBackups: number
  totalSizeBytes: number
  nextAutoAt: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024)         return `${bytes} B`
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(new Date(iso))
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min  = Math.floor(diff / 60_000)
  const hr   = Math.floor(diff / 3_600_000)
  const day  = Math.floor(diff / 86_400_000)
  if (min < 1)   return 'vừa xong'
  if (min < 60)  return `${min} phút trước`
  if (hr  < 24)  return `${hr} giờ trước`
  return `${day} ngày trước`
}

// ── Stat tile ─────────────────────────────────────────────────────────────────

function StatTile({ icon: Icon, label, value, color = 'slate' }: {
  icon: React.ElementType; label: string; value: string; color?: 'green' | 'blue' | 'slate' | 'amber'
}) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 text-green-600',
    blue:  'bg-blue-50  text-blue-600',
    slate: 'bg-slate-100 text-slate-600',
    amber: 'bg-amber-50 text-amber-600',
  }
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', colors[color])}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-0.5 text-lg font-bold text-slate-800">{value}</p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BackupPage() {
  const queryClient = useQueryClient()
  const [deletingFile, setDeletingFile] = useState<string | null>(null)

  const { data: status, isLoading: loadingStatus } = useQuery<BackupStatus>({
    queryKey: ['backup-status'],
    queryFn: () => api.get('/admin/backup/status'),
    refetchInterval: 10_000,
  })

  const { data: backups = [], isLoading: loadingList } = useQuery<BackupRecord[]>({
    queryKey: ['backup-list'],
    queryFn: () => api.get('/admin/backup'),
    refetchInterval: 10_000,
  })

  const createMutation = useMutation({
    mutationFn: () => api.post('/admin/backup'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-list'] })
      queryClient.invalidateQueries({ queryKey: ['backup-status'] })
    },
  })

  const autoMutation = useMutation({
    mutationFn: (enabled: boolean) => api.post('/admin/backup/auto', { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-status'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (filename: string) => api.delete(`/admin/backup/${filename}`),
    onSuccess: () => {
      setDeletingFile(null)
      queryClient.invalidateQueries({ queryKey: ['backup-list'] })
      queryClient.invalidateQueries({ queryKey: ['backup-status'] })
    },
  })

  const handleDownload = (filename: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'
    window.open(`${baseUrl}/admin/backup/${filename}/download`, '_blank')
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Backup & Khôi phục</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sao lưu toàn bộ cơ sở dữ liệu PostgreSQL. Backup lưu tại <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">uploads/backups/</code> trên server.
          </p>
        </div>
        <button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90 disabled:opacity-60"
        >
          {createMutation.isPending ? (
            <RefreshCwIcon className="h-4 w-4 animate-spin" />
          ) : (
            <DatabaseIcon className="h-4 w-4" />
          )}
          {createMutation.isPending ? 'Đang backup...' : 'Tạo backup ngay'}
        </button>
      </div>

      {/* ── Status banner ── */}
      {createMutation.isSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2Icon className="h-4 w-4 shrink-0" />
          Backup đã hoàn thành thành công!
        </div>
      )}
      {createMutation.isError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangleIcon className="h-4 w-4 shrink-0" />
          {(createMutation.error as any)?.message ?? 'Backup thất bại. Kiểm tra pg_dump đã được cài đặt chưa.'}
        </div>
      )}

      {/* ── Stat tiles ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          icon={HardDriveIcon} label="Tổng dung lượng" color="blue"
          value={loadingStatus ? '...' : formatBytes(status?.totalSizeBytes ?? 0)}
        />
        <StatTile
          icon={DatabaseIcon} label="Số file backup" color="slate"
          value={loadingStatus ? '...' : `${status?.totalBackups ?? 0} file`}
        />
        <StatTile
          icon={ClockIcon} label="Backup gần nhất" color="green"
          value={loadingStatus || !status?.lastBackupAt ? 'Chưa có' : timeAgo(status.lastBackupAt)}
        />
        <StatTile
          icon={CalendarClockIcon} label="Backup tiếp theo" color="amber"
          value={loadingStatus || !status?.nextAutoAt ? 'Tắt' : timeAgo(status.nextAutoAt)}
        />
      </div>

      {/* ── Auto-backup panel ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
              <ServerIcon className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Backup tự động hàng ngày</p>
              <p className="mt-0.5 text-sm text-slate-500">
                Tự động backup lúc 0:00 mỗi ngày. Backup cũ hơn 30 ngày sẽ bị xóa tự động.
              </p>
            </div>
          </div>

          <button
            onClick={() => autoMutation.mutate(!(status?.autoEnabled ?? false))}
            disabled={autoMutation.isPending || loadingStatus}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-60"
          >
            {status?.autoEnabled ? (
              <>
                <ToggleRightIcon className="h-5 w-5 text-brand" />
                <span className="text-brand">Đang bật</span>
              </>
            ) : (
              <>
                <ToggleLeftIcon className="h-5 w-5 text-slate-400" />
                <span className="text-slate-500">Đang tắt</span>
              </>
            )}
          </button>
        </div>

        {status?.autoEnabled && status.nextAutoAt && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-brand/5 px-3 py-2 text-xs text-brand">
            <ClockIcon className="h-3.5 w-3.5" />
            Backup tiếp theo: <strong>{formatDate(status.nextAutoAt)}</strong>
          </div>
        )}
      </div>

      {/* ── Backup list ── */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-800">Lịch sử backup</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            {backups.length} file
          </span>
        </div>

        {loadingList ? (
          <div className="space-y-3 p-5">
            {[0,1,2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : backups.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
              <DatabaseIcon className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-sm text-slate-500">Chưa có backup nào. Nhấn <strong>Tạo backup ngay</strong> để bắt đầu.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {backups.map((b) => (
              <div key={b.filename} className="flex items-center gap-4 px-5 py-4">

                {/* Status icon */}
                <div className="shrink-0">
                  {b.status === 'success' ? (
                    <CheckCircle2Icon className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-400" />
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-700">{b.filename}</p>
                    <span className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                      b.type === 'auto'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-slate-100 text-slate-500',
                    )}>
                      {b.type === 'auto' ? 'Tự động' : 'Thủ công'}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                    <span>{formatDate(b.createdAt)}</span>
                    <span>·</span>
                    <span>{formatBytes(b.sizeBytes)}</span>
                    {b.note && (
                      <>
                        <span>·</span>
                        <span className="text-red-400">{b.note}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  {b.status === 'success' && (
                    <button
                      onClick={() => handleDownload(b.filename)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand hover:text-brand"
                    >
                      <DownloadIcon className="h-3.5 w-3.5" />
                      Tải xuống
                    </button>
                  )}

                  {deletingFile === b.filename ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => deleteMutation.mutate(b.filename)}
                        disabled={deleteMutation.isPending}
                        className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
                      >
                        {deleteMutation.isPending ? 'Đang xóa...' : 'Xác nhận xóa'}
                      </button>
                      <button
                        onClick={() => setDeletingFile(null)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingFile(b.filename)}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2Icon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Notes ── */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
        <div className="flex items-start gap-2">
          <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="space-y-1">
            <p className="font-semibold">Lưu ý bảo mật</p>
            <p>Backup chứa toàn bộ dữ liệu hệ thống. Chỉ admin mới có quyền truy cập. File backup được lưu trên server — khuyến nghị định kỳ tải xuống và lưu ở nơi khác (Google Drive, S3 bucket riêng).</p>
            <p className="mt-1">Để restore: <code className="rounded bg-amber-100 px-1">psql DATABASE_URL &lt; backup.sql</code> (sau khi giải nén với <code className="rounded bg-amber-100 px-1">gunzip</code>).</p>
          </div>
        </div>
      </div>
    </div>
  )
}
