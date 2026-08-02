'use client'

import { LinkIcon, CheckIcon } from 'lucide-react'
import { useState } from 'react'

export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin + path).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <button
      onClick={handleCopy}
      aria-label="Sao chép liên kết"
      title={copied ? 'Đã sao chép!' : 'Sao chép liên kết'}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-brand hover:text-brand"
    >
      {copied ? (
        <CheckIcon className="h-4 w-4 text-brand" />
      ) : (
        <LinkIcon className="h-4 w-4" />
      )}
    </button>
  )
}
