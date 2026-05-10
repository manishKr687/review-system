import { create } from 'zustand'
import type { AuthUser } from '../api/auth'

const TOKEN_KEY = 'rl_token'

interface AuthStore {
  user: AuthUser | null
  token: string | null
  isLoggedIn: boolean
  setAuth: (user: AuthUser, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  isLoggedIn: !!localStorage.getItem(TOKEN_KEY),

  setAuth: (user, token) => {
    localStorage.setItem(TOKEN_KEY, token)
    set({ user, token, isLoggedIn: true })
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ user: null, token: null, isLoggedIn: false })
  },
}))
