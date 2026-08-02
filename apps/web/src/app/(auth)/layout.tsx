import Link from 'next/link'
import { BriefcaseIcon } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 py-3.5 shadow-sm">
        <div className="mx-auto max-w-7xl px-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
              <BriefcaseIcon className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              TuyenDung<span className="text-brand">.vn</span>
            </span>
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>
      <footer className="py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} TuyenDung.vn · Kết nối ứng viên và nhà tuyển dụng
      </footer>
    </div>
  )
}
