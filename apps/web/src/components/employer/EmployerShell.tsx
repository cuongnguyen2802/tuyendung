'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { EmployerTopbar } from './EmployerTopbar'
import { EmployerSidebar } from './EmployerSidebar'
import { UpgradeToastListener } from '@/components/common/UpgradeToastListener'
import { cn } from '@/lib/utils'

export function EmployerShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Close drawer on navigation
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Prevent body scroll when drawer is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <UpgradeToastListener />
      <EmployerTopbar onMenuToggle={() => setSidebarOpen(v => !v)} />

      <div className="relative flex flex-1 min-h-0">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'w-[260px] shrink-0 overflow-y-auto border-r border-gray-100 bg-white scrollbar-hover',
            // Mobile: fixed drawer sliding from left, sits above content
            'fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out',
            // Desktop: static in flow
            'lg:relative lg:inset-auto lg:z-auto lg:translate-x-0 lg:transition-none',
            // Mobile open/close
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
          )}
        >
          {/* Extra top padding on mobile to clear the topbar (h-14) */}
          <div className="p-4 pt-16 lg:pt-4">
            <EmployerSidebar />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-gray-50">
          <div className="px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
