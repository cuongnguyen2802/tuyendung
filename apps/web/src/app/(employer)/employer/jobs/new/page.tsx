'use client'

import { useState, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'
import { JobType, WorkMode, VIETNAM_CITIES, JOB_TYPE_LABELS, WORK_MODE_LABELS, JobCategoryDto } from '@tuyendung/types'
import { RichEditor } from '@/components/ui/RichEditor'
import {
  ChevronRightIcon, ChevronLeftIcon, ChevronUpIcon, ChevronDownIcon,
  CheckCircle2Icon, CircleIcon, InfoIcon, SaveIcon,
  BriefcaseIcon, MapPinIcon, EyeIcon, BarChart2Icon,
  SparklesIcon, FileTextIcon, PencilIcon, UploadCloudIcon,
  ClipboardIcon, CheckIcon, AlertCircleIcon, Loader2Icon, XIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  title:            z.string().min(5, 'Tiêu đề ít nhất 5 ký tự'),
  categoryId:       z.string().optional(),
  description:      z.string().min(20, 'Mô tả ít nhất 20 ký tự'),
  requirements:     z.string().optional(),
  benefits:         z.string().optional(),
  city:             z.string().min(1, 'Vui lòng chọn thành phố'),
  location:         z.string().min(1, 'Vui lòng nhập địa điểm cụ thể'),
  jobType:          z.nativeEnum(JobType),
  workMode:         z.nativeEnum(WorkMode),
  salaryMin:        z.coerce.number().optional(),
  salaryMax:        z.coerce.number().optional(),
  salaryNegotiable: z.boolean().default(false),
  experienceMin:    z.coerce.number().min(0).max(30).optional(),
  quantity:         z.coerce.number().min(1).default(1),
  deadline:         z.string().optional(),
})
type FormData = z.infer<typeof schema>

const DEFAULT_VALUES: Partial<FormData> = {
  jobType: JobType.FULL_TIME,
  workMode: WorkMode.ONSITE,
  quantity: 1,
  salaryNegotiable: false,
}

// ── Nav sections ──────────────────────────────────────────────────────────────

type FieldKey = keyof FormData

const NAV = [
  {
    id: '1', label: 'Thông tin chung',
    items: [
      { key: 'title',    label: 'Tiêu đề tin',       fields: ['title'] as FieldKey[] },
      { key: 'category', label: 'Vị trí chuyên môn', fields: ['categoryId'] as FieldKey[] },
      { key: 'jobType',  label: 'Loại công việc',     fields: ['jobType'] as FieldKey[] },
      { key: 'workMode', label: 'Hình thức làm việc', fields: ['workMode'] as FieldKey[] },
      { key: 'city',     label: 'Địa điểm làm việc', fields: ['city', 'location'] as FieldKey[] },
      { key: 'salary',   label: 'Mức lương',          fields: ['salaryMin', 'salaryMax', 'salaryNegotiable'] as FieldKey[] },
    ],
  },
  {
    id: '2', label: 'Mô tả công việc',
    items: [
      { key: 'desc', label: 'Mô tả công việc',    fields: ['description'] as FieldKey[] },
      { key: 'req',  label: 'Yêu cầu ứng viên',   fields: ['requirements'] as FieldKey[] },
      { key: 'ben',  label: 'Quyền lợi ứng viên', fields: ['benefits'] as FieldKey[] },
    ],
  },
  {
    id: '3', label: 'Kỳ vọng về ứng viên',
    items: [
      { key: 'exp',      label: 'Kinh nghiệm',    fields: ['experienceMin'] as FieldKey[] },
      { key: 'quantity', label: 'Số lượng tuyển', fields: ['quantity'] as FieldKey[] },
      { key: 'deadline', label: 'Hạn nộp hồ sơ', fields: ['deadline'] as FieldKey[] },
    ],
  },
]

function isFilled(values: Partial<FormData>, fields: FieldKey[]): boolean {
  if (fields.includes('salaryNegotiable' as FieldKey)) {
    return !!(values.salaryNegotiable || (values.salaryMin && values.salaryMax))
  }
  return fields.some(f => {
    const v = values[f]
    if (v === undefined || v === null || v === '') return false
    if (typeof v === 'string') return v.trim().length > 0
    if (typeof v === 'number') return !isNaN(v) && v > 0
    return true
  })
}

// ── AccordionSection ──────────────────────────────────────────────────────────

function Section({
  id, title, filled, total, open, onToggle, children,
}: {
  id: string; title: string; filled: number; total: number
  open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button" onClick={onToggle}
        className={cn(
          'flex w-full items-center gap-3 px-5 py-3.5 text-left transition',
          open ? 'bg-amber-500' : 'bg-white hover:bg-gray-50',
        )}
      >
        <span className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
          open ? 'bg-white text-amber-600'
          : filled === total ? 'bg-brand text-white'
          : 'bg-gray-200 text-gray-600',
        )}>{id}</span>
        <span className={cn('flex-1 font-semibold', open ? 'text-white' : 'text-gray-900')}>{title}</span>
        <span className={cn('text-sm font-medium', open ? 'text-white/80' : filled === total ? 'text-brand' : 'text-gray-400')}>
          {filled}/{total}
        </span>
        {open
          ? <ChevronUpIcon className="h-4 w-4 shrink-0 text-white/80" />
          : <ChevronDownIcon className="h-4 w-4 shrink-0 text-gray-400" />
        }
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  )
}

// ── ParsedField preview row ───────────────────────────────────────────────────

function FieldRow({ label, value }: { label: string; value: string | undefined | null }) {
  if (!value) return null
  return (
    <div className="flex gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="w-40 shrink-0 text-sm text-gray-500">{label}</span>
      <span className="flex-1 text-sm font-medium text-gray-900 line-clamp-2">{value}</span>
      <CheckIcon className="h-4 w-4 shrink-0 text-brand mt-0.5" />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Step = 'select' | 'jd-upload' | 'ai-suggest' | 'form'

interface ParsedJD {
  title?: string
  description?: string
  requirements?: string
  benefits?: string
  city?: string
  location?: string
  jobType?: JobType
  workMode?: WorkMode
  salaryMin?: number
  salaryMax?: number
  salaryNegotiable?: boolean
  experienceMin?: number
}

export default function NewJobPage() {
  const router   = useRouter()
  const { data: session } = useSession()

  // ── Main step state ──────────────────────────────────────────────────────
  const [step, setStep]             = useState<Step>('select')
  const [leftOpen, setLeftOpen]     = useState(true)
  const [rightOpen, setRightOpen]   = useState(true)
  const [openSections, setOpenSections] = useState(new Set(['1']))
  const [previewTab, setPreviewTab] = useState<'preview' | 'evaluate'>('preview')

  // ── JD Upload state ──────────────────────────────────────────────────────
  const [jdTab, setJdTab]         = useState<'paste' | 'file'>('paste')
  const [jdText, setJdText]       = useState('')
  const [jdFile, setJdFile]       = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedJD | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── AI Suggest state ─────────────────────────────────────────────────────
  const [aiPosition,   setAiPosition]   = useState('')
  const [aiCategoryId, setAiCategoryId] = useState('')
  const [aiExperience, setAiExperience] = useState('')
  const [aiSkills,     setAiSkills]     = useState('')
  const [aiContext,    setAiContext]     = useState('')
  const [aiData,       setAiData]       = useState<ParsedJD | null>(null)

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: categories = [] } = useQuery<JobCategoryDto[]>({
    queryKey: ['job-categories'],
    queryFn: () => api.get('/job-categories'),
  })

  const { data: company } = useQuery<{ companyName?: string }>({
    queryKey: ['my-company'],
    queryFn: () => api.get('/employers/me/company'),
  })

  // ── Form ─────────────────────────────────────────────────────────────────
  const { register, handleSubmit, watch, control, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  })

  const formValues      = useWatch({ control }) as Partial<FormData>
  const salaryNegotiable = watch('salaryNegotiable')
  const titleValue       = watch('title') || ''

  const navStats = useMemo(() =>
    NAV.map(s => ({
      ...s,
      filledCount: s.items.filter(item => isFilled(formValues, item.fields)).length,
    }))
  , [formValues])

  const toggleSection = (sid: string) =>
    setOpenSections(prev => {
      const next = new Set(prev)
      next.has(sid) ? next.delete(sid) : next.add(sid)
      return next
    })

  // ── Mutations ────────────────────────────────────────────────────────────
  const parseMutation = useMutation<ParsedJD, Error, { text?: string; file?: File }>({
    mutationFn: async ({ text, file }) => {
      if (file) {
        const fd = new FormData()
        fd.append('file', file)
        return api.post('/jobs/parse-jd', fd) as Promise<ParsedJD>
      }
      return api.post('/jobs/parse-jd', { text }) as Promise<ParsedJD>
    },
    onSuccess: data => setParsedData(data),
  })

  const generateMutation = useMutation<ParsedJD, Error, object>({
    mutationFn: params => api.post('/jobs/ai-suggest', params) as Promise<ParsedJD>,
    onSuccess: data => setAiData(data),
  })

  const submitMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/jobs', data),
    onSuccess: () => router.push('/employer/jobs'),
  })

  // ── Helpers ──────────────────────────────────────────────────────────────
  const companyName = company?.companyName || session?.user?.name || 'Nhà tuyển dụng'

  function applyData(data: ParsedJD) {
    reset({ ...DEFAULT_VALUES, ...data })
    setOpenSections(new Set(['1', '2', '3']))
    setStep('form')
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) setJdFile(file)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setJdFile(file)
  }

  const prevStep: Record<Step, Step | null> = {
    select: null,
    'jd-upload': 'select',
    'ai-suggest': 'select',
    form: 'select',
  }

  function goBack() {
    const prev = prevStep[step]
    if (!prev) return
    if (step === 'jd-upload') { setParsedData(null); setJdText(''); setJdFile(null) }
    if (step === 'ai-suggest') { setAiData(null) }
    setStep(prev)
  }

  // ── Top bar label ─────────────────────────────────────────────────────────
  const topBarTitle: Record<Step, string> = {
    select:       'Đăng tin tuyển dụng',
    'jd-upload':  'Tự động điền từ JD có sẵn',
    'ai-suggest': 'AI gợi ý nội dung JD',
    form:         'Đăng tin tuyển dụng',
  }

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="-mx-4 -mt-4 sm:-mx-5 sm:-mt-5 lg:-mx-6 lg:-mt-6 flex flex-col">

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-2 lg:px-5">
        {step !== 'select' && (
          <button type="button" onClick={goBack}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-brand hover:text-brand transition"
          >
            <ChevronLeftIcon className="h-3.5 w-3.5" />
          </button>
        )}
        <h1 className="text-sm font-bold text-gray-900">{topBarTitle[step]}</h1>

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <a href="#" className="hidden items-center gap-1 text-xs text-brand hover:underline sm:flex">
            <InfoIcon className="h-3.5 w-3.5" />
            Quy định đăng tin
          </a>
          <span className="hidden h-3.5 w-px bg-gray-200 sm:block" />
          <div className="hidden items-center gap-1.5 sm:flex">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">4</span>
            <span className="text-xs font-medium text-brand">Cập nhật mới:</span>
            <span className="text-xs text-gray-600">Tiêu chuẩn đăng tin</span>
          </div>
          {step === 'form' && (
            <button type="submit" form="new-job-form" disabled={submitMutation.isPending}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:opacity-60"
            >
              <SaveIcon className="h-3.5 w-3.5" />
              {submitMutation.isPending ? 'Đang gửi...' : 'Gửi duyệt'}
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          Step: Select
      ══════════════════════════════════════════════════════════════════════ */}
      {step === 'select' && (
        <div className="flex min-h-[calc(100vh-105px)] items-center justify-center bg-gradient-to-br from-brand-50 via-emerald-50/60 to-white px-4 py-12">
          <div className="w-full max-w-lg">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Xin chào, <span className="text-brand">{companyName}!</span>
              </h2>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Cùng TuyenDung.vn tạo nên trải nghiệm đăng tin tuyển dụng hiện đại<br />
                Tối ưu thời gian đăng tin cùng Toppy AI
              </p>
            </div>

            <div className="space-y-3">
              {/* Option 1: Auto-fill from JD */}
              <button
                onClick={() => { setParsedData(null); setStep('jd-upload') }}
                className="group flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition hover:border-brand/70 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-brand">
                  <FileTextIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-900">Tự động điền từ JD có sẵn</p>
                  <p className="mt-0.5 text-sm text-gray-500">Tiết kiệm thời gian nhập liệu</p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-brand text-brand transition group-hover:bg-brand group-hover:text-white">
                  <ChevronRightIcon className="h-4 w-4" />
                </span>
              </button>

              {/* Option 2: AI suggest */}
              <button
                onClick={() => { setAiData(null); setStep('ai-suggest') }}
                className="group flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition hover:border-brand/70 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-brand">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-900">AI gợi ý JD</p>
                  <p className="mt-0.5 text-sm text-gray-500">Gợi ý nội dung thu hút ứng viên tiềm năng</p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-brand text-brand transition group-hover:bg-brand group-hover:text-white">
                  <ChevronRightIcon className="h-4 w-4" />
                </span>
              </button>

              {/* Option 3: Manual */}
              <button
                onClick={() => { reset(DEFAULT_VALUES); setStep('form') }}
                className="group flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition hover:border-brand/70 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-teal-500">
                  <PencilIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-gray-900">Tạo tin thủ công</p>
                  <p className="mt-0.5 text-sm text-gray-500">Tạo tin linh hoạt theo nhu cầu tuyển dụng</p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-brand text-brand transition group-hover:bg-brand group-hover:text-white">
                  <ChevronRightIcon className="h-4 w-4" />
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Step: JD Upload
      ══════════════════════════════════════════════════════════════════════ */}
      {step === 'jd-upload' && (
        <div className="flex min-h-[calc(100vh-105px)] justify-center bg-gray-50 px-4 py-8">
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900">Phân tích JD có sẵn</h2>
              <p className="mt-1 text-sm text-gray-500">
                Dán nội dung hoặc tải lên file JD — hệ thống sẽ tự động điền vào form đăng tin.
              </p>
            </div>

            {/* Tabs */}
            <div className="mb-4 flex gap-1 rounded-xl bg-gray-100 p-1">
              {(['paste', 'file'] as const).map(t => (
                <button key={t} onClick={() => setJdTab(t)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition',
                    jdTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
                  )}
                >
                  {t === 'paste' ? <ClipboardIcon className="h-4 w-4" /> : <UploadCloudIcon className="h-4 w-4" />}
                  {t === 'paste' ? 'Dán văn bản' : 'Tải file lên'}
                </button>
              ))}
            </div>

            {/* Paste tab */}
            {jdTab === 'paste' && (
              <div className="space-y-3">
                <textarea
                  value={jdText}
                  onChange={e => setJdText(e.target.value)}
                  rows={14}
                  placeholder="Dán nội dung JD vào đây...&#10;&#10;Ví dụ: Mô tả công việc, yêu cầu ứng viên, quyền lợi, địa điểm, mức lương..."
                  className="input w-full resize-none font-mono text-sm leading-relaxed"
                />
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{jdText.length} ký tự</span>
                  {jdText && (
                    <button onClick={() => setJdText('')} className="flex items-center gap-1 text-gray-400 hover:text-gray-600">
                      <XIcon className="h-3 w-3" /> Xóa
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* File tab */}
            {jdTab === 'file' && (
              <div className="space-y-3">
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition',
                    isDragging ? 'border-brand bg-brand/5' : 'border-gray-200 bg-white hover:border-gray-300',
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  {jdFile ? (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50">
                        <FileTextIcon className="h-6 w-6 text-brand" />
                      </div>
                      <p className="mt-3 font-semibold text-gray-800">{jdFile.name}</p>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {(jdFile.size / 1024).toFixed(0)} KB
                      </p>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setJdFile(null) }}
                        className="mt-3 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500"
                      >
                        <XIcon className="h-3 w-3" /> Xóa file
                      </button>
                    </>
                  ) : (
                    <>
                      <UploadCloudIcon className="h-10 w-10 text-gray-300" />
                      <p className="mt-3 font-medium text-gray-600">Kéo thả file vào đây</p>
                      <p className="mt-1 text-sm text-gray-400">hoặc nhấn để chọn file</p>
                      <p className="mt-3 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                        Hỗ trợ: PDF, DOC, DOCX, TXT (tối đa 10MB)
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Parse button */}
            {!parsedData && (
              <button
                type="button"
                disabled={parseMutation.isPending || (jdTab === 'paste' ? jdText.trim().length < 50 : !jdFile)}
                onClick={() => parseMutation.mutate(jdTab === 'paste' ? { text: jdText } : { file: jdFile! })}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-bold text-white transition hover:bg-brand/90 disabled:opacity-50"
              >
                {parseMutation.isPending ? (
                  <><Loader2Icon className="h-4 w-4 animate-spin" /> Đang phân tích JD...</>
                ) : (
                  <><FileTextIcon className="h-4 w-4" /> Phân tích JD</>
                )}
              </button>
            )}

            {/* Error */}
            {parseMutation.isError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                <AlertCircleIcon className="h-4 w-4 shrink-0" />
                {parseMutation.error.message || 'Phân tích thất bại, vui lòng thử lại.'}
              </div>
            )}

            {/* Result */}
            {parsedData && (
              <div className="mt-4 overflow-hidden rounded-xl border border-brand/30 bg-white shadow-sm">
                <div className="flex items-center gap-2 bg-brand-50 px-5 py-3">
                  <CheckCircle2Icon className="h-5 w-5 text-brand" />
                  <span className="font-semibold text-brand">Phân tích thành công!</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {Object.values(parsedData).filter(Boolean).length} thông tin được trích xuất
                  </span>
                </div>
                <div className="px-5 py-2">
                  <FieldRow label="Tiêu đề vị trí" value={parsedData.title} />
                  <FieldRow label="Thành phố" value={parsedData.city} />
                  <FieldRow label="Địa điểm" value={parsedData.location} />
                  <FieldRow label="Loại công việc" value={parsedData.jobType ? JOB_TYPE_LABELS[parsedData.jobType] : undefined} />
                  <FieldRow label="Hình thức" value={parsedData.workMode ? WORK_MODE_LABELS[parsedData.workMode] : undefined} />
                  <FieldRow label="Kinh nghiệm (năm)" value={parsedData.experienceMin?.toString()} />
                  <FieldRow label="Lương từ" value={parsedData.salaryMin ? `${(parsedData.salaryMin / 1_000_000).toFixed(0)} triệu` : undefined} />
                  <FieldRow label="Lương đến" value={parsedData.salaryMax ? `${(parsedData.salaryMax / 1_000_000).toFixed(0)} triệu` : undefined} />
                  {parsedData.description && (
                    <div className="py-2.5 border-b border-gray-100">
                      <p className="text-sm text-gray-500 mb-1">Mô tả công việc</p>
                      <div
                        className="text-sm text-gray-700 line-clamp-3 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: parsedData.description }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 border-t border-gray-100 px-5 py-3">
                  <button
                    type="button"
                    onClick={() => { setParsedData(null); parseMutation.reset() }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Phân tích lại
                  </button>
                  <button
                    type="button"
                    onClick={() => applyData(parsedData)}
                    className="ml-auto flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand/90"
                  >
                    Áp dụng và tiếp tục
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Step: AI Suggest
      ══════════════════════════════════════════════════════════════════════ */}
      {step === 'ai-suggest' && (
        <div className="flex min-h-[calc(100vh-105px)] justify-center bg-gray-50 px-4 py-8">
          <div className="w-full max-w-xl">
            {/* Header */}
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-brand">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">AI gợi ý nội dung JD</h2>
                <p className="mt-0.5 text-sm text-gray-500">
                  Nhập thông tin cơ bản — AI sẽ tạo mô tả công việc, yêu cầu và quyền lợi phù hợp.
                </p>
              </div>
            </div>

            {!aiData ? (
              <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                {/* Position (required) */}
                <div>
                  <label className="label">
                    Tên vị trí tuyển dụng <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={aiPosition}
                    onChange={e => setAiPosition(e.target.value)}
                    className="input"
                    placeholder="VD: Senior Frontend Developer, Kế toán trưởng, Project Manager..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="label">Lĩnh vực chuyên môn</label>
                  <select value={aiCategoryId} onChange={e => setAiCategoryId(e.target.value)} className="input">
                    <option value="">-- Chọn lĩnh vực --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Experience */}
                <div>
                  <label className="label">Kinh nghiệm yêu cầu</label>
                  <select value={aiExperience} onChange={e => setAiExperience(e.target.value)} className="input">
                    <option value="">Không yêu cầu cụ thể</option>
                    <option value="0">Fresher / Không yêu cầu</option>
                    <option value="1">1 năm trở lên</option>
                    <option value="2">2 năm trở lên</option>
                    <option value="3">3 năm trở lên</option>
                    <option value="5">5 năm trở lên</option>
                  </select>
                </div>

                {/* Skills */}
                <div>
                  <label className="label">Kỹ năng / Công nghệ chính</label>
                  <input
                    value={aiSkills}
                    onChange={e => setAiSkills(e.target.value)}
                    className="input"
                    placeholder="VD: React, TypeScript, Node.js, REST API..."
                  />
                  <p className="mt-1 text-xs text-gray-400">Tách bằng dấu phẩy, càng cụ thể AI gợi ý càng chất lượng</p>
                </div>

                {/* Extra context */}
                <div>
                  <label className="label">Ghi chú thêm cho AI</label>
                  <textarea
                    value={aiContext}
                    onChange={e => setAiContext(e.target.value)}
                    rows={3}
                    className="input resize-none"
                    placeholder="VD: Ưu tiên ứng viên có kinh nghiệm startup, làm việc theo mô hình Agile, có thể làm remote một phần..."
                  />
                </div>

                {/* Generate button */}
                <button
                  type="button"
                  disabled={generateMutation.isPending || aiPosition.trim().length < 3}
                  onClick={() =>
                    generateMutation.mutate({
                      position: aiPosition,
                      categoryId: aiCategoryId || undefined,
                      experienceMin: aiExperience ? Number(aiExperience) : undefined,
                      skills: aiSkills ? aiSkills.split(',').map(s => s.trim()).filter(Boolean) : undefined,
                      context: aiContext || undefined,
                    })
                  }
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-brand py-3 text-sm font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      AI đang tạo nội dung...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4" />
                      Tạo nội dung với AI
                    </>
                  )}
                </button>

                {generateMutation.isPending && (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    <Loader2Icon className="h-3.5 w-3.5 animate-spin shrink-0" />
                    Toppy AI đang phân tích và tạo JD phù hợp với vị trí của bạn...
                  </div>
                )}

                {generateMutation.isError && (
                  <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                    <AlertCircleIcon className="h-4 w-4 shrink-0" />
                    {generateMutation.error.message || 'Tạo nội dung thất bại, vui lòng thử lại.'}
                  </div>
                )}
              </div>
            ) : (
              /* AI Result */
              <div className="overflow-hidden rounded-xl border border-brand/30 bg-white shadow-sm">
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-brand-50 px-5 py-3">
                  <SparklesIcon className="h-5 w-5 text-brand" />
                  <span className="font-semibold text-brand">AI đã tạo xong nội dung JD!</span>
                  <span className="ml-auto rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand">
                    {aiPosition}
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {aiData.description && (
                    <div className="p-5">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Mô tả công việc</p>
                      <div
                        className="prose prose-sm max-w-none text-gray-700 line-clamp-6"
                        dangerouslySetInnerHTML={{ __html: aiData.description }}
                      />
                    </div>
                  )}
                  {aiData.requirements && (
                    <div className="p-5">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Yêu cầu ứng viên</p>
                      <div
                        className="prose prose-sm max-w-none text-gray-700 line-clamp-6"
                        dangerouslySetInnerHTML={{ __html: aiData.requirements }}
                      />
                    </div>
                  )}
                  {aiData.benefits && (
                    <div className="p-5">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Quyền lợi</p>
                      <div
                        className="prose prose-sm max-w-none text-gray-700 line-clamp-4"
                        dangerouslySetInnerHTML={{ __html: aiData.benefits }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 border-t border-gray-100 px-5 py-3">
                  <button
                    type="button"
                    onClick={() => { setAiData(null); generateMutation.reset() }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Tạo lại
                  </button>
                  <button
                    type="button"
                    onClick={() => applyData({ ...aiData, title: aiPosition })}
                    className="ml-auto flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand/90"
                  >
                    Áp dụng và tiếp tục
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Step: Form (3-column layout)
      ══════════════════════════════════════════════════════════════════════ */}
      {step === 'form' && (
        <div className="flex min-h-0">

          {/* Left nav */}
          <aside className={cn(
            'scrollbar-hover sticky top-[49px] self-start h-[calc(100vh-105px)] shrink-0 overflow-y-auto border-r border-gray-200 bg-white transition-all duration-300',
            leftOpen ? 'w-52' : 'w-11',
          )}>
            <button
              onClick={() => setLeftOpen(v => !v)}
              className="flex h-9 w-full items-center justify-end border-b border-gray-100 px-3 text-gray-400 hover:text-gray-600 transition"
            >
              {leftOpen ? <ChevronLeftIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
            </button>
            <div className="py-2">
              {navStats.map(section => {
                const allDone = section.filledCount === section.items.length
                const isOpen  = openSections.has(section.id)
                return (
                  <div key={section.id} className="mb-0.5">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={cn(
                        'flex w-full items-center gap-2.5 px-3 py-2 text-left transition hover:bg-gray-50',
                        isOpen && 'text-brand',
                      )}
                    >
                      <span className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition',
                        allDone ? 'bg-brand text-white'
                        : isOpen ? 'bg-brand text-white'
                        : 'bg-gray-200 text-gray-600',
                      )}>{section.id}</span>
                      {leftOpen && (
                        <>
                          <span className="flex-1 text-sm font-semibold leading-tight">{section.label}</span>
                          <span className={cn('text-xs font-medium', allDone ? 'text-brand' : 'text-gray-400')}>
                            {section.filledCount}/{section.items.length}
                          </span>
                        </>
                      )}
                    </button>
                    {leftOpen && isOpen && (
                      <div className="pb-1 pl-10 pr-3">
                        {section.items.map(item => {
                          const filled = isFilled(formValues, item.fields)
                          return (
                            <div key={item.key} className="flex items-center gap-2 py-0.5">
                              {filled
                                ? <CheckCircle2Icon className="h-3.5 w-3.5 shrink-0 text-brand" />
                                : <CircleIcon className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                              }
                              <span className={cn('text-xs leading-tight', filled ? 'text-gray-700' : 'text-gray-400')}>
                                {item.label}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </aside>

          {/* Center form */}
          <div className="min-w-0 flex-1 bg-gray-50 pb-12">
            <form id="new-job-form" onSubmit={handleSubmit(d => submitMutation.mutate(d))} className="space-y-3 p-4 lg:p-5">

              <Section
                id="1" title="Thông tin chung"
                filled={navStats[0].filledCount} total={navStats[0].items.length}
                open={openSections.has('1')} onToggle={() => toggleSection('1')}
              >
                <div className="space-y-5">
                  <div>
                    <label className="label">Tiêu đề tin *</label>
                    <div className="relative">
                      <input {...register('title')} maxLength={50} className="input pr-16" placeholder="VD: Senior Frontend Developer" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{titleValue.length}/50</span>
                    </div>
                    {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                  </div>
                  <div>
                    <label className="label">Vị trí chuyên môn</label>
                    <select {...register('categoryId')} className="input">
                      <option value="">-- Chọn phân loại --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon ? `${cat.icon} ` : ''}{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label">Loại công việc *</label>
                      <select {...register('jobType')} className="input">
                        {Object.values(JobType).map(t => <option key={t} value={t}>{JOB_TYPE_LABELS[t]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Hình thức làm việc *</label>
                      <select {...register('workMode')} className="input">
                        {Object.values(WorkMode).map(m => <option key={m} value={m}>{WORK_MODE_LABELS[m]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Thành phố *</label>
                      <select {...register('city')} className="input">
                        <option value="">Chọn thành phố</option>
                        {VIETNAM_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="label">Địa chỉ cụ thể *</label>
                      <input {...register('location')} className="input" placeholder="VD: Quận Cầu Giấy, Hà Nội" />
                      {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="label">Mức lương</label>
                    <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm">
                      <input {...register('salaryNegotiable')} type="checkbox" className="accent-brand" />
                      Thỏa thuận (không hiển thị mức lương cụ thể)
                    </label>
                    {!salaryNegotiable && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="label">Lương tối thiểu (VND)</label>
                          <input {...register('salaryMin')} type="number" min={0} step={500000} className="input" placeholder="VD: 15.000.000" />
                        </div>
                        <div>
                          <label className="label">Lương tối đa (VND)</label>
                          <input {...register('salaryMax')} type="number" min={0} step={500000} className="input" placeholder="VD: 30.000.000" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Section>

              <Section
                id="2" title="Mô tả công việc"
                filled={navStats[1].filledCount} total={navStats[1].items.length}
                open={openSections.has('2')} onToggle={() => toggleSection('2')}
              >
                <div className="space-y-5">
                  <div>
                    <label className="label">Mô tả công việc *</label>
                    <Controller name="description" control={control}
                      render={({ field }) => (
                        <RichEditor value={field.value ?? ''} onChange={field.onChange}
                          placeholder="Mô tả chi tiết về vị trí, công việc hàng ngày..." minHeight={200} error={!!errors.description} />
                      )}
                    />
                    {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
                  </div>
                  <div>
                    <label className="label">Yêu cầu ứng viên</label>
                    <Controller name="requirements" control={control}
                      render={({ field }) => (
                        <RichEditor value={field.value ?? ''} onChange={field.onChange}
                          placeholder="Kỹ năng, kinh nghiệm, bằng cấp yêu cầu..." minHeight={150} />
                      )}
                    />
                  </div>
                  <div>
                    <label className="label">Quyền lợi</label>
                    <Controller name="benefits" control={control}
                      render={({ field }) => (
                        <RichEditor value={field.value ?? ''} onChange={field.onChange}
                          placeholder="Lương, thưởng, bảo hiểm, team building..." minHeight={150} />
                      )}
                    />
                  </div>
                </div>
              </Section>

              <Section
                id="3" title="Kỳ vọng về ứng viên"
                filled={navStats[2].filledCount} total={navStats[2].items.length}
                open={openSections.has('3')} onToggle={() => toggleSection('3')}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Kinh nghiệm tối thiểu (năm)</label>
                    <input {...register('experienceMin')} type="number" min={0} max={30} className="input" placeholder="VD: 2" />
                  </div>
                  <div>
                    <label className="label">Số lượng tuyển</label>
                    <input {...register('quantity')} type="number" min={1} className="input" />
                  </div>
                  <div>
                    <label className="label">Hạn nộp hồ sơ</label>
                    <input {...register('deadline')} type="date" className="input" />
                  </div>
                </div>
              </Section>

              {submitMutation.isError && (
                <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                  {(submitMutation.error as Error).message}
                </div>
              )}
            </form>
          </div>

          {/* Right panel toggle */}
          <button
            onClick={() => setRightOpen(v => !v)}
            className="sticky top-[60px] self-start flex h-8 w-5 shrink-0 items-center justify-center bg-gray-100 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
          >
            {rightOpen ? <ChevronRightIcon className="h-3.5 w-3.5" /> : <ChevronLeftIcon className="h-3.5 w-3.5" />}
          </button>

          {/* Right preview */}
          <aside className={cn(
            'scrollbar-hover sticky top-[49px] self-start h-[calc(100vh-105px)] shrink-0 overflow-y-auto border-l border-gray-200 bg-white transition-all duration-300',
            rightOpen ? 'w-72' : 'w-0 overflow-hidden',
          )}>
            {rightOpen && (
              <div className="p-4">
                <div className="mb-4 flex items-center gap-0.5">
                  {(['preview', 'evaluate'] as const).map(tab => (
                    <button key={tab} onClick={() => setPreviewTab(tab)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition',
                        previewTab === tab ? 'bg-brand-50 text-brand' : 'text-gray-500 hover:bg-gray-50',
                      )}
                    >
                      {tab === 'preview' ? <EyeIcon className="h-3.5 w-3.5" /> : <BarChart2Icon className="h-3.5 w-3.5" />}
                      {tab === 'preview' ? 'Xem trước' : 'Đánh giá'}
                    </button>
                  ))}
                  <span className="ml-auto text-xs font-semibold text-gray-400">--%</span>
                </div>

                <div className="mb-3 flex items-center gap-1 text-xs text-brand">
                  <span>Trên trang:</span>
                  <span className="font-semibold">Danh sách việc làm</span>
                  <ChevronDownIcon className="h-3 w-3" />
                </div>

                <div className="rounded-xl border border-gray-200 p-3.5 shadow-sm">
                  <div className="mb-2 flex items-start gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10">
                      <BriefcaseIcon className="h-5 w-5 text-brand" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-bold leading-tight text-gray-900">
                        {titleValue || 'Chức danh công việc'}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] uppercase tracking-wide text-gray-500">
                        {companyName}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500">
                    {formValues.city && (
                      <span className="flex items-center gap-0.5">
                        <MapPinIcon className="h-3 w-3" />{formValues.city}
                      </span>
                    )}
                    {formValues.workMode && (
                      <span className="flex items-center gap-0.5">
                        <BriefcaseIcon className="h-3 w-3" />{WORK_MODE_LABELS[formValues.workMode]}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {formValues.jobType && (
                      <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                        {JOB_TYPE_LABELS[formValues.jobType]}
                      </span>
                    )}
                    {formValues.salaryNegotiable && (
                      <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand">Thỏa thuận</span>
                    )}
                    {!formValues.salaryNegotiable && formValues.salaryMax && (
                      <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                        {((formValues.salaryMin ?? 0) / 1_000_000).toFixed(0)}–{(formValues.salaryMax / 1_000_000).toFixed(0)} triệu
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs leading-relaxed text-gray-600">
                    Sử dụng dịch vụ để đặt Tiêu đề có thể dài tới <strong>255 ký tự</strong> và hiển thị tin với{' '}
                    <span className="font-semibold text-brand">nền nổi bật</span>.
                  </p>
                  <button className="mt-3 w-full rounded-lg bg-brand px-3 py-2 text-sm font-bold text-white transition hover:bg-brand/90">
                    Kích hoạt dịch vụ &rsaquo;
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}
