'use client'

import {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import { useChatSocket } from '@/hooks/useChatSocket'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import {
  SendIcon, SearchIcon, MessageSquareIcon, CheckCheckIcon,
  MoreVerticalIcon, ArrowLeftIcon, FileTextIcon, Building2Icon, UsersIcon,
} from 'lucide-react'

// ── Helpers ──────────────────────────────────────────────────────────────────

function getDisplayName(user: any): string {
  return user?.profile?.fullName ?? user?.employer?.companyName ?? user?.email ?? '?'
}

function getAvatar(user: any): string | null {
  return user?.profile?.avatarUrl ?? user?.employer?.logoUrl ?? null
}

const SIZE_CLASSES: Record<number, string> = {
  7:  'h-7 w-7',
  8:  'h-8 w-8',
  10: 'h-10 w-10',
  14: 'h-14 w-14',
}

function Avatar({ user, size = 10, dot }: { user: any; size?: 7 | 8 | 10 | 14; dot?: boolean }) {
  const name = getDisplayName(user)
  const img  = getAvatar(user)
  const cls  = SIZE_CLASSES[size]
  return (
    <div className={cn('relative shrink-0', cls)}>
      {img ? (
        <img src={img} alt={name} className={cn(cls, 'rounded-full object-cover')} />
      ) : (
        <div className={cn(cls, 'rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-sm')}>
          {name[0]?.toUpperCase()}
        </div>
      )}
      {dot && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-brand ring-2 ring-white" />}
    </div>
  )
}

function timeLabel(date: string | Date) {
  const d = new Date(date)
  if (isToday(d))     return format(d, 'HH:mm')
  if (isYesterday(d)) return 'Hôm qua'
  return format(d, 'dd/MM')
}

function dateDivider(date: string | Date) {
  const d = new Date(date)
  if (isToday(d))     return 'Hôm nay'
  if (isYesterday(d)) return 'Hôm qua'
  return format(d, 'dd/MM/yyyy')
}

// ── Left panel: conversation list ────────────────────────────────────────────

function ConvList({
  conversations, selectedId, onSelect, unreadOnly, setUnreadOnly, search, setSearch,
}: {
  conversations: any[]
  selectedId: string | null
  onSelect: (id: string) => void
  unreadOnly: boolean
  setUnreadOnly: (v: boolean) => void
  search: string
  setSearch: (v: string) => void
}) {
  const filtered = useMemo(() => {
    let list = conversations
    if (unreadOnly) list = list.filter(c => c.unreadCount > 0)
    if (search.trim()) {
      const kw = search.toLowerCase()
      list = list.filter(c => getDisplayName(c.user).toLowerCase().includes(kw))
    }
    return list
  }, [conversations, unreadOnly, search])

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-gray-200">
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Họ tên..."
            className="w-full rounded-full bg-gray-100 py-2 pl-8 pr-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-3">
        {(['Tất cả', 'Chưa đọc'] as const).map((tab, i) => (
          <button
            key={tab}
            onClick={() => setUnreadOnly(i === 1)}
            className={cn(
              'relative py-2.5 text-sm font-medium transition',
              (i === 1) === unreadOnly ? 'text-brand' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {tab}
            {(i === 1) === unreadOnly && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-brand" />
            )}
            {tab === 'Tất cả' && <span className="mr-4" />}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <MessageSquareIcon className="h-10 w-10 text-gray-200" />
            <p className="text-sm text-gray-400">
              {unreadOnly ? 'Không có tin nhắn chưa đọc' : 'Chưa có cuộc trò chuyện'}
            </p>
            {!unreadOnly && !search && (
              <Link href="/companies"
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand/30 px-4 py-2 text-xs font-semibold text-brand hover:bg-brand/5 transition">
                <Building2Icon className="h-3.5 w-3.5" />
                Tìm công ty để nhắn tin
              </Link>
            )}
          </div>
        ) : (
          filtered.map(conv => {
            const isSelected = conv.user.id === selectedId
            const isUnread   = conv.unreadCount > 0
            return (
              <button
                key={conv.user.id}
                onClick={() => onSelect(conv.user.id)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-3 text-left transition',
                  isSelected ? 'bg-brand/5 border-r-2 border-brand' : 'hover:bg-gray-50',
                )}
              >
                <Avatar user={conv.user} size={10} dot />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <p className={cn('truncate text-sm', isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700')}>
                      {getDisplayName(conv.user)}
                    </p>
                    <span className="shrink-0 text-[10px] text-gray-400">
                      {conv.lastMessage ? timeLabel(conv.lastMessage.createdAt) : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <p className={cn('truncate text-xs', isUnread ? 'font-medium text-brand' : 'text-gray-400')}>
                      {conv.lastMessage?.content ?? ''}
                    </p>
                    {isUnread && (
                      <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </aside>
  )
}

// ── Middle panel: chat thread ─────────────────────────────────────────────────

function ChatThread({
  partnerId, partner, myId, onBack,
  sendMessage, sendTyping, typingUserId,
}: {
  partnerId: string
  partner: any
  myId: string
  onBack?: () => void
  sendMessage: (receiverId: string, content: string) => void
  sendTyping: (receiverId: string, isTyping: boolean) => void
  typingUserId: string | null
}) {
  const queryClient = useQueryClient()
  const [text, setText]     = useState('')
  const endRef              = useRef<HTMLDivElement>(null)
  const typingTimer         = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef            = useRef<HTMLInputElement>(null)

  const { data: thread, isLoading } = useQuery<any>({
    queryKey: ['thread', partnerId],
    queryFn:  () => api.get(`/messages/${partnerId}`),
    enabled:  !!partnerId,
    refetchInterval: 10000,
  })

  const sendMutation = useMutation({
    mutationFn: (content: string) => api.post('/messages', { receiverId: partnerId, content }),
    onSuccess: (newMsg: any) => {
      queryClient.setQueryData(['thread', partnerId], (old: any) => {
        if (!old) return old
        const exists = old.data?.some((m: any) => m.id === newMsg.id)
        if (exists) return old
        return { ...old, data: [...(old.data ?? []), newMsg] }
      })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread?.data?.length])

  useEffect(() => {
    inputRef.current?.focus()
  }, [partnerId])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const content = text.trim()
    if (!content) return
    setText('')
    sendMutation.mutate(content)
  }

  function handleTyping(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value)
    sendTyping(partnerId, true)
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => sendTyping(partnerId, false), 1500)
  }

  const messages: any[] = thread?.data ?? []

  // Group messages by date
  const grouped = useMemo(() => {
    const out: { divider?: string; msg?: any }[] = []
    let lastDate = ''
    for (const msg of messages) {
      const day = format(new Date(msg.createdAt), 'yyyy-MM-dd')
      if (day !== lastDate) {
        out.push({ divider: dateDivider(msg.createdAt) })
        lastDate = day
      }
      out.push({ msg })
    }
    return out
  }, [messages])

  const partnerName = getDisplayName(partner)

  return (
    <div className="flex flex-1 flex-col min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
        {onBack && (
          <button onClick={onBack} className="lg:hidden rounded-lg p-1 hover:bg-gray-100">
            <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
          </button>
        )}
        <Avatar user={partner} size={10} dot />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{partnerName}</p>
          <p className="text-xs text-brand">Đang hoạt động</p>
        </div>
        <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
          <MoreVerticalIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        ) : (
          grouped.map((item, i) => {
            if (item.divider) {
              return (
                <div key={`d-${i}`} className="flex items-center gap-3 py-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">{item.divider}</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
              )
            }
            const msg    = item.msg!
            const isMine = msg.senderId === myId
            return (
              <div key={msg.id} className={cn('flex items-end gap-2', isMine ? 'justify-end' : 'justify-start')}>
                {!isMine && <Avatar user={partner} size={7} />}
                <div className={cn('flex flex-col gap-0.5', isMine ? 'items-end' : 'items-start')}>
                  <div className={cn(
                    'max-w-xs rounded-2xl px-4 py-2 text-sm leading-relaxed lg:max-w-sm',
                    isMine
                      ? 'rounded-br-sm bg-brand text-white'
                      : 'rounded-bl-sm bg-gray-100 text-gray-800',
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-gray-400 px-1">
                    {format(new Date(msg.createdAt), 'HH:mm')}
                    {isMine && (
                      <CheckCheckIcon className={cn('ml-1 inline h-3 w-3', msg.isRead ? 'text-blue-400' : 'text-gray-300')} />
                    )}
                  </span>
                </div>
              </div>
            )
          })
        )}

        {/* Typing indicator */}
        {typingUserId === partnerId && (
          <div className="flex items-end gap-2">
            <Avatar user={partner} size={7} />
            <div className="rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3">
              <span className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-200 px-4 py-3">
        <input
          ref={inputRef}
          value={text}
          onChange={handleTyping}
          placeholder={`Nhắn tin cho ${partnerName}...`}
          className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-brand/30"
        />
        <button
          type="submit"
          disabled={!text.trim() || sendMutation.isPending}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand text-white disabled:opacity-40 hover:bg-brand/90 transition"
        >
          <SendIcon className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}

// ── Context panel: partner info ───────────────────────────────────────────────

function PartnerPanel({
  partnerId,
  onMessage,
  alwaysVisible = false,
}: {
  partnerId: string
  onMessage: (id: string) => void
  alwaysVisible?: boolean
}) {
  const { data: ctx } = useQuery<any>({
    queryKey: ['chat-context', partnerId],
    queryFn:  () => api.get(`/messages/${partnerId}/context`),
    enabled:  !!partnerId,
  })

  if (!ctx) return (
    <div className={cn(
      'w-64 shrink-0 border-l border-gray-200 p-4',
      alwaysVisible ? 'flex flex-col' : 'hidden xl:flex flex-col',
    )}>
      <div className="space-y-3 animate-pulse">
        {[...Array(5)].map((_, i) => <div key={i} className="h-4 rounded bg-gray-100" />)}
      </div>
    </div>
  )

  const { partner, applications, recentApplicants } = ctx

  return (
    <aside className={cn(
      'w-64 shrink-0 flex-col overflow-y-auto border-l border-gray-200',
      alwaysVisible ? 'flex' : 'hidden xl:flex',
    )}>
      {/* Partner profile */}
      <div className="flex flex-col items-center gap-2 border-b border-gray-100 px-4 py-5 text-center">
        <Avatar user={partner} size={14} />
        <p className="font-semibold text-gray-900 text-sm">{getDisplayName(partner)}</p>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
          {partner.role === 'EMPLOYER' ? 'Nhà tuyển dụng' : 'Ứng viên'}
        </span>
      </div>

      {/* Applied jobs */}
      {applications?.length > 0 && (
        <div className="border-b border-gray-100 px-4 py-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Việc làm đã ứng tuyển
          </p>
          <div className="space-y-3">
            {applications.map((app: any) => (
              <div key={app.id} className="text-xs">
                <p className="text-[10px] text-gray-400">
                  {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true, locale: vi })}
                </p>
                <p className="font-medium text-gray-800 truncate">{app.job?.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', {
                    'bg-yellow-100 text-yellow-700': app.status === 'PENDING',
                    'bg-blue-100 text-blue-700':    app.status === 'REVIEWING',
                    'bg-purple-100 text-purple-700':app.status === 'INTERVIEW',
                    'bg-brand-100 text-brand':  app.status === 'OFFER',
                    'bg-red-100 text-red-600':      app.status === 'REJECTED',
                  })}>
                    {app.status === 'PENDING'   ? 'Chờ xem' :
                     app.status === 'REVIEWING' ? 'Đang xem' :
                     app.status === 'INTERVIEW' ? 'Phỏng vấn' :
                     app.status === 'OFFER'     ? 'Đề nghị' : 'Từ chối'}
                  </span>
                  {app.resumeId && (
                    <a href={`/resumes/${app.resumeId}`} target="_blank"
                      className="flex items-center gap-0.5 text-[10px] text-brand hover:underline">
                      <FileTextIcon className="h-3 w-3" />Xem CV
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other recent applicants (employer view) */}
      {recentApplicants?.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">Ứng viên khác</p>
          <p className="mb-3 text-[10px] text-gray-400">Ứng tuyển vào tin của bạn trong 7 ngày qua</p>
          <div className="space-y-3">
            {recentApplicants.map((app: any) => (
              <div key={app.id} className="flex items-center gap-2">
                <Avatar user={app.user} size={8} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-medium text-gray-800">
                    {getDisplayName(app.user)}
                  </p>
                  <p className="truncate text-[10px] text-gray-400">{app.job?.title}</p>
                </div>
                <button
                  onClick={() => onMessage(app.user.id)}
                  className="shrink-0 rounded-full bg-brand px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-brand transition"
                >
                  Nhắn tin
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employer: manage applications link */}
      {alwaysVisible && (
        <div className="border-t border-gray-100 px-4 py-3 mt-auto">
          <Link
            href="/employer/candidates"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            <UsersIcon className="h-3.5 w-3.5" />
            Quản lý hồ sơ ứng tuyển
          </Link>
        </div>
      )}
    </aside>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { data: session } = useSession()
  const myId        = (session?.user as any)?.id ?? ''
  const role        = (session?.user as any)?.role ?? ''
  const isEmployer  = role === 'EMPLOYER'
  const searchParams = useSearchParams()
  const router       = useRouter()
  const toParam      = searchParams.get('to')
  const queryClient  = useQueryClient()

  // URL is source of truth for selected conversation — prevents router-cache restoring stale state
  const selectedId = toParam

  const [typingUserId, setTypingUserId] = useState<string | null>(null)
  const [search, setSearch]           = useState('')
  const [unreadOnly, setUnreadOnly]   = useState(false)
  const typingClearRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load conversations (polling fallback)
  const { data: conversations = [] } = useQuery<any[]>({
    queryKey: ['conversations'],
    queryFn: () => api.get('/messages/conversations'),
    refetchInterval: 15000,
  })

  // Socket.io real-time
  const onMessage = useCallback((msg: any) => {
    const partnerId = msg.senderId === myId ? msg.receiverId : msg.senderId

    // Update thread cache
    queryClient.setQueryData(['thread', partnerId], (old: any) => {
      if (!old) return old
      const exists = old.data?.some((m: any) => m.id === msg.id)
      if (exists) return old
      return { ...old, data: [...(old.data ?? []), msg] }
    })

    // Refresh conversation list
    queryClient.invalidateQueries({ queryKey: ['conversations'] })
    queryClient.invalidateQueries({ queryKey: ['messages-unread-count'] })
  }, [myId, queryClient])

  const onTyping = useCallback(({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
    if (isTyping) {
      setTypingUserId(userId)
      if (typingClearRef.current) clearTimeout(typingClearRef.current)
      typingClearRef.current = setTimeout(() => setTypingUserId(null), 3000)
    } else {
      setTypingUserId(null)
    }
  }, [])

  const { sendMessage, sendTyping } = useChatSocket({ onMessage, onTyping })

  const selectedConv = conversations.find(c => c.user.id === selectedId)

  // When coming from ?to= with no existing conversation, fetch partner info via context
  const { data: partnerCtx } = useQuery<any>({
    queryKey: ['chat-context', selectedId],
    queryFn:  () => api.get(`/messages/${selectedId}/context`),
    enabled:  !!selectedId && !selectedConv,
  })

  const selectedPartner = selectedConv?.user ?? partnerCtx?.partner ?? null

  function selectConversation(id: string) {
    router.replace(`${window.location.pathname}?to=${id}`, { scroll: false })
    // Badge giảm ngay khi mở conversation
    queryClient.invalidateQueries({ queryKey: ['messages-unread-count'] })
  }

  function clearSelection() {
    router.replace(window.location.pathname, { scroll: false })
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

      {/* Conversation list */}
      <ConvList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={selectConversation}
        unreadOnly={unreadOnly}
        setUnreadOnly={setUnreadOnly}
        search={search}
        setSearch={setSearch}
      />

      {/* Chat thread */}
      {selectedId && selectedPartner ? (
        <ChatThread
          key={selectedId}
          partnerId={selectedId}
          partner={selectedPartner}
          myId={myId}
          onBack={clearSelection}
          sendMessage={sendMessage}
          sendTyping={sendTyping}
          typingUserId={typingUserId}
        />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-400">
          <MessageSquareIcon className="h-14 w-14 text-gray-200" />
          <p className="text-sm">Chọn một cuộc trò chuyện để bắt đầu</p>
        </div>
      )}

      {/* Right: partner context panel — always visible for employer, xl-only for candidate */}
      {selectedId && (
        <PartnerPanel
          key={`ctx-${selectedId}`}
          partnerId={selectedId}
          onMessage={selectConversation}
          alwaysVisible={isEmployer}
        />
      )}
    </div>
  )
}
