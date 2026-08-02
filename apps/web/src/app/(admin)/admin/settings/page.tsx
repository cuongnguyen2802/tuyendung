'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  SaveIcon, CheckIcon, Loader2Icon, GlobeIcon,
  MailIcon, PhoneIcon, MapPinIcon, ToggleRightIcon,
  InfoIcon,
} from 'lucide-react'

// ── Default settings ──────────────────────────────────────────────────────────

const DEFAULTS: Record<string, string> = {
  siteName: 'TuyenDung.vn',
  siteTagline: 'Kết nối ứng viên và nhà tuyển dụng',
  supportEmail: 'support@tuyendung.vn',
  supportPhone: '1900 1234',
  address: 'Hà Nội, Việt Nam',
  maintenanceMode: 'false',
  allowRegistration: 'true',
  requireEmailVerification: 'true',
  maxCVsPerUser: '5',
  maxJobsPerEmployerFree: '3',
  jobApprovalRequired: 'true',
  metaTitle: 'TuyenDung.vn - Tìm việc làm nhanh, lương cao',
  metaDescription: 'Hàng nghìn tin tuyển dụng chất lượng từ các công ty hàng đầu. Ứng tuyển nhanh, nhận phản hồi sớm.',
  facebookUrl: '',
  linkedinUrl: '',
  youtubeUrl: '',
}

type SettingKey = keyof typeof DEFAULTS

interface SettingGroup {
  label: string
  icon: React.ElementType
  keys: { key: SettingKey; label: string; desc?: string; type?: 'text' | 'toggle' | 'number' | 'textarea' | 'email' | 'tel' | 'url' }[]
}

const GROUPS: SettingGroup[] = [
  {
    label: 'Thông tin website',
    icon: GlobeIcon,
    keys: [
      { key: 'siteName',    label: 'Tên website',   type: 'text' },
      { key: 'siteTagline', label: 'Tagline',        type: 'text', desc: 'Câu mô tả ngắn hiển thị dưới logo' },
      { key: 'facebookUrl', label: 'Facebook URL',   type: 'url' },
      { key: 'linkedinUrl', label: 'LinkedIn URL',   type: 'url' },
      { key: 'youtubeUrl',  label: 'YouTube URL',    type: 'url' },
    ],
  },
  {
    label: 'Thông tin liên hệ',
    icon: MailIcon,
    keys: [
      { key: 'supportEmail', label: 'Email hỗ trợ', type: 'email' },
      { key: 'supportPhone', label: 'Điện thoại',   type: 'tel'   },
      { key: 'address',      label: 'Địa chỉ',      type: 'text'  },
    ],
  },
  {
    label: 'SEO mặc định',
    icon: InfoIcon,
    keys: [
      { key: 'metaTitle',       label: 'Meta title',       type: 'text',     desc: 'Tiêu đề mặc định cho SEO (≤ 60 ký tự)' },
      { key: 'metaDescription', label: 'Meta description', type: 'textarea', desc: 'Mô tả mặc định cho SEO (≤ 160 ký tự)'  },
    ],
  },
  {
    label: 'Vận hành',
    icon: ToggleRightIcon,
    keys: [
      { key: 'maintenanceMode',          label: 'Chế độ bảo trì',                type: 'toggle', desc: 'Chặn tất cả người dùng ngoại trừ Admin' },
      { key: 'allowRegistration',        label: 'Cho phép đăng ký mới',          type: 'toggle' },
      { key: 'requireEmailVerification', label: 'Bắt buộc xác minh email',       type: 'toggle' },
      { key: 'jobApprovalRequired',      label: 'Duyệt tin trước khi đăng',      type: 'toggle' },
      { key: 'maxCVsPerUser',            label: 'Số CV tối đa / ứng viên',       type: 'number' },
      { key: 'maxJobsPerEmployerFree',   label: 'Số tin tối đa / NTD gói Free',  type: 'number' },
    ],
  },
]

// ── Components ────────────────────────────────────────────────────────────────

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${enabled ? 'bg-brand' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-5' : ''}`} />
    </button>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULTS)
  const [saved, setSaved]       = useState(false)

  const { data, isLoading } = useQuery<Record<string, string>>({
    queryKey: ['admin-settings'],
    queryFn: () => api.get('/admin/settings'),
  })

  useEffect(() => {
    if (data) setSettings({ ...DEFAULTS, ...data })
  }, [data])

  const mutation = useMutation({
    mutationFn: (s: Record<string, string>) => api.put('/admin/settings', s),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500) },
  })

  function set(key: string, val: string) {
    setSettings(prev => ({ ...prev, [key]: val }))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2Icon className="h-7 w-7 animate-spin text-gray-300" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cài đặt hệ thống</h1>
          <p className="mt-0.5 text-sm text-gray-500">Cấu hình tổng quan cho toàn bộ nền tảng</p>
        </div>
        <button
          onClick={() => mutation.mutate(settings)}
          disabled={mutation.isPending}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
            saved ? 'bg-emerald-500' : mutation.isPending ? 'cursor-not-allowed bg-brand/60' : 'bg-brand hover:bg-brand/90'
          }`}
        >
          {mutation.isPending ? <Loader2Icon className="h-4 w-4 animate-spin" />
            : saved ? <CheckIcon className="h-4 w-4" />
            : <SaveIcon className="h-4 w-4" />}
          {saved ? 'Đã lưu!' : mutation.isPending ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>

      {mutation.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {(mutation.error as Error).message}
        </div>
      )}

      {settings.maintenanceMode === 'true' && (
        <div className="flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
          <ToggleRightIcon className="h-5 w-5 shrink-0 text-orange-500" />
          <p className="text-sm font-medium text-orange-800">
            Chế độ bảo trì đang BẬT — người dùng không thể truy cập website
          </p>
        </div>
      )}

      <div className="space-y-5">
        {GROUPS.map(group => (
          <div key={group.label} className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10">
                <group.icon className="h-[18px] w-[18px] text-brand" />
              </div>
              <p className="font-semibold text-gray-900">{group.label}</p>
            </div>
            <div className="divide-y divide-gray-50 px-6">
              {group.keys.map(({ key, label, desc, type = 'text' }) => {
                const val = settings[key] ?? DEFAULTS[key] ?? ''
                return (
                  <div key={key} className="flex items-start justify-between gap-6 py-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{label}</p>
                      {desc && <p className="mt-0.5 text-xs text-gray-400">{desc}</p>}
                    </div>
                    <div className="w-72 shrink-0">
                      {type === 'toggle' ? (
                        <div className="flex justify-end">
                          <Toggle enabled={val === 'true'} onChange={v => set(key, v ? 'true' : 'false')} />
                        </div>
                      ) : type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={val}
                          onChange={e => set(key, e.target.value)}
                          className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                        />
                      ) : (
                        <input
                          type={type}
                          value={val}
                          onChange={e => set(key, e.target.value)}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
