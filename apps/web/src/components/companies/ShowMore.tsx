'use client'

import { useState, useMemo } from 'react'

const HTML_TAG_RE = /<[a-z][\s\S]*?>/i

function isHtml(text: string) {
  return HTML_TAG_RE.test(text)
}

/**
 * Client-side HTML sanitizer using the browser's DOMParser.
 * Strips <script>, <iframe>, <object>, <embed>, <form> tags and all
 * event-handler attributes (on*) and javascript: URLs.
 */
function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') return ''
  const doc = new window.DOMParser().parseFromString(dirty, 'text/html')

  // Remove entirely dangerous elements
  doc.querySelectorAll('script, iframe, object, embed, form, meta, link, style, base').forEach(el => el.remove())

  // Strip dangerous attributes from every remaining element
  doc.body.querySelectorAll('*').forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      const name = attr.name.toLowerCase()
      const value = attr.value.trim().toLowerCase()
      if (
        name.startsWith('on') ||                                 // event handlers
        (name === 'href' && value.startsWith('javascript:')) ||  // js: links
        (name === 'src'  && value.startsWith('javascript:')) ||  // js: src
        name === 'action'                                         // form action
      ) {
        el.removeAttribute(attr.name)
      }
    })
  })

  return doc.body.innerHTML
}

export function ShowMore({ text, maxLines = 6 }: { text: string; maxLines?: number }) {
  const [expanded, setExpanded] = useState(false)

  // Sanitize once; memo prevents re-computation on every re-render
  const safeHtml = useMemo(() => (isHtml(text) ? sanitizeHtml(text) : null), [text])

  if (safeHtml !== null) {
    return (
      <div>
        <div className="relative">
          <div
            className={[
              'prose prose-sm max-w-none text-gray-600',
              'prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5',
              !expanded ? 'max-h-48 overflow-hidden' : '',
            ].join(' ')}
            dangerouslySetInnerHTML={{ __html: safeHtml }}
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

  // safeHtml is null → plain text path

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
