'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
  BotMessageSquareIcon, XIcon, RotateCcwIcon, SendIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

// ── Constants ─────────────────────────────────────────────────────────────────

const API_BASE   = process.env.NEXT_PUBLIC_API_URL + '/api/v1'
const SESSION_KEY = 'ai_chat_session_id'
const GUEST_KEY   = 'ai_chat_guest_id'

const QUICK_PROMPTS = [
  'Tư vấn viết CV chuyên nghiệp',
  'Chuẩn bị phỏng vấn xin việc',
  'Tìm việc lương cao phù hợp',
  'Cách đàm phán mức lương',
]

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Xin chào! Tôi là trợ lý AI của **TuyenDung.vn**.\n\nTôi có thể giúp bạn tìm việc, viết CV, chuẩn bị phỏng vấn và nhiều hơn nữa. Bạn cần hỗ trợ gì hôm nay?',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem(GUEST_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(GUEST_KEY, id)
  }
  return id
}

/** Minimal markdown → safe HTML (bold, newline, bullet) */
function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

// ── Cursor blink ──────────────────────────────────────────────────────────────

function Cursor() {
  return <span className="ml-0.5 inline-block h-[14px] w-0.5 animate-pulse bg-current align-middle" />
}

// ── AI avatar icon ─────────────────────────────────────────────────────────────

function AiAvatar() {
  return (
    <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand">
      <BotMessageSquareIcon className="h-3.5 w-3.5 text-white" strokeWidth={2} />
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ChatWidget() {
  const { data: session } = useSession()
  const [open, setOpen]           = useState(false)
  const [messages, setMessages]   = useState<ChatMessage[]>([WELCOME])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)
  const abortRef  = useRef<AbortController | null>(null)

  // Restore sessionId from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) setSessionId(stored)
  }, [])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120)
  }, [open])

  // ── Send ────────────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (text: string) => {
    const userText = text.trim()
    if (!userText || loading) return

    setInput('')
    setLoading(true)

    const userMsg: ChatMessage      = { id: Date.now().toString(), role: 'user', content: userText }
    const assistantId               = (Date.now() + 1).toString()
    const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '', streaming: true }

    setMessages(prev => [...prev, userMsg, assistantMsg])

    const guestId = getOrCreateGuestId()
    const token   = (session as any)?.accessToken as string | undefined

    try {
      abortRef.current = new AbortController()

      const res = await fetch(`${API_BASE}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: userText, sessionId, guestId }),
        signal: abortRef.current.signal,
      })

      if (!res.ok || !res.body) throw new Error('Không thể kết nối đến máy chủ')

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let   buffer  = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const payload = JSON.parse(line.slice(6))

            if (payload.token) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, content: m.content + payload.token } : m,
                ),
              )
            }
            if (payload.done) {
              if (payload.sessionId) {
                setSessionId(payload.sessionId)
                localStorage.setItem(SESSION_KEY, payload.sessionId)
              }
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, streaming: false } : m),
              )
            }
            if (payload.error) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: `⚠️ ${payload.error}`, streaming: false }
                    : m,
                ),
              )
            }
          } catch { /* ignore malformed JSON */ }
        }
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: '⚠️ Có lỗi xảy ra, vui lòng thử lại.', streaming: false }
              : m,
          ),
        )
      }
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [loading, session, sessionId])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearChat = () => {
    setMessages([WELCOME])
    setSessionId(null)
    localStorage.removeItem(SESSION_KEY)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Chat panel ──────────────────────────────────────────────────────── */}
      {open && (
        <div
          className={cn(
            'fixed bottom-20 right-4 z-50 flex flex-col overflow-hidden',
            'w-[370px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[80vh]',
            'rounded-2xl border border-gray-200 bg-white shadow-2xl',
          )}
          role="dialog"
          aria-label="Trợ lý AI TuyenDung"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center gap-3 bg-brand px-4 py-3">
            {/* Avatar */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
              <BotMessageSquareIcon className="h-4 w-4 text-white" strokeWidth={2} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-tight">Trợ lý AI TuyenDung</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                <p className="text-xs text-white/80">Tư vấn tuyển dụng 24/7</p>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                onClick={clearChat}
                title="Cuộc trò chuyện mới"
                className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/15 hover:text-white"
              >
                <RotateCcwIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                title="Đóng"
                className="rounded-lg p-1.5 text-white/70 transition hover:bg-white/15 hover:text-white"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth bg-gray-50"
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-2.5',
                  msg.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                {msg.role === 'assistant' && <AiAvatar />}

                <div
                  className={cn(
                    'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'rounded-br-sm bg-brand text-white'
                      : 'rounded-bl-sm bg-white text-gray-800 shadow-sm ring-1 ring-gray-100',
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <span
                      // eslint-disable-next-line react/no-danger
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                    />
                  ) : (
                    msg.content
                  )}

                  {/* Typing dots */}
                  {msg.streaming && msg.content === '' && (
                    <span className="inline-flex gap-1 py-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300 [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300" />
                    </span>
                  )}
                  {msg.streaming && msg.content !== '' && <Cursor />}
                </div>
              </div>
            ))}
          </div>

          {/* Quick prompts — only on first open */}
          {messages.length === 1 && (
            <div className="shrink-0 bg-gray-50 px-4 pb-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Gợi ý câu hỏi</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className={cn(
                      'rounded-full border border-brand/25 bg-brand/5 px-3 py-1',
                      'text-xs font-medium text-brand transition',
                      'hover:bg-brand hover:text-white hover:border-brand',
                    )}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="shrink-0 border-t border-gray-100 bg-white px-3 py-3">
            <div className={cn(
              'flex items-end gap-2 rounded-xl border bg-gray-50 px-3 py-2 transition',
              'border-gray-200 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15',
            )}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi… (Enter để gửi)"
                rows={1}
                style={{ maxHeight: 100, overflowY: 'auto' }}
                className="flex-1 resize-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                aria-label="Gửi"
                className={cn(
                  'mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition',
                  loading || !input.trim()
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                    : 'bg-brand text-white hover:bg-brand-600 active:scale-95',
                )}
              >
                {loading ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <SendIcon className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-gray-400">
              AI có thể mắc lỗi. Hãy xác minh thông tin quan trọng.
            </p>
          </div>
        </div>
      )}

      {/* ── Floating button ──────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Đóng trợ lý AI' : 'Mở trợ lý AI'}
        className={cn(
          'fixed bottom-4 right-4 z-50',
          'flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200',
          open
            ? 'bg-gray-700 hover:bg-gray-800'
            : 'bg-brand text-white hover:bg-brand-600 hover:scale-105 hover:shadow-xl',
        )}
      >
        {open ? (
          <XIcon className="h-6 w-6 text-white" />
        ) : (
          <BotMessageSquareIcon className="h-6 w-6 text-white" strokeWidth={1.75} />
        )}

        {/* Active session indicator */}
        {!open && sessionId && (
          <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
        )}
      </button>
    </>
  )
}
