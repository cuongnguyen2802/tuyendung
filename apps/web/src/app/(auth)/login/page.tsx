'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { signIn, useSession, getProviders } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { EyeIcon, EyeOffIcon, Loader2Icon, ArrowRightIcon } from 'lucide-react'

const schema = z.object({
  email:    z.string().email('Email khÃ´ng há»£p lá»‡'),
  password: z.string().min(1, 'Vui lÃ²ng nháº­p máº­t kháº©u'),
})
type FormData = z.infer<typeof schema>

function getDashboard(role?: string) {
  if (role === 'EMPLOYER') return '/employer/dashboard'
  if (role === 'ADMIN') return '/admin/dashboard'
  return '/dashboard'
}

function LoginContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [error, setError]         = useState('')
  const [loggedIn, setLoggedIn]   = useState(false)
  const [showPw, setShowPw]       = useState(false)
  const [socialMsg, setSocialMsg] = useState('')
  const [enabledProviders, setEnabledProviders] = useState<Set<string>>(new Set())

  const registered = searchParams.get('registered')
  const authError  = searchParams.get('error')

  useEffect(() => {
    getProviders().then(p => {
      setEnabledProviders(new Set(Object.keys(p ?? {})))
    })
  }, [])

  useEffect(() => {
    if (authError) {
      setError('ÄÄƒng nháº­p báº±ng máº¡ng xÃ£ há»™i tháº¥t báº¡i. Vui lÃ²ng thá»­ láº¡i hoáº·c dÃ¹ng email.')
    }
  }, [authError])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (loggedIn && status === 'authenticated' && session?.user?.role) {
      router.push(getDashboard(session.user.role))
    }
  }, [loggedIn, status, session, router])

  useEffect(() => {
    const hasError = !!(session as any)?.error
    if (status === 'authenticated' && session?.user?.role && !loggedIn && !hasError) {
      router.replace(getDashboard(session.user.role))
    }
  }, [status, session, loggedIn, router])

  const onSubmit = async (data: FormData) => {
    setError('')
    const res = await signIn('credentials', { ...data, redirect: false })
    if (res?.error) {
      setError(
        res.error === 'SERVER_UNAVAILABLE'
          ? 'MÃ¡y chá»§ Ä‘ang khá»Ÿi Ä‘á»™ng, vui lÃ²ng thá»­ láº¡i sau vÃ i giÃ¢y.'
          : 'Email hoáº·c máº­t kháº©u khÃ´ng Ä‘Ãºng.',
      )
      return
    }
    setLoggedIn(true)
  }

  function handleOAuth(provider: string, label: string) {
    if (!enabledProviders.has(provider)) {
      setSocialMsg(`ÄÄƒng nháº­p báº±ng ${label} chÆ°a Ä‘Æ°á»£c cáº¥u hÃ¬nh trÃªn há»‡ thá»‘ng.`)
      return
    }
    setSocialMsg('')
    signIn(provider, { callbackUrl: '/login' })
  }

  if (loggedIn && status !== 'authenticated') {
    return (
      <div className="flex min-h-[260px] items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="rounded-2xl bg-white px-8 py-9 shadow-xl ring-1 ring-gray-100">

        {/* Title */}
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          ÄÄƒng nháº­p{' '}
          <span className="text-brand">TuyenDung</span>
          <span className="text-gray-900">.vn</span>
        </h1>

        {registered && (
          <div className="mb-4 rounded-lg bg-brand-50 border border-brand/30 p-3 text-center text-sm font-medium text-brand">
            Táº¡o tÃ i khoáº£n thÃ nh cÃ´ng! ÄÄƒng nháº­p ngay.
          </div>
        )}

        {/* Social buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleOAuth('google', 'Google')}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            <GoogleIcon />
            ÄÄƒng nháº­p báº±ng Google
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuth('facebook', 'Facebook')}
              className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <FacebookIcon />
              Facebook
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('linkedin', 'LinkedIn')}
              className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <LinkedInIcon />
              Linkedin
            </button>
          </div>
        </div>

        {socialMsg && (
          <p className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-center text-xs text-amber-700">
            {socialMsg}
          </p>
        )}

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-xs text-gray-400">Hoáº·c Ä‘Äƒng nháº­p báº±ng email</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="Nháº­p email cá»§a báº¡n"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">Máº­t kháº©u</label>
              <Link href="/forgot-password" className="text-sm font-semibold text-brand hover:underline">
                QuÃªn máº­t kháº©u
              </Link>
            </div>
            <div className="relative">
              <input
                {...register('password')}
                type={showPw ? 'text' : 'password'}
                placeholder="Nháº­p máº­t kháº©u"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-11 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-brand py-3.5 text-sm font-bold text-white shadow-sm hover:bg-brand disabled:opacity-60 transition"
          >
            {isSubmitting ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <>ÄÄƒng nháº­p <ArrowRightIcon className="h-4 w-4" /></>
            )}
          </button>
        </form>

        {/* Register link */}
        <p className="mt-5 text-center text-sm text-gray-500">
          Báº¡n chÆ°a cÃ³ tÃ i khoáº£n?{' '}
          <Link href="/register" className="font-semibold text-brand hover:underline">
            ÄÄƒng kÃ½ ngay
          </Link>
        </p>
      </div>

      {/* Helpline */}
      <p className="mt-4 text-center text-xs text-gray-400 px-2">
        Báº¡n gáº·p khÃ³ khÄƒn khi táº¡o tÃ i khoáº£n? Vui lÃ²ng gá»i tá»›i sá»‘{' '}
        <span className="font-semibold text-brand">1900 068 889</span>
        {' | '}
        <span className="font-semibold text-brand">NhÃ¡nh 2</span>
        {' '}(giá» hÃ nh chÃ­nh).
      </p>
    </div>
  )
}

// â”€â”€ Social icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}

