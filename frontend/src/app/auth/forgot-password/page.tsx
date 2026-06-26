"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Mail, Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { authService } from "@/lib/auth"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations"
import { SmokeyBackground } from "@/components/auth/SmokeyBackground"

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true)
    try {
      await authService.forgotPassword(data.email)
      setSent(true)
      toast.success("Şifre sıfırlama e-postası başarıyla gönderildi!")
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

      {/* Forgot Password Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-6 sm:p-8 md:p-10 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-white">Şifremi Unuttum</h2>
          <p className="text-sm text-gray-300">
            {sent ? "Sıfırlama e-postası gönderildi" : "E-posta adresinizi girin, sıfırlama bağlantısı gönderelim"}
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-6 pt-4">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 font-normal">
              <p className="text-sm text-gray-200 leading-relaxed">
                Şifre sıfırlama bağlantısını e-posta adresinize gönderdik. Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.
              </p>
            </div>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-[#a78bfa] hover:text-[#c084fc] font-semibold transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Giriş Sayfasına Dön
            </Link>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center py-3.5 px-4 bg-[#7342E2] hover:bg-[#7342E2]/90 rounded-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#7342E2] transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Bağlantıyı Gönder
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-center pt-2">
              <Link
                href="/auth/login"
                className="text-xs text-gray-400 hover:text-white inline-flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Giriş Sayfasına Dön
              </Link>
            </p>
          </form>
        )}
      </motion.div>
    </main>
  )
}
