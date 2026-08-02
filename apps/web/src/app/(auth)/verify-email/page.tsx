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
          setErrorMsg(body?.message || 'Link xÃ¡c thá»±c khÃ´ng há»£p lá»‡ hoáº·c Ä‘Ã£ háº¿t háº¡n.')
          setStatus('error')
        }
      })
      .catch(() => {
        setErrorMsg('KhÃ´ng thá»ƒ káº¿t ná»‘i server. Vui lÃ²ng thá»­ láº¡i.')
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

  // No token â€” show "check your inbox" info page
  if (!token) {
    return (
      <>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
          <MailIcon className="h-8 w-8 text-brand" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">XÃ¡c thá»±c email cá»§a báº¡n</h1>
        <p className="mb-6 text-sm text-gray-500">
          ChÃºng tÃ´i Ä‘Ã£ gá»­i email xÃ¡c thá»±c Ä‘áº¿n há»™p thÆ° cá»§a báº¡n. Vui lÃ²ng kiá»ƒm tra vÃ  nháº¥n vÃ o link xÃ¡c thá»±c.
        </p>
        <p className="mb-4 text-xs text-gray-400">KhÃ´ng tháº¥y email? Kiá»ƒm tra thÆ° má»¥c Spam hoáº·c gá»­i láº¡i:</p>

        {!resendSent ? (
          <div className="space-y-2">
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="Nháº­p email cá»§a báº¡n"
              className="input"
            />
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || !resendEmail}
              className="btn-primary w-full py-2.5 text-sm"
            >
              {resendLoading ? 'Äang gá»­i...' : 'Gá»­i láº¡i email xÃ¡c thá»±c'}
            </button>
          </div>
        ) : (
          <p className="rounded-lg bg-brand-50 p-3 text-sm text-brand">
            ÄÃ£ gá»­i láº¡i! Kiá»ƒm tra há»™p thÆ° cá»§a báº¡n.
          </p>
        )}

        <div className="mt-5">
          <Link href="/login" className="text-sm text-gray-500 hover:text-brand">
            Quay láº¡i Ä‘Äƒng nháº­p â†’
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
        <h1 className="mb-2 text-xl font-bold text-gray-900">Äang xÃ¡c thá»±c...</h1>
        <p className="text-sm text-gray-400">Vui lÃ²ng chá» trong giÃ¢y lÃ¡t.</p>
      </>
    )
  }

  if (status === 'success') {
    return (
      <>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50">
          <CheckCircleIcon className="h-8 w-8 text-brand" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-gray-900">Email Ä‘Ã£ Ä‘Æ°á»£c xÃ¡c thá»±c!</h1>
        <p className="mb-6 text-sm text-gray-500">
          TÃ i khoáº£n cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c kÃ­ch hoáº¡t. Báº¡n cÃ³ thá»ƒ Ä‘Äƒng nháº­p ngay bÃ¢y giá».
        </p>
        <Link href="/login" className="btn-primary px-8 py-2.5 text-sm">
          ÄÄƒng nháº­p
        </Link>
      </>
    )
  }

  return (
    <>
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <XCircleIcon className="h-8 w-8 text-red-500" />
      </div>
      <h1 className="mb-2 text-xl font-bold text-gray-900">XÃ¡c thá»±c tháº¥t báº¡i</h1>
      <p className="mb-6 text-sm text-gray-500">{errorMsg}</p>
      <Link href="/forgot-password" className="btn-primary px-6 py-2.5 text-sm">
        YÃªu cáº§u gá»­i láº¡i
      </Link>
    </>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-md">
      <div className="card p-8 text-center">
        <Suspense fallback={<div className="py-8 text-sm text-gray-400">Äang táº£i...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  )
}

