"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Lock, Loader2, ArrowRight } from "lucide-react"
import { authService } from "@/lib/auth"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations"
import { SmokeyBackground } from "@/components/auth/SmokeyBackground"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "" },
  })

  useEffect(() => {
    if (token) {
      setValue("token", token)
    }
  }, [token, setValue])

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true)
    try {
      await authService.resetPassword(data.token, data.password)
      toast.success("Şifreniz başarıyla sıfırlandı! Giriş yapabilirsiniz.")
      router.push("/auth/login")
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative w-full min-h-screen bg-black overflow-hidden flex items-center justify-center p-4">
      {/* WebGL Smokey Background */}
      <SmokeyBackground backdropBlurAmount="lg" color="#7342E2" className="absolute inset-0" />

      {/* Reset Password Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-6 sm:p-8 md:p-10 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-white">Şifre Sıfırla</h2>
          <p className="text-sm text-gray-300">Yeni şifrenizi belirleyin</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" {...register("token")} />

          {/* Password Input with Animated Floating Label */}
          <div className="relative z-0">
            <input
              type="password"
              id="floating_password"
              {...register("password")}
              className="block py-3 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-[#7342E2] peer transition-colors"
              placeholder=" "
              autoComplete="new-password"
            />
            <label
              htmlFor="floating_password"
              className="absolute text-sm text-gray-300 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#a78bfa] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              <Lock className="inline-block mr-2 -mt-0.5" size={16} />
              Yeni Şifre
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

          <button
            type="submit"
            disabled={loading}
            className="group w-full flex items-center justify-center py-3.5 px-4 bg-[#7342E2] hover:bg-[#7342E2]/90 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#7342E2] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Şifreyi Sıfırla
                <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black relative">
        <SmokeyBackground backdropBlurAmount="lg" color="#7342E2" className="absolute inset-0" />
        <Loader2 className="h-8 w-8 animate-spin text-[#7342E2] relative z-10" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
