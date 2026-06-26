"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { SmokeyBackground } from "@/components/auth/SmokeyBackground"

function AuthCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const accessToken = searchParams.get("accessToken")
    const refreshToken = searchParams.get("refreshToken")

    if (accessToken && refreshToken) {
      api.setToken(accessToken)
      
      if (typeof document !== "undefined") {
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
        document.cookie = `auth_session=${accessToken}; path=/; expires=${expires}; SameSite=Lax`
      }
      
      localStorage.setItem("refreshToken", refreshToken)
      toast.success("Başarıyla giriş yapıldı! Yönlendiriliyorsunuz...")
      router.push("/dashboard")
    } else {
      toast.error("Kimlik doğrulama başarısız oldu.")
      router.push("/auth/login")
    }
  }, [searchParams, router])

  return (
    <main className="relative w-full min-h-screen bg-black flex items-center justify-center p-4">
      <SmokeyBackground backdropBlurAmount="lg" color="#7342E2" className="absolute inset-0" />
      <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#7342E2]" />
        <p className="text-white text-sm font-medium tracking-wide">Giriş yapılıyor, lütfen bekleyin...</p>
      </div>
    </main>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black relative">
        <SmokeyBackground backdropBlurAmount="lg" color="#7342E2" className="absolute inset-0" />
        <Loader2 className="h-8 w-8 animate-spin text-[#7342E2] relative z-10" />
      </div>
    }>
      <AuthCallbackHandler />
    </Suspense>
  )
}
