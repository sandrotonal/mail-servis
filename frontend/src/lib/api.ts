const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1"

interface ApiOptions extends RequestInit {
  params?: Record<string, string>
}

class ApiClient {
  private token: string | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("accessToken")
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem("accessToken", token)
    } else {
      localStorage.removeItem("accessToken")
    }
  }

  private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options
    let url = `${API_BASE}${endpoint}`

    if (params) {
      const searchParams = new URLSearchParams(params)
      url += `?${searchParams.toString()}`
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    if (response.status === 401) {
      localStorage.removeItem("accessToken")
      if (typeof document !== "undefined") {
        document.cookie = "auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC"
      }
      window.location.href = "/auth/login"
      throw new Error("Session expired")
    }

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(data.message || "An error occurred", response.status, data.errors)
    }

    return data
  }

  get<T>(endpoint: string, options?: ApiOptions) {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  post<T>(endpoint: string, body?: unknown, options?: ApiOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  put<T>(endpoint: string, body?: unknown, options?: ApiOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  delete<T>(endpoint: string, options?: ApiOptions) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }

  patch<T>(endpoint: string, body?: unknown, options?: ApiOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    })
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: unknown
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export const api = new ApiClient()
