'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { CompanySize, COMPANY_SIZE_LABELS, VIETNAM_CITIES } from '@tuyendung/types'
import {
  Building2Icon, GlobeIcon, MapPinIcon, BadgeCheckIcon, BriefcaseIcon,
  UploadIcon, XIcon, ImageIcon, PhoneIcon, FacebookIcon, LinkedinIcon,
  ShieldIcon,
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
  type,
  label,
  hint,
  currentUrl,
  aspect,
  onSuccess,
}: {
  type: 'logo' | 'cover'
  label: string
  hint: string
  currentUrl?: string
  aspect: 'square' | 'wide'
  onSuccess: (url: string) => void
}) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | undefined>(currentUrl)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setPreview(currentUrl) }, [currentUrl])

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh (jpg, png, webp)')
      return
    }
    const maxMb = type === 'cover' ? 10 : 5
    if (file.size > maxMb * 1024 * 1024) {
      setError(`File quá lớn, tối đa ${maxMb}MB`)
      return
    }
    setError('')
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res: any = await api.post(`/employers/me/upload-${type}`, formData)
      setPreview(res.url)
      onSuccess(res.url)
    } catch (err: any) {
      setError(err.message || 'Upload thất bại')
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload(file)
    e.target.value = ''
  }

  const remove = async () => {
    setPreview(undefined)
    await api.put('/employers/me/company', { [`${type}Url`]: '' })
    onSuccess('')
  }

  if (aspect === 'wide') {
    return (
      <div>
        <label className="label mb-2 block">{label}</label>
        <div
          className={cn(
            'relative w-full overflow-hidden rounded-xl border-2 border-dashed transition',
            dragging ? 'border-brand bg-brand/5' : 'border-gray-300 bg-gray-50',
          )}
          style={{ height: 160 }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          {preview ? (
            <>
              <img src={preview} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-white"
                >
                  <UploadIcon className="mr-1.5 inline h-4 w-4" />Đổi ảnh
                </button>
                <button
                  type="button"
                  onClick={remove}
                  className="rounded-lg bg-red-500/90 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500"
                >
                  <XIcon className="mr-1.5 inline h-4 w-4" />Xóa
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600"
            >
              {uploading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              ) : (
                <ImageIcon className="h-8 w-8" />
              )}
              <span className="text-sm">{uploading ? 'Đang tải lên...' : 'Kéo thả ảnh hoặc click để chọn'}</span>
              <span className="text-xs text-gray-400">{hint}</span>
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
      </div>
    )
  }

  // Square (logo)
  return (
    <div className="flex items-start gap-5">
      <div
        className={cn(
          'relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-2 border-dashed transition cursor-pointer',
          dragging ? 'border-brand bg-brand/5' : 'border-gray-300 bg-gray-50',
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <>
            <img src={preview} alt="" className="h-full w-full object-contain p-1" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); remove() }}
              className="absolute right-1 top-1 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
            >
              <XIcon className="h-3 w-3" />
            </button>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400">
            {uploading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            ) : (
              <>
                <Building2Icon className="h-8 w-8" />
                <span className="text-center text-[10px] px-1">Kéo thả hoặc click</span>
              </>
            )}
          </div>
        )}
      </div>
      <div className="flex-1 pt-1">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <p className="mt-0.5 text-xs text-gray-400">{hint}</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-brand hover:text-brand disabled:opacity-50"
        >
          <UploadIcon className="h-3.5 w-3.5" />
          {uploading ? 'Đang tải lên...' : 'Chọn ảnh'}
        </button>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CompanyProfilePage() {
  const queryClient = useQueryClient()
  const [logoUrl, setLogoUrl] = useState<string | undefined>()
  const [coverUrl, setCoverUrl] = useState<string | undefined>()

  const { data: company, isLoading } = useQuery<Company>({
    queryKey: ['my-company'],
    queryFn: () => api.get('/employers/me/company'),
  })

  const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

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
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="card h-36 animate-pulse bg-gray-100" />)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Thông tin công ty</h1>
          <p className="mt-0.5 text-sm text-gray-500">Cập nhật hồ sơ công ty để thu hút ứng viên tốt hơn</p>
        </div>
        <div className="flex items-center gap-2">
          {company?.verified ? (
            <span className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand">
              <BadgeCheckIcon className="h-4 w-4" />Đã xác minh
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-sm font-medium text-yellow-700">
              <ShieldIcon className="h-4 w-4" />Chưa xác minh
            </span>
          )}
        </div>
      </div>

      {/* Preview card */}
      <div className="card overflow-hidden p-0">
        {/* Cover */}
        <div className="relative h-32 w-full bg-gradient-to-r from-brand/80 to-brand overflow-hidden">
          {coverUrl && <img src={coverUrl} alt="" className="h-full w-full object-cover" />}
        </div>
        {/* Logo + info */}
        <div className="flex items-end gap-4 px-5 pb-4">
          <div className="-mt-10 h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-full w-full object-contain p-1" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-50">
                <Building2Icon className="h-9 w-9 text-gray-300" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <p className="font-bold text-gray-900 truncate">{company?.companyName || 'Tên công ty'}</p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              {company?.city && (
                <span className="flex items-center gap-1"><MapPinIcon className="h-3.5 w-3.5" />{company.city}</span>
              )}
              {company?.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-brand">
                  <GlobeIcon className="h-3.5 w-3.5" />{company.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {company?._count !== undefined && (
                <span className="flex items-center gap-1">
                  <BriefcaseIcon className="h-3.5 w-3.5" />{company._count.jobs} tin đang tuyển
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
        {/* ── Hình ảnh ─────────────────────────────────────────────────────── */}
        <div className="card p-6 space-y-6">
          <h2 className="font-semibold text-gray-900">Hình ảnh công ty</h2>

          <ImageUploader
            type="logo"
            label="Logo công ty"
            hint="PNG, JPG, WebP — tối đa 5MB. Khuyến nghị 400×400px, nền trắng."
            currentUrl={logoUrl}
            aspect="square"
            onSuccess={(url) => { setLogoUrl(url || undefined); queryClient.invalidateQueries({ queryKey: ['my-company'] }) }}
          />

          <div className="border-t border-gray-100 pt-5">
            <ImageUploader
              type="cover"
              label="Ảnh bìa"
              hint="PNG, JPG, WebP — tối đa 10MB. Khuyến nghị 1200×400px."
              currentUrl={coverUrl}
              aspect="wide"
              onSuccess={(url) => { setCoverUrl(url || undefined); queryClient.invalidateQueries({ queryKey: ['my-company'] }) }}
            />
          </div>
        </div>

        {/* ── Thông tin cơ bản ─────────────────────────────────────────────── */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Thông tin cơ bản</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Tên công ty *</label>
              <input {...register('companyName')} className="input" placeholder="VD: Công ty CP Công nghệ XYZ" />
              {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>}
            </div>

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
              <label className="label">Ngành nghề chính</label>
              <input {...register('industry')} className="input" placeholder="VD: Công nghệ thông tin" />
            </div>

            <div>
              <label className="label">Quy mô nhân sự</label>
              <select {...register('size')} className="input">
                <option value="">Chọn quy mô</option>
                {Object.values(CompanySize).map((s) => (
                  <option key={s} value={s}>{COMPANY_SIZE_LABELS[s]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Năm thành lập</label>
              <input
                {...register('founded')}
                type="number" min={1800} max={2030}
                className="input" placeholder="VD: 2015"
              />
            </div>

            <div>
              <label className="label">Mã số thuế</label>
              <div className="relative">
                <ShieldIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input {...register('taxCode')} className="input pl-9" placeholder="VD: 0123456789" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Địa chỉ ──────────────────────────────────────────────────────── */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Địa chỉ</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Tỉnh / Thành phố</label>
              <div className="relative">
                <MapPinIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select {...register('city')} className="input pl-9">
                  <option value="">Chọn thành phố</option>
                  {VIETNAM_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Quốc gia</label>
              <input {...register('country')} className="input" placeholder="Vietnam" />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Địa chỉ cụ thể</label>
              <input {...register('address')} className="input" placeholder="Số nhà, tên đường, phường/xã, quận/huyện..." />
            </div>
          </div>
        </div>

        {/* ── Mạng xã hội ──────────────────────────────────────────────────── */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Mạng xã hội</h2>

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
        </div>

        {/* ── Giới thiệu ───────────────────────────────────────────────────── */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Giới thiệu công ty</h2>
            <span className="text-xs text-gray-400">Hiển thị trên trang công ty</span>
          </div>
          <textarea
            {...register('description')}
            rows={10}
            className="input resize-none"
            placeholder="Giới thiệu về lịch sử hình thành, sứ mệnh, tầm nhìn, văn hóa công ty, sản phẩm/dịch vụ nổi bật..."
          />
        </div>

        {/* Feedback */}
        {mutation.isError && (
          <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-600">
            {(mutation.error as Error).message}
          </div>
        )}
        {mutation.isSuccess && (
          <div className="rounded-lg bg-brand-50 border border-brand-100 p-3 text-sm text-brand">
            ✓ Cập nhật thành công!
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => reset()}
            disabled={!isDirty}
            className="rounded-xl border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 disabled:opacity-40"
          >
            Hủy thay đổi
          </button>
          <button
            type="submit"
            disabled={mutation.isPending || isSubmitting || !isDirty}
            className="btn-primary px-8"
          >
            {mutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  )
}
