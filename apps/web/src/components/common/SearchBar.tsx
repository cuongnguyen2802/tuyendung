'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { SearchIcon } from 'lucide-react'
import { LocationPicker } from './LocationPicker'

interface SearchBarProps {
  defaultKeyword?: string
  defaultCity?: string
  size?: 'default' | 'large'
}

export function SearchBar({ defaultKeyword = '', defaultCity = '', size = 'default' }: SearchBarProps) {
  const [keyword, setKeyword] = useState(defaultKeyword)
  const [city, setCity] = useState(defaultCity)
  const router = useRouter()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set('keyword', keyword.trim())
    if (city) {
      const province = city.includes(' - ') ? city.split(' - ')[0] : city
      params.set('city', province)
    }
    router.push(`/jobs?${params.toString()}`)
  }

  if (size === 'large') {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex items-center rounded-full bg-white shadow-2xl shadow-black/20 pr-2"
      >
        {/* Keyword */}
        <div className="flex flex-1 items-center rounded-l-full pl-6">
          <SearchIcon className="h-5 w-5 shrink-0 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Vị trí tuyển dụng, tên công ty..."
            className="h-14 flex-1 bg-transparent px-4 text-base text-gray-900 placeholder:text-gray-400 outline-none border-0"
          />
        </div>

        {/* Divider */}
        <div className="h-7 w-px shrink-0 bg-gray-200" />

        {/* Location */}
        <div className="relative h-14 w-56 shrink-0">
          <LocationPicker value={city} onChange={setCity} placeholder="Địa điểm" className="h-full" />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="ml-2 flex shrink-0 items-center gap-2 rounded-full bg-brand px-6 py-3 text-base font-semibold text-white transition hover:bg-brand/90"
        >
          <SearchIcon className="h-4 w-4" />
          Tìm kiếm
        </button>
      </form>
    )
  }

  /* Default size */
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm kiếm việc làm..."
          className="input pl-9"
        />
      </div>
      <div className="hidden sm:block w-44 border border-gray-300 rounded-lg">
        <LocationPicker value={city} onChange={setCity} placeholder="Địa điểm" className="h-full" />
      </div>
      <button type="submit" className="btn-primary shrink-0">Tìm</button>
    </form>
  )
}
