import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
  html_url: string
}

interface AuthState {
  token: string | null
  user: GitHubUser | null
  gistId: string | null
  isLoading: boolean

  setToken: (token: string) => void
  setUser: (user: GitHubUser) => void
  setGistId: (id: string) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      gistId: null,
      isLoading: false,

      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setGistId: (id) => set({ gistId: id }),
      setLoading: (isLoading) => set({ isLoading }),

      logout: () => set({ token: null, user: null, gistId: null }),
    }),
    {
      name: 'zentype-auth',
      // Only persist token, user, and gistId — not transient loading state
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        gistId: state.gistId,
      }),
    }
  )
)
