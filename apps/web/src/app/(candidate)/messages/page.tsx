import { Suspense } from 'react'
import MessagesPage from '@/components/common/MessagesPage'

export const metadata = { title: 'Tin nhắn' }

export default function Page() {
  return (
    <Suspense>
      <MessagesPage />
    </Suspense>
  )
}
