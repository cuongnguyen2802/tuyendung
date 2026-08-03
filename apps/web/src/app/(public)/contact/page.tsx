'use client'

import { useState } from 'react'
import { MailIcon, PhoneIcon, MapPinIcon, ClockIcon, CheckCircleIcon } from 'lucide-react'

const CONTACTS = [
  { icon: PhoneIcon,   label: 'Hotline',        value: '1900 068 889', sub: 'Nhánh 2 — Giờ hành chính' },
  { icon: MailIcon,    label: 'Email hỗ trợ',   value: 'hotro@tuyendung.vn', sub: 'Phản hồi trong 24h' },
  { icon: MapPinIcon,  label: 'Địa chỉ',        value: '123 Nguyễn Huệ, Q.1, TP.HCM', sub: '' },
  { icon: ClockIcon,   label: 'Giờ làm việc',   value: 'Thứ 2 – Thứ 6', sub: '8:00 – 18:00' },
]

const TOPICS = [
  'Hỗ trợ tài khoản',
  'Báo cáo tin tuyển dụng',
  'Hợp tác nhà tuyển dụng',
  'Báo chí / Truyền thông',
  'Khác',
]

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', topic: TOPICS[0], message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setLoading(false)
    setSent(true)
  }

  return (
    <>
      {/* Hero */}
      <div className="border-b border-gray-100 bg-gradient-to-br from-brand/5 via-white to-emerald-50">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">Liên hệ</p>
          <h1 className="mb-3 text-3xl font-extrabold text-gray-900">Chúng tôi luôn lắng nghe</h1>
          <p className="text-gray-500">Có câu hỏi, góp ý hoặc cần hỗ trợ? Hãy gửi tin nhắn cho chúng tôi.</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">

          {/* Form */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            {sent ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
                  <CheckCircleIcon className="h-8 w-8 text-brand" />
                </div>
                <h2 className="mb-2 text-xl font-bold text-gray-900">Đã nhận được tin nhắn!</h2>
                <p className="text-sm text-gray-500">
                  Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.
                </p>
                <button
                  type="button"
                  onClick={() => { setSent(false); setForm({ name: '', email: '', topic: TOPICS[0], message: '' }) }}
                  className="mt-6 text-sm font-semibold text-brand hover:underline"
                >
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-lg font-bold text-gray-900">Gửi tin nhắn</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Họ và tên</label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Nguyễn Văn A"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="ban@example.com"
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Chủ đề</label>
                  <select
                    value={form.topic}
                    onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition"
                  >
                    {TOPICS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Nội dung</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Mô tả vấn đề hoặc câu hỏi của bạn..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white transition hover:bg-brand/90 disabled:opacity-60"
                >
                  {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                </button>
              </form>
            )}
          </div>

          {/* Info sidebar */}
          <div className="space-y-4">
            {CONTACTS.map(({ icon: Icon, label, value, sub }) => (
              <div key={label} className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                  <Icon className="h-5 w-5 text-brand" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="font-semibold text-gray-800">{value}</p>
                  {sub && <p className="text-xs text-gray-400">{sub}</p>}
                </div>
              </div>
            ))}

            <div className="rounded-xl border border-brand/20 bg-brand/5 p-4">
              <p className="mb-1 text-sm font-semibold text-brand">Hỗ trợ nhanh qua Zalo</p>
              <p className="text-xs text-gray-500">Nhắn tin trực tiếp với đội hỗ trợ qua Zalo OA — phản hồi trong 5 phút giờ hành chính.</p>
              <a href="#" className="mt-2 inline-block text-xs font-semibold text-brand hover:underline">
                Mở Zalo chat →
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
