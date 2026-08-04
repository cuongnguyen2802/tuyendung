'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { CompanySize, COMPANY_SIZE_LABELS, VIETNAM_CITIES } from '@tuyendung/types'
import {
  Building2Icon, GlobeIcon, MapPinIcon, BadgeCheckIcon, BriefcaseIcon,
  UploadIcon, XIcon, ImageIcon, PhoneIcon, FacebookIcon, LinkedinIcon,
  ShieldCheckIcon, CheckCircle2Icon, CameraIcon, UsersIcon,
  CalendarIcon, HashIcon, FileTextIcon, LinkIcon, CheckIcon,
  AlertCircleIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Company {
  id: string
  companyName: string
  slug: string
  logoUrl?: string
  coverUrl?: string
  website?: string
  description?: string
  size?: CompanySize
  industry?: string
  founded?: number
  address?: string
  city?: string
  country?: string
  taxCode?: string
  phone?: string
  facebookUrl?: string
  linkedinUrl?: string
  verified: boolean
  _count?: { jobs: number }
}

const schema = z.object({
  companyName:  z.string().min(2, 'Tên công ty ít nhất 2 ký tự'),
  website:      z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  description:  z.string().optional(),
  size:         z.nativeEnum(CompanySize).optional(),
  industry:     z.string().optional(),
  founded:      z.coerce.number().int().min(1800).max(2030).optional().or(z.literal('')),
  address:      z.string().optional(),
  city:         z.string().optional(),
  country:      z.string().optional(),
  taxCode:      z.string().optional(),
  phone:        z.string().optional(),
  facebookUrl:  z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  linkedinUrl:  z.string().url('URL không hợp lệ').optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

// ── Image Uploader ────────────────────────────────────────────────────────────

function ImageUploader({
  type, label, hint, currentUrl, aspect, onSuccess,
}: {
  type: 'logo' | 'cover'
  label: string
  hint: string
  currentUrl?: string
  aspect: 'square' | 'wide'
  onSuccess: (url: string) => void
}) {
  const [dragging, setDragging]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview]     = useState<string | undefined>(currentUrl)
  const [error, setError]         = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setPreview(currentUrl) }, [currentUrl])

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Chỉ chấp nhận file ảnh (jpg, png, webp)'); return }
    const maxMb = type === 'cover' ? 10 : 5
    if (file.size > maxMb * 1024 * 1024) { setError(`File quá lớn, tối đa ${maxMb}MB`); return }
    setError(''); setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res: any = await api.post(`/employers/me/upload-${type}`, fd)
      setPreview(res.url); onSuccess(res.url)
    } catch (e: any) {
      setError(e.message || 'Upload thất bại')
    } finally {
      setUploading(false)
    }
  }

  const onDrop  = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) upload(f) }
  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }
  const remove  = async () => { setPreview(undefined); await api.put('/employers/me/company', { [`${type}Url`]: '' }); onSuccess('') }

  if (aspect === 'wide') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">{label}</p>
          <p className="text-xs text-gray-400">{hint}</p>
        </div>
        <div
          className={cn(
            'group relative w-full overflow-hidden rounded-2xl border-2 border-dashed transition-all',
            dragging ? 'border-brand bg-brand/5 scale-[1.01]' : 'border-gray-200 bg-gray-50 hover:border-gray-300',
            'cursor-pointer',
          )}
          style={{ height: 180 }}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          {preview ? (
            <>
              <img src={preview} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition group-hover:opacity-100">
                <button type="button" onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
                  className="flex items-center gap-1.5 rounded-xl bg-white/95 px-4 py-2 text-sm font-semibold text-gray-800 shadow transition hover:bg-white">
                  <CameraIcon className="h-4 w-4" />Đổi ảnh
                </button>
                <button type="button" onClick={e => { e.stopPropagation(); remove() }}
                  className="flex items-center gap-1.5 rounded-xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-500">
                  <XIcon className="h-4 w-4" />Xóa
                </button>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
              {uploading ? (
                <><div className="h-7 w-7 animate-spin rounded-full border-2 border-brand border-t-transparent" /><p className="text-sm">Đang tải lên...</p></>
              ) : (
                <>
                  <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 transition', dragging && 'bg-brand/10')}>
                    <ImageIcon className={cn('h-6 w-6', dragging ? 'text-brand' : 'text-gray-400')} />
                  </div>
                  <p className="text-sm font-medium text-gray-600">{dragging ? 'Thả ảnh vào đây' : 'Kéo thả hoặc nhấn để chọn ảnh bìa'}</p>
                  <p className="text-xs text-gray-400">PNG, JPG, WebP • Khuyến nghị 1200×400px</p>
                </>
              )}
            </div>
          )}
        </div>
        {error && <p className="flex items-center gap-1 text-xs text-red-500"><AlertCircleIcon className="h-3.5 w-3.5" />{error}</p>}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onInput} />
      </div>
    )
  }

  // Square (logo)
  return (
    <div className="flex items-start gap-5">
      <div
        className={cn(
          'group relative h-28 w-28 shrink-0 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all',
          dragging ? 'border-brand bg-brand/5 scale-105' : 'border-gray-200 bg-gray-50 hover:border-gray-300',
        )}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <>
            <img src={preview} alt="" className="h-full w-full object-contain p-2" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
              <CameraIcon className="h-6 w-6 text-white" />
            </div>
            <button type="button" onClick={e => { e.stopPropagation(); remove() }}
              className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow transition group-hover:opacity-100 hover:bg-red-600">
              <XIcon className="h-3 w-3" />
            </button>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-gray-400">
            {uploading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            ) : (
              <>
                <Building2Icon className={cn('h-8 w-8 transition', dragging ? 'text-brand' : 'text-gray-300')} />
                <span className="px-2 text-center text-[10px] leading-tight">Kéo thả hoặc click</span>
              </>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 pt-2">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="mt-0.5 text-xs text-gray-400">{hint}</p>
        <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-brand hover:bg-brand/5 hover:text-brand disabled:opacity-50">
          <UploadIcon className="h-3.5 w-3.5" />
          {uploading ? 'Đang tải...' : 'Chọn ảnh'}
        </button>
        {error && <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500"><AlertCircleIcon className="h-3.5 w-3.5" />{error}</p>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onInput} />
    </div>
  )
}

// ── Section card ──────────────────────────────────────────────────────────────

function SectionCard({ icon, color, title, children }: {
  icon: React.ReactNode; color: string; title: string; children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-5 py-3.5">
        <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', color)}>
          {icon}
        </div>
        <h2 className="text-sm font-bold text-gray-800">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ── Completion meter ──────────────────────────────────────────────────────────

function CompletionMeter({ pct }: { pct: number }) {
  const color = pct >= 80 ? 'bg-brand' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'
  const label = pct >= 80 ? 'Hồ sơ hoàn chỉnh' : pct >= 50 ? 'Đang hoàn thiện' : 'Cần bổ sung thêm'
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-gray-500">{label}</span>
        <span className={cn(pct >= 80 ? 'text-brand' : pct >= 50 ? 'text-amber-600' : 'text-red-500')}>{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CompanyProfilePage() {
  const queryClient = useQueryClient()
  const [logoUrl, setLogoUrl]   = useState<string | undefined>()
  const [coverUrl, setCoverUrl] = useState<string | undefined>()
  const [saved, setSaved]       = useState(false)

  const { data: company, isLoading } = useQuery<Company>({
    queryKey: ['my-company'],
    queryFn: () => api.get('/employers/me/company'),
  })

  const { register, handleSubmit, reset, control, formState: { errors, isDirty, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const watched = useWatch({ control })

  useEffect(() => {
    if (company) {
      setLogoUrl(company.logoUrl)
      setCoverUrl(company.coverUrl)
      reset({
        companyName:  company.companyName ?? '',
        website:      company.website ?? '',
        description:  company.description ?? '',
        size:         company.size,
        industry:     company.industry ?? '',
        founded:      company.founded ?? '',
        address:      company.address ?? '',
        city:         company.city ?? '',
        country:      company.country ?? 'Vietnam',
        taxCode:      company.taxCode ?? '',
        phone:        company.phone ?? '',
        facebookUrl:  company.facebookUrl ?? '',
        linkedinUrl:  company.linkedinUrl ?? '',
      })
    }
  }, [company, reset])

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.put('/employers/me/company', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-company'] })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    },
  })

  // Profile completion score
  const completionPct = useMemo(() => {
    const fields: (string | undefined | null | number)[] = [
      watched.companyName, logoUrl, coverUrl, watched.website,
      watched.description, watched.industry, watched.size,
      watched.city, watched.address, watched.phone,
    ]
    const filled = fields.filter(f => f && String(f).trim().length > 0).length
    return Math.round((filled / fields.length) * 100)
  }, [watched, logoUrl, coverUrl])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />
        {[1, 2, 3].map(i => <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />)}
      </div>
    )
  }

  const displayName = watched.companyName || company?.companyName || 'Tên công ty'
  const displayCity = watched.city || company?.city
  const displayWebsite = watched.website || company?.website
  const jobCount = company?._count?.jobs ?? 0

  return (
    <div className="space-y-5 pb-10">

      {/* ── Company profile preview ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">

        {/* Cover + logo overlay — relative wrapper so logo can be absolute */}
        <div className="relative">
          {/* Cover */}
          <div className="relative h-36 w-full overflow-hidden rounded-t-2xl">
            {coverUrl ? (
              <img src={coverUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-emerald-500 via-brand to-teal-600">
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 40%)' }}
                />
              </div>
            )}
            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
            {/* Verified badge */}
            <div className="absolute right-4 top-4">
              {company?.verified ? (
                <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand shadow backdrop-blur-sm">
                  <BadgeCheckIcon className="h-3.5 w-3.5" />Đã xác minh
                </span>
              ) : (
                <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-amber-600 shadow backdrop-blur-sm">
                  <ShieldCheckIcon className="h-3.5 w-3.5" />Chưa xác minh
                </span>
              )}
            </div>
          </div>

          {/* Logo — anchored to bottom of cover, straddles the boundary */}
          <div className="absolute bottom-0 left-5 z-10 translate-y-1/2">
            <div className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
              {logoUrl ? (
                <img src={logoUrl} alt="" className="h-full w-full object-contain p-1.5" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/10 to-teal-50">
                  <Building2Icon className="h-9 w-9 text-brand/30" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info bar — padding-top makes room for the overlapping logo (h-20 / 2 = 40px = pt-10) */}
        <div className="px-5 pb-4 pt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-tight text-gray-900">{displayName}</h1>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                {displayCity && (
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="h-3.5 w-3.5 text-gray-400" />{displayCity}
                  </span>
                )}
                {displayWebsite && (
                  <a href={displayWebsite} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 transition hover:text-brand">
                    <GlobeIcon className="h-3.5 w-3.5 text-gray-400" />
                    {displayWebsite.replace(/^https?:\/\//, '')}
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <BriefcaseIcon className="h-3.5 w-3.5 text-gray-400" />{jobCount} tin đang tuyển
                </span>
              </div>
            </div>
            {/* Completion meter */}
            <div className="w-full sm:w-44">
              <CompletionMeter pct={completionPct} />
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">

        {/* ── Hình ảnh ─────────────────────────────────────────────────────── */}
        <SectionCard
          icon={<CameraIcon className="h-4 w-4 text-violet-600" />}
          color="bg-violet-50"
          title="Hình ảnh thương hiệu"
        >
          <div className="space-y-6">
            <ImageUploader
              type="logo"
              label="Logo công ty"
              hint="PNG, JPG, WebP • Tối đa 5MB • Khuyến nghị 400×400px, nền trắng"
              currentUrl={logoUrl}
              aspect="square"
              onSuccess={url => { setLogoUrl(url || undefined); queryClient.invalidateQueries({ queryKey: ['my-company'] }) }}
            />
            <div className="h-px bg-gray-100" />
            <ImageUploader
              type="cover"
              label="Ảnh bìa"
              hint="Tối đa 10MB • Khuyến nghị 1200×400px"
              currentUrl={coverUrl}
              aspect="wide"
              onSuccess={url => { setCoverUrl(url || undefined); queryClient.invalidateQueries({ queryKey: ['my-company'] }) }}
            />
          </div>
        </SectionCard>

        {/* ── Thông tin cơ bản ─────────────────────────────────────────────── */}
        <SectionCard
          icon={<Building2Icon className="h-4 w-4 text-brand" />}
          color="bg-brand/10"
          title="Thông tin cơ bản"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Tên công ty <span className="text-red-400">*</span></label>
              <input {...register('companyName')} className="input" placeholder="VD: Công ty CP Công nghệ XYZ" />
              {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>}
            </div>

            <div>
              <label className="label">Ngành nghề chính</label>
              <input {...register('industry')} className="input" placeholder="VD: Công nghệ thông tin" />
            </div>

            <div>
              <label className="label">Quy mô nhân sự</label>
              <div className="relative">
                <UsersIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select {...register('size')} className="input pl-9">
                  <option value="">Chọn quy mô</option>
                  {Object.values(CompanySize).map(s => (
                    <option key={s} value={s}>{COMPANY_SIZE_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Năm thành lập</label>
              <div className="relative">
                <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input {...register('founded')} type="number" min={1800} max={2030}
                  className="input pl-9" placeholder="VD: 2015" />
              </div>
            </div>

            <div>
              <label className="label">Mã số thuế</label>
              <div className="relative">
                <HashIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input {...register('taxCode')} className="input pl-9" placeholder="VD: 0123456789" />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── Liên hệ & Địa chỉ ────────────────────────────────────────────── */}
        <SectionCard
          icon={<MapPinIcon className="h-4 w-4 text-orange-500" />}
          color="bg-orange-50"
          title="Liên hệ & Địa chỉ"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Website chính thức</label>
              <div className="relative">
                <GlobeIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input {...register('website')} className="input pl-9" placeholder="https://company.vn" />
              </div>
              {errors.website && <p className="mt-1 text-xs text-red-500">{errors.website.message}</p>}
            </div>

            <div>
              <label className="label">Số điện thoại</label>
              <div className="relative">
                <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input {...register('phone')} className="input pl-9" placeholder="VD: 028 3456 7890" />
              </div>
            </div>

            <div>
              <label className="label">Tỉnh / Thành phố</label>
              <div className="relative">
                <MapPinIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select {...register('city')} className="input pl-9">
                  <option value="">Chọn thành phố</option>
                  {VIETNAM_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Quốc gia</label>
              <input {...register('country')} className="input" placeholder="Vietnam" />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Địa chỉ cụ thể</label>
              <input {...register('address')} className="input"
                placeholder="Số nhà, đường, phường/xã, quận/huyện..." />
            </div>
          </div>
        </SectionCard>

        {/* ── Mạng xã hội ──────────────────────────────────────────────────── */}
        <SectionCard
          icon={<LinkIcon className="h-4 w-4 text-sky-500" />}
          color="bg-sky-50"
          title="Mạng xã hội"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Facebook</label>
              <div className="relative">
                <FacebookIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1877f2]" />
                <input {...register('facebookUrl')} className="input pl-9" placeholder="https://facebook.com/company" />
              </div>
              {errors.facebookUrl && <p className="mt-1 text-xs text-red-500">{errors.facebookUrl.message}</p>}
            </div>
            <div>
              <label className="label">LinkedIn</label>
              <div className="relative">
                <LinkedinIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0a66c2]" />
                <input {...register('linkedinUrl')} className="input pl-9" placeholder="https://linkedin.com/company/..." />
              </div>
              {errors.linkedinUrl && <p className="mt-1 text-xs text-red-500">{errors.linkedinUrl.message}</p>}
            </div>
          </div>
        </SectionCard>

        {/* ── Giới thiệu ───────────────────────────────────────────────────── */}
        <SectionCard
          icon={<FileTextIcon className="h-4 w-4 text-amber-500" />}
          color="bg-amber-50"
          title="Giới thiệu công ty"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Hiển thị trên trang công ty công khai</span>
              <span>{(watched.description ?? '').length} ký tự</span>
            </div>
            <textarea
              {...register('description')}
              rows={8}
              className="input resize-none leading-relaxed"
              placeholder="Giới thiệu lịch sử hình thành, sứ mệnh, tầm nhìn, văn hoá công ty, sản phẩm/dịch vụ nổi bật..."
            />
          </div>
        </SectionCard>

        {/* ── Error ─────────────────────────────────────────────────────────── */}
        {mutation.isError && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircleIcon className="h-4 w-4 shrink-0" />
            {(mutation.error as Error).message || 'Có lỗi xảy ra, vui lòng thử lại.'}
          </div>
        )}

        {/* ── Actions ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
          <div className="text-sm text-gray-400">
            {isDirty
              ? <span className="font-medium text-amber-600">Có thay đổi chưa lưu</span>
              : saved
              ? <span className="flex items-center gap-1.5 font-medium text-brand"><CheckCircle2Icon className="h-4 w-4" />Đã lưu thành công</span>
              : <span>Cập nhật hồ sơ để thu hút ứng viên tốt hơn</span>
            }
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => reset()} disabled={!isDirty}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-40">
              Hủy
            </button>
            <button type="submit" disabled={mutation.isPending || isSubmitting || !isDirty}
              className={cn(
                'flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-semibold text-white shadow transition',
                isDirty
                  ? 'bg-brand hover:bg-brand/90 active:scale-[.98]'
                  : 'bg-gray-300 cursor-not-allowed',
                mutation.isPending && 'opacity-70',
              )}
            >
              {mutation.isPending ? (
                <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />Đang lưu...</>
              ) : saved ? (
                <><CheckIcon className="h-3.5 w-3.5" />Đã lưu</>
              ) : (
                'Lưu thay đổi'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
