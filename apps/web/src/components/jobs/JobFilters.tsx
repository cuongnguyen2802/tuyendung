'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { ChevronDownIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Data ─────────────────────────────────────────────────────────────────────

const SALARY_RANGES = [
  { label: 'Dưới 5 triệu',  min: undefined,   max: 5_000_000  },
  { label: '5 – 10 triệu',  min: 5_000_000,   max: 10_000_000 },
  { label: '10 – 15 triệu', min: 10_000_000,  max: 15_000_000 },
  { label: '15 – 20 triệu', min: 15_000_000,  max: 20_000_000 },
  { label: '20 – 30 triệu', min: 20_000_000,  max: 30_000_000 },
  { label: '30 – 50 triệu', min: 30_000_000,  max: 50_000_000 },
  { label: 'Trên 50 triệu', min: 50_000_000,  max: undefined  },
]

const JOB_TYPES = [
  { value: 'FULL_TIME',   label: 'Toàn thời gian' },
  { value: 'PART_TIME',   label: 'Bán thời gian'  },
  { value: 'CONTRACT',    label: 'Thời vụ / HĐ'   },
  { value: 'INTERNSHIP',  label: 'Thực tập'        },
  { value: 'FREELANCE',   label: 'Freelance'       },
]

const WORK_MODES = [
  { value: 'ONSITE', label: 'Tại văn phòng' },
  { value: 'REMOTE', label: 'Remote'         },
  { value: 'HYBRID', label: 'Hybrid'         },
]

const EXPERIENCE_LEVELS = [
  { label: 'Không yêu cầu', value: ''  },
  { label: 'Dưới 1 năm',    value: '0' },
  { label: '1 – 2 năm',     value: '1' },
  { label: '2 – 5 năm',     value: '2' },
  { label: 'Trên 5 năm',    value: '5' },
]

// ── Accordion section ─────────────────────────────────────────────────────────

function Section({
  title,
  badge,
  defaultOpen = true,
  children,
}: {
  title: string
  badge?: number
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{title}</span>
          {badge ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
              {badge}
            </span>
          ) : null}
        </span>
        <ChevronDownIcon
          className={cn('h-4 w-4 text-gray-400 transition-transform duration-200', !open && '-rotate-90')}
        />
      </button>
      {open && <div className="space-y-1 px-5 pb-4">{children}</div>}
    </div>
  )
}

// ── Radio item ────────────────────────────────────────────────────────────────

function RadioItem({
  name, value, checked, label, onChange,
}: {
  name: string; value: string; checked: boolean; label: string
  onChange: (v: string) => void
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition hover:bg-gray-50">
      <span className={cn(
        'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition',
        checked ? 'border-brand' : 'border-gray-300',
      )}>
        {checked && <span className="h-2 w-2 rounded-full bg-brand" />}
      </span>
      <input type="radio" name={name} value={value} checked={checked}
        onChange={() => onChange(value)} className="sr-only" />
      <span className={checked ? 'font-medium text-brand' : 'text-gray-600'}>{label}</span>
    </label>
  )
}

// ── Checkbox item ─────────────────────────────────────────────────────────────

function CheckItem({
  checked, label, onChange,
}: {
  checked: boolean; label: string; onChange: (v: boolean) => void
}) {
  return (
    <label
      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition hover:bg-gray-50"
      onClick={() => onChange(!checked)}
    >
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
      <span className={checked ? 'font-medium text-brand' : 'text-gray-600'}>{label}</span>
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
  const [jobTypes,  setJobTypes]  = useState<Set<string>>(new Set(params.getAll('jobType')))
  const [workModes, setWorkModes] = useState<Set<string>>(new Set(params.getAll('workMode')))
  const [experience, setExperience] = useState(params.get('experienceMin') ?? '')

  const toggleSet = (set: Set<string>, val: string): Set<string> => {
    const next = new Set(set)
    next.has(val) ? next.delete(val) : next.add(val)
    return next
  }

  const salaryRange = SALARY_RANGES.find(
    (r) => `${r.min ?? ''}-${r.max ?? ''}` === salaryKey,
  )

  const activeCount =
    (salaryKey ? 1 : 0) +
    jobTypes.size +
    workModes.size +
    (experience ? 1 : 0)

  const apply = () => {
    const p = new URLSearchParams()
    if (params.get('keyword')) p.set('keyword', params.get('keyword')!)
    if (params.get('city'))    p.set('city',    params.get('city')!)
    if (salaryRange?.min) p.set('salaryMin', String(salaryRange.min))
    if (salaryRange?.max) p.set('salaryMax', String(salaryRange.max))
    jobTypes.forEach((t)  => p.append('jobType',  t))
    workModes.forEach((m) => p.append('workMode', m))
    if (experience) p.set('experienceMin', experience)
    p.set('page', '1')
    router.push(`/jobs?${p.toString()}`)
  }

  const clear = () => {
    setSalaryKey(''); setJobTypes(new Set()); setWorkModes(new Set()); setExperience('')
    const p = new URLSearchParams()
    if (params.get('keyword')) p.set('keyword', params.get('keyword')!)
    if (params.get('city'))    p.set('city',    params.get('city')!)
    router.push(`/jobs?${p.toString()}`)
  }

  return (
    <aside className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontalIcon className="h-4 w-4 text-brand" />
          <h3 className="text-sm font-bold text-gray-900">Lọc kết quả</h3>
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clear}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-400 transition hover:bg-red-50 hover:text-red-500"
          >
            <XIcon className="h-3 w-3" />
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Salary */}
      <Section title="Mức lương" badge={salaryKey ? 1 : 0} defaultOpen>
        <RadioItem
          name="salary" value="" checked={!salaryKey}
          label="Tất cả mức lương" onChange={() => setSalaryKey('')}
        />
        {SALARY_RANGES.map((r) => {
          const key = `${r.min ?? ''}-${r.max ?? ''}`
          return (
            <RadioItem
              key={key} name="salary" value={key}
              checked={salaryKey === key} label={r.label}
              onChange={setSalaryKey}
            />
          )
        })}
      </Section>

      {/* Job type */}
      <Section title="Hình thức làm việc" badge={jobTypes.size} defaultOpen>
        {JOB_TYPES.map((t) => (
          <CheckItem
            key={t.value} checked={jobTypes.has(t.value)} label={t.label}
            onChange={() => setJobTypes(toggleSet(jobTypes, t.value))}
          />
        ))}
      </Section>

      {/* Work mode */}
      <Section title="Chế độ làm việc" badge={workModes.size} defaultOpen={false}>
        {WORK_MODES.map((m) => (
          <CheckItem
            key={m.value} checked={workModes.has(m.value)} label={m.label}
            onChange={() => setWorkModes(toggleSet(workModes, m.value))}
          />
        ))}
      </Section>

      {/* Experience */}
      <Section title="Kinh nghiệm" badge={experience ? 1 : 0} defaultOpen={false}>
        {EXPERIENCE_LEVELS.map((e) => (
          <RadioItem
            key={e.value} name="experience" value={e.value}
            checked={experience === e.value} label={e.label}
            onChange={setExperience}
          />
        ))}
      </Section>

      {/* Apply button */}
      <div className="border-t border-gray-100 p-4">
        <button
          onClick={apply}
          className="w-full rounded-xl bg-brand py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand/90 active:scale-[.98]"
        >
          Áp dụng bộ lọc
        </button>
      </div>
    </aside>
  )
}
