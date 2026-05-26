// Global application store using Zustand
// This manages authentication state across the app

import { create } from 'zustand'

interface User {
  id: string
  email: string
  name: string
  role: 'customer' | 'agent' | 'admin' | 'ai_operator'
  org_id: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  restoreSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      // Use the actual apiClient to talk to the FastAPI backend
      const { apiClient } = await import('@/services/api')
      const response = await apiClient.post('/auth/login', { email, password })
      
      const { access_token, user } = response.data as any
      set({ user, token: access_token, isAuthenticated: true })
      localStorage.setItem('auth_token', access_token)
    } catch (error: any) {
      const detail = error.response?.data?.detail
      const message = Array.isArray(detail) 
        ? detail.map((d: any) => d.msg).join(', ') 
        : detail || error.message || 'Login failed'
      set({ error: message })
      throw error // Re-throw to handle in UI
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const { apiClient } = await import('@/services/api')
      const response = await apiClient.post('/auth/register', { name, email, password, role: 'customer' })
      
      const { access_token, user } = response.data as any
      set({ user, token: access_token, isAuthenticated: true })
      localStorage.setItem('auth_token', access_token)
    } catch (error: any) {
      const detail = error.response?.data?.detail
      const message = Array.isArray(detail) 
        ? detail.map((d: any) => d.msg).join(', ') 
        : detail || error.message || 'Registration failed'
      set({ error: message })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false })
    localStorage.removeItem('auth_token')
  },

  restoreSession: async () => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      set({ token, isAuthenticated: true })
      try {
        const { apiClient } = await import('@/services/api')
        const response = await apiClient.get('/auth/me')
        set({ user: response.data as any })
      } catch (e) {
        // Token invalid or expired
        set({ token: null, isAuthenticated: false, user: null })
        localStorage.removeItem('auth_token')
      }
    }
  },
}))
