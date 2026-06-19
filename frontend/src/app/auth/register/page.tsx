"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Mail, Lock, User, Building2, Loader2, ArrowRight, Chrome, Github } from "lucide-react"
import { authService } from "@/lib/auth"
import { registerSchema, type RegisterInput } from "@/lib/validations"
import { SmokeyBackground } from "@/components/auth/SmokeyBackground"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true)
    try {
      await authService.register(data)
      toast.success("Hesap oluşturuldu! Yönlendiriliyorsunuz...")
      router.push("/dashboard")
    } catch (err: any) {
      toast.error(err.message || "Kayıt yapılamadı. Lütfen bilgilerinizi kontrol edin.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative w-screen min-h-screen bg-black overflow-x-hidden flex items-center justify-center p-4 py-12">
      {/* WebGL Smokey Background */}
      <SmokeyBackground backdropBlurAmount="lg" color="#7342E2" className="absolute inset-0" />

      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 md:p-10 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-white">Hesap Oluştur</h2>
          <p className="text-sm text-gray-300">MailServis platformuna katılarak başlayın</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Input with Animated Floating Label */}
          <div className="relative z-0">
            <input
              type="text"
              id="floating_name"
              {...register("name")}
              className="block py-3 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-[#7342E2] peer transition-colors"
              placeholder=" "
              autoComplete="name"
            />
            <label
              htmlFor="floating_name"
              className="absolute text-sm text-gray-300 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#a78bfa] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              <User className="inline-block mr-2 -mt-0.5" size={16} />
              Ad Soyad
            </label>
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 mt-1.5"
              >
                {errors.name.message}
              </motion.p>
            )}
          </div>

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
              autoComplete="new-password"
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

          {/* Workspace Name Input with Animated Floating Label */}
          <div className="relative z-0">
            <input
              type="text"
              id="floating_workspacename"
              {...register("workspaceName")}
              className="block py-3 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-[#7342E2] peer transition-colors"
              placeholder=" "
              autoComplete="organization"
            />
            <label
              htmlFor="floating_workspacename"
              className="absolute text-sm text-gray-300 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-[#a78bfa] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >
              <Building2 className="inline-block mr-2 -mt-0.5" size={16} />
              Çalışma Alanı Adı <span className="text-xs text-gray-400">(opsiyonel)</span>
            </label>
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
                Kayıt Ol
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
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-semibold transition-colors"
            >
              <Chrome className="w-4.5 h-4.5" />
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-semibold transition-colors"
            >
              <Github className="w-4.5 h-4.5" />
              Github
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-gray-400 pt-2">
          Zaten hesabınız var mı?{" "}
          <Link href="/auth/login" className="font-semibold text-[#a78bfa] hover:text-[#c084fc] transition-colors">
            Giriş Yapın
          </Link>
        </p>
      </motion.div>
    </main>
  )
}