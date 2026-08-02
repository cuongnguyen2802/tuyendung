import { serverFetch } from '@/lib/server-fetch'
import { JobMarketSectionClient } from './JobMarketSectionClient'

interface Stats {
  totalActive: number
  newLast24h: number
  totalEmployers: number
  recentJobs: Array<{
    id: string
    title: string
    slug: string
    city: string
    employer: { companyName: string; logoUrl: string | null; slug: string }
  }>
  weeklyData: Array<{ week: string; count: number }>
  jobTypeData: Array<{ label: string; count: number }>
}

export async function JobMarketSection() {
  const stats = await serverFetch<Stats>('/jobs/stats', { revalidate: 60 })
  if (!stats) return null

  return <JobMarketSectionClient initialStats={stats} />
}
