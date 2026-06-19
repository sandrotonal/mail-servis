import { api } from "./api"

export interface User {
  _id: string
  name: string
  email: string
  role: string
  plan: string
  isEmailVerified: boolean
  createdAt: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    accessToken: string
    refreshToken: string
    workspace?: { _id: string; name: string; slug: string }
  }
}

// Helper: set a cookie accessible to Next.js middleware
function setSessionCookie(token: string | null) {
  if (typeof document === 'undefined') return
  if (token) {
    // 7 days
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
    document.cookie = `auth_session=${token}; path=/; expires=${expires}; SameSite=Lax`
  } else {
    document.cookie = 'auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC'
  }
}

export const authService = {
  async register(data: { name: string; email: string; password: string; workspaceName?: string }) {
    const res = await api.post<AuthResponse>("/auth/register", data)
    api.setToken(res.data.accessToken)
    setSessionCookie(res.data.accessToken)
    if (res.data.refreshToken) {
      localStorage.setItem('refreshToken', res.data.refreshToken)
    }
    return res
  },

  async login(data: { email: string; password: string }) {
    const res = await api.post<AuthResponse>("/auth/login", data)
    api.setToken(res.data.accessToken)
    setSessionCookie(res.data.accessToken)
    if (res.data.refreshToken) {
      localStorage.setItem('refreshToken', res.data.refreshToken)
    }
    return res
  },

  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken })
      }
    } catch (_) { /* ignore */ }
    api.setToken(null)
    setSessionCookie(null)
    localStorage.removeItem('refreshToken')
  },

  async getMe() {
    return api.get<{ success: boolean; data: { user: User } }>("/auth/me")
  },

  async forgotPassword(email: string) {
    return api.post("/auth/forgot-password", { email })
  },

  async resetPassword(token: string, password: string) {
    return api.post("/auth/reset-password", { token, password })
  },

  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false
    return Boolean(localStorage.getItem('accessToken'))
  },
}
