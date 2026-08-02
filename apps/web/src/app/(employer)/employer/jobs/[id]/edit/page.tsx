'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import {
  JobType, WorkMode, VIETNAM_CITIES,
  JOB_TYPE_LABELS, WORK_MODE_LABELS, JobCategoryDto,
} from '@tuyendung/types'
import {
  ArrowLeftIcon, ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon,
  CheckCircle2Icon, CircleIcon, ExternalLinkIcon, FlagIcon, InfoIcon,
  BriefcaseIcon, MapPinIcon, EyeIcon, BarChart2Icon, SaveIcon,
} from 'lucide-react'
import Link from 'next/link'
import { RichEditor } from '@/components/ui/RichEditor'
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

// ── Status badges ─────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  DRAFT:            { label: 'Nháp',           cls: 'bg-gray-100 text-gray-600' },
  PENDING_APPROVAL: { label: 'Chờ duyệt',      cls: 'bg-yellow-100 text-yellow-700' },
  PUBLISHED:        { label: 'Đang hiển thị',  cls: 'bg-brand-100 text-brand' },
  CLOSED:           { label: 'Không hiển thị', cls: 'bg-orange-100 text-orange-700' },
  EXPIRED:          { label: 'Hết hạn',         cls: 'bg-red-100 text-red-600' },
  REJECTED:         { label: 'Từ chối',         cls: 'bg-red-100 text-red-600' },
}

// ── Nav sections ──────────────────────────────────────────────────────────────

type FieldKey = keyof FormData
type NavItem = { key: string; label: string; fields: FieldKey[] }

const NAV: { id: string; label: string; items: NavItem[] }[] = [
  {
    id: '1', label: 'Thông tin chung',
    items: [
      { key: 'title',    label: 'Tiêu đề tin',        fields: ['title'] },
      { key: 'category', label: 'Vị trí chuyên môn',  fields: ['categoryId'] },
      { key: 'jobType',  label: 'Loại công việc',      fields: ['jobType'] },
      { key: 'workMode', label: 'Hình thức làm việc',  fields: ['workMode'] },
      { key: 'city',     label: 'Địa điểm làm việc',  fields: ['city', 'location'] },
      { key: 'salary',   label: 'Mức lương',           fields: ['salaryMin', 'salaryMax', 'salaryNegotiable'] },
    ],
  },
  {
    id: '2', label: 'Mô tả công việc',
    items: [
      { key: 'desc',  label: 'Mô tả công việc',    fields: ['description'] },
      { key: 'req',   label: 'Yêu cầu ứng viên',   fields: ['requirements'] },
      { key: 'ben',   label: 'Quyền lợi ứng viên', fields: ['benefits'] },
    ],
  },
  {
    id: '3', label: 'Kỳ vọng về ứng viên',
    items: [
      { key: 'exp',      label: 'Kinh nghiệm',     fields: ['experienceMin'] },
      { key: 'quantity', label: 'Số lượng tuyển',  fields: ['quantity'] },
      { key: 'deadline', label: 'Hạn nộp hồ sơ',  fields: ['deadline'] },
    ],
  },
]

function isFilled(values: Partial<FormData>, fields: FieldKey[]): boolean {
  if (fields.includes('salaryNegotiable')) {
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

// ── Accordion section ─────────────────────────────────────────────────────────

function Section({
  id, title, filled, total, open, onToggle, children,
}: {
  id: string; title: string; filled: number; total: number
  open: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
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
        )}>
          {id}
        </span>
        <span className={cn('flex-1 font-semibold', open ? 'text-white' : 'text-gray-900')}>
          {title}
        </span>
        <span className={cn('text-sm font-medium', open ? 'text-white/80' : filled === total ? 'text-brand' : 'text-gray-400')}>
          {filled}/{total}
        </span>
        {open
          ? <ChevronUpIcon className="h-4 w-4 text-white/80 shrink-0" />
          : <ChevronDownIcon className="h-4 w-4 text-gray-400 shrink-0" />
        }
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const [leftOpen,    setLeftOpen]    = useState(true)
  const [rightOpen,   setRightOpen]   = useState(true)
  const [openSections, setOpenSections] = useState(new Set(['1']))
  const [previewTab,  setPreviewTab]  = useState<'preview' | 'evaluate'>('preview')

  const { data: categories = [] } = useQuery<JobCategoryDto[]>({
    queryKey: ['job-categories'],
    queryFn:  () => api.get('/job-categories'),
  })

  const { data: job, isLoading } = useQuery<any>({
    queryKey: ['employer-job', id],
    queryFn:  () => api.get(`/jobs/employer/${id}`),
    enabled:  !!id,
  })

  const { register, handleSubmit, watch, reset, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      jobType: JobType.FULL_TIME,
      workMode: WorkMode.ONSITE,
      quantity: 1,
      salaryNegotiable: false,
    },
  })

  const formValues = useWatch({ control }) as Partial<FormData>

  useEffect(() => {
    if (job) {
      reset({
        title:            job.title ?? '',
        categoryId:       job.categoryId ?? '',
        description:      job.description ?? '',
        requirements:     job.requirements ?? '',
        benefits:         job.benefits ?? '',
        city:             job.city ?? '',
        location:         job.location ?? '',
        jobType:          job.jobType ?? JobType.FULL_TIME,
        workMode:         job.workMode ?? WorkMode.ONSITE,
        salaryMin:        job.salaryMin ?? undefined,
        salaryMax:        job.salaryMax ?? undefined,
        salaryNegotiable: job.salaryNegotiable ?? false,
        experienceMin:    job.experienceMin ?? undefined,
        quantity:         job.quantity ?? 1,
        deadline:         job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : '',
      })
    }
  }, [job, reset])

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.put(`/jobs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employer-jobs'] })
      queryClient.invalidateQueries({ queryKey: ['employer-job', id] })
      toast.success('Đã lưu thay đổi thành công')
    },
  })

  const salaryNegotiable = watch('salaryNegotiable')
  const titleValue = watch('title') || ''

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

  const statusBadge = job?.status ? STATUS_BADGE[job.status] : null

  // ── Loading / not found ────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="-mx-4 -mt-4 sm:-mx-5 sm:-mt-5 lg:-mx-6 lg:-mt-6 flex h-[calc(100vh-56px)] items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="-mx-4 -mt-4 sm:-mx-5 sm:-mt-5 lg:-mx-6 lg:-mt-6 flex h-[calc(100vh-56px)] items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-400">Không tìm thấy tin tuyển dụng</p>
          <Link href="/employer/jobs" className="mt-3 inline-block text-sm text-brand hover:underline">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="-mx-4 -mt-4 sm:-mx-5 sm:-mt-5 lg:-mx-6 lg:-mt-6 flex flex-col">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-2 lg:px-5">
        <Link
          href="/employer/jobs"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-brand hover:text-brand transition"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5" />
        </Link>

        {/* Breadcrumb */}
        <div className="flex min-w-0 items-center gap-1.5 text-sm text-gray-500">
          <Link href="/employer/jobs" className="shrink-0 hover:text-brand">Tin tuyển dụng</Link>
          <span className="text-gray-300">/</span>
          <span className="truncate font-semibold text-gray-900">{job.title}</span>
          <Link href={`/jobs/${job.slug}`} target="_blank" className="shrink-0 hover:text-brand">
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Status badges */}
        {statusBadge && (
          <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium', statusBadge.cls)}>
            {statusBadge.label}
          </span>
        )}
        <div className="hidden items-center gap-1 text-xs text-gray-500 sm:flex">
          <FlagIcon className="h-3.5 w-3.5 text-gray-400" />
          <span className="max-w-[160px] truncate font-medium">{job.title}</span>
        </div>

        {/* Right actions */}
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <a href="#" className="hidden items-center gap-1 text-xs text-brand hover:underline sm:flex">
            <InfoIcon className="h-3.5 w-3.5" />
            Quy định đăng tin
          </a>
          <button
            type="submit"
            form="edit-job-form"
            disabled={mutation.isPending}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-brand/90 disabled:opacity-60"
          >
            <SaveIcon className="h-3.5 w-3.5" />
            {mutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      {/* ── Body: 3 columns ─────────────────────────────────────────────── */}
      <div className="flex min-h-0">

        {/* ── Left nav ─────────────────────────────────────────────────── */}
        <aside
          className={cn(
            'scrollbar-hover sticky top-[49px] self-start h-[calc(100vh-105px)] shrink-0 overflow-y-auto border-r border-gray-200 bg-white transition-all duration-300',
            leftOpen ? 'w-52' : 'w-11',
          )}
        >
          {/* Toggle */}
          <button
            onClick={() => setLeftOpen(v => !v)}
            className="flex h-9 w-full items-center justify-end border-b border-gray-100 px-3 text-gray-400 hover:text-gray-600 transition"
          >
            {leftOpen
              ? <ChevronLeftIcon className="h-4 w-4" />
              : <ChevronRightIcon className="h-4 w-4" />
            }
          </button>

          {/* Sections */}
          <div className="py-2">
            {navStats.map((section) => {
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
                      allDone   ? 'bg-brand text-white'
                      : isOpen  ? 'bg-brand text-white'
                      : 'bg-gray-200 text-gray-600',
                    )}>
                      {section.id}
                    </span>

                    {leftOpen && (
                      <>
                        <span className="flex-1 text-sm font-semibold leading-tight">
                          {section.label}
                        </span>
                        <span className={cn(
                          'text-xs font-medium',
                          allDone ? 'text-brand' : 'text-gray-400',
                        )}>
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

        {/* ── Center form ─────────────────────────────────────────────────── */}
        <div className="min-w-0 flex-1 bg-gray-50 pb-12">
          <form id="edit-job-form" onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-3 p-4 lg:p-5">

            {/* Section 1 */}
            <Section
              id="1" title="Thông tin chung"
              filled={navStats[0].filledCount} total={navStats[0].items.length}
              open={openSections.has('1')} onToggle={() => toggleSection('1')}
            >
              <div className="space-y-5">
                <div>
                  <label className="label">Tiêu đề tin *</label>
                  <div className="relative">
                    <input
                      {...register('title')}
                      maxLength={50}
                      className="input pr-16"
                      placeholder="VD: Senior Frontend Developer"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      {titleValue.length}/50
                    </span>
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
                      {Object.values(JobType).map(t => (
                        <option key={t} value={t}>{JOB_TYPE_LABELS[t]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Hình thức làm việc *</label>
                    <select {...register('workMode')} className="input">
                      {Object.values(WorkMode).map(m => (
                        <option key={m} value={m}>{WORK_MODE_LABELS[m]}</option>
                      ))}
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

            {/* Section 2 */}
            <Section
              id="2" title="Mô tả công việc"
              filled={navStats[1].filledCount} total={navStats[1].items.length}
              open={openSections.has('2')} onToggle={() => toggleSection('2')}
            >
              <div className="space-y-5">
                <div>
                  <label className="label">Mô tả công việc *</label>
                  <Controller
                    name="description" control={control}
                    render={({ field }) => (
                      <RichEditor value={field.value ?? ''} onChange={field.onChange}
                        placeholder="Mô tả chi tiết về vị trí, công việc hàng ngày..."
                        minHeight={200} error={!!errors.description} />
                    )}
                  />
                  {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
                </div>
                <div>
                  <label className="label">Yêu cầu ứng viên</label>
                  <Controller
                    name="requirements" control={control}
                    render={({ field }) => (
                      <RichEditor value={field.value ?? ''} onChange={field.onChange}
                        placeholder="Kỹ năng, kinh nghiệm, bằng cấp yêu cầu..." minHeight={150} />
                    )}
                  />
                </div>
                <div>
                  <label className="label">Quyền lợi</label>
                  <Controller
                    name="benefits" control={control}
                    render={({ field }) => (
                      <RichEditor value={field.value ?? ''} onChange={field.onChange}
                        placeholder="Lương, thưởng, bảo hiểm, team building..." minHeight={150} />
                    )}
                  />
                </div>
              </div>
            </Section>

            {/* Section 3 */}
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

            {mutation.isError && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                {(mutation.error as Error).message}
              </div>
            )}
          </form>
        </div>

        {/* ── Right panel toggle ───────────────────────────────────────────── */}
        <button
          onClick={() => setRightOpen(v => !v)}
          className="sticky top-[60px] self-start flex h-8 w-5 shrink-0 items-center justify-center bg-gray-100 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
        >
          {rightOpen
            ? <ChevronRightIcon className="h-3.5 w-3.5" />
            : <ChevronLeftIcon className="h-3.5 w-3.5" />
          }
        </button>

        {/* ── Right preview ────────────────────────────────────────────────── */}
        <aside
          className={cn(
            'scrollbar-hover sticky top-[49px] self-start h-[calc(100vh-105px)] shrink-0 overflow-y-auto border-l border-gray-200 bg-white transition-all duration-300',
            rightOpen ? 'w-72' : 'w-0 overflow-hidden',
          )}
        >
          {rightOpen && (
            <div className="p-4">
              {/* Tabs */}
              <div className="mb-4 flex items-center gap-0.5">
                {(['preview', 'evaluate'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setPreviewTab(tab)}
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

              {/* On page */}
              <div className="mb-3 flex items-center gap-1 text-xs text-brand">
                <span>Trên trang:</span>
                <span className="font-semibold">Danh sách việc làm</span>
                <ChevronDownIcon className="h-3 w-3" />
              </div>

              {/* Preview card */}
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
                      Tên công ty
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
                    <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                      Thỏa thuận
                    </span>
                  )}
                  {!formValues.salaryNegotiable && formValues.salaryMax && (
                    <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                      {((formValues.salaryMin ?? 0) / 1_000_000).toFixed(0)}–{(formValues.salaryMax / 1_000_000).toFixed(0)} triệu
                    </span>
                  )}
                </div>
              </div>

              {/* Service upsell */}
              <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs leading-relaxed text-gray-600">
                  Sử dụng dịch vụ để đặt Tiêu đề có thể dài tới{' '}
                  <strong>255 ký tự</strong> và hiển thị tin với{' '}
                  <span className="font-semibold text-brand">nền nổi bật</span>.
                </p>
                <button className="mt-3 w-full rounded-lg bg-brand px-3 py-2 text-sm font-bold text-white transition hover:bg-brand/90">
                  Kích hoạt dịch vụ &rsaquo;
                </button>
              </div>

              {/* View live */}
              <Link
                href={`/jobs/${job.slug}`}
                target="_blank"
                className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-brand hover:text-brand"
              >
                <ExternalLinkIcon className="h-3.5 w-3.5" />
                Xem trước tin đăng
              </Link>
            </div>
          )}
        </aside>

      </div>
    </div>
  )
}
