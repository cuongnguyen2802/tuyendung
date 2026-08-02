'use client'

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

// ── Nav items ─────────────────────────────────────────────────────────────────

const NAV = [
  { key: 'account',       label: 'Thông tin tài khoản',               icon: UserIcon,      href: null },
  { key: 'password',      label: 'Đổi mật khẩu',                      icon: LockIcon,      href: null },
  { key: 'documents',     label: 'Giấy đăng ký doanh nghiệp',         icon: FileTextIcon,  href: null },
  { key: 'pdpa',          label: 'Văn bản xử lý Dữ liệu cá nhân',     icon: ShieldIcon,    href: null },
  { key: 'company',       label: 'Thông tin công ty',                  icon: BuildingIcon,  href: '/employer/company' },
  { key: 'recruitment',   label: 'Nhu cầu tuyển dụng',                 icon: BriefcaseIcon, href: null },
  { key: 'notifications', label: 'Cài đặt thông báo',                  icon: BellIcon,      href: null },
  { key: 'general',       label: 'Cài đặt',                            icon: SettingsIcon,  href: null },
]

// ── Shared input helpers ───────────────────────────────────────────────────────

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
          placeholder={placeholder ?? '••••••••'}
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

// ── Sections ──────────────────────────────────────────────────────────────────

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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-company'] }); toast.success('Đã cập nhật thông tin') },
    onError: () => toast.error('Có lỗi xảy ra'),
  })

  const avatarMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData(); fd.append('file', file)
      return api.postForm('/employers/me/upload-logo', fd)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-company'] }); toast.success('Đã cập nhật ảnh đại diện') },
    onError: () => toast.error('Upload thất bại'),
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
              Tài khoản xác thực:{' '}
              <span className="text-brand">Cấp {level}/3</span>
            </p>
            <p className="mt-0.5 text-sm text-gray-500">
              {level < 3
                ? `Tài khoản đã đạt cấp ${level}/3. Hoàn thiện thêm để tăng uy tín.`
                : 'Tài khoản đã đạt cấp 3/3.'}
            </p>
          </div>
          <a href="#" className="rounded-xl border border-brand px-4 py-2 text-sm font-medium text-brand transition hover:bg-brand/5">
            Tìm hiểu thêm
          </a>
        </div>

        {/* Level steps */}
        <div className="mt-4 flex items-center gap-0">
          {[
            { label: 'Xác thực email', done: !!session?.user?.email },
            { label: 'Xác minh công ty', done: !!company?.verified },
            { label: 'Cung cấp mã số thuế', done: !!company?.taxCode },
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
          <h2 className="font-semibold text-gray-900">Cập nhật thông tin tài khoản</h2>
          <button
            onClick={() => toast.info('Tính năng xuất dữ liệu sẽ sớm ra mắt')}
            className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition hover:border-gray-300 hover:bg-gray-50"
          >
            Xuất dữ liệu
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
                  {avatarMutation.isPending ? 'Đang tải...' : 'Đổi avatar'}
                </button>
                <p className="mt-1 text-xs text-gray-400">JPG, PNG, WebP • Tối đa 5MB</p>
              </div>

              {/* Email */}
              <div className="ml-auto text-sm text-gray-600">
                Email: <span className="font-medium text-gray-900">{session?.user?.email}</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Họ và tên (đại diện)</label>
                <input
                  className="input"
                  value={form.companyName}
                  onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Số điện thoại</label>
                <div className="relative">
                  <input
                    className="input pr-28"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="0xxx xxx xxx"
                  />
                  {company?.phone && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-brand">
                      <CheckCircleIcon className="h-3.5 w-3.5" /> Đã xác thực
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
                {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
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
      toast.success('Đã đổi mật khẩu thành công')
      setForm({ current: '', next: '', confirm: '' })
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Có lỗi xảy ra'
      toast.error(msg)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!form.current) errs.current = 'Nhập mật khẩu hiện tại'
    if (form.next.length < 8) errs.next = 'Mật khẩu mới phải từ 8 ký tự'
    if (form.next !== form.confirm) errs.confirm = 'Xác nhận mật khẩu không khớp'
    setErrors(errs)
    if (Object.keys(errs).length === 0) mutation.mutate()
  }

  return (
    <div className="card max-w-lg p-6">
      <h2 className="mb-5 font-semibold text-gray-900">Đổi mật khẩu</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <PasswordInput label="Mật khẩu hiện tại" value={form.current} onChange={v => setForm(f => ({ ...f, current: v }))} />
          {errors.current && <p className="mt-1 text-xs text-red-500">{errors.current}</p>}
        </div>
        <div>
          <PasswordInput label="Mật khẩu mới" value={form.next} onChange={v => setForm(f => ({ ...f, next: v }))} placeholder="Tối thiểu 8 ký tự" />
          {errors.next && <p className="mt-1 text-xs text-red-500">{errors.next}</p>}
        </div>
        <div>
          <PasswordInput label="Xác nhận mật khẩu mới" value={form.confirm} onChange={v => setForm(f => ({ ...f, confirm: v }))} />
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
            <p className="text-xs text-gray-400">Mật khẩu mạnh hơn khi kết hợp chữ hoa, số và ký tự đặc biệt</p>
          </div>
        )}

        <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
          {mutation.isPending ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
        </button>
      </form>
    </div>
  )
}

function DocumentsSection() {
  return (
    <div className="card p-6 max-w-2xl">
      <h2 className="mb-1 font-semibold text-gray-900">Giấy đăng ký doanh nghiệp</h2>
      <p className="mb-5 text-sm text-gray-500">
        Tải lên giấy đăng ký doanh nghiệp để xác minh tài khoản và tăng độ tin cậy với ứng viên.
      </p>

      {/* Upload zone */}
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-10 text-center transition hover:border-brand/40 hover:bg-brand/3 cursor-pointer"
        onClick={() => toast.info('Tính năng tải lên tài liệu sẽ sớm ra mắt')}>
        <UploadIcon className="mb-3 h-8 w-8 text-gray-300" />
        <p className="font-medium text-gray-600">Kéo thả file vào đây hoặc click để chọn</p>
        <p className="mt-1 text-sm text-gray-400">PDF, JPG, PNG • Tối đa 10MB</p>
      </div>

      <div className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
        <p className="font-semibold">Lưu ý quan trọng:</p>
        <ul className="mt-1 list-inside list-disc space-y-1 text-blue-600">
          <li>File phải rõ nét, đầy đủ thông tin</li>
          <li>Giấy phép kinh doanh còn hiệu lực</li>
          <li>Thông tin khớp với thông tin đăng ký tài khoản</li>
          <li>Thời gian xét duyệt 1-3 ngày làm việc</li>
        </ul>
      </div>
    </div>
  )
}

function PDPASection() {
  const [agreed, setAgreed] = useState(false)
  return (
    <div className="card p-6 max-w-2xl">
      <h2 className="mb-1 font-semibold text-gray-900">Văn bản xử lý Dữ liệu cá nhân</h2>
      <p className="mb-5 text-sm text-gray-500">
        Theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân
      </p>

      <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 p-4 text-sm text-gray-600 leading-relaxed space-y-3">
        <p className="font-semibold text-gray-800">THỎA THUẬN XỬ LÝ DỮ LIỆU CÁ NHÂN</p>
        <p>TuyenDung.vn cam kết bảo vệ thông tin cá nhân của bạn theo đúng quy định của pháp luật Việt Nam, đặc biệt là Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân.</p>
        <p><strong>1. Dữ liệu chúng tôi thu thập:</strong> Thông tin đăng ký tài khoản, thông tin doanh nghiệp, lịch sử hoạt động trên nền tảng.</p>
        <p><strong>2. Mục đích xử lý:</strong> Cung cấp dịch vụ tuyển dụng, cải thiện trải nghiệm người dùng, tuân thủ nghĩa vụ pháp lý.</p>
        <p><strong>3. Thời gian lưu trữ:</strong> Dữ liệu được lưu trữ trong suốt thời gian tài khoản hoạt động và tối đa 3 năm sau khi xóa tài khoản.</p>
        <p><strong>4. Quyền của bạn:</strong> Bạn có quyền truy cập, chỉnh sửa, xóa dữ liệu cá nhân và phản đối việc xử lý dữ liệu.</p>
        <p><strong>5. Liên hệ:</strong> Gửi email đến privacy@tuyendung.vn để thực hiện các quyền liên quan đến dữ liệu cá nhân.</p>
      </div>

      <div className="mt-4 flex items-start gap-3">
        <input type="checkbox" id="pdpa" checked={agreed} onChange={e => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand" />
        <label htmlFor="pdpa" className="text-sm text-gray-600 cursor-pointer">
          Tôi đã đọc, hiểu và đồng ý với các điều khoản xử lý dữ liệu cá nhân nêu trên.
        </label>
      </div>

      <button
        onClick={() => agreed && toast.success('Đã xác nhận đồng ý')}
        disabled={!agreed}
        className="btn-primary mt-4 disabled:opacity-50"
      >
        Xác nhận đồng ý
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
      <h2 className="mb-1 font-semibold text-gray-900">Nhu cầu tuyển dụng</h2>
      <p className="mb-5 text-sm text-gray-500">Cho chúng tôi biết nhu cầu để gợi ý ứng viên phù hợp hơn</p>

      <div className="space-y-4">
        <div>
          <label className="label">Vị trí thường tuyển</label>
          <input className="input" placeholder="VD: Developer, Designer, Marketing..." value={form.positions}
            onChange={e => setForm(f => ({ ...f, positions: e.target.value }))} />
        </div>
        <div>
          <label className="label">Địa điểm tuyển dụng</label>
          <input className="input" placeholder="VD: Hà Nội, TP.HCM, Đà Nẵng..." value={form.locations}
            onChange={e => setForm(f => ({ ...f, locations: e.target.value }))} />
        </div>
        <div>
          <label className="label">Lĩnh vực</label>
          <input className="input" placeholder="VD: Công nghệ thông tin, Tài chính..." value={form.industries}
            onChange={e => setForm(f => ({ ...f, industries: e.target.value }))} />
        </div>
        <div>
          <label className="label">Quy mô tuyển dụng hàng tháng</label>
          <select className="input" value={form.scale} onChange={e => setForm(f => ({ ...f, scale: e.target.value }))}>
            <option value="1-5">1-5 người</option>
            <option value="6-20">6-20 người</option>
            <option value="21-50">21-50 người</option>
            <option value="50+">Trên 50 người</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button onClick={() => toast.success('Đã lưu nhu cầu tuyển dụng')} className="btn-primary">
            Lưu thay đổi
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
    { key: 'newApplication', label: 'Ứng viên mới', desc: 'Khi có ứng viên nộp đơn vào tin của bạn' },
    { key: 'statusUpdate', label: 'Cập nhật trạng thái', desc: 'Khi trạng thái đơn ứng tuyển thay đổi' },
    { key: 'weeklyReport', label: 'Báo cáo hàng tuần', desc: 'Tóm tắt hoạt động tuyển dụng mỗi thứ 2' },
    { key: 'promotions', label: 'Khuyến mãi & tính năng mới', desc: 'Thông tin về gói dịch vụ và tính năng' },
    { key: 'systemAlerts', label: 'Cảnh báo hệ thống', desc: 'Bảo mật, đăng nhập lạ, cập nhật quan trọng' },
  ] as const

  return (
    <div className="card p-6 max-w-2xl">
      <h2 className="mb-1 font-semibold text-gray-900">Cài đặt thông báo</h2>
      <p className="mb-5 text-sm text-gray-500">Chọn loại thông báo bạn muốn nhận</p>

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
        <button onClick={() => toast.success('Đã lưu cài đặt thông báo')} className="btn-primary">
          Lưu cài đặt
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
        <h2 className="mb-4 font-semibold text-gray-900">Tuỳ chọn giao diện</h2>
        <div>
          <label className="label">Ngôn ngữ</label>
          <select className="input max-w-xs" value={lang} onChange={e => setLang(e.target.value)}>
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-4 font-semibold text-red-600">Vùng nguy hiểm</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50/50 p-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Xóa tài khoản</p>
              <p className="text-xs text-gray-500">Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu. Không thể hoàn tác.</p>
            </div>
            <button
              onClick={() => toast.error('Vui lòng liên hệ support@tuyendung.vn để xóa tài khoản')}
              className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Xóa tài khoản
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

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
      <h1 className="text-xl font-bold text-gray-900">Cài đặt tài khoản</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-gray-100" />}>
        <SettingsContent />
      </Suspense>
    </div>
  )
}
