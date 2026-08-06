import { create } from 'zustand'
import { TokenStore, authApi } from './api'

interface User {
  id: string
  email: string
  fullName: string
  role: string
  avatarUrl?: string
}

interface AuthState {
  user:        User | null
  isLoading:   boolean
  isLoggedIn:  boolean
  login:       (email: string, password: string) => Promise<void>
  register:    (data: { email: string; password: string; fullName: string }) => Promise<void>
  logout:      () => Promise<void>
  loadUser:    () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user:       null,
  isLoading:  true,
  isLoggedIn: false,

  loadUser: async () => {
    try {
      const token = await TokenStore.getAccess()
      if (!token) { set({ isLoading: false }); return }
      const res = await authApi.me()
      set({ user: res.data, isLoggedIn: true, isLoading: false })
    } catch {
      await TokenStore.clear()
      set({ user: null, isLoggedIn: false, isLoading: false })
    }
  },

  login: async (email, password) => {
    const res = await authApi.login(email, password)
    const { accessToken, refreshToken, user } = res.data
    await TokenStore.setTokens(accessToken, refreshToken)
    set({ user, isLoggedIn: true })
  },

  register: async (data) => {
    const res = await authApi.register(data)
    const { accessToken, refreshToken, user } = res.data
    await TokenStore.setTokens(accessToken, refreshToken)
    set({ user, isLoggedIn: true })
  },

  logout: async () => {
    await TokenStore.clear()
    set({ user: null, isLoggedIn: false })
  },
}))
