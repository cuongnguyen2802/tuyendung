'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { api } from '@/lib/api'
import { JobCard } from './JobCard'
import { SparklesIcon } from 'lucide-react'

export function RecommendedJobs() {
  const { data: session } = useSession()

  const { data: jobs, isLoading } = useQuery<any[]>({
    queryKey: ['recommended-jobs'],
    queryFn: () => api.get('/recommendations/jobs?limit=4'),
    enabled: !!session && session.user?.role === 'CANDIDATE',
  })

  if (!session || session.user?.role !== 'CANDIDATE') return null
  if (isLoading) return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="h-8 w-64 rounded bg-gray-200 animate-pulse mb-4" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      </div>
    </section>
  )

  if (!jobs || jobs.length === 0) return null

  return (
    <section className="py-10 bg-brand-50/50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-5 flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-brand" />
          <h2 className="text-xl font-bold text-gray-900">Gợi ý việc làm cho bạn</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job: any) => <JobCard key={job.id} job={job} />)}
        </div>
      </div>
    </section>
  )
}
