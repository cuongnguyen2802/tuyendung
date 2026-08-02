'use client'

import Link from 'next/link'
import { MessageSquareIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Props {
  href?: string
  className?: string
}

export function ChatBadge({ href = '/messages', className }: Props) {
  const { data } = useQuery<{ count: number }>({
    queryKey: ['messages-unread-count'],
    queryFn:  () => api.get('/messages/unread-count'),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  })

  const count = data?.count ?? 0

  return (
    <Link
      href={href}
      aria-label="Tin nhắn"
      className={cn(
        'relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700',
        className,
      )}
    >
      <MessageSquareIcon className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
