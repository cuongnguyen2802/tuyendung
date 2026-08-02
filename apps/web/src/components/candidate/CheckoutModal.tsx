'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  XIcon, ShieldCheckIcon, LockIcon, CreditCardIcon,
  SmartphoneIcon, BuildingIcon, ChevronDownIcon,
  ZapIcon, CrownIcon,
} from 'lucide-react'
import { api } from '@/lib/api'
import { UserPlan } from '@tuyendung/types'

// ── Validation helpers ────────────────────────────────────────────────────────

function luhn(raw: string): boolean {
  const digits = raw.split('').reverse().map(Number)
  const sum = digits.reduce((acc, d, i) => {
    if (i % 2 !== 0) { d *= 2; if (d > 9) d -= 9 }
    return acc + d
  }, 0)
  return sum % 10 === 0
}

function validExpiry(val: string): boolean {
  const [mm, yy] = val.split('/')
  if (!mm || !yy || mm.length !== 2 || yy.length !== 2) return false
  const month = parseInt(mm, 10)
  if (month < 1 || month > 12) return false
  const exp = new Date(2000 + parseInt(yy, 10), month - 1, 1)
  const now = new Date()
  return exp >= new Date(now.getFullYear(), now.getMonth(), 1)
}

function hasFullName(name: string): boolean {
  return name.trim().split(/\s+/).length >= 2
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BANKS = [
  'Vietcombank', 'VietinBank', 'BIDV', 'Agribank', 'Techcombank',
  'MB Bank', 'ACB', 'Sacombank', 'TPBank', 'VPBank', 'HDBank', 'SHB',
]

const WALLETS = [
  { id: 'momo',    name: 'MoMo',    activeCls: 'border-pink-400 bg-pink-50 text-pink-600' },
  { id: 'zalopay', name: 'ZaloPay', activeCls: 'border-blue-400 bg-blue-50 text-blue-600' },
  { id: 'vnpay',   name: 'VNPay',   activeCls: 'border-red-400  bg-red-50  text-red-600'  },
]

const DURATIONS = [
  { months: 1,  label: '1 tháng', discount: 0  },
  { months: 3,  label: '3 tháng', discount: 10, badge: '-10%' },
  { months: 6,  label: '6 tháng', discount: 20, badge: '-20%' },
  { months: 12, label: '1 năm',   discount: 30, badge: '-30%' },
]

const METHODS = [
  { id: 'card',     label: 'Visa/Master',  Icon: CreditCardIcon },
  { id: 'atm',      label: 'Thẻ ATM',      Icon: CreditCardIcon },
  { id: 'wallet',   label: 'Ví điện tử',   Icon: SmartphoneIcon },
  { id: 'transfer', label: 'Chuyển khoản', Icon: BuildingIcon   },
] as const

type MethodId = typeof METHODS[number]['id']

// ── Types ─────────────────────────────────────────────────────────────────────

interface PlanInfo { id: 'PRO' | 'PREMIUM'; name: string; price: number }
interface Props { plan: PlanInfo; onClose: () => void; onSuccess: (plan: UserPlan) => void; upgradeEndpoint?: string }
type Errors = Record<string, string>

function fmt(n: number) { return n.toLocaleString('vi-VN') }

// ── Field component ───────────────────────────────────────────────────────────

function Field({
  label, value, onChange, placeholder, type = 'text', error, className = '',
}: {
  label: string; value: string; onChange: (v: string) => void
  placeholder: string; type?: string; error?: string; className?: string
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-semibold text-gray-600">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm transition focus:outline-none focus:ring-1 ${
          error
            ? 'border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-200'
            : 'border-gray-200 focus:border-brand focus:ring-brand/20'
        }`}
      />
      {error && <p className="mt-1 text-[11px] text-red-500">{error}</p>}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function CheckoutModal({ plan, onClose, onSuccess, upgradeEndpoint = '/users/me/upgrade' }: Props) {
  const queryClient = useQueryClient()
  const [duration, setDuration] = useState(DURATIONS[0])
  const [method, setMethod]     = useState<MethodId>('card')
  const [wallet, setWallet]     = useState('momo')
  const [bank, setBank]         = useState(BANKS[0])
  const [attempted, setAttempted] = useState(false)

  // Card fields
  const [cardNum,  setCardNum]  = useState('')
  const [cardName, setCardName] = useState('')
  const [expiry,   setExpiry]   = useState('')
  const [cvv,      setCvv]      = useState('')

  // ATM fields
  const [atmNum,  setAtmNum]  = useState('')
  const [atmName, setAtmName] = useState('')

  // Reset validation state when switching payment method
  const switchMethod = (id: MethodId) => {
    setMethod(id)
    setAttempted(false)
  }

  // Price calc
  const unitPrice = Math.round(plan.price * (1 - duration.discount / 100))
  const subtotal  = unitPrice * duration.months
  const discount  = plan.price * duration.months - subtotal
  const vat       = Math.round(subtotal * 0.08)
  const total     = subtotal + vat

  // Derive errors from current field state (computed, not stored)
  const errors: Errors = useMemo(() => {
    if (!attempted) return {}
    const e: Errors = {}

    if (method === 'card') {
      const raw = cardNum.replace(/\s/g, '')
      if (!raw)              e.cardNum = 'Vui lòng nhập số thẻ'
      else if (raw.length !== 16) e.cardNum = 'Số thẻ phải có 16 chữ số'
      else if (!luhn(raw))   e.cardNum = 'Số thẻ không hợp lệ'

      if (!cardName.trim())           e.cardName = 'Vui lòng nhập tên chủ thẻ'
      else if (!hasFullName(cardName)) e.cardName = 'Vui lòng nhập đầy đủ họ và tên'

      if (!expiry)                 e.expiry = 'Vui lòng nhập ngày hết hạn'
      else if (!validExpiry(expiry)) e.expiry = 'Ngày hết hạn không hợp lệ hoặc đã hết hạn'

      if (!cvv)            e.cvv = 'Vui lòng nhập CVV'
      else if (cvv.length < 3) e.cvv = 'CVV phải có ít nhất 3 chữ số'
    }

    if (method === 'atm') {
      const raw = atmNum.replace(/\s/g, '')
      if (!raw)                              e.atmNum = 'Vui lòng nhập số thẻ ATM'
      else if (raw.length < 9 || raw.length > 19) e.atmNum = 'Số thẻ ATM không hợp lệ (9–19 chữ số)'

      if (!atmName.trim())            e.atmName = 'Vui lòng nhập tên chủ thẻ'
      else if (!hasFullName(atmName))  e.atmName = 'Vui lòng nhập đầy đủ họ và tên'
    }

    return e
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempted, method, cardNum, cardName, expiry, cvv, atmNum, atmName])

  const hasErrors = Object.keys(errors).length > 0

  const mutation = useMutation({
    mutationFn: () => api.post(upgradeEndpoint, { plan: plan.id, months: duration.months }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-plan'] })
      queryClient.invalidateQueries({ queryKey: ['candidate-sidebar-stats'] })
      onSuccess(plan.id as UserPlan)
    },
  })

  const handleSubmit = () => {
    // wallet & transfer need no field validation
    if (method === 'wallet' || method === 'transfer') {
      mutation.mutate()
      return
    }
    setAttempted(true)
    // Re-check synchronously before submitting (useMemo hasn't re-run yet)
    const e: Errors = {}
    if (method === 'card') {
      const raw = cardNum.replace(/\s/g, '')
      if (!raw || raw.length !== 16 || !luhn(raw)) e.cardNum = 'x'
      if (!cardName.trim() || !hasFullName(cardName)) e.cardName = 'x'
      if (!expiry || !validExpiry(expiry)) e.expiry = 'x'
      if (!cvv || cvv.length < 3) e.cvv = 'x'
    }
    if (method === 'atm') {
      const raw = atmNum.replace(/\s/g, '')
      if (!raw || raw.length < 9 || raw.length > 19) e.atmNum = 'x'
      if (!atmName.trim() || !hasFullName(atmName)) e.atmName = 'x'
    }
    if (Object.keys(e).length > 0) return
    mutation.mutate()
  }

  // Close on Escape
  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !mutation.isPending) onClose()
  }, [mutation.isPending, onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [handleEsc])

  const planCls = plan.id === 'PRO'
    ? { Icon: ZapIcon,   iconBg: 'bg-blue-600', border: 'border-blue-200',  btn: 'bg-blue-600 hover:bg-blue-700' }
    : { Icon: CrownIcon, iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500', border: 'border-amber-200', btn: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90' }

  const PlanIcon = planCls.Icon

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !mutation.isPending) onClose() }}
    >
      <div className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <LockIcon className="h-4 w-4 text-green-600" />
            <span className="font-bold text-gray-900">Xác nhận thanh toán</span>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">SSL</span>
          </div>
          <button
            onClick={onClose}
            disabled={mutation.isPending}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-40"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex max-h-[75vh] overflow-y-auto">

          {/* ── Left: Order summary ── */}
          <div className="w-56 shrink-0 border-r border-gray-100 bg-gray-50/70 p-5">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Đơn hàng</p>

            <div className={`mb-4 rounded-xl border p-3 ${planCls.border} bg-white`}>
              <div className="flex items-center gap-2.5">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${planCls.iconBg}`}>
                  <PlanIcon className="h-[18px] w-[18px] text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Gói {plan.name}</p>
                  <p className="text-xs text-gray-500">{duration.label}</p>
                </div>
              </div>
            </div>

            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">Thời hạn</p>
            <div className="mb-4 grid grid-cols-2 gap-1.5">
              {DURATIONS.map((d) => (
                <button
                  key={d.months}
                  onClick={() => setDuration(d)}
                  className={`relative rounded-lg border py-2 text-center text-xs font-medium transition ${
                    duration.months === d.months
                      ? 'border-brand bg-brand/5 font-semibold text-brand'
                      : 'border-gray-200 text-gray-500 hover:border-brand/40'
                  }`}
                >
                  {d.label}
                  {d.badge && (
                    <span className="absolute -right-1 -top-1.5 rounded-full bg-green-500 px-1 py-px text-[9px] font-bold leading-tight text-white">
                      {d.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-2 border-t border-gray-200 pt-3 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>{fmt(unitPrice)}đ × {duration.months}</span>
                <span>{fmt(subtotal)}đ</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Tiết kiệm</span>
                  <span>-{fmt(discount)}đ</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>VAT (8%)</span>
                <span>{fmt(vat)}đ</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-bold">
                <span className="text-gray-900">Tổng</span>
                <span className="text-brand">{fmt(total)}đ</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-green-50 px-2.5 py-2">
              <ShieldCheckIcon className="h-3.5 w-3.5 shrink-0 text-green-600" />
              <p className="text-[10px] text-green-700">Mã hóa SSL 256-bit</p>
            </div>
          </div>

          {/* ── Right: Payment form ── */}
          <div className="flex-1 p-5">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">Phương thức thanh toán</p>

            <div className="mb-5 grid grid-cols-4 gap-1.5">
              {METHODS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => switchMethod(id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 text-center transition ${
                    method === id
                      ? 'border-brand bg-brand/5 text-brand'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] font-semibold leading-tight">{label}</span>
                </button>
              ))}
            </div>

            {/* ── Visa / Mastercard ── */}
            {method === 'card' && (
              <div className="space-y-3">
                <Field
                  label="Số thẻ"
                  value={cardNum}
                  placeholder="0000 0000 0000 0000"
                  error={errors.cardNum}
                  onChange={(v) => setCardNum(v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19))}
                />
                <Field
                  label="Tên chủ thẻ"
                  value={cardName}
                  placeholder="NGUYEN VAN A"
                  error={errors.cardName}
                  onChange={(v) => setCardName(v.toUpperCase().replace(/[^A-Z\s]/g, ''))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Ngày hết hạn"
                    value={expiry}
                    placeholder="MM/YY"
                    error={errors.expiry}
                    onChange={(v) => {
                      const d = v.replace(/\D/g, '').slice(0, 4)
                      setExpiry(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d)
                    }}
                  />
                  <Field
                    label="CVV"
                    value={cvv}
                    placeholder="•••"
                    type="password"
                    error={errors.cvv}
                    onChange={(v) => setCvv(v.replace(/\D/g, '').slice(0, 4))}
                  />
                </div>
                <p className="flex items-center gap-1 text-[11px] text-gray-400">
                  <ShieldCheckIcon className="h-3 w-3 text-green-500" />
                  Thông tin thẻ được mã hóa, không lưu trữ
                </p>
              </div>
            )}

            {/* ── ATM ── */}
            {method === 'atm' && (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">Ngân hàng</label>
                  <div className="relative">
                    <select
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm focus:border-brand focus:outline-none"
                    >
                      {BANKS.map((b) => <option key={b}>{b}</option>)}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <Field
                  label="Số tài khoản / Số thẻ ATM"
                  value={atmNum}
                  placeholder="0000 0000 0000 0000"
                  error={errors.atmNum}
                  onChange={(v) => setAtmNum(v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19))}
                />
                <Field
                  label="Tên chủ thẻ"
                  value={atmName}
                  placeholder="NGUYEN VAN A"
                  error={errors.atmName}
                  onChange={(v) => setAtmName(v.toUpperCase().replace(/[^A-Z\s]/g, ''))}
                />
              </div>
            )}

            {/* ── Ví điện tử ── */}
            {method === 'wallet' && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-600">Chọn ví</p>
                <div className="grid grid-cols-3 gap-2">
                  {WALLETS.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setWallet(w.id)}
                      className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
                        wallet === w.id ? w.activeCls : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {w.name}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50 py-5">
                  <div className="h-28 w-28 rounded-xl bg-white p-1.5 shadow-md">
                    <svg viewBox="0 0 10 10" className="h-full w-full" shapeRendering="crispEdges">
                      {[0,1,2,3,4,5,6,7,8,9].map(r =>
                        [0,1,2,3,4,5,6,7,8,9].map(c =>
                          ((r + c * 3 + r * c) % 3 === 0 || (r < 3 && c < 3) || (r < 3 && c > 6) || (r > 6 && c < 3))
                            ? <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#111" />
                            : null
                        )
                      )}
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-gray-500">
                    Mở app <strong>{WALLETS.find(w2 => w2.id === wallet)?.name}</strong> → Quét mã
                  </p>
                  <p className="text-[11px] text-gray-400">Mã có hiệu lực trong <strong>15 phút</strong></p>
                </div>
              </div>
            )}

            {/* ── Chuyển khoản ── */}
            {method === 'transfer' && (
              <div className="space-y-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="grid grid-cols-[90px_1fr] gap-y-3 text-xs">
                    {([
                      ['Ngân hàng',   'Vietcombank (VCB)',            null],
                      ['Số TK',       '0071 0001 2345 6789',          '0071000123456789'],
                      ['Chủ TK',      'CONG TY TNHH TUYEN DUNG',     null],
                      ['Nội dung CK', `NANGCAP ${plan.id} ${duration.months}T`, `NANGCAP ${plan.id} ${duration.months}T`],
                      ['Số tiền',     `${fmt(total)}đ`,               String(total)],
                    ] as [string, string, string | null][]).map(([k, v, copy]) => (
                      <>
                        <span key={`k-${k}`} className="font-semibold text-gray-400">{k}</span>
                        <span key={`v-${k}`} className="flex items-center gap-2 font-medium text-gray-800">
                          {v}
                          {copy && (
                            <button
                              onClick={() => navigator.clipboard.writeText(copy)}
                              className="rounded bg-gray-200 px-1.5 py-px text-[10px] text-gray-600 hover:bg-brand hover:text-white"
                            >
                              Copy
                            </button>
                          )}
                        </span>
                      </>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-700">
                  ⚠️ Tài khoản được kích hoạt trong vòng <strong>30 phút</strong> sau khi chuyển khoản thành công. Vui lòng ghi đúng nội dung chuyển khoản.
                </div>
              </div>
            )}

            {/* API error */}
            {mutation.isError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {(mutation.error as Error).message}
              </div>
            )}

            {/* Validation summary (first submit attempt) */}
            {attempted && hasErrors && !mutation.isError && (
              <p className="mt-3 text-xs text-red-500">
                Vui lòng kiểm tra lại thông tin thanh toán bên trên.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-white px-6 py-4">
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className={`w-full rounded-xl py-3.5 text-sm font-bold text-white transition active:scale-[0.99] disabled:opacity-60 ${planCls.btn}`}
          >
            {mutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Đang xử lý...
              </span>
            ) : method === 'transfer' ? (
              'Tôi đã chuyển khoản — Xác nhận'
            ) : (
              <span className="flex items-center justify-center gap-2">
                <LockIcon className="h-4 w-4" />
                Thanh toán {fmt(total)}đ
              </span>
            )}
          </button>
          <p className="mt-2 text-center text-[11px] text-gray-400">
            Bằng việc thanh toán, bạn đồng ý với{' '}
            <span className="cursor-pointer text-brand hover:underline">Điều khoản dịch vụ</span>
            {' '}và{' '}
            <span className="cursor-pointer text-brand hover:underline">Chính sách bảo mật</span>
          </p>
        </div>
      </div>
    </div>
  )
}
