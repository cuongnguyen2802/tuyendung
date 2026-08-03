'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { SaveIcon, CheckIcon, Loader2Icon } from 'lucide-react'

interface ContactData {
  phone: string
  email: string
  address: string
  mapEmbed: string
  workingHours: string
  supportEmail: string
  facebookUrl: string
  linkedinUrl: string
  twitterUrl: string
}

const DEFAULT: ContactData = {
  phone: '1900 6768',
  email: 'contact@tuyendung.vn',
  address: 'Tầng 10, Tòa nhà Keangnam, Phạm Hùng, Nam Từ Liêm, Hà Nội',
  mapEmbed: '',
  workingHours: 'Thứ 2 – Thứ 6: 8:00 – 18:00',
  supportEmail: 'support@tuyendung.vn',
  facebookUrl: '',
  linkedinUrl: '',
  twitterUrl: '',
}

const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand'

function Field({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div>
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
        {desc && <p className="text-xs text-gray-400">{desc}</p>}
      </div>
      {children}
    </div>
  )
}

export default function AdminContactPage() {
  const qc = useQueryClient()
  const [form, setForm] = useState<ContactData>(DEFAULT)
  const [saved, setSaved] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-page', 'contact'],
    queryFn: () => api.get('/admin/pages/contact'),
  })

  useEffect(() => {
    if (data) setForm({ ...DEFAULT, ...data })
  }, [data])

  const mutation = useMutation({
    mutationFn: (d: ContactData) => api.put('/admin/pages/contact', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pages'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  function set(field: keyof ContactData, val: string) {
    setForm(f => ({ ...f, [field]: val }))
  }

  if (isLoading) return <div className="flex justify-center py-20"><Loader2Icon className="h-7 w-7 animate-spin text-gray-300" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Trang Liên hệ</h1>
          <p className="mt-0.5 text-sm text-gray-500">Thông tin liên lạc, hotline và địa chỉ</p>
        </div>
        <button
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
            saved ? 'bg-emerald-500' : mutation.isPending ? 'bg-brand/60' : 'bg-brand hover:bg-brand/90'
          }`}
        >
          {mutation.isPending ? <Loader2Icon className="h-4 w-4 animate-spin" />
            : saved ? <CheckIcon className="h-4 w-4" />
            : <SaveIcon className="h-4 w-4" />}
          {saved ? 'Đã lưu!' : mutation.isPending ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact info */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Thông tin liên hệ</h2>

          <Field label="Số điện thoại / Hotline">
            <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="1900 6768" className={inputCls} />
          </Field>

          <Field label="Email chính">
            <input value={form.email} onChange={e => set('email', e.target.value)} type="email" placeholder="contact@..." className={inputCls} />
          </Field>

          <Field label="Email hỗ trợ">
            <input value={form.supportEmail} onChange={e => set('supportEmail', e.target.value)} type="email" placeholder="support@..." className={inputCls} />
          </Field>

          <Field label="Địa chỉ">
            <textarea
              value={form.address}
              onChange={e => set('address', e.target.value)}
              rows={2}
              className={inputCls + ' resize-none'}
              placeholder="Địa chỉ văn phòng..."
            />
          </Field>

          <Field label="Giờ làm việc">
            <input value={form.workingHours} onChange={e => set('workingHours', e.target.value)} placeholder="Thứ 2 – Thứ 6: 8:00 – 18:00" className={inputCls} />
          </Field>
        </div>

        {/* Social + Map */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Mạng xã hội</h2>

            <Field label="Facebook">
              <input value={form.facebookUrl} onChange={e => set('facebookUrl', e.target.value)} placeholder="https://facebook.com/..." className={inputCls} />
            </Field>

            <Field label="LinkedIn">
              <input value={form.linkedinUrl} onChange={e => set('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/company/..." className={inputCls} />
            </Field>

            <Field label="Twitter / X">
              <input value={form.twitterUrl} onChange={e => set('twitterUrl', e.target.value)} placeholder="https://twitter.com/..." className={inputCls} />
            </Field>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-gray-900 border-b border-gray-100 pb-3">Bản đồ</h2>
            <Field label="Google Maps Embed URL" desc="Lấy từ Google Maps → Share → Embed a map → copy src=...">
              <input value={form.mapEmbed} onChange={e => set('mapEmbed', e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." className={inputCls} />
            </Field>
            {form.mapEmbed && (
              <iframe
                src={form.mapEmbed}
                width="100%"
                height="200"
                className="rounded-lg border border-gray-200"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
