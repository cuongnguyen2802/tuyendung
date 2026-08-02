'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { CandidateProfileDto, VIETNAM_CITIES } from '@tuyendung/types'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  CheckCircleIcon, StarIcon, BriefcaseIcon, CheckIcon,
  Link2Icon, GlobeIcon, CameraIcon, Loader2Icon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import DropZone from '@/components/common/DropZone'

const schema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  phone: z.string().optional(),
  title: z.string().optional(),
  summary: z.string().optional(),
  city: z.string().optional(),
  linkedinUrl: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  githubUrl: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  portfolioUrl: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const { data: profile, isLoading } = useQuery<CandidateProfileDto>({
    queryKey: ['candidate-profile'],
    queryFn: () => api.get('/users/me/profile'),
  })

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: profile
      ? {
          fullName: profile.fullName ?? '',
          phone: profile.phone ?? '',
          title: profile.title ?? '',
          summary: profile.summary ?? '',
          city: profile.city ?? '',
          linkedinUrl: profile.linkedinUrl ?? '',
          githubUrl: profile.githubUrl ?? '',
          portfolioUrl: profile.portfolioUrl ?? '',
        }
      : undefined,
  })

  const saveMutation = useMutation({
    mutationFn: (data: FormData) => api.put('/users/me/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    },
  })

  const openToWorkMutation = useMutation({
    mutationFn: (value: boolean) => api.put('/users/me/profile', { openToWork: value }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['candidate-profile'] }),
  })

  const onSubmit = (data: FormData) => saveMutation.mutate(data)

  const handleAvatarUpload = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setAvatarUploading(true)
    setAvatarError('')
    const localUrl = URL.createObjectURL(file)
    setAvatarPreview(localUrl)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await api.post('/users/me/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] })
    } catch (err: any) {
      setAvatarError(err.message ?? 'Upload thất bại')
      setAvatarPreview(null)
    } finally {
      setAvatarUploading(false)
    }
  }, [queryClient])

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="h-[500px] animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-72 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    )
  }

  const initial = profile?.fullName?.[0]?.toUpperCase() ?? '?'
  const openToWork = profile?.openToWork ?? false

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

      {/* ── Left: form ───────────────────────────────────────────────────────── */}
      <div className="space-y-5">
        <div className="card p-6">
          <h2 className="mb-1 text-lg font-bold text-gray-900">Cài đặt thông tin cá nhân</h2>
          <p className="mb-5 text-sm text-red-500">(*) Các thông tin bắt buộc</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Họ và tên */}
            <div>
              <label className="label">Họ và tên <span className="text-red-500">*</span></label>
              <input {...register('fullName')} className="input" placeholder="Nhập họ và tên" />
              {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
            </div>

            {/* Phone + City */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">Số điện thoại</label>
                <input {...register('phone')} className="input" placeholder="Nhập số điện thoại" />
              </div>
              <div>
                <label className="label">Thành phố / Tỉnh</label>
                <select {...register('city')} className="input">
                  <option value="">Chọn thành phố</option>
                  {VIETNAM_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Email readonly */}
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                disabled
                value={session?.user?.email ?? ''}
                className="input cursor-not-allowed bg-gray-50 text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-400">Email không thể thay đổi</p>
            </div>

            {/* Chức danh */}
            <div>
              <label className="label">Chức danh / Vị trí hiện tại</label>
              <input
                {...register('title')}
                className="input"
                placeholder="VD: Senior Frontend Developer"
              />
            </div>

            {/* Summary */}
            <div>
              <label className="label">Giới thiệu bản thân</label>
              <textarea
                {...register('summary')}
                rows={4}
                className="input resize-none"
                placeholder="Mô tả ngắn về kinh nghiệm và mục tiêu của bạn..."
              />
            </div>

            {/* Social links */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label flex items-center gap-1.5">
                  <Link2Icon className="h-3.5 w-3.5 text-blue-600" />LinkedIn
                </label>
                <input
                  {...register('linkedinUrl')}
                  className="input"
                  placeholder="https://linkedin.com/in/..."
                />
                {errors.linkedinUrl && <p className="mt-1 text-xs text-red-500">{errors.linkedinUrl.message}</p>}
              </div>
              <div>
                <label className="label flex items-center gap-1.5">
                  <Link2Icon className="h-3.5 w-3.5" />GitHub
                </label>
                <input
                  {...register('githubUrl')}
                  className="input"
                  placeholder="https://github.com/..."
                />
                {errors.githubUrl && <p className="mt-1 text-xs text-red-500">{errors.githubUrl.message}</p>}
              </div>
              <div>
                <label className="label flex items-center gap-1.5">
                  <GlobeIcon className="h-3.5 w-3.5 text-gray-500" />Portfolio
                </label>
                <input
                  {...register('portfolioUrl')}
                  className="input"
                  placeholder="https://..."
                />
                {errors.portfolioUrl && <p className="mt-1 text-xs text-red-500">{errors.portfolioUrl.message}</p>}
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting || saveMutation.isPending}
                className="btn-primary"
              >
                {saveMutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </button>
              {saveSuccess && (
                <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                  <CheckIcon className="h-4 w-4" /> Đã lưu thành công
                </span>
              )}
              {saveMutation.isError && (
                <span className="text-sm text-red-500">Có lỗi xảy ra, vui lòng thử lại</span>
              )}
            </div>
          </form>
        </div>

        {/* Skills */}
        {profile?.skills && profile.skills.length > 0 && (
          <div className="card p-6">
            <h3 className="mb-3 font-semibold text-gray-900">Kỹ năng</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((cs) => (
                <span key={cs.skillId} className="rounded-full bg-brand/5 px-3 py-1 text-sm font-medium text-brand">
                  {cs.skill.name}
                  {cs.level && <span className="ml-1 text-xs text-brand/60">· {cs.level}</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Right: profile sidebar ────────────────────────────────────────────── */}
      <div className="space-y-4">

        {/* Profile card */}
        <div className="card p-5">
          {/* Avatar + info */}
          <div className="flex flex-col items-center gap-2 pb-4 text-center">
            {/* Drag-drop avatar */}
            <DropZone
              onFiles={handleAvatarUpload}
              accept="image/*"
              uploading={avatarUploading}
              className="relative"
            >
              <div className="relative h-20 w-20 cursor-pointer">
                {(avatarPreview || profile?.avatarUrl) ? (
                  <img
                    src={avatarPreview ?? profile!.avatarUrl!}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-2xl font-bold text-gray-500">
                    {initial}
                  </div>
                )}
                {avatarUploading ? (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                    <Loader2Icon className="h-6 w-6 animate-spin text-white" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 opacity-0 transition hover:bg-black/30 hover:opacity-100">
                    <CameraIcon className="h-6 w-6 text-white" />
                  </div>
                )}
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gray-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  VERIFIED
                </span>
              </div>
            </DropZone>
            <p className="text-[11px] text-gray-400">Kéo thả hoặc click để đổi ảnh</p>
            {avatarError && <p className="text-xs text-red-500">{avatarError}</p>}
            <div>
              <p className="text-xs text-gray-500">Chào bạn trở lại,</p>
              <p className="text-base font-bold text-gray-900">{profile?.fullName}</p>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-white">
                <CheckCircleIcon className="h-3 w-3 text-brand/70" />
                Tài khoản đã xác thực
              </div>
            </div>
            <Link
              href="/upgrade"
              className="mt-1 flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-brand hover:text-brand"
            >
              <StarIcon className="h-3.5 w-3.5 text-yellow-500" /> Nâng cấp tài khoản
            </Link>
          </div>

          {/* Open to work toggle */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">
                Đang {openToWork ? 'Bật' : 'Tắt'} tìm việc
              </span>
              <button
                role="switch"
                aria-checked={openToWork}
                onClick={() => openToWorkMutation.mutate(!openToWork)}
                disabled={openToWorkMutation.isPending}
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
                  openToWork ? 'bg-brand' : 'bg-gray-300',
                )}
              >
                <span className={cn(
                  'inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200',
                  openToWork ? 'translate-x-5' : 'translate-x-0',
                )} />
              </button>
            </div>

            {!openToWork && (
              <div className="mt-3 space-y-2 text-xs text-gray-500">
                <p>Khi bật tìm việc:</p>
                <p className="flex gap-1.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                  Nhà tuyển dụng (NTD) có thể <strong className="text-gray-700">tìm thấy</strong> và mang đến cho bạn những cơ hội hấp dẫn.
                </p>
                <p className="flex gap-1.5">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                  Hồ sơ của bạn sẽ <strong className="text-gray-700">hiển thị nổi bật</strong> trên kết quả tìm kiếm của Nhà tuyển dụng.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CV / employer search section */}
        <div className="card p-5">
          <h3 className="mb-2 font-semibold text-gray-900">Cho phép NTD tìm kiếm hồ sơ</h3>
          {(!profile?.skills || profile.skills.length === 0) ? (
            <>
              <p className="mb-3 text-xs leading-relaxed text-gray-500">
                Bạn chưa có CV nào trên hệ thống. Tạo CV ngay để bắt đầu nhận lời mời kết nối từ các Nhà tuyển dụng uy tín.
              </p>
              <Link
                href="/resumes"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-brand px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand/5"
              >
                <BriefcaseIcon className="h-4 w-4" /> Tạo CV ngay
              </Link>
            </>
          ) : (
            <p className="text-xs leading-relaxed text-gray-500">
              Khi bạn cho phép Nhà tuyển dụng (NTD) tìm kiếm hồ sơ, các NTD uy tín có thể tiếp cận thông tin kinh nghiệm làm việc, học vấn, kỹ năng của bạn.
            </p>
          )}
        </div>

      </div>
    </div>
  )
}
