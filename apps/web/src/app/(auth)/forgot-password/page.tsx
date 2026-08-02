'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeftIcon, MailIcon, CheckCircleIcon } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
})
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email }),
    })
    setSubmittedEmail(data.email)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="w-full max-w-md">
        <div className="card p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
            <CheckCircleIcon className="h-8 w-8 text-brand" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-gray-900">Kiểm tra hộp thư!</h1>
          <p className="mb-1 text-sm text-gray-500">
            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến
          </p>
          <p className="mb-6 font-semibold text-gray-800">{submittedEmail}</p>
          <p className="mb-6 text-xs text-gray-400">
            Không thấy email? Kiểm tra thư mục Spam hoặc{' '}
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-brand hover:underline"
            >
              thử lại
            </button>
            .
          </p>
          <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-brand">
            <ArrowLeftIcon className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="card p-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
          <MailIcon className="h-6 w-6 text-brand" />
        </div>
        <h1 className="mb-1 text-2xl font-bold text-gray-900">Quên mật khẩu?</h1>
        <p className="mb-6 text-sm text-gray-500">
          Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="input"
              autoFocus
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
            {isSubmitting ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
          </button>
        </form>

        <div className="mt-5 text-center">
          <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-brand">
            <ArrowLeftIcon className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
