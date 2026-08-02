'use client'

import { useState, useEffect, useCallback } from 'react'
import { UpgradeToast } from './UpgradePrompt'

export function UpgradeToastListener() {
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  })

  const close = useCallback(() => setToast((t) => ({ ...t, visible: false })), [])

  useEffect(() => {
    const handler = (e: Event) => {
      const message = (e as CustomEvent<{ message: string }>).detail?.message
      if (message) setToast({ message, visible: true })
    }
    window.addEventListener('upgrade-required', handler)
    return () => window.removeEventListener('upgrade-required', handler)
  }, [])

  return <UpgradeToast message={toast.message} visible={toast.visible} onClose={close} />
}
