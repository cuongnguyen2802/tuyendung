'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { HeartIcon, SendIcon } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'

interface Props {
  slug: string
  jobId: string
  isSaved?: boolean
  hasApplied?: boolean
}

export function ApplyButtons({ slug, jobId, isSaved, hasApplied }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(isSaved ?? false)

  const toggleMutation = useMutation({
    mutationFn: () => api.post(`/jobs/${jobId}/save`),
    onMutate: () => setSaved((v) => !v),
    onSuccess: (res: { saved: boolean }) => {
      setSaved(res.saved)
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] })
    },
    onError: () => setSaved((v) => !v),
  })

  const handleSave = () => {
    if (!session) {
      router.push('/login')
      return
    }
    toggleMutation.mutate()
  }

  return (
    <div className="mt-5 flex gap-3">
      {hasApplied ? (
        <div className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 py-3 text-base font-semibold text-gray-500">
          <SendIcon className="h-5 w-5" />
          Đã ứng tuyển
        </div>
      ) : (
        <Link
          href={session ? `/jobs/${slug}/apply` : '/login'}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand py-3 text-base font-semibold text-white transition hover:bg-brand/90 active:scale-95"
        >
          <SendIcon className="h-5 w-5" />
          Ứng tuyển ngay
        </Link>
      )}

      <button
        onClick={handleSave}
        disabled={toggleMutation.isPending}
        aria-label={saved ? 'Bỏ lưu' : 'Lưu tin'}
        title={saved ? 'Bỏ lưu' : 'Lưu tin'}
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 transition active:scale-95 ${
          saved
            ? 'border-rose-400 bg-rose-50 text-rose-500'
            : 'border-gray-200 text-gray-400 hover:border-rose-400 hover:text-rose-400'
        }`}
      >
        <HeartIcon className={`h-5 w-5 ${saved ? 'fill-rose-500 stroke-none' : ''}`} />
      </button>
    </div>
  )
}
