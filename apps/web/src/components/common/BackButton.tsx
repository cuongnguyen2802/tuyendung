'use client'

import { ArrowLeftIcon } from 'lucide-react'

export function BackButton() {
  return (
    <button
      type="button"
      onClick={() => history.back()}
      className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
    >
      <ArrowLeftIcon className="h-4 w-4" />
      Quay lại
    </button>
  )
}
