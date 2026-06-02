import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { authAPI } from '@/utils/api'
import { saveUser } from '@/utils/db'

interface AuthStore {
  user: User | null
  token: string | null
  loading: boolean
  login:    (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout:   () => void
  loadMe:   () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user:    null,
      token:   null,
      loading: false,

      login: async (email, password) => {
        set({ loading: true })
        try {
          const res = await authAPI.login(email, password)
          const { user, token } = res.data
          localStorage.setItem('pi_token', token)
          await saveUser(user)
          set({ user, token, loading: false })
        } catch (err) {
          set({ loading: false })
          throw err
        }
      },

      register: async (name, email, password) => {
        set({ loading: true })
        try {
          const res = await authAPI.register(name, email, password)
          const { user, token } = res.data
          localStorage.setItem('pi_token', token)
          await saveUser(user)
          set({ user, token, loading: false })
        } catch (err) {
          set({ loading: false })
          throw err
        }
      },

      logout: () => {
        localStorage.removeItem('pi_token')
        set({ user: null, token: null })
      },

      loadMe: async () => {
        const { token } = get()
        if (!token) return
        try {
          const res = await authAPI.me()
          set({ user: res.data })
        } catch (err: any) {
          // Only clear auth state on 401 (invalid/expired token)
          // Network errors, rate limiting (429), etc. should NOT log user out
          if (err?.response?.status === 401) {
            set({ user: null, token: null })
          }
        }
      },
    }),
    {
      name: 'pi_auth',
      partialize: (s) => ({ user: s.user, token: s.token }),
    }
  )
)
