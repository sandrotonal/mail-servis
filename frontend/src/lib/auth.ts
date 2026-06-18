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
  }
}

export const authService = {
  async register(data: { name: string; email: string; password: string; workspaceName?: string }) {
    const res = await api.post<AuthResponse>("/auth/register", data)
    api.setToken(res.data.accessToken)
    return res
  },

  async login(data: { email: string; password: string }) {
    const res = await api.post<AuthResponse>("/auth/login", data)
    api.setToken(res.data.accessToken)
    return res
  },

  async logout(refreshToken: string) {
    await api.post("/auth/logout", { refreshToken })
    api.setToken(null)
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
}
