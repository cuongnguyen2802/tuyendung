import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'
import { ChatWidget } from '@/components/chat/ChatWidget'

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

export const metadata: Metadata = {
  title: { default: 'TuyenDung.vn - Tìm việc làm nhanh nhất', template: '%s | TuyenDung.vn' },
  description: 'Nền tảng tuyển dụng hàng đầu Việt Nam — kết nối ứng viên với hàng nghìn nhà tuyển dụng uy tín.',
  keywords: ['tuyển dụng', 'việc làm', 'tìm việc', 'TopCV', 'tuyendung'],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
          <ChatWidget />
        </Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
