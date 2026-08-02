'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MessageSquareIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  employerUserId: string
  className?: string
  variant?: 'default' | 'outline'
  label?: string
}

export function ContactEmployerButton({
  employerUserId,
  className,
  variant = 'default',
  label = 'Nhắn tin nhà tuyển dụng',
}: Props) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const role = (session?.user as any)?.role

  // Employer / admin không cần nút này
  if (role === 'EMPLOYER' || role === 'ADMIN') return null

  function handleClick() {
    if (status === 'unauthenticated' || !session) {
      router.push(`/login?callbackUrl=/messages?to=${employerUserId}`)
      return
    }
    router.push(`/messages?to=${employerUserId}`)
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition',
        variant === 'default'
          ? 'bg-brand text-white hover:bg-brand/90'
          : 'border border-brand text-brand hover:bg-brand/5',
        className,
      )}
    >
      <MessageSquareIcon className="h-4 w-4" />
      {label}
    </button>
  )
}
