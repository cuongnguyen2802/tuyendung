'use client'

import { useState, useEffect } from 'react'
import {
  HeartIcon, UserPlusIcon, MessageCircleIcon, HeadphonesIcon,
  EyeIcon, EyeOffIcon, SaveIcon, CheckIcon, PencilIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingItem {
  id: string
  label: string
  icon: string
  href: string
  visible: boolean
  showBadge: boolean
}

interface FloatingConfig {
  items: FloatingItem[]
}

const ICON_MAP: Record<string, React.ElementType> = {
  heart: HeartIcon,
  'user-plus': UserPlusIcon,
  'message-circle': MessageCircleIcon,
  headset: HeadphonesIcon,
}

const ITEM_META: Record<string, { name: string; desc: string }> = {
  saved: { name: 'Việc đã lưu', desc: 'Nút yêu thích — hiển thị số việc đã bookmark. Yêu cầu đăng nhập.' },
  register: { name: 'Đăng ký nhanh', desc: 'Nút tạo tài khoản — ẩn tự động nếu người dùng đã đăng nhập.' },
  feedback: { name: 'Góp ý', desc: 'Mở form gửi góp ý / báo lỗi. Không cần đăng nhập.' },
  support: { name: 'Hỗ trợ', desc: 'Hiển thị hotline và email hỗ trợ khi click.' },
}

export default function AdminWidgetsPage() {
  const [config, setConfig] = useState<FloatingConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editHref, setEditHref] = useState('')

  useEffect(() => {
    fetch('/api/admin/floating-config')
      .then((r) => r.json())
      .then((d) => { setConfig(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const save = async () => {
    if (!config) return
    setSaving(true)
    try {
      await fetch('/api/admin/floating-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const toggle = (id: string) => {
    setConfig((prev) => prev ? {
      ...prev,
      items: prev.items.map((i) => i.id === id ? { ...i, visible: !i.visible } : i),
    } : prev)
  }

  const startEdit = (item: FloatingItem) => {
    setEditing(item.id)
    setEditLabel(item.label)
    setEditHref(item.href)
  }

  const applyEdit = () => {
    if (!editing || !config) return
    setConfig({
      ...config,
      items: config.items.map((i) => i.id === editing ? { ...i, label: editLabel, href: editHref } : i),
    })
    setEditing(null)
  }

  if (loading) return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}
    </div>
  )

  if (!config) return (
    <div className="py-20 text-center text-red-500">Không thể tải cấu hình</div>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nút nổi</h1>
          <p className="mt-1 text-sm text-gray-500">Bật/tắt và chỉnh sửa các nút hành động cố định bên phải màn hình</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className={cn(
            'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition',
            saved ? 'bg-brand' : 'bg-brand hover:bg-brand/90',
          )}
        >
          {saved ? <CheckIcon className="h-4 w-4" /> : <SaveIcon className="h-4 w-4" />}
          {saved ? 'Đã lưu!' : saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Xem trước</p>
        <div className="flex items-center gap-3">
          {config.items.filter((i) => i.visible).map((item) => {
            const Icon = ICON_MAP[item.icon] ?? MessageCircleIcon
            return (
              <div key={item.id} className="flex flex-col items-center gap-1">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md text-brand">
                  <Icon className="h-5 w-5" />
                  {item.showBadge && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">0</span>
                  )}
                </div>
                {item.label && <span className="text-[10px] font-semibold text-gray-500">{item.label}</span>}
              </div>
            )
          })}
          {config.items.filter((i) => i.visible).length === 0 && (
            <p className="text-sm text-gray-400">Không có nút nào hiển thị</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {config.items.map((item) => {
          const Icon = ICON_MAP[item.icon] ?? MessageCircleIcon
          const meta = ITEM_META[item.id]
          const isEditing = editing === item.id

          return (
            <div key={item.id}
              className={cn(
                'rounded-xl border bg-white transition',
                item.visible ? 'border-gray-200' : 'border-gray-100 opacity-60',
              )}>
              <div className="flex items-center gap-4 px-4 py-4">
                {/* Icon preview */}
                <div className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
                  item.visible ? 'bg-brand/10 text-brand' : 'bg-gray-100 text-gray-300',
                )}>
                  <Icon className="h-5 w-5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{meta?.name ?? item.id}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{meta?.desc}</p>

                  {isEditing && (
                    <div className="mt-3 space-y-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                          Nhãn hiển thị <span className="text-gray-400">(để trống nếu không cần)</span>
                        </label>
                        <input
                          autoFocus
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          placeholder="Ví dụ: Góp ý"
                          className="w-full rounded-lg border border-brand px-3 py-1.5 text-sm outline-none"
                        />
                      </div>
                      {item.href !== undefined && (
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">
                            Đường dẫn <span className="text-gray-400">(để trống nếu mở modal)</span>
                          </label>
                          <input
                            value={editHref}
                            onChange={(e) => setEditHref(e.target.value)}
                            placeholder="/jobs hoặc https://..."
                            onKeyDown={(e) => { if (e.key === 'Enter') applyEdit(); if (e.key === 'Escape') setEditing(null) }}
                            className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-brand"
                          />
                        </div>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button onClick={applyEdit}
                          className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand/90">
                          Lưu
                        </button>
                        <button onClick={() => setEditing(null)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50">
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  {!isEditing && (
                    <button
                      onClick={() => startEdit(item)}
                      className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 hover:border-brand hover:text-brand transition"
                    >
                      <PencilIcon className="h-3.5 w-3.5" />
                      Sửa
                    </button>
                  )}
                  <button
                    onClick={() => toggle(item.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition',
                      item.visible
                        ? 'bg-brand-50 text-brand hover:bg-brand-100'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200',
                    )}
                  >
                    {item.visible ? <EyeIcon className="h-3.5 w-3.5" /> : <EyeOffIcon className="h-3.5 w-3.5" />}
                    {item.visible ? 'Hiện' : 'Ẩn'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs text-gray-500 space-y-1">
        <p className="font-semibold text-gray-700 mb-2">Lưu ý:</p>
        <p>• Các nút hiển thị cố định ở góc phải màn hình trên tất cả trang public</p>
        <p>• Nút <strong>Đăng ký nhanh</strong> tự ẩn khi người dùng đã đăng nhập</p>
        <p>• Nút <strong>Góp ý</strong> và <strong>Hỗ trợ</strong> mở hộp thoại — không cần đường dẫn</p>
      </div>
    </div>
  )
}
