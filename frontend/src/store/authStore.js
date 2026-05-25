import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: (user, token) => set({ user, token }),

      logout: () => set({ user: null, token: null }),

      isAuthenticated: () => {
        const state = useAuthStore.getState()
        return !!state.token
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)

export default useAuthStore
