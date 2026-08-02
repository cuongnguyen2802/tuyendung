import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { NEW_SYSTEM_NOTIFICATIONS } from '@/lib/system-notifications'

interface SystemNotifStore {
  readIds: number[]
  markRead: (id: number) => void
  unreadCount: () => number
  isRead: (id: number) => boolean
}

export const useSystemNotifStore = create<SystemNotifStore>()(
  persist(
    (set, get) => ({
      readIds: [],
      markRead: (id) =>
        set(state => ({
          readIds: state.readIds.includes(id) ? state.readIds : [...state.readIds, id],
        })),
      unreadCount: () => {
        const { readIds } = get()
        return NEW_SYSTEM_NOTIFICATIONS.filter(n => !readIds.includes(n.id)).length
      },
      isRead: (id) => get().readIds.includes(id),
    }),
    { name: 'sys-notif-read' },
  ),
)
