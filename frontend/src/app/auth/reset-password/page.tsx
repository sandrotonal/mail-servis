"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Lock, Loader2 } from "lucide-react"
import { authService } from "@/lib/auth"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "" },
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true)
    try {
      await authService.resetPassword(data.token, data.password)
      toast.success("Şifre başarıyla sıfırlandı! Yeni şifrenizle giriş yapabilirsiniz.")
      router.push("/auth/login")
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
          <Lock className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-4 text-3xl font-bold">Şifre Sıfırla</h2>
          <p className="mt-2 text-muted-foreground">Yeni şifrenizi belirleyin</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <input type="hidden" {...register("token")} />

          <div>
            <label className="block text-sm font-medium mb-2">Yeni Şifre</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="password" {...register("password")} className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="En az 8 karakter" />
            </div>
            {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Şifreyi Sıfırla
          </button>
        </form>
      </div>
    </div>
  )
}
