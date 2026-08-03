'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LockIcon, CheckCircleIcon, XCircleIcon, EyeIcon, EyeOffIcon } from 'lucide-react'

const schema = z.object({
  newPassword: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMsg('Link không hợp lệ. Vui lòng yêu cầu lại.')
    }
  }, [token])

  const onSubmit = async (data: FormData) => {
    setErrorMsg('')
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: data.newPassword }),
    })

    if (res.ok) {
      setStatus('success')
      setTimeout(() => router.push('/login'), 3000)
    } else {
      const body = await res.json().catch(() => ({}))
      setErrorMsg(body?.message || 'Link đã hết hạn. Vui lòng yêu cầu lại.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
          <CheckCircleIcon className="h-8 w-8 text-brand" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Mật khẩu đã được cập nhật!</h1>
        <p className="mb-6 text-sm text-gray-500">
          Đang chuyển hướng về trang đăng nhập...
        </p>
        <Link href="/login" className="btn-primary px-6 py-2.5 text-sm">
          Đăng nhập ngay
        </Link>
      </div>
    )
  }

  if (status === 'error' && !token) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <XCircleIcon className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Link không hợp lệ</h1>
        <p className="mb-6 text-sm text-gray-500">{errorMsg}</p>
        <Link href="/forgot-password" className="btn-primary px-6 py-2.5 text-sm">
          Yêu cầu lại
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
        <LockIcon className="h-6 w-6 text-brand" />
      </div>
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Đặt mật khẩu mới</h1>
      <p className="mb-6 text-sm text-gray-500">Nhập mật khẩu mới cho tài khoản của bạn.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Mật khẩu mới</label>
          <div className="relative">
            <input
              {...register('newPassword')}
              type={showPw ? 'text' : 'password'}
              placeholder="Ít nhất 8 ký tự"
              className="input pr-10"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPw ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
          {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirm ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu"
              className="input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
          {isSubmitting ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
        </button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        <Suspense fallback={<div className="py-8 text-center text-sm text-gray-400">Đang tải...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
