'use client'

import { useState } from 'react'
import { resolveMediaUrl } from '@/lib/media'

interface Props {
  src: string
  alt: string
  fallbackLetter: string
  fallbackGradient: string
  className?: string
}

export function CompanyLogoImg({ src, alt, fallbackLetter, fallbackGradient, className }: Props) {
  const [failed, setFailed] = useState(false)

  const resolvedSrc = resolveMediaUrl(src)

  if (failed || !resolvedSrc) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${fallbackGradient}`}>
        <span className="text-2xl font-bold text-white">{fallbackLetter}</span>
      </div>
    )
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className ?? 'h-full w-full object-contain'}
      onError={() => setFailed(true)}
    />
  )
}
