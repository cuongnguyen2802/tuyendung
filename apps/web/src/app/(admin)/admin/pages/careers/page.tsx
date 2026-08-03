'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { PlusIcon, Trash2Icon, SaveIcon, CheckIcon, Loader2Icon } from 'lucide-react'

interface Perk { icon: string; title: string; desc: string }
interface Opening { title: string; team: string; type: string; location: string }

const DEFAULT: { perks: Perk[]; openings: Opening[] } = {
  perks: [
    { icon: '💰', title: 'Lương cạnh tranh', desc: 'Review 2 lần/năm theo hiệu suất' },
    { icon: '🏖️', title: '20 ngày phép', desc: 'Thêm 1 ngày cho mỗi năm gắn bó' },
    { icon: '🏠', title: 'Remote 2 ngày/tuần', desc: 'Linh hoạt giữa văn phòng và nhà' },
  ],
  openings: [
    { title: 'Senior Frontend Engineer', team: 'Engineering', type: 'Full-time', location: 'Hà Nội / Remote' },
    { title: 'Product Designer', team: 'Design', type: 'Full-time', location: 'Hà Nội' },
  ],
}

const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand'

function SaveButton({ onClick, isPending, saved }: { onClick: () => void; isPending: boolean; saved: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
        saved ? 'bg-emerald-500' : isPending ? 'bg-brand/60' : 'bg-brand hover:bg-brand/90'
      }`}
    >
      {isPending ? <Loader2Icon className="h-4 w-4 animate-spin" />
        : saved ? <CheckIcon className="h-4 w-4" />
        : <SaveIcon className="h-4 w-4" />}
      {saved ? 'Đã lưu!' : isPending ? 'Đang lưu...' : 'Lưu'}
    </button>
  )
}

export default function AdminCareersPage() {
  const qc = useQueryClient()
  const [perks, setPerks] = useState<Perk[]>(DEFAULT.perks)
  const [openings, setOpenings] = useState<Opening[]>(DEFAULT.openings)
  const [saved, setSaved] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-page', 'careers'],
    queryFn: () => api.get('/admin/pages/careers'),
  })

  useEffect(() => {
    if (data?.perks) setPerks(data.perks)
    if (data?.openings) setOpenings(data.openings)
  }, [data])

  const mutation = useMutation({
    mutationFn: (d: { perks: Perk[]; openings: Opening[] }) => api.put('/admin/pages/careers', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pages'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    },
  })

  function updatePerk(i: number, f: keyof Perk, v: string) {
    setPerks(p => p.map((item, idx) => idx === i ? { ...item, [f]: v } : item))
  }

  function updateOpening(i: number, f: keyof Opening, v: string) {
    setOpenings(o => o.map((item, idx) => idx === i ? { ...item, [f]: v } : item))
  }

  if (isLoading) return <div className="flex justify-center py-20"><Loader2Icon className="h-7 w-7 animate-spin text-gray-300" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Trang Tuyển dụng nội bộ</h1>
          <p className="mt-0.5 text-sm text-gray-500">Phúc lợi và vị trí đang tuyển</p>
        </div>
        <SaveButton onClick={() => mutation.mutate({ perks, openings })} isPending={mutation.isPending} saved={saved} />
      </div>

      {/* Perks */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="font-semibold text-gray-900">Phúc lợi</h2>
          <p className="text-xs text-gray-400 mt-0.5">Hiển thị dưới dạng card trên trang careers</p>
        </div>
        <div className="divide-y divide-gray-50">
          {perks.map((perk, i) => (
            <div key={i} className="grid grid-cols-[60px_1fr_2fr_40px] items-center gap-3 px-5 py-3">
              <input
                value={perk.icon}
                onChange={e => updatePerk(i, 'icon', e.target.value)}
                placeholder="🎯"
                className={inputCls + ' text-center text-lg'}
              />
              <input
                value={perk.title}
                onChange={e => updatePerk(i, 'title', e.target.value)}
                placeholder="Tiêu đề"
                className={inputCls}
              />
              <input
                value={perk.desc}
                onChange={e => updatePerk(i, 'desc', e.target.value)}
                placeholder="Mô tả ngắn"
                className={inputCls}
              />
              <button type="button" onClick={() => setPerks(p => p.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-400 transition">
                <Trash2Icon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="px-5 py-3">
            <button
              type="button"
              onClick={() => setPerks(p => [...p, { icon: '✨', title: '', desc: '' }])}
              className="flex items-center gap-1.5 text-sm text-brand hover:text-brand/80 transition"
            >
              <PlusIcon className="h-4 w-4" />
              Thêm phúc lợi
            </button>
          </div>
        </div>
      </div>

      {/* Openings */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="font-semibold text-gray-900">Vị trí đang tuyển</h2>
          <p className="text-xs text-gray-400 mt-0.5">Danh sách công việc mở</p>
        </div>
        <div className="divide-y divide-gray-50">
          {openings.map((job, i) => (
            <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_40px] items-center gap-3 px-5 py-3">
              <input
                value={job.title}
                onChange={e => updateOpening(i, 'title', e.target.value)}
                placeholder="Tên vị trí"
                className={inputCls}
              />
              <input
                value={job.team}
                onChange={e => updateOpening(i, 'team', e.target.value)}
                placeholder="Team"
                className={inputCls}
              />
              <input
                value={job.type}
                onChange={e => updateOpening(i, 'type', e.target.value)}
                placeholder="Full-time"
                className={inputCls}
              />
              <input
                value={job.location}
                onChange={e => updateOpening(i, 'location', e.target.value)}
                placeholder="Địa điểm"
                className={inputCls}
              />
              <button type="button" onClick={() => setOpenings(o => o.filter((_, idx) => idx !== i))} className="text-gray-300 hover:text-red-400 transition">
                <Trash2Icon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="px-5 py-3">
            <button
              type="button"
              onClick={() => setOpenings(o => [...o, { title: '', team: '', type: 'Full-time', location: 'Hà Nội' }])}
              className="flex items-center gap-1.5 text-sm text-brand hover:text-brand/80 transition"
            >
              <PlusIcon className="h-4 w-4" />
              Thêm vị trí tuyển dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
