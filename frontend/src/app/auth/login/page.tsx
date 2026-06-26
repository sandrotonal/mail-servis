"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Mail, Lock, Loader2, ArrowRight, Chrome, Github } from "lucide-react"
import { authService } from "@/lib/auth"
import { loginSchema, type LoginInput } from "@/lib/validations"
import { SmokeyBackground } from "@/components/auth/SmokeyBackground"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (error) {
      if (error === "google_not_configured") {
        toast.error("Google OAuth henüz yapılandırılmadı. Lütfen backend/.env dosyasında GOOGLE_CLIENT_ID değerini tanımlayın.")
      } else if (error === "github_not_configured") {
        toast.error("GitHub OAuth henüz yapılandırılmadı. Lütfen backend/.env dosyasında GITHUB_CLIENT_ID değerini tanımlayın.")
      } else if (error === "google_auth_failed" || error === "github_auth_failed") {
        toast.error("Sosyal ağ ile giriş başarısız oldu. Lütfen tekrar deneyin.")
      }
      router.replace("/auth/login")
    }
  }, [error, router])

  const onSubmit = async (data: LoginInput) => {
    setLoading(true)
    try {
      await authService.login(data)
      toast.success("Giriş başarılı! Yönlendiriliyorsunuz...")
      router.push("/dashboard")
    } catch (err: any) {
      toast.error(err.message || "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative w-full min-h-screen bg-black overflow-hidden flex items-center justify-center p-4">
      {/* WebGL Smokey Background */}
      <SmokeyBackground backdropBlurAmount="lg" color="#7342E2" className="absolute inset-0" />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-6 sm:p-8 md:p-10 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-white">Hoş Geldiniz</h2>
          <p className="text-sm text-gray-300">Hesabınıza giriş yaparak devam edin</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Input with Animated Floating Label */}
          <div className="relative z-0">
            <input
              type="email"
              id="floating_email"
              {...register("email")}
              className="block py-3 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-[#7342E2] peer transition-colors"
              placeholder=" "
              autoComplete="email"
            />
            <label
              htmlFor="floating_email"
              className="absolute text-sm text-gray-300 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#a78bfa] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              <Mail className="inline-block mr-2 -mt-0.5" size={16} />
              E-posta Adresi
            </label>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 mt-1.5"
              >
                {errors.email.message}
              </motion.p>
            )}
          </div>

          {/* Password Input with Animated Floating Label */}
          <div className="relative z-0">
            <input
              type="password"
              id="floating_password"
              {...register("password")}
              className="block py-3 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-[#7342E2] peer transition-colors"
              placeholder=" "
              autoComplete="current-password"
            />
            <label
              htmlFor="floating_password"
              className="absolute text-sm text-gray-300 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#a78bfa] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              <Lock className="inline-block mr-2 -mt-0.5" size={16} />
              Şifre
            </label>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 mt-1.5"
              >
                {errors.password.message}
              </motion.p>
            )}
          </div>

          <div className="flex items-center justify-end text-xs">
            <Link href="/auth/forgot-password" className="text-gray-300 hover:text-white transition-colors">
              Şifremi Unuttum?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group w-full flex items-center justify-center py-3.5 px-4 bg-[#7342E2] hover:bg-[#7342E2]/90 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#7342E2] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Giriş Yap
                <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-white/40 text-xs tracking-wider font-medium">VEYA</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
                window.location.href = `${apiBase}/auth/google?origin=${window.location.origin}`;
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-semibold transition-colors"
            >
              <Chrome className="w-4.5 h-4.5" />
              Google
            </button>
            <button
              type="button"
              onClick={() => {
                const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
                window.location.href = `${apiBase}/auth/github?origin=${window.location.origin}`;
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-semibold transition-colors"
            >
              <Github className="w-4.5 h-4.5" />
              Github
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-gray-400 pt-2">
          Hesabınız yok mu?{" "}
          <Link href="/auth/register" className="font-semibold text-[#a78bfa] hover:text-[#c084fc] transition-colors">
            Kayıt Olun
          </Link>
        </p>
      </motion.div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black relative">
        <SmokeyBackground backdropBlurAmount="lg" color="#7342E2" className="absolute inset-0" />
        <Loader2 className="h-8 w-8 animate-spin text-[#7342E2] relative z-10" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}