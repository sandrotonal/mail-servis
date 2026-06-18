"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Mail, Loader2, ArrowLeft } from "lucide-react"
import { authService } from "@/lib/auth"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations"

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
      toast.success("Email gönderildi")
    } catch (err: any) {
      toast.error(err.message || "Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-4 text-3xl font-bold">Şifremi Unuttum</h2>
          <p className="mt-2 text-muted-foreground">Email adresinizi girin, size sıfırlama linki gönderelim</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="rounded-lg bg-primary/10 p-6">
              <p className="text-sm">Email gönderildi! Gelen kutunuzu kontrol edin.</p>
            </div>
            <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" /> Giriş Sayfasına Dön
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="email" {...register("email")} className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="ornek@email.com" />
              </div>
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sıfırlama Linki Gönder
            </button>

            <p className="text-center">
              <Link href="/auth/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Giriş Sayfasına Dön
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
