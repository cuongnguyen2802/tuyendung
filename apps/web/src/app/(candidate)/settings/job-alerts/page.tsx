'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SlidersIcon, PlusIcon, Trash2Icon, BellIcon, CheckIcon, Loader2Icon } from 'lucide-react'
import { api } from '@/lib/api'
import { JOB_TYPE_LABELS, JobType } from '@tuyendung/types'

interface JobAlert {
  id: string
  keyword?: string
  city?: string
  jobType?: JobType
  salaryMin?: number
  frequency: 'DAILY' | 'WEEKLY'
  isActive: boolean
  createdAt: string
}

interface FormState {
  keyword: string
  city: string
  jobType: string
  salaryMin: string
  frequency: 'DAILY' | 'WEEKLY'
}

const EMPTY_FORM: FormState = { keyword: '', city: '', jobType: '', salaryMin: '', frequency: 'DAILY' }

export default function JobAlertsPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState<FormState>(EMPTY_FORM)

  const { data: alerts = [], isLoading } = useQuery<JobAlert[]>({
    queryKey: ['job-alerts'],
    queryFn: () => api.get('/job-alerts'),
  })

  const create = useMutation({
    mutationFn: (data: Omit<FormState, 'salaryMin'> & { salaryMin?: number }) =>
      api.post('/job-alerts', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['job-alerts'] })
      setForm(EMPTY_FORM); setShowForm(false)
    },
  })

  const toggle = useMutation({
    mutationFn: (id: string) => api.patch(`/job-alerts/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['job-alerts'] }),
  })

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/job-alerts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['job-alerts'] }),
  })

  function handleAdd() {
    if (!form.keyword.trim()) return
    create.mutate({
      keyword: form.keyword.trim() || undefined,
      city: form.city.trim() || undefined,
      jobType: (form.jobType as JobType) || undefined,
      salaryMin: form.salaryMin ? parseInt(form.salaryMin, 10) : undefined,
      frequency: form.frequency,
    } as any)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cài đặt gợi ý việc làm</h1>
          <p className="mt-0.5 text-sm text-gray-500">Nhận thông báo khi có việc làm phù hợp với bạn</p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90"
        >
          <PlusIcon className="h-4 w-4" /> Thêm gợi ý
        </button>
      </div>

      {create.isSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckIcon className="h-4 w-4" /> Đã lưu gợi ý việc làm!
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-brand/20 bg-brand/5 p-5 space-y-4">
          <p className="font-semibold text-gray-800">Thêm gợi ý mới</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Từ khóa / Vị trí <span className="text-red-500">*</span></label>
              <input
                value={form.keyword}
                onChange={e => setForm(f => ({ ...f, keyword: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="Frontend Developer, Marketing..."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Địa điểm</label>
              <input
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="Hà Nội, Toàn quốc..."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Loại công việc</label>
              <select
                value={form.jobType}
                onChange={e => setForm(f => ({ ...f, jobType: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand bg-white"
              >
                <option value="">Tất cả loại</option>
                {Object.entries(JOB_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Lương tối thiểu (VNĐ)</label>
              <input
                type="number"
                value={form.salaryMin}
                onChange={e => setForm(f => ({ ...f, salaryMin: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="VD: 10000000"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tần suất gợi ý</label>
            <div className="flex gap-3">
              {([['DAILY', 'Hàng ngày'], ['WEEKLY', 'Hàng tuần']] as const).map(([v, l]) => (
                <label key={v} className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 transition has-[:checked]:border-brand has-[:checked]:bg-white">
                  <input type="radio" name="freq" value={v} checked={form.frequency === v} onChange={() => setForm(f => ({ ...f, frequency: v }))} className="accent-brand" />
                  <span className="text-sm font-medium text-gray-700">{l}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Hủy
            </button>
            <button
              onClick={handleAdd}
              disabled={create.isPending || !form.keyword.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white disabled:opacity-60 hover:bg-brand/90"
            >
              {create.isPending ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <CheckIcon className="h-4 w-4" />}
              Lưu gợi ý
            </button>
          </div>
          {create.isError && (
            <p className="text-sm text-red-500">{(create.error as Error).message}</p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2Icon className="h-7 w-7 animate-spin text-gray-300" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <SlidersIcon className="h-7 w-7 text-gray-300" />
          </div>
          <div>
            <p className="font-semibold text-gray-500">Chưa có gợi ý việc làm nào</p>
            <p className="mt-1 text-sm text-gray-400">Thêm gợi ý để nhận thông báo việc làm phù hợp</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`flex items-center gap-4 rounded-2xl border bg-white p-4 transition ${alert.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${alert.isActive ? 'bg-brand/10' : 'bg-gray-100'}`}>
                <BellIcon className={`h-5 w-5 ${alert.isActive ? 'text-brand' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{alert.keyword || 'Tất cả vị trí'}</p>
                <p className="text-xs text-gray-500">
                  {[
                    alert.city || 'Toàn quốc',
                    alert.jobType ? JOB_TYPE_LABELS[alert.jobType] : null,
                    alert.salaryMin ? `Từ ${(alert.salaryMin / 1_000_000).toFixed(0)}tr` : null,
                    alert.frequency === 'DAILY' ? 'Hàng ngày' : 'Hàng tuần',
                  ].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => toggle.mutate(alert.id)}
                  disabled={toggle.isPending}
                  className={`relative h-6 w-11 rounded-full transition-colors duration-200 disabled:opacity-60 ${alert.isActive ? 'bg-brand' : 'bg-gray-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${alert.isActive ? 'translate-x-5' : ''}`} />
                </button>
                <button
                  onClick={() => remove.mutate(alert.id)}
                  disabled={remove.isPending}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 disabled:opacity-60"
                >
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
