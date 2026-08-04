'use client'

import { use, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  SendIcon, ArrowLeftIcon, BriefcaseIcon,
  MapPinIcon, DollarSignIcon, FileTextIcon, CheckCircle2Icon,
  BuildingIcon,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'
import { formatSalary } from '@/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

export default function ApplyPage({ params }: Props) {
  const { slug } = use(params)
  const { data: session, status } = useSession()
  const router = useRouter()

  const [coverLetter, setCoverLetter] = useState('')
  const [resumeId, setResumeId] = useState<string>('')
  const [submitted, setSubmitted] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/login?callbackUrl=/jobs/${slug}/apply`)
    }
  }, [status, router, slug])

  const { data: job, isLoading: jobLoading } = useQuery<any>({
    queryKey: ['job-detail', slug],
    queryFn: () => api.get(`/jobs/${slug}`),
    enabled: !!session,
  })

  const { data: resumes = [] } = useQuery<any[]>({
    queryKey: ['my-resumes'],
    queryFn: () => api.get('/resumes/me'),
    enabled: !!session,
  })

  // Pre-select default resume
  useEffect(() => {
    const def = resumes.find((r: any) => r.isDefault)
    if (def && !resumeId) setResumeId(def.id)
  }, [resumes, resumeId])

  const applyMutation = useMutation({
    mutationFn: () =>
      api.post(`/applications/jobs/${job.id}`, {
        coverLetter: coverLetter.trim() || undefined,
        resumeId: resumeId || undefined,
      }),
    onSuccess: () => setSubmitted(true),
  })

  if (status === 'loading' || jobLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  if (!job) return null

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryNegotiable)

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
            <CheckCircle2Icon className="h-8 w-8 text-brand" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Nộp đơn thành công!</h2>
          <p className="mt-2 text-sm text-gray-500">
            Đơn ứng tuyển của bạn đã được gửi đến{' '}
            <strong>{job.employer?.companyName}</strong>. Nhà tuyển dụng sẽ xem xét và liên hệ với bạn sớm nhất.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/applications"
              className="rounded-xl bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90"
            >
              Xem đơn đã nộp
            </Link>
            <Link
              href="/jobs"
              className="rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Tiếp tục tìm việc
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Top bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            href={`/jobs/${slug}`}
            className="flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-brand"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Quay lại tin tuyển dụng
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">

        {/* Job summary card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
              {job.employer?.logoUrl ? (
                <Image
                  src={job.employer.logoUrl}
                  alt={job.employer.companyName}
                  width={56}
                  height={56}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-gray-300">
                  {job.employer?.companyName?.[0]}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold leading-snug text-gray-900">{job.title}</h1>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                <BuildingIcon className="h-3.5 w-3.5 shrink-0" />
                {job.employer?.companyName}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPinIcon className="h-3.5 w-3.5 text-brand" />
                  {job.city}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSignIcon className="h-3.5 w-3.5 text-brand" />
                  {salary}
                </span>
                <span className="flex items-center gap-1">
                  <BriefcaseIcon className="h-3.5 w-3.5 text-brand" />
                  {job.experienceMin ? `${job.experienceMin}+ năm kinh nghiệm` : 'Không yêu cầu kinh nghiệm'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Apply form */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-bold text-gray-900">Thông tin ứng tuyển</h2>

          {/* Resume selector */}
          {resumes.length > 0 && (
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Chọn CV đính kèm <span className="font-normal text-gray-400">(tuỳ chọn)</span>
              </label>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3 transition hover:border-brand has-[:checked]:border-brand has-[:checked]:bg-brand/5">
                  <input
                    type="radio"
                    name="resume"
                    value=""
                    checked={resumeId === ''}
                    onChange={() => setResumeId('')}
                    className="accent-brand"
                  />
                  <span className="text-sm text-gray-600">Không đính kèm CV</span>
                </label>
                {resumes.map((r: any) => (
                  <label
                    key={r.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-3 transition hover:border-brand has-[:checked]:border-brand has-[:checked]:bg-brand/5"
                  >
                    <input
                      type="radio"
                      name="resume"
                      value={r.id}
                      checked={resumeId === r.id}
                      onChange={() => setResumeId(r.id)}
                      className="accent-brand"
                    />
                    <FileTextIcon className="h-4 w-4 shrink-0 text-brand" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800">{r.title}</p>
                      {r.isDefault && (
                        <span className="text-[10px] font-semibold text-brand">CV mặc định</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Chưa có CV?{' '}
                <Link href="/resumes/upload" className="text-brand hover:underline">
                  Upload CV ngay
                </Link>
              </p>
            </div>
          )}

          {/* Cover letter */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Thư xin việc <span className="font-normal text-gray-400">(tuỳ chọn)</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              rows={8}
              placeholder={`Giới thiệu bản thân và lý do bạn phù hợp với vị trí ${job.title} tại ${job.employer?.companyName}...\n\nVí dụ:\n- Kinh nghiệm liên quan đến vị trí này\n- Lý do bạn muốn làm việc tại công ty\n- Điểm mạnh nổi bật của bạn`}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 resize-none"
            />
            <p className="mt-1.5 text-right text-xs text-gray-400">{coverLetter.length} ký tự</p>
          </div>

          {/* Error */}
          {applyMutation.isError && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {(applyMutation.error as any)?.message ?? 'Có lỗi xảy ra, vui lòng thử lại'}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={() => applyMutation.mutate()}
            disabled={applyMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-base font-semibold text-white transition hover:bg-brand/90 active:scale-[.99] disabled:opacity-60"
          >
            {applyMutation.isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Đang gửi...
              </>
            ) : (
              <>
                <SendIcon className="h-5 w-5" />
                Nộp đơn ứng tuyển
              </>
            )}
          </button>

          <p className="mt-3 text-center text-xs text-gray-400">
            Bằng cách nộp đơn, bạn đồng ý để TuyenDung.vn chia sẻ thông tin hồ sơ của bạn với nhà tuyển dụng.
          </p>
        </div>

      </div>
    </div>
  )
}
