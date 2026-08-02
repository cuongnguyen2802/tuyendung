'use client'

export const dynamic = 'force-dynamic'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { api } from '@/lib/api'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { PlusIcon, TrashIcon, CheckIcon, EyeIcon, PencilIcon } from 'lucide-react'

interface WorkExperience {
  company: string
  position: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

interface Education {
  school: string
  degree: string
  field: string
  startYear: number | string
  endYear: number | string
}

interface CVForm {
  title: string
  summary: string
  experiences: WorkExperience[]
  educations: Education[]
  skills: string
  certifications: string
  isOnline: boolean
}

// Map DB content → form values
function contentToForm(content: any, resumeTitle: string): Partial<CVForm> {
  if (!content) return {}
  return {
    title: resumeTitle,
    summary: content.personalInfo?.summary ?? content.summary ?? '',
    experiences: (content.experiences ?? []).map((e: any) => ({
      company: e.company ?? '',
      position: e.title ?? e.position ?? '',
      startDate: e.startDate ?? '',
      endDate: e.endDate ?? '',
      current: e.isCurrent ?? e.current ?? false,
      description: e.description ?? '',
    })),
    educations: (content.educations ?? []).map((e: any) => ({
      school: e.school ?? '',
      degree: e.degree ?? '',
      field: e.major ?? e.field ?? '',
      startYear: e.startDate ? new Date(e.startDate).getFullYear() : e.startYear ?? '',
      endYear: e.endDate ? new Date(e.endDate).getFullYear() : e.endYear ?? '',
    })),
    skills: Array.isArray(content.skills)
      ? content.skills.map((s: any) => (typeof s === 'string' ? s : s.name)).join(', ')
      : content.skills ?? '',
    certifications: content.certifications ?? '',
    isOnline: true,
  }
}

export default function CVBuilderPage() {
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const resumeId = searchParams.get('id')

  const [saved, setSaved] = useState(false)
  const [preview, setPreview] = useState(!!resumeId) // start in preview when viewing existing

  const { data: profile } = useQuery<any>({
    queryKey: ['candidate-profile'],
    queryFn: () => api.get('/users/me/profile'),
  })

  const { data: existingResume } = useQuery<any>({
    queryKey: ['resume', resumeId],
    queryFn: () => api.get(`/resumes/${resumeId}`),
    enabled: !!resumeId,
  })

  const { register, handleSubmit, control, watch, reset, formState: { isSubmitting } } = useForm<CVForm>({
    defaultValues: {
      title: 'CV của tôi',
      summary: '',
      experiences: [],
      educations: [],
      skills: '',
      certifications: '',
      isOnline: true,
    },
  })

  // Populate form when existing resume loads
  useEffect(() => {
    if (existingResume) {
      reset(contentToForm(existingResume.content, existingResume.title) as CVForm)
    }
  }, [existingResume, reset])

  const { fields: expFields, append: addExp, remove: removeExp } = useFieldArray({ control, name: 'experiences' })
  const { fields: eduFields, append: addEdu, remove: removeEdu } = useFieldArray({ control, name: 'educations' })

  const formData = watch()

  const saveMutation = useMutation({
    mutationFn: (data: CVForm) => {
      const payload = {
        title: data.title,
        content: {
          summary: data.summary,
          experiences: data.experiences,
          educations: data.educations,
          skills: data.skills.split(',').map((s) => s.trim()).filter(Boolean),
          certifications: data.certifications,
        },
        isOnline: data.isOnline,
      }
      return resumeId
        ? api.put(`/resumes/${resumeId}`, payload)
        : api.post('/resumes', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-resumes'] })
      if (resumeId) queryClient.invalidateQueries({ queryKey: ['resume', resumeId] })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {resumeId ? formData.title || 'CV của tôi' : 'CV Builder'}
          </h1>
          {resumeId && (
            <p className="text-sm text-gray-500">Xem và chỉnh sửa CV</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="btn-outline gap-1.5"
          >
            {preview ? (
              <><PencilIcon className="h-4 w-4" /> Chỉnh sửa</>
            ) : (
              <><EyeIcon className="h-4 w-4" /> Xem trước</>
            )}
          </button>
          <button
            onClick={handleSubmit((d) => saveMutation.mutate(d))}
            disabled={isSubmitting || saveMutation.isPending}
            className="btn-primary gap-1.5"
          >
            <CheckIcon className="h-4 w-4" />
            {saved ? 'Đã lưu!' : saveMutation.isPending ? 'Đang lưu...' : 'Lưu CV'}
          </button>
        </div>
      </div>

      {preview ? (
        <CVPreview data={formData} profile={profile} existingContent={existingResume?.content} />
      ) : (
        <div className="space-y-4">
          {/* Basic info */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">Thông tin cơ bản</h2>
            <div>
              <label className="label">Tên CV</label>
              <input {...register('title')} className="input" placeholder="VD: CV Senior Frontend 2025" />
            </div>
            <div>
              <label className="label">Mục tiêu nghề nghiệp / Giới thiệu</label>
              <textarea
                {...register('summary')}
                rows={4}
                className="input resize-none"
                placeholder="Mô tả ngắn về bản thân và mục tiêu nghề nghiệp..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" {...register('isOnline')} id="isOnline" className="h-4 w-4 accent-brand" />
              <label htmlFor="isOnline" className="text-sm text-gray-700">
                Cho phép nhà tuyển dụng tìm thấy CV này
              </label>
            </div>
          </div>

          {/* Work Experience */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Kinh nghiệm làm việc</h2>
              <button
                type="button"
                onClick={() => addExp({ company: '', position: '', startDate: '', endDate: '', current: false, description: '' })}
                className="btn-outline text-sm gap-1"
              >
                <PlusIcon className="h-4 w-4" /> Thêm
              </button>
            </div>
            {expFields.length === 0 && (
              <p className="text-sm text-gray-400">Chưa có kinh nghiệm. Nhấn "Thêm" để bắt đầu.</p>
            )}
            {expFields.map((field, idx) => (
              <div key={field.id} className="rounded-lg border border-gray-200 p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Kinh nghiệm #{idx + 1}</span>
                  <button type="button" onClick={() => removeExp(idx)} className="text-red-500 hover:text-red-700">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Công ty</label>
                    <input {...register(`experiences.${idx}.company`)} className="input" />
                  </div>
                  <div>
                    <label className="label">Vị trí</label>
                    <input {...register(`experiences.${idx}.position`)} className="input" />
                  </div>
                  <div>
                    <label className="label">Bắt đầu</label>
                    <input type="month" {...register(`experiences.${idx}.startDate`)} className="input" />
                  </div>
                  <div>
                    <label className="label">Kết thúc</label>
                    <input
                      type="month"
                      {...register(`experiences.${idx}.endDate`)}
                      className="input"
                      disabled={watch(`experiences.${idx}.current`)}
                    />
                    <label className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                      <input type="checkbox" {...register(`experiences.${idx}.current`)} className="accent-brand" />
                      Vẫn đang làm
                    </label>
                  </div>
                </div>
                <div>
                  <label className="label">Mô tả công việc</label>
                  <textarea
                    {...register(`experiences.${idx}.description`)}
                    rows={3}
                    className="input resize-none"
                    placeholder="Mô tả nhiệm vụ, thành tựu..."
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Học vấn</h2>
              <button
                type="button"
                onClick={() => addEdu({ school: '', degree: '', field: '', startYear: '', endYear: '' })}
                className="btn-outline text-sm gap-1"
              >
                <PlusIcon className="h-4 w-4" /> Thêm
              </button>
            </div>
            {eduFields.map((field, idx) => (
              <div key={field.id} className="rounded-lg border border-gray-200 p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Học vấn #{idx + 1}</span>
                  <button type="button" onClick={() => removeEdu(idx)} className="text-red-500 hover:text-red-700">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="label">Trường</label>
                    <input {...register(`educations.${idx}.school`)} className="input" />
                  </div>
                  <div>
                    <label className="label">Bằng cấp</label>
                    <input {...register(`educations.${idx}.degree`)} className="input" placeholder="Cử nhân, Thạc sĩ..." />
                  </div>
                  <div>
                    <label className="label">Chuyên ngành</label>
                    <input {...register(`educations.${idx}.field`)} className="input" />
                  </div>
                  <div>
                    <label className="label">Năm bắt đầu</label>
                    <input type="number" {...register(`educations.${idx}.startYear`)} className="input" placeholder="2018" />
                  </div>
                  <div>
                    <label className="label">Năm kết thúc</label>
                    <input type="number" {...register(`educations.${idx}.endYear`)} className="input" placeholder="2022" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">Kỹ năng</h2>
            <div>
              <label className="label">Kỹ năng (phân cách bằng dấu phẩy)</label>
              <input
                {...register('skills')}
                className="input"
                placeholder="React, TypeScript, Node.js, PostgreSQL..."
              />
            </div>
          </div>

          {/* Certifications */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">Chứng chỉ / Giải thưởng</h2>
            <textarea
              {...register('certifications')}
              rows={3}
              className="input resize-none"
              placeholder="AWS Certified, Google Analytics, Giải nhất cuộc thi..."
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── CV Preview ────────────────────────────────────────────────────────────────

function CVPreview({ data, profile, existingContent }: {
  data: CVForm
  profile: any
  existingContent?: any
}) {
  // Merge: prefer form data, fall back to existingContent for personalInfo fields
  const pi = existingContent?.personalInfo ?? {}
  const fullName = profile?.fullName || pi.fullName || 'Họ và Tên'
  const jobTitle = profile?.title || pi.title || ''
  const phone = profile?.phone || pi.phone || ''
  const email = pi.email || ''
  const city = profile?.city || pi.address || ''
  const linkedin = profile?.linkedinUrl || pi.linkedinUrl || ''
  const github = profile?.githubUrl || pi.githubUrl || ''

  const skills = data.skills
    ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : (existingContent?.skills ?? []).map((s: any) => typeof s === 'string' ? s : s.name)

  const experiences = data.experiences.length
    ? data.experiences
    : (existingContent?.experiences ?? []).map((e: any) => ({
        position: e.title ?? e.position ?? '',
        company: e.company ?? '',
        startDate: e.startDate ?? '',
        endDate: e.endDate ?? '',
        current: e.isCurrent ?? e.current ?? false,
        description: e.description ?? '',
      }))

  const educations = data.educations.length
    ? data.educations
    : (existingContent?.educations ?? []).map((e: any) => ({
        school: e.school ?? '',
        degree: e.degree ?? '',
        field: e.major ?? e.field ?? '',
        startYear: e.startDate ? new Date(e.startDate).getFullYear() : '',
        endYear: e.endDate ? new Date(e.endDate).getFullYear() : '',
      }))

  const summary = data.summary || existingContent?.personalInfo?.summary || ''

  return (
    <div className="card mx-auto max-w-3xl p-8 print:shadow-none">
      {/* Header */}
      <div className="border-b-2 border-brand pb-5 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
        {jobTitle && <p className="mt-1 font-medium text-brand">{jobTitle}</p>}
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
          {phone && <span>📞 {phone}</span>}
          {email && <span>✉ {email}</span>}
          {city && <span>📍 {city}</span>}
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              LinkedIn
            </a>
          )}
          {github && (
            <a href={github} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:underline">
              GitHub
            </a>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <Section title="Mục tiêu nghề nghiệp">
          <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{summary}</p>
        </Section>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <Section title="Kinh nghiệm làm việc">
          <div className="space-y-5">
            {experiences.map((exp: any, i: number) => (
              <div key={i}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-800">{exp.position}</p>
                    <p className="text-sm text-brand">{exp.company}</p>
                  </div>
                  <p className="shrink-0 text-xs text-gray-400">
                    {formatDate(exp.startDate)} – {exp.current || exp.isCurrent ? 'Hiện tại' : formatDate(exp.endDate)}
                  </p>
                </div>
                {exp.description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600 whitespace-pre-line">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Education */}
      {educations.length > 0 && (
        <Section title="Học vấn">
          <div className="space-y-3">
            {educations.map((edu: any, i: number) => (
              <div key={i} className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">{edu.school}</p>
                  <p className="text-sm text-gray-500">
                    {[edu.degree, edu.field || edu.major].filter(Boolean).join(' — ')}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-gray-400">
                  {edu.startYear} – {edu.endYear || 'Nay'}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <Section title="Kỹ năng">
          <div className="flex flex-wrap gap-2">
            {skills.map((s: string, i: number) => (
              <span key={i} className="rounded-full bg-brand/10 px-3 py-1 text-sm font-medium text-brand">
                {s}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Languages (from existing content) */}
      {existingContent?.languages?.length > 0 && (
        <Section title="Ngôn ngữ">
          <div className="space-y-1">
            {existingContent.languages.map((l: any, i: number) => (
              <p key={i} className="text-sm text-gray-600">
                <span className="font-medium">{l.name}</span>
                {l.level && <span className="text-gray-400"> — {l.level}</span>}
              </p>
            ))}
          </div>
        </Section>
      )}

      {/* Certifications */}
      {data.certifications && (
        <Section title="Chứng chỉ / Giải thưởng">
          <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{data.certifications}</p>
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="mb-3 border-b border-gray-100 pb-1 text-sm font-bold uppercase tracking-wide text-gray-400">
        {title}
      </h2>
      {children}
    </div>
  )
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  // ISO date "2022-06" → "06/2022"; full ISO → "MM/YYYY"
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}
