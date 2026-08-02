'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { BellIcon, MailIcon, CheckIcon, SaveIcon, Loader2Icon } from 'lucide-react'
import { api } from '@/lib/api'

interface NotifPref {
  emailApply: boolean
  emailJobAlert: boolean
  emailNews: boolean
  inAppApply: boolean
  inAppJobAlert: boolean
  inAppNews: boolean
}

const DEFAULT_PREF: NotifPref = {
  emailApply: true, emailJobAlert: true, emailNews: false,
  inAppApply: true, inAppJobAlert: true, inAppNews: true,
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${enabled ? 'bg-brand' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  )
}

function Row({ label, desc, enabled, onChange }: { label: string; desc: string; enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="mt-0.5 text-xs text-gray-400">{desc}</p>
      </div>
      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  )
}

export default function NotificationsSettingsPage() {
  const [prefs, setPrefs] = useState<NotifPref>(DEFAULT_PREF)
  const [saved, setSaved] = useState(false)

  const { data, isLoading } = useQuery<NotifPref>({
    queryKey: ['notif-prefs'],
    queryFn: () => api.get('/users/me/notification-preferences'),
  })

  useEffect(() => {
    if (data) setPrefs(data)
  }, [data])

  const mutation = useMutation({
    mutationFn: (p: Partial<NotifPref>) => api.patch('/users/me/notification-preferences', p),
    onSuccess: () => {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  const set = (key: keyof NotifPref, v: boolean) => setPrefs(p => ({ ...p, [key]: v }))

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
          <h1 className="text-xl font-bold text-gray-900">Cài đặt email & thông báo</h1>
          <p className="mt-0.5 text-sm text-gray-500">Kiểm soát loại thông báo bạn muốn nhận</p>
        </div>
        <button
          onClick={() => mutation.mutate(prefs)}
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

      {/* Email */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
            <MailIcon className="h-[18px] w-[18px] text-blue-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Thông báo qua email</p>
            <p className="text-xs text-gray-400">Các loại email bạn muốn nhận</p>
          </div>
        </div>
        <div className="divide-y divide-gray-50 px-6">
          <Row label="Cập nhật đơn ứng tuyển" desc="Nhận email khi nhà tuyển dụng cập nhật trạng thái đơn" enabled={prefs.emailApply} onChange={v => set('emailApply', v)} />
          <Row label="Gợi ý việc làm phù hợp" desc="Nhận email khi có tin tuyển dụng phù hợp với cảnh báo việc làm của bạn" enabled={prefs.emailJobAlert} onChange={v => set('emailJobAlert', v)} />
          <Row label="Bản tin nghề nghiệp" desc="Nhận email cẩm nang nghề nghiệp và xu hướng thị trường" enabled={prefs.emailNews} onChange={v => set('emailNews', v)} />
        </div>
      </div>

      {/* In-app */}
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
            <BellIcon className="h-[18px] w-[18px] text-emerald-500" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Thông báo trong ứng dụng</p>
            <p className="text-xs text-gray-400">Thông báo hiển thị trên chuông báo</p>
          </div>
        </div>
        <div className="divide-y divide-gray-50 px-6">
          <Row label="Đơn ứng tuyển" desc="Thông báo khi có cập nhật về đơn ứng tuyển" enabled={prefs.inAppApply} onChange={v => set('inAppApply', v)} />
          <Row label="Gợi ý việc làm" desc="Thông báo khi có việc làm phù hợp với tiêu chí của bạn" enabled={prefs.inAppJobAlert} onChange={v => set('inAppJobAlert', v)} />
          <Row label="Tin tức & bản tin" desc="Thông báo bài viết mới và tin tức nghề nghiệp" enabled={prefs.inAppNews} onChange={v => set('inAppNews', v)} />
        </div>
      </div>
    </div>
  )
}
