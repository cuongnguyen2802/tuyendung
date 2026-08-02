'use client'

import { useState, useRef, useEffect } from 'react'
import { SearchIcon, MapPinIcon, ChevronRightIcon, XIcon, CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VIETNAM_PROVINCES } from '@/lib/vietnam-locations'

interface LocationPickerProps {
  value: string          // e.g. "Hà Nội" or "Hà Nội - Cầu Giấy"
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function LocationPicker({ value, onChange, placeholder = 'Địa điểm', className }: LocationPickerProps) {
  const [open, setOpen] = useState(false)
  const [provinceSearch, setProvinceSearch] = useState('')
  const [districtSearch, setDistrictSearch] = useState('')
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null)
  const [selectedProvince, setSelectedProvince] = useState<string>('')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')
  const ref = useRef<HTMLDivElement>(null)

  // Parse current value
  useEffect(() => {
    if (value.includes(' - ')) {
      const [p, d] = value.split(' - ')
      setSelectedProvince(p)
      setSelectedDistrict(d)
      setHoveredProvince(p)
    } else {
      setSelectedProvince(value)
      setSelectedDistrict('')
      setHoveredProvince(value || null)
    }
  }, [value])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setProvinceSearch('')
        setDistrictSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredProvinces = provinceSearch
    ? VIETNAM_PROVINCES.filter((p) => p.name.toLowerCase().includes(provinceSearch.toLowerCase()))
    : VIETNAM_PROVINCES

  const activeProvince = VIETNAM_PROVINCES.find((p) => p.name === (hoveredProvince ?? selectedProvince))

  const filteredDistricts = activeProvince
    ? districtSearch
      ? activeProvince.districts.filter((d) => d.toLowerCase().includes(districtSearch.toLowerCase()))
      : activeProvince.districts
    : []

  const handleSelectProvince = (provinceName: string) => {
    if (selectedProvince === provinceName) {
      // Deselect
      setSelectedProvince('')
      setSelectedDistrict('')
      setHoveredProvince(null)
    } else {
      setSelectedProvince(provinceName)
      setSelectedDistrict('')
      setHoveredProvince(provinceName)
    }
  }

  const handleSelectDistrict = (district: string) => {
    setSelectedDistrict(district === selectedDistrict ? '' : district)
  }

  const handleApply = () => {
    if (!selectedProvince) {
      onChange('')
    } else if (selectedDistrict) {
      onChange(`${selectedProvince} - ${selectedDistrict}`)
    } else {
      onChange(selectedProvince)
    }
    setOpen(false)
    setProvinceSearch('')
    setDistrictSearch('')
  }

  const handleClear = () => {
    setSelectedProvince('')
    setSelectedDistrict('')
    setHoveredProvince(null)
    setProvinceSearch('')
    setDistrictSearch('')
  }

  const displayValue = value
  const hasValue = !!value

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Trigger */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(!open) }}
        className="flex h-full w-full cursor-pointer items-center gap-2 bg-white px-4 text-left focus:outline-none"
      >
        <MapPinIcon className="h-5 w-5 shrink-0 text-gray-400" />
        <span className={cn('flex-1 truncate text-base', hasValue ? 'text-gray-900' : 'text-gray-400')}>
          {displayValue || placeholder}
        </span>
        {hasValue ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onChange('') }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onChange('') } }}
            className="shrink-0 cursor-pointer rounded-full p-0.5 text-gray-400 hover:text-gray-600"
          >
            <XIcon className="h-4 w-4" />
          </span>
        ) : (
          <ChevronRightIcon className={cn('h-4 w-4 shrink-0 text-gray-400 transition-transform', open && 'rotate-90')} />
        )}
      </div>

      {/* Dropdown — auto-align right if near edge */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[580px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* Two panels */}
          <div className="flex divide-x divide-gray-100" style={{ height: 380 }}>

            {/* Left: Provinces */}
            <div className="flex w-1/2 flex-col">
              <div className="px-3 py-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5">
                  <SearchIcon className="h-4 w-4 text-gray-400 shrink-0" />
                  <input
                    autoFocus
                    value={provinceSearch}
                    onChange={(e) => setProvinceSearch(e.target.value)}
                    placeholder="Nhập Tỉnh/Thành phố"
                    className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredProvinces.map((province) => {
                  const isSelected = selectedProvince === province.name
                  const isHovered = hoveredProvince === province.name
                  return (
                    <button
                      key={province.name}
                      type="button"
                      onMouseEnter={() => setHoveredProvince(province.name)}
                      onClick={() => handleSelectProvince(province.name)}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2.5 text-sm text-left text-gray-700 transition',
                        isHovered ? 'bg-brand/5' : 'hover:bg-gray-50',
                      )}
                    >
                      {/* Checkbox */}
                      <span className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition',
                        isSelected
                          ? 'border-brand bg-brand text-white'
                          : 'border-gray-300',
                      )}>
                        {isSelected && <CheckIcon className="h-3 w-3" />}
                      </span>
                      <span className={cn('flex-1', isSelected && 'font-medium text-brand')}>
                        {province.name}
                      </span>
                      <ChevronRightIcon className={cn('h-4 w-4 text-gray-300', isHovered && 'text-gray-500')} />
                    </button>
                  )
                })}
                {filteredProvinces.length === 0 && (
                  <p className="px-4 py-6 text-center text-sm text-gray-400">Không tìm thấy</p>
                )}
              </div>
            </div>

            {/* Right: Districts */}
            <div className="flex w-1/2 flex-col">
              {activeProvince ? (
                <>
                  <div className="px-3 py-2.5 border-b border-gray-100">
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5">
                      <SearchIcon className="h-4 w-4 text-gray-400 shrink-0" />
                      <input
                        value={districtSearch}
                        onChange={(e) => setDistrictSearch(e.target.value)}
                        placeholder="Nhập Phường/Xã/Quận/Huyện"
                        className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {filteredDistricts.map((district) => {
                      const isSelected = selectedDistrict === district && selectedProvince === activeProvince.name
                      return (
                        <button
                          key={district}
                          type="button"
                          onClick={() => {
                            if (selectedProvince !== activeProvince.name) {
                              setSelectedProvince(activeProvince.name)
                            }
                            handleSelectDistrict(district)
                          }}
                          className={cn(
                            'flex w-full items-center gap-3 px-4 py-2.5 text-sm text-left text-gray-700 transition hover:bg-gray-50',
                          )}
                        >
                          <span className={cn(
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition',
                            isSelected ? 'border-brand bg-brand text-white' : 'border-gray-300',
                          )}>
                            {isSelected && <CheckIcon className="h-3 w-3" />}
                          </span>
                          <span className={isSelected ? 'font-medium text-brand' : ''}>{district}</span>
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center px-6">
                  <div className="text-5xl">📍</div>
                  <p className="text-sm text-gray-400">Vui lòng chọn Tỉnh/Thành phố</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-gray-500 hover:text-gray-700 transition"
            >
              Bỏ chọn tất cả
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="rounded-xl bg-brand px-6 py-2 text-sm font-semibold text-white hover:bg-brand/90 transition"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
