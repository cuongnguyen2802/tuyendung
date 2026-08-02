'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import {
  LockIcon, ShieldIcon, SmartphoneIcon, AlertTriangleIcon,
  CheckIcon, EyeIcon, EyeOffIcon, KeyRoundIcon,
} from 'lucide-react'

const schema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: z.string().min(8, 'Mật khẩu mới phải ít nhất 8 ký tự'),
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

function PasswordInput({ id, label, register, error, placeholder }: {
  id: string; label: string; register: any; error?: string; placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          {...register}
          placeholder={placeholder}
          className="input pr-10"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export default function SecuritySettingsPage() {
  const [pwSuccess, setPwSuccess] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    try {
      await api.put('/users/me/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      setPwSuccess(true)
      reset()
      setTimeout(() => setPwSuccess(false), 3000)
    } catch {
      // API sẽ throw với message lỗi cụ thể
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Cá nhân & Bảo mật</h1>
        <p className="mt-0.5 text-sm text-gray-500">Quản lý bảo mật và quyền riêng tư tài khoản</p>
      </div>

      {/* Change password */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10">
            <KeyRoundIcon className="h-4.5 w-4.5 text-brand" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Đổi mật khẩu</p>
            <p className="text-xs text-gray-400">Nên dùng mật khẩu mạnh, không trùng với tài khoản khác</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          {pwSuccess && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              <CheckIcon className="h-4 w-4 shrink-0" /> Đổi mật khẩu thành công!
            </div>
          )}

          <PasswordInput
            id="currentPassword"
            label="Mật khẩu hiện tại"
            register={register('currentPassword')}
            error={errors.currentPassword?.message}
            placeholder="Nhập mật khẩu hiện tại"
          />
          <PasswordInput
            id="newPassword"
            label="Mật khẩu mới"
            register={register('newPassword')}
            error={errors.newPassword?.message}
            placeholder="Ít nhất 8 ký tự"
          />
          <PasswordInput
            id="confirmPassword"
            label="Xác nhận mật khẩu mới"
            register={register('confirmPassword')}
            error={errors.confirmPassword?.message}
            placeholder="Nhập lại mật khẩu mới"
          />

          {/* Password strength hints */}
          <div className="rounded-xl bg-gray-50 p-3.5 text-xs text-gray-500 space-y-1">
            <p className="font-medium text-gray-700 mb-1.5">Mật khẩu mạnh cần:</p>
            {[
              'Ít nhất 8 ký tự',
              'Gồm chữ hoa và chữ thường',
              'Chứa ít nhất 1 số hoặc ký tự đặc biệt',
            ].map(hint => (
              <p key={hint} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300" /> {hint}
              </p>
            ))}
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:opacity-60"
            >
              {isSubmitting ? 'Đang lưu...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </div>

      {/* Two-factor auth */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
            <ShieldIcon className="h-4.5 w-4.5 text-emerald-600" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Xác thực 2 bước (2FA)</p>
            <p className="text-xs text-gray-400">Thêm lớp bảo vệ cho tài khoản</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <SmartphoneIcon className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-800">Xác thực qua SMS</p>
              <p className="text-xs text-gray-400">Nhận mã OTP qua tin nhắn điện thoại</p>
            </div>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
            Sắp ra mắt
          </span>
        </div>
      </div>

      {/* Login history */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50">
            <LockIcon className="h-4.5 w-4.5 text-orange-500" style={{ width: 18, height: 18 }} />
          </div>
          <p className="font-semibold text-gray-900">Phiên đăng nhập gần đây</p>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { device: 'Chrome trên Windows', location: 'Hà Nội, VN', time: '2 phút trước', current: true },
            { device: 'Safari trên iPhone', location: 'Hà Nội, VN', time: '2 ngày trước', current: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {s.device}
                  {s.current && (
                    <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                      Hiện tại
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-400">{s.location} · {s.time}</p>
              </div>
              {!s.current && (
                <button className="text-xs font-medium text-red-500 hover:underline">Đăng xuất</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-red-200 bg-red-50/50">
        <div className="flex items-center gap-3 border-b border-red-100 px-6 py-4">
          <AlertTriangleIcon className="h-5 w-5 text-red-500" />
          <p className="font-semibold text-red-700">Vùng nguy hiểm</p>
        </div>
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-gray-800">Xóa tài khoản</p>
            <p className="mt-0.5 text-xs text-gray-500">Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu của bạn</p>
          </div>
          <button className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100">
            Xóa tài khoản
          </button>
        </div>
      </div>
    </div>
  )
}
