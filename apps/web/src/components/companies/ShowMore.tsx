'use client'

import { useState } from 'react'

const HTML_TAG_RE = /<[a-z][\s\S]*?>/i

function isHtml(text: string) {
  return HTML_TAG_RE.test(text)
}

export function ShowMore({ text, maxLines = 6 }: { text: string; maxLines?: number }) {
  const [expanded, setExpanded] = useState(false)

  if (isHtml(text)) {
    return (
      <div>
        <div className="relative">
          <div
            className={[
              'prose prose-sm max-w-none text-gray-600',
              'prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5',
              !expanded ? 'max-h-48 overflow-hidden' : '',
            ].join(' ')}
            dangerouslySetInnerHTML={{ __html: text }}
          />
          {!expanded && (
            <div className="pointer-events-none absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white to-transparent" />
          )}
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-sm font-semibold text-brand hover:underline"
        >
          {expanded ? '▲ Thu gọn' : '▼ Xem thêm'}
        </button>
      </div>
    )
  }

  // Plain text — split by newlines
  const paragraphs = text.split('\n').filter((l) => l.trim())
  const needsMore = paragraphs.length > maxLines
  const visible = !expanded && needsMore ? paragraphs.slice(0, maxLines) : paragraphs

  return (
    <div>
      <div className="space-y-2 text-sm leading-relaxed text-gray-600">
        {visible.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      {needsMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-sm font-semibold text-brand hover:underline"
        >
          {expanded ? '▲ Thu gọn' : '▼ Xem thêm'}
        </button>
      )}
    </div>
  )
}
