'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import {
  LockIcon, UserIcon, FileTextIcon, ShieldIcon, BuildingIcon,
  BriefcaseIcon, RefreshCwIcon, SettingsIcon, CameraIcon,
  EyeIcon, EyeOffIcon, CheckCircleIcon, UploadIcon, BellIcon,
} from 'lucide-react'
import { toast } from 'sonner'

// â”€â”€ Nav items â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const NAV = [
  { key: 'account',       label: 'ThÃ´ng tin tÃ i khoáº£n',               icon: UserIcon,      href: null },
  { key: 'password',      label: 'Äá»•i máº­t kháº©u',                      icon: LockIcon,      href: null },
  { key: 'documents',     label: 'Giáº¥y Ä‘Äƒng kÃ½ doanh nghiá»‡p',         icon: FileTextIcon,  href: null },
  { key: 'pdpa',          label: 'VÄƒn báº£n xá»­ lÃ½ Dá»¯ liá»‡u cÃ¡ nhÃ¢n',     icon: ShieldIcon,    href: null },
  { key: 'company',       label: 'ThÃ´ng tin cÃ´ng ty',                  icon: BuildingIcon,  href: '/employer/company' },
  { key: 'recruitment',   label: 'Nhu cáº§u tuyá»ƒn dá»¥ng',                 icon: BriefcaseIcon, href: null },
  { key: 'notifications', label: 'CÃ i Ä‘áº·t thÃ´ng bÃ¡o',                  icon: BellIcon,      href: null },
  { key: 'general',       label: 'CÃ i Ä‘áº·t',                            icon: SettingsIcon,  href: null },
]

// â”€â”€ Shared input helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PasswordInput({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className="input pr-10"
          placeholder={placeholder ?? 'â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢'}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

// â”€â”€ Sections â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function AccountSection() {
  const { data: session } = useSession()
  const qc = useQueryClient()

  const { data: company, isLoading } = useQuery<{
    companyName: string; phone?: string; logoUrl?: string; verified: boolean; taxCode?: string
  }>({
    queryKey: ['my-company'],
    queryFn: () => api.get('/employers/me/company'),
  })

  const [form, setForm] = useState({ companyName: '', phone: '' })
  const [initialized, setInitialized] = useState(false)
  if (company && !initialized) {
    setForm({ companyName: company.companyName, phone: company.phone ?? '' })
    setInitialized(true)
  }

  const fileRef = useRef<HTMLInputElement>(null)

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put('/employers/me/company', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-company'] }); toast.success('ÄÃ£ cáº­p nháº­t thÃ´ng tin') },
    onError: () => toast.error('CÃ³ lá»—i xáº£y ra'),
  })

  const avatarMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData(); fd.append('file', file)
      return api.postForm('/employers/me/upload-logo', fd)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-company'] }); toast.success('ÄÃ£ cáº­p nháº­t áº£nh Ä‘áº¡i diá»‡n') },
    onError: () => toast.error('Upload tháº¥t báº¡i'),
  })

  // Verification level
  const level = [
    company?.verified,
    !!session?.user?.email,
    !!(company?.taxCode),
  ].filter(Boolean).length

  return (
    <div className="space-y-5">
      {/* Verification level card */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">
              TÃ i khoáº£n xÃ¡c thá»±c:{' '}
              <span className="text-brand">Cáº¥p {level}/3</span>
            </p>
            <p className="mt-0.5 text-sm text-gray-500">
              {level < 3
                ? `TÃ i khoáº£n Ä‘Ã£ Ä‘áº¡t cáº¥p ${level}/3. HoÃ n thiá»‡n thÃªm Ä‘á»ƒ tÄƒng uy tÃ­n.`
                : 'TÃ i khoáº£n Ä‘Ã£ Ä‘áº¡t cáº¥p 3/3.'}
            </p>
          </div>
          <a href="#" className="rounded-xl border border-brand px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand/5">
            TÃ¬m hiá»ƒu thÃªm
          </a>
        </div>

        {/* Level steps */}
        <div className="mt-4 flex items-center gap-0">
          {[
            { label: 'XÃ¡c thá»±c email', done: !!session?.user?.email },
            { label: 'XÃ¡c minh cÃ´ng ty', done: !!company?.verified },
            { label: 'Cung cáº¥p mÃ£ sá»‘ thuáº¿', done: !!company?.taxCode },
          ].map((step, i) => (
            <div key={step.label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                  step.done ? 'bg-brand text-white' : 'bg-gray-100 text-gray-400',
                )}>
                  {step.done ? <CheckCircleIcon className="h-4 w-4" /> : i + 1}
                </div>
                <span className="text-[10px] text-gray-500 text-center whitespace-nowrap">{step.label}</span>
              </div>
              {i < 2 && (
                <div className={cn('h-0.5 flex-1 mx-1', step.done ? 'bg-brand/40' : 'bg-gray-200')} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Update form */}
      <div className="card p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Cáº­p nháº­t thÃ´ng tin tÃ i khoáº£n</h2>
          <button
            onClick={() => toast.info('TÃ­nh nÄƒng xuáº¥t dá»¯ liá»‡u sáº½ sá»›m ra máº¯t')}
            className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition hover:border-gray-300 hover:bg-gray-50"
          >
            Xuáº¥t dá»¯ liá»‡u
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />)}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Avatar row */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
                  {company?.logoUrl ? (
                    <img src={company.logoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-brand/10 text-xl font-bold text-brand">
                      {company?.companyName?.[0]?.toUpperCase() ?? 'E'}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white shadow-sm"
                >
                  <CameraIcon className="h-3 w-3" />
                </button>
                <input
                  ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) avatarMutation.mutate(f)
                  }}
                />
              </div>
              <div>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  {avatarMutation.isPending ? 'Äang táº£i...' : 'Äá»•i avatar'}
                </button>
                <p className="mt-1 text-xs text-gray-400">JPG, PNG, WebP â€¢ Tá»‘i Ä‘a 5MB</p>
              </div>

              {/* Email */}
              <div className="ml-auto text-sm text-gray-600">
                Email: <span className="font-medium text-gray-900">{session?.user?.email}</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Há» vÃ  tÃªn (Ä‘áº¡i diá»‡n)</label>
                <input
                  className="input"
                  value={form.companyName}
                  onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Sá»‘ Ä‘iá»‡n thoáº¡i</label>
                <div className="relative">
                  <input
                    className="input pr-28"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="0xxx xxx xxx"
                  />
                  {company?.phone && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-brand">
                      <CheckCircleIcon className="h-3.5 w-3.5" /> ÄÃ£ xÃ¡c thá»±c
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => updateMutation.mutate(form)}
                disabled={updateMutation.isPending}
                className="btn-primary"
              >
                {updateMutation.isPending ? 'Äang lÆ°u...' : 'LÆ°u thay Ä‘á»•i'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PasswordSection() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const mutation = useMutation({
    mutationFn: () => api.put('/auth/change-password', {
      currentPassword: form.current,
      newPassword: form.next,
    }),
    onSuccess: () => {
      toast.success('ÄÃ£ Ä‘á»•i máº­t kháº©u thÃ nh cÃ´ng')
      setForm({ current: '', next: '', confirm: '' })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'CÃ³ lá»—i xáº£y ra'
      toast.error(msg)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.current) errs.current = 'Nháº­p máº­t kháº©u hiá»‡n táº¡i'
    if (form.next.length < 8) errs.next = 'Máº­t kháº©u má»›i pháº£i tá»« 8 kÃ½ tá»±'
    if (form.next !== form.confirm) errs.confirm = 'XÃ¡c nháº­n máº­t kháº©u khÃ´ng khá»›p'
    setErrors(errs)
    if (Object.keys(errs).length === 0) mutation.mutate()
  }

  return (
    <div className="card max-w-lg p-6">
      <h2 className="mb-5 font-semibold text-gray-900">Äá»•i máº­t kháº©u</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <PasswordInput label="Máº­t kháº©u hiá»‡n táº¡i" value={form.current} onChange={v => setForm(f => ({ ...f, current: v }))} />
          {errors.current && <p className="mt-1 text-xs text-red-500">{errors.current}</p>}
        </div>
        <div>
          <PasswordInput label="Máº­t kháº©u má»›i" value={form.next} onChange={v => setForm(f => ({ ...f, next: v }))} placeholder="Tá»‘i thiá»ƒu 8 kÃ½ tá»±" />
          {errors.next && <p className="mt-1 text-xs text-red-500">{errors.next}</p>}
        </div>
        <div>
          <PasswordInput label="XÃ¡c nháº­n máº­t kháº©u má»›i" value={form.confirm} onChange={v => setForm(f => ({ ...f, confirm: v }))} />
          {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm}</p>}
        </div>

        {/* Strength indicator */}
        {form.next && (
          <div>
            <div className="mb-1 flex gap-1">
              {[1, 2, 3, 4].map(i => {
                const strength = Math.min(4, Math.floor(form.next.length / 3) + (form.next.match(/[A-Z]/) ? 1 : 0) + (form.next.match(/[0-9]/) ? 1 : 0) + (form.next.match(/[^a-zA-Z0-9]/) ? 1 : 0))
                return (
                  <div key={i} className={cn('h-1 flex-1 rounded-full', i <= strength ? (strength >= 4 ? 'bg-brand' : strength >= 3 ? 'bg-yellow-500' : 'bg-red-400') : 'bg-gray-200')} />
                )
              })}
            </div>
            <p className="text-xs text-gray-400">Máº­t kháº©u máº¡nh hÆ¡n khi káº¿t há»£p chá»¯ hoa, sá»‘ vÃ  kÃ½ tá»± Ä‘áº·c biá»‡t</p>
          </div>
        )}

        <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
          {mutation.isPending ? 'Äang cáº­p nháº­t...' : 'Cáº­p nháº­t máº­t kháº©u'}
        </button>
      </form>
    </div>
  )
}

function DocumentsSection() {
  return (
    <div className="card p-6 max-w-2xl">
      <h2 className="mb-1 font-semibold text-gray-900">Giáº¥y Ä‘Äƒng kÃ½ doanh nghiá»‡p</h2>
      <p className="mb-5 text-sm text-gray-500">
        Táº£i lÃªn giáº¥y Ä‘Äƒng kÃ½ doanh nghiá»‡p Ä‘á»ƒ xÃ¡c minh tÃ i khoáº£n vÃ  tÄƒng Ä‘á»™ tin cáº­y vá»›i á»©ng viÃªn.
      </p>

      {/* Upload zone */}
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-10 text-center transition hover:border-brand/40 hover:bg-brand/3 cursor-pointer"
        onClick={() => toast.info('TÃ­nh nÄƒng táº£i lÃªn tÃ i liá»‡u sáº½ sá»›m ra máº¯t')}>
        <UploadIcon className="mb-3 h-8 w-8 text-gray-300" />
        <p className="font-medium text-gray-600">KÃ©o tháº£ file vÃ o Ä‘Ã¢y hoáº·c click Ä‘á»ƒ chá»n</p>
        <p className="mt-1 text-sm text-gray-400">PDF, JPG, PNG â€¢ Tá»‘i Ä‘a 10MB</p>
      </div>

      <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
        <p className="font-semibold">LÆ°u Ã½ quan trá»ng:</p>
        <ul className="mt-1 list-inside list-disc space-y-1 text-blue-600">
          <li>File pháº£i rÃµ nÃ©t, Ä‘áº§y Ä‘á»§ thÃ´ng tin</li>
          <li>Giáº¥y phÃ©p kinh doanh cÃ²n hiá»‡u lá»±c</li>
          <li>ThÃ´ng tin khá»›p vá»›i thÃ´ng tin Ä‘Äƒng kÃ½ tÃ i khoáº£n</li>
          <li>Thá»i gian xÃ©t duyá»‡t 1-3 ngÃ y lÃ m viá»‡c</li>
        </ul>
      </div>
    </div>
  )
}

function PDPASection() {
  const [agreed, setAgreed] = useState(false)
  return (
    <div className="card p-6 max-w-2xl">
      <h2 className="mb-1 font-semibold text-gray-900">VÄƒn báº£n xá»­ lÃ½ Dá»¯ liá»‡u cÃ¡ nhÃ¢n</h2>
      <p className="mb-5 text-sm text-gray-500">
        Theo Nghá»‹ Ä‘á»‹nh 13/2023/NÄ-CP vá» báº£o vá»‡ dá»¯ liá»‡u cÃ¡ nhÃ¢n
      </p>

      <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 p-4 text-sm text-gray-600 leading-relaxed space-y-3">
        <p className="font-semibold text-gray-800">THá»ŽA THUáº¬N Xá»¬ LÃ Dá»® LIá»†U CÃ NHÃ‚N</p>
        <p>TuyenDung.vn cam káº¿t báº£o vá»‡ thÃ´ng tin cÃ¡ nhÃ¢n cá»§a báº¡n theo Ä‘Ãºng quy Ä‘á»‹nh cá»§a phÃ¡p luáº­t Viá»‡t Nam, Ä‘áº·c biá»‡t lÃ  Nghá»‹ Ä‘á»‹nh 13/2023/NÄ-CP vá» Báº£o vá»‡ dá»¯ liá»‡u cÃ¡ nhÃ¢n.</p>
        <p><strong>1. Dá»¯ liá»‡u chÃºng tÃ´i thu tháº­p:</strong> ThÃ´ng tin Ä‘Äƒng kÃ½ tÃ i khoáº£n, thÃ´ng tin doanh nghiá»‡p, lá»‹ch sá»­ hoáº¡t Ä‘á»™ng trÃªn ná»n táº£ng.</p>
        <p><strong>2. Má»¥c Ä‘Ã­ch xá»­ lÃ½:</strong> Cung cáº¥p dá»‹ch vá»¥ tuyá»ƒn dá»¥ng, cáº£i thiá»‡n tráº£i nghiá»‡m ngÆ°á»i dÃ¹ng, tuÃ¢n thá»§ nghÄ©a vá»¥ phÃ¡p lÃ½.</p>
        <p><strong>3. Thá»i gian lÆ°u trá»¯:</strong> Dá»¯ liá»‡u Ä‘Æ°á»£c lÆ°u trá»¯ trong suá»‘t thá»i gian tÃ i khoáº£n hoáº¡t Ä‘á»™ng vÃ  tá»‘i Ä‘a 3 nÄƒm sau khi xÃ³a tÃ i khoáº£n.</p>
        <p><strong>4. Quyá»n cá»§a báº¡n:</strong> Báº¡n cÃ³ quyá»n truy cáº­p, chá»‰nh sá»­a, xÃ³a dá»¯ liá»‡u cÃ¡ nhÃ¢n vÃ  pháº£n Ä‘á»‘i viá»‡c xá»­ lÃ½ dá»¯ liá»‡u.</p>
        <p><strong>5. LiÃªn há»‡:</strong> Gá»­i email Ä‘áº¿n privacy@tuyendung.vn Ä‘á»ƒ thá»±c hiá»‡n cÃ¡c quyá»n liÃªn quan Ä‘áº¿n dá»¯ liá»‡u cÃ¡ nhÃ¢n.</p>
      </div>

      <div className="mt-4 flex items-start gap-3">
        <input type="checkbox" id="pdpa" checked={agreed} onChange={e => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand" />
        <label htmlFor="pdpa" className="text-sm text-gray-600 cursor-pointer">
          TÃ´i Ä‘Ã£ Ä‘á»c, hiá»ƒu vÃ  Ä‘á»“ng Ã½ vá»›i cÃ¡c Ä‘iá»u khoáº£n xá»­ lÃ½ dá»¯ liá»‡u cÃ¡ nhÃ¢n nÃªu trÃªn.
        </label>
      </div>

      <button
        onClick={() => agreed && toast.success('ÄÃ£ xÃ¡c nháº­n Ä‘á»“ng Ã½')}
        disabled={!agreed}
        className="btn-primary mt-4 disabled:opacity-50"
      >
        XÃ¡c nháº­n Ä‘á»“ng Ã½
      </button>
    </div>
  )
}

function RecruitmentNeedsSection() {
  const [form, setForm] = useState({
    positions: '', locations: '', industries: '', scale: '1-10',
  })

  return (
    <div className="card p-6 max-w-2xl">
      <h2 className="mb-1 font-semibold text-gray-900">Nhu cáº§u tuyá»ƒn dá»¥ng</h2>
      <p className="mb-5 text-sm text-gray-500">Cho chÃºng tÃ´i biáº¿t nhu cáº§u Ä‘á»ƒ gá»£i Ã½ á»©ng viÃªn phÃ¹ há»£p hÆ¡n</p>

      <div className="space-y-4">
        <div>
          <label className="label">Vá»‹ trÃ­ thÆ°á»ng tuyá»ƒn</label>
          <input className="input" placeholder="VD: Developer, Designer, Marketing..." value={form.positions}
            onChange={e => setForm(f => ({ ...f, positions: e.target.value }))} />
        </div>
        <div>
          <label className="label">Äá»‹a Ä‘iá»ƒm tuyá»ƒn dá»¥ng</label>
          <input className="input" placeholder="VD: HÃ  Ná»™i, TP.HCM, ÄÃ  Náºµng..." value={form.locations}
            onChange={e => setForm(f => ({ ...f, locations: e.target.value }))} />
        </div>
        <div>
          <label className="label">LÄ©nh vá»±c</label>
          <input className="input" placeholder="VD: CÃ´ng nghá»‡ thÃ´ng tin, TÃ i chÃ­nh..." value={form.industries}
            onChange={e => setForm(f => ({ ...f, industries: e.target.value }))} />
        </div>
        <div>
          <label className="label">Quy mÃ´ tuyá»ƒn dá»¥ng hÃ ng thÃ¡ng</label>
          <select className="input" value={form.scale} onChange={e => setForm(f => ({ ...f, scale: e.target.value }))}>
            <option value="1-5">1-5 ngÆ°á»i</option>
            <option value="6-20">6-20 ngÆ°á»i</option>
            <option value="21-50">21-50 ngÆ°á»i</option>
            <option value="50+">TrÃªn 50 ngÆ°á»i</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button onClick={() => toast.success('ÄÃ£ lÆ°u nhu cáº§u tuyá»ƒn dá»¥ng')} className="btn-primary">
            LÆ°u thay Ä‘á»•i
          </button>
        </div>
      </div>
    </div>
  )
}

function NotificationsSection() {
  const [settings, setSettings] = useState({
    newApplication: true,
    statusUpdate: true,
    weeklyReport: false,
    promotions: false,
    systemAlerts: true,
  })

  const toggle = (key: keyof typeof settings) =>
    setSettings(s => ({ ...s, [key]: !s[key] }))

  const items = [
    { key: 'newApplication', label: 'á»¨ng viÃªn má»›i', desc: 'Khi cÃ³ á»©ng viÃªn ná»™p Ä‘Æ¡n vÃ o tin cá»§a báº¡n' },
    { key: 'statusUpdate', label: 'Cáº­p nháº­t tráº¡ng thÃ¡i', desc: 'Khi tráº¡ng thÃ¡i Ä‘Æ¡n á»©ng tuyá»ƒn thay Ä‘á»•i' },
    { key: 'weeklyReport', label: 'BÃ¡o cÃ¡o hÃ ng tuáº§n', desc: 'TÃ³m táº¯t hoáº¡t Ä‘á»™ng tuyá»ƒn dá»¥ng má»—i thá»© 2' },
    { key: 'promotions', label: 'Khuyáº¿n mÃ£i & tÃ­nh nÄƒng má»›i', desc: 'ThÃ´ng tin vá» gÃ³i dá»‹ch vá»¥ vÃ  tÃ­nh nÄƒng' },
    { key: 'systemAlerts', label: 'Cáº£nh bÃ¡o há»‡ thá»‘ng', desc: 'Báº£o máº­t, Ä‘Äƒng nháº­p láº¡, cáº­p nháº­t quan trá»ng' },
  ] as const

  return (
    <div className="card p-6 max-w-2xl">
      <h2 className="mb-1 font-semibold text-gray-900">CÃ i Ä‘áº·t thÃ´ng bÃ¡o</h2>
      <p className="mb-5 text-sm text-gray-500">Chá»n loáº¡i thÃ´ng bÃ¡o báº¡n muá»‘n nháº­n</p>

      <div className="divide-y divide-gray-100">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-gray-900">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors',
                settings[key] ? 'bg-brand' : 'bg-gray-200',
              )}
            >
              <span className={cn(
                'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
                settings[key] ? 'translate-x-5' : 'translate-x-0',
              )} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={() => toast.success('ÄÃ£ lÆ°u cÃ i Ä‘áº·t thÃ´ng bÃ¡o')} className="btn-primary">
          LÆ°u cÃ i Ä‘áº·t
        </button>
      </div>
    </div>
  )
}

function GeneralSection() {
  const [lang, setLang] = useState('vi')

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="card p-6">
        <h2 className="mb-4 font-semibold text-gray-900">Tuá»³ chá»n giao diá»‡n</h2>
        <div>
          <label className="label">NgÃ´n ngá»¯</label>
          <select className="input max-w-xs" value={lang} onChange={e => setLang(e.target.value)}>
            <option value="vi">Tiáº¿ng Viá»‡t</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-semibold text-red-600">VÃ¹ng nguy hiá»ƒm</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/50 p-4">
            <div>
              <p className="text-sm font-medium text-gray-900">XÃ³a tÃ i khoáº£n</p>
              <p className="text-xs text-gray-500">XÃ³a vÄ©nh viá»…n tÃ i khoáº£n vÃ  toÃ n bá»™ dá»¯ liá»‡u. KhÃ´ng thá»ƒ hoÃ n tÃ¡c.</p>
            </div>
            <button
              onClick={() => toast.error('Vui lÃ²ng liÃªn há»‡ support@tuyendung.vn Ä‘á»ƒ xÃ³a tÃ i khoáº£n')}
              className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              XÃ³a tÃ i khoáº£n
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  account:       AccountSection,
  password:      PasswordSection,
  documents:     DocumentsSection,
  pdpa:          PDPASection,
  recruitment:   RecruitmentNeedsSection,
  notifications: NotificationsSection,
  general:       GeneralSection,
}

function SettingsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = searchParams.get('tab') ?? 'account'

  const ActiveSection = SECTION_COMPONENTS[tab] ?? AccountSection

  return (
    <div className="flex gap-5 items-start">
      {/* Sub-navigation */}
      <nav className="w-60 shrink-0 rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {NAV.map(({ key, label, icon: Icon, href }) => {
          const active = key === tab && !href
          if (href) {
            return (
              <Link
                key={key}
                href={href}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium border-b border-gray-100 last:border-0 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
              >
                <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="truncate">{label}</span>
              </Link>
            )
          }
          return (
            <button
              key={key}
              onClick={() => router.push(`/employer/settings?tab=${key}`)}
              className={cn(
                'flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium transition border-b border-gray-100 last:border-0 text-left',
                active
                  ? 'bg-brand/5 font-semibold text-brand'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-brand' : 'text-gray-400')} />
              <span className="truncate">{label}</span>
            </button>
          )
        })}
      </nav>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <ActiveSection />
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">CÃ i Ä‘áº·t tÃ i khoáº£n</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-gray-100" />}>
        <SettingsContent />
      </Suspense>
    </div>
  )
}

