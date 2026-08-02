'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { ChevronDownIcon, XCircleIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Data ─────────────────────────────────────────────────────────────────────

const SALARY_RANGES = [
  { label: 'Dưới 5 triệu', min: undefined, max: 5_000_000 },
  { label: '5 - 10 triệu', min: 5_000_000, max: 10_000_000 },
  { label: '10 - 15 triệu', min: 10_000_000, max: 15_000_000 },
  { label: '15 - 20 triệu', min: 15_000_000, max: 20_000_000 },
  { label: '20 - 30 triệu', min: 20_000_000, max: 30_000_000 },
  { label: '30 - 50 triệu', min: 30_000_000, max: 50_000_000 },
  { label: 'Trên 50 triệu', min: 50_000_000, max: undefined },
]

const JOB_TYPES = [
  { value: 'FULL_TIME', label: 'Toàn thời gian' },
  { value: 'PART_TIME', label: 'Bán thời gian' },
  { value: 'CONTRACT', label: 'Hợp đồng / Thời vụ' },
  { value: 'INTERNSHIP', label: 'Thực tập' },
  { value: 'FREELANCE', label: 'Freelance' },
]

const WORK_MODES = [
  { value: 'ONSITE', label: 'Tại văn phòng' },
  { value: 'REMOTE', label: 'Làm từ xa (Remote)' },
  { value: 'HYBRID', label: 'Kết hợp (Hybrid)' },
]

const EXPERIENCE_LEVELS = [
  { label: 'Không yêu cầu', value: '' },
  { label: 'Dưới 1 năm', value: '0' },
  { label: '1 - 2 năm', value: '1' },
  { label: '2 - 5 năm', value: '2' },
  { label: 'Trên 5 năm', value: '5' },
]

// ── Accordion section ─────────────────────────────────────────────────────────

function Section({
  title, defaultOpen = true, children,
}: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 py-3 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-1 text-sm font-semibold text-gray-800"
      >
        {title}
        <ChevronDownIcon className={cn('h-4 w-4 text-gray-400 transition-transform', !open && '-rotate-90')} />
      </button>
      {open && <div className="mt-3 space-y-2.5">{children}</div>}
    </div>
  )
}

function RadioItem({ name, value, checked, label, onChange }: {
  name: string; value: string; checked: boolean; label: string
  onChange: (v: string) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
      <span className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition',
        checked ? 'border-brand' : 'border-gray-300',
      )}>
        {checked && <span className="h-2 w-2 rounded-full bg-brand" />}
      </span>
      <input type="radio" name={name} value={value} checked={checked}
        onChange={() => onChange(value)} className="sr-only" />
      {label}
    </label>
  )
}

function CheckItem({ checked, label, onChange }: {
  checked: boolean; label: string; onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700" onClick={() => onChange(!checked)}>
      <span className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition',
        checked ? 'border-brand bg-brand' : 'border-gray-300',
      )}>
        {checked && (
          <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </label>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function JobFilters() {
  const router = useRouter()
  const params = useSearchParams()

  const [salaryKey, setSalaryKey] = useState(
    params.get('salaryMin') ? `${params.get('salaryMin')}-${params.get('salaryMax') ?? ''}` : '',
  )
  const [jobTypes, setJobTypes] = useState<Set<string>>(
    new Set(params.getAll('jobType')),
  )
  const [workModes, setWorkModes] = useState<Set<string>>(
    new Set(params.getAll('workMode')),
  )
  const [experience, setExperience] = useState(params.get('experienceMin') ?? '')

  const toggleSet = (set: Set<string>, val: string): Set<string> => {
    const next = new Set(set)
    next.has(val) ? next.delete(val) : next.add(val)
    return next
  }

  const salaryRange = SALARY_RANGES.find(
    (r) => `${r.min ?? ''}-${r.max ?? ''}` === salaryKey,
  )

  const hasFilters = salaryKey || jobTypes.size > 0 || workModes.size > 0 || experience

  const apply = () => {
    const p = new URLSearchParams()
    if (params.get('keyword')) p.set('keyword', params.get('keyword')!)
    if (params.get('city')) p.set('city', params.get('city')!)
    if (salaryRange?.min) p.set('salaryMin', String(salaryRange.min))
    if (salaryRange?.max) p.set('salaryMax', String(salaryRange.max))
    jobTypes.forEach((t) => p.append('jobType', t))
    workModes.forEach((m) => p.append('workMode', m))
    if (experience) p.set('experienceMin', experience)
    p.set('page', '1')
    router.push(`/jobs?${p.toString()}`)
  }

  const clear = () => {
    setSalaryKey(''); setJobTypes(new Set()); setWorkModes(new Set()); setExperience('')
    const p = new URLSearchParams()
    if (params.get('keyword')) p.set('keyword', params.get('keyword')!)
    if (params.get('city')) p.set('city', params.get('city')!)
    router.push(`/jobs?${p.toString()}`)
  }

  return (
    <aside className="rounded-xl border border-gray-200 bg-white px-4 py-2">
      <div className="flex items-center justify-between py-3">
        <h3 className="text-sm font-bold text-gray-900">Lọc kết quả</h3>
        {hasFilters && (
          <button onClick={clear} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition">
            <XCircleIcon className="h-3.5 w-3.5" />
            Xóa lọc
          </button>
        )}
      </div>

      {/* Salary */}
      <Section title="Mức lương">
        <RadioItem name="salary" value="" checked={!salaryKey} label="Tất cả mức lương"
          onChange={() => setSalaryKey('')} />
        {SALARY_RANGES.map((r) => {
          const key = `${r.min ?? ''}-${r.max ?? ''}`
          return (
            <RadioItem key={key} name="salary" value={key} checked={salaryKey === key}
              label={r.label} onChange={setSalaryKey} />
          )
        })}
      </Section>

      {/* Job type */}
      <Section title="Hình thức làm việc">
        {JOB_TYPES.map((t) => (
          <CheckItem key={t.value} checked={jobTypes.has(t.value)} label={t.label}
            onChange={() => setJobTypes(toggleSet(jobTypes, t.value))} />
        ))}
      </Section>

      {/* Work mode */}
      <Section title="Chế độ làm việc" defaultOpen={false}>
        {WORK_MODES.map((m) => (
          <CheckItem key={m.value} checked={workModes.has(m.value)} label={m.label}
            onChange={() => setWorkModes(toggleSet(workModes, m.value))} />
        ))}
      </Section>

      {/* Experience */}
      <Section title="Kinh nghiệm" defaultOpen={false}>
        {EXPERIENCE_LEVELS.map((e) => (
          <RadioItem key={e.value} name="experience" value={e.value} checked={experience === e.value}
            label={e.label} onChange={setExperience} />
        ))}
      </Section>

      {/* Apply */}
      <div className="pb-2 pt-4">
        <button
          onClick={apply}
          className="w-full rounded-xl bg-brand py-2.5 text-sm font-bold text-white transition hover:bg-brand/90"
        >
          Áp dụng bộ lọc
        </button>
      </div>
    </aside>
  )
}
