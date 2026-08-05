'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { HeartIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  employerId: string
  /** glass-style trắng trên nền hero tối */
  variant?: 'hero' | 'default'
}

export function FollowCompanyButton({ employerId, variant = 'hero' }: Props) {
  const { data: session, status } = useSession()
  const queryClient = useQueryClient()
  const isCandidate = session?.user?.role === 'CANDIDATE'

  // Check if already following
  const { data: followedData } = useQuery<{ data: { employer: { id: string } }[] }>({
    queryKey: ['followed-companies'],
    queryFn: () => api.get('/users/me/followed-companies?limit=100'),
    enabled: !!session && isCandidate,
    staleTime: 60_000,
  })

  const isFollowing = (followedData?.data ?? []).some((f) => f.employer.id === employerId)

  const mutation = useMutation({
    mutationFn: () => api.post(`/users/me/follow-companies/${employerId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followed-companies'] })
    },
  })

  // Don't render for non-candidates or unauthenticated
  if (status === 'loading') return null
  if (!isCandidate) return null

  if (variant === 'hero') {
    return (
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className={cn(
          'flex w-fit items-center gap-2 rounded-xl border-2 px-5 py-2 text-sm font-semibold backdrop-blur-sm transition disabled:opacity-60',
          isFollowing
            ? 'border-red-300/80 bg-white/10 text-red-200 hover:border-red-300 hover:bg-white/20'
            : 'border-white/60 text-white hover:border-white hover:bg-white hover:text-gray-900',
        )}
      >
        <HeartIcon
          className={cn(
            'h-4 w-4 transition',
            isFollowing ? 'fill-red-400 text-red-400' : 'text-current',
          )}
        />
        {isFollowing ? 'Đang theo dõi' : '+ Theo dõi công ty'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className={cn(
        'flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition disabled:opacity-60',
        isFollowing
          ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
          : 'border-gray-200 bg-white text-gray-600 hover:border-brand hover:text-brand',
      )}
    >
      <HeartIcon
        className={cn('h-4 w-4', isFollowing ? 'fill-red-400 text-red-400' : '')}
      />
      {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
    </button>
  )
}
