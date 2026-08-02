'use client'

import { useState, useEffect } from 'react'
import { Link2, CheckIcon } from 'lucide-react'

interface Props {
  slug: string
  title: string
}

export function StickyShare({ slug, title }: Props) {
  const [copied, setCopied] = useState(false)
  const [jobUrl, setJobUrl] = useState('')

  useEffect(() => {
    setJobUrl(`${window.location.origin}/jobs/${slug}`)
  }, [slug])

  const copyLink = async () => {
    await navigator.clipboard.writeText(jobUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const encoded = encodeURIComponent(jobUrl)
  const titleEncoded = encodeURIComponent(title)

  return (
    <div className="fixed left-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2.5 lg:flex">
      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-full shadow-md transition hover:scale-110"
        style={{ background: '#1877F2' }}
        aria-label="Chia sẻ Facebook"
      >
        <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>

      {/* Twitter / X */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encoded}&text=${titleEncoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-black shadow-md transition hover:scale-110"
        aria-label="Chia sẻ Twitter"
      >
        <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-full shadow-md transition hover:scale-110"
        style={{ background: '#0A66C2' }}
        aria-label="Chia sẻ LinkedIn"
      >
        <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </a>

      {/* Copy link */}
      <button
        onClick={copyLink}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-600 text-white shadow-md transition hover:scale-110 hover:bg-gray-700"
        aria-label="Sao chép liên kết"
      >
        {copied ? <CheckIcon className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  )
}
