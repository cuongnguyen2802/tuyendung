'use client'

import { useState } from 'react'

export function ShowMore({ text, maxLines = 6 }: { text: string; maxLines?: number }) {
  const [expanded, setExpanded] = useState(false)
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
