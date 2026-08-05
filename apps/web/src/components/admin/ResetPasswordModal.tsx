'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { KeyRoundIcon, XIcon, EyeIcon, EyeOffIcon, CheckIcon, RefreshCwIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  userId: string
  userName: string
  onClose: () => void
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$'
  return Array.from(crypto.getRandomValues(new Uint8Array(12)))
    .map(b => chars[b % chars.length])
    .join('')
}

export function ResetPasswordModal({ userId, userName, onClose }: Props) {
  const [password, setPassword]     = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [success, setSuccess]       = useState(false)

  const mutation = useMutation({
    mutationFn: (pw: string) =>
      api.patch(`/admin/users/${userId}/reset-password`, { password: pw }),
    onSuccess: () => setSuccess(true),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) return
    mutation.mutate(password)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100">
              <KeyRoundIcon className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Reset mật khẩu</p>
              <p className="text-xs text-gray-400 truncate max-w-[220px]">{userName}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        {success ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center gap-4 px-6 py-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckIcon className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Đã đặt lại mật khẩu</p>
              <p className="mt-1 text-sm text-gray-500">
                Mật khẩu mới cho <strong>{userName}</strong> đã được cập nhật thành công.
              </p>
            </div>
            <div className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Mật khẩu mới</p>
              <p className="mt-1 font-mono text-base font-bold text-gray-800 select-all">{password}</p>
            </div>
            <p className="text-xs text-gray-400">Hãy thông báo mật khẩu này cho người dùng qua kênh bảo mật</p>
            <button onClick={onClose} className="btn-primary w-full">Đóng</button>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            <p className="text-sm text-gray-600">
              Đặt mật khẩu mới cho tài khoản này. Mật khẩu tối thiểu <strong>6 ký tự</strong>.
            </p>

            {/* password input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  className={cn(
                    'input pr-20 font-mono',
                    mutation.isError ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : '',
                  )}
                  autoFocus
                  minLength={6}
                  required
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="rounded p-1 text-gray-400 hover:text-gray-600 transition"
                    title={showPass ? 'Ẩn' : 'Hiện'}
                  >
                    {showPass ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { const pw = generatePassword(); setPassword(pw); setShowPass(true) }}
                    className="rounded p-1 text-gray-400 hover:text-brand transition"
                    title="Tạo mật khẩu ngẫu nhiên"
                  >
                    <RefreshCwIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* strength bar */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[6, 10, 14].map((threshold, i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-colors',
                          password.length >= threshold
                            ? i === 0 ? 'bg-red-400' : i === 1 ? 'bg-yellow-400' : 'bg-green-500'
                            : 'bg-gray-100',
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {password.length < 6  ? 'Quá ngắn'
                    : password.length < 10 ? 'Yếu'
                    : password.length < 14 ? 'Trung bình'
                    : 'Mạnh'}
                  </p>
                </div>
              )}
            </div>

            {mutation.isError && (
              <p className="text-sm text-red-500">
                {(mutation.error as any)?.message ?? 'Có lỗi xảy ra, vui lòng thử lại'}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                Hủy
              </button>
              <button
                type="submit"
                disabled={password.length < 6 || mutation.isPending}
                className="flex-1 rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-50"
              >
                {mutation.isPending ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
