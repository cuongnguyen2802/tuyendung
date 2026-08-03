'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MailIcon, CheckCircleIcon, XCircleIcon, RefreshCwIcon } from 'lucide-react'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending')
  const [errorMsg, setErrorMsg] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [resendSent, setResendSent] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const calledRef = useRef(false)

  useEffect(() => {
    if (!token || calledRef.current) return
    calledRef.current = true
    setStatus('verifying')

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (res.ok) {
          setStatus('success')
        } else {
          const body = await res.json().catch(() => ({}))
          setErrorMsg(body?.message || 'Link xác thực không hợp lệ hoặc đã hết hạn.')
          setStatus('error')
        }
      })
      .catch(() => {
        setErrorMsg('Không thể kết nối server. Vui lòng thử lại.')
        setStatus('error')
      })
  }, [token])

  const handleResend = async () => {
    if (!resendEmail) return
    setResendLoading(true)
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resendEmail }),
    }).catch(() => {})
    setResendSent(true)
    setResendLoading(false)
  }

  // No token — show "check your inbox" info page
  if (!token) {
    return (
      <>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
          <MailIcon className="h-8 w-8 text-brand" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Xác thực email của bạn</h1>
        <p className="mb-6 text-sm text-gray-500">
          Chúng tôi đã gửi email xác thực đến hộp thư của bạn. Vui lòng kiểm tra và nhấn vào link xác thực.
        </p>
        <p className="mb-4 text-xs text-gray-400">Không thấy email? Kiểm tra thư mục Spam hoặc gửi lại:</p>

        {!resendSent ? (
          <div className="space-y-2">
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="Nhập email của bạn"
              className="input"
            />
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || !resendEmail}
              className="btn-primary w-full py-2.5 text-sm"
            >
              {resendLoading ? 'Đang gửi...' : 'Gửi lại email xác thực'}
            </button>
          </div>
        ) : (
          <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand">
            Đã gửi lại! Kiểm tra hộp thư của bạn.
          </p>
        )}

        <div className="mt-5">
          <Link href="/login" className="text-sm text-gray-500 hover:text-brand">
            Quay lại đăng nhập →
          </Link>
        </div>
      </>
    )
  }

  if (status === 'verifying') {
    return (
      <>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
          <RefreshCwIcon className="h-8 w-8 animate-spin text-brand" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Đang xác thực...</h1>
        <p className="text-sm text-gray-400">Vui lòng chờ trong giây lát.</p>
      </>
    )
  }

  if (status === 'success') {
    return (
      <>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
          <CheckCircleIcon className="h-8 w-8 text-brand" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Email đã được xác thực!</h1>
        <p className="mb-6 text-sm text-gray-500">
          Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.
        </p>
        <Link href="/login" className="btn-primary px-8 py-2.5 text-sm">
          Đăng nhập
        </Link>
      </>
    )
  }

  return (
    <>
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <XCircleIcon className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="mb-2 text-xl font-bold text-gray-900">Xác thực thất bại</h1>
      <p className="mb-6 text-sm text-gray-500">{errorMsg}</p>
      <Link href="/forgot-password" className="btn-primary px-6 py-2.5 text-sm">
        Yêu cầu gửi lại
      </Link>
    </>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-md">
      <div className="card p-8 text-center">
        <Suspense fallback={<div className="py-8 text-sm text-gray-400">Đang tải...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  )
}
