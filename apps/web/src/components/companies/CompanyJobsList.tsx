'use client'

import { useState, useMemo } from 'react'
import { SearchIcon, BriefcaseIcon } from 'lucide-react'
import { JobCard } from '@/components/jobs/JobCard'
import { JobDto } from '@tuyendung/types'

export function CompanyJobsList({ jobs }: { jobs: JobDto[] }) {
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')

  const cities = useMemo(() => {
    const set = new Set(jobs.map((j) => j.city).filter(Boolean))
    return Array.from(set) as string[]
  }, [jobs])

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      if (search && !job.title.toLowerCase().includes(search.toLowerCase())) return false
      if (city && job.city !== city) return false
      return true
    })
  }, [jobs, search, city])

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm vị trí..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-brand focus:bg-white transition"
          />
        </div>
        {cities.length > 1 && (
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="">Toàn quốc</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center text-gray-400">
          <BriefcaseIcon className="h-10 w-10 text-gray-200" />
          <p className="text-sm">Không tìm thấy vị trí phù hợp</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}
