'use client'

import { SessionProvider, useSession } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { setApiToken } from '@/lib/api'

// Syncs the NextAuth session token into the api.ts module-level cache.
// This means API calls never need to call getSession() (an HTTP round-trip)
// because the token is already in memory as soon as the session loads.
function SessionSync() {
  const { data: session } = useSession()
  useEffect(() => {
    setApiToken((session as any)?.accessToken ?? null)
  }, [session])
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      }),
  )

  return (
    <SessionProvider>
      <SessionSync />
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  )
}
