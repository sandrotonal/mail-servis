"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useWorkspace } from "@/context/WorkspaceContext"
import {
  MailCheck, Plus, Star, Trash2, TestTube, Loader2,
  Check, X, Settings2
} from "lucide-react"

interface SmtpProvider {
  _id: string
  name: string
  host: string
  port: number
  username: string
  fromName?: string
  fromEmail?: string
  isPrimary: boolean
  isVerified: boolean
  isActive: boolean
  lastTested?: string
  lastTestResult?: string
}

const defaultForm = {
  name: "", host: "", port: 587, secure: false,
  username: "", password: "", fromName: "", fromEmail: ""
}

export default function SmtpPage() {
  const [providers, setProviders] = useState<SmtpProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const { activeWorkspace } = useWorkspace()

  const fetchProviders = async () => {
    if (!activeWorkspace) return
    try {
      const res = await api.get<{ success: boolean; data: { providers: SmtpProvider[] } }>(
        `/workspaces/${activeWorkspace._id}/smtp`
      )
      setProviders(res.data.providers || [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchProviders() }, [activeWorkspace])

  const saveProvider = async () => {
    if (!activeWorkspace) return
    setSaving(true)
    try {
      await api.post(`/workspaces/${activeWorkspace._id}/smtp`, form)
      toast.success("SMTP provider eklendi!")
      setShowForm(false)
      setForm(defaultForm)
      fetchProviders()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Hata oluştu")
    } finally { setSaving(false) }
  }

  const testProvider = async (id: string) => {
    if (!activeWorkspace) return
    setTesting(id)
    try {
      const res = await api.post<{ success: boolean; message: string }>(
        `/workspaces/${activeWorkspace._id}/smtp/${id}/test`
      )
      if (res.success) {
        toast.success("SMTP bağlantısı başarılı!")
      } else {
        toast.error(res.message || "Bağlantı başarısız")
      }
      fetchProviders()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Test başarısız")
    } finally { setTesting(null) }
  }

  const setDefault = async (id: string) => {
    if (!activeWorkspace) return
    try {
      await api.patch(`/workspaces/${activeWorkspace._id}/smtp/${id}/default`, {})
      toast.success("Varsayılan SMTP ayarlandı")
      fetchProviders()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Hata oluştu")
    }
  }

  const deleteProvider = async (id: string, name: string) => {
    if (!confirm(`"${name}" SMTP provider'ını silmek istiyor musunuz?`)) return
    if (!activeWorkspace) return
    try {
      await api.delete(`/workspaces/${activeWorkspace._id}/smtp/${id}`)
      toast.success("Provider silindi")
      fetchProviders()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Hata oluştu")
    }
  }

  const PRESETS = [
    { label: "Gmail", host: "smtp.gmail.com", port: 587, secure: false },
    { label: "Brevo", host: "smtp-relay.brevo.com", port: 587, secure: false },
    { label: "Amazon SES", host: "email-smtp.us-east-1.amazonaws.com", port: 587, secure: false },
    { label: "Mailgun", host: "smtp.mailgun.org", port: 587, secure: false },
    { label: "Resend", host: "smtp.resend.com", port: 587, secure: false },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">SMTP Providers</h1>
          <p className="text-muted-foreground mt-1">Mail gönderimi için SMTP sağlayıcılarınız</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#7342E2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7342E2]/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> SMTP Ekle
        </button>
      </motion.div>

      {/* Create Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowForm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl z-50 overflow-y-auto max-h-[90vh]">
              <h2 className="text-xl font-semibold mb-4">SMTP Provider Ekle</h2>
              {/* Quick presets */}
              <div className="flex flex-wrap gap-2 mb-4">
                {PRESETS.map((p) => (
                  <button key={p.label} onClick={() => setForm(f => ({ ...f, host: p.host, port: p.port, secure: p.secure, name: p.label }))}
                    className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-secondary hover:border-[#7342E2]/50 transition-colors font-medium">
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">Ad *</label>
                  <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="input-premium" placeholder="Gmail Ana" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-medium mb-1.5 block">Host *</label>
                  <input value={form.host} onChange={(e) => setForm(f => ({ ...f, host: e.target.value }))} className="input-premium" placeholder="smtp.gmail.com" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Port</label>
                  <input type="number" value={form.port} onChange={(e) => setForm(f => ({ ...f, port: Number(e.target.value) }))} className="input-premium" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">Kullanıcı Adı *</label>
                  <input value={form.username} onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))} className="input-premium" placeholder="user@gmail.com" />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">Şifre / App Password *</label>
                  <input type="password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} className="input-premium" placeholder="••••••••••" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Gönderici Adı</label>
                  <input value={form.fromName} onChange={(e) => setForm(f => ({ ...f, fromName: e.target.value }))} className="input-premium" placeholder="Şirket Adı" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Gönderici Email</label>
                  <input value={form.fromEmail} onChange={(e) => setForm(f => ({ ...f, fromEmail: e.target.value }))} className="input-premium" placeholder="noreply@..." />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="secure" checked={form.secure} onChange={(e) => setForm(f => ({ ...f, secure: e.target.checked }))} className="rounded" />
                  <label htmlFor="secure" className="text-sm">SSL/TLS (port 465)</label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={saveProvider} disabled={saving || !form.name || !form.host || !form.username || !form.password}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#7342E2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7342E2]/90 disabled:opacity-50 transition-colors">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Kaydet
                </button>
                <button onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary transition-colors">İptal</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Provider List */}
      {loading ? (
        <div className="card-premium p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" /></div>
      ) : providers.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <MailCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium">Henüz SMTP provider yok</p>
          <p className="text-sm text-muted-foreground mt-1">Mail gönderebilmek için bir SMTP sağlayıcı ekleyin</p>
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map((p) => (
            <motion.div key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="card-premium flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${p.isPrimary ? "bg-[#7342E2] text-white" : "bg-secondary"}`}>
                  <MailCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{p.name}</span>
                    {p.isPrimary && <span className="text-xs bg-[#7342E2]/10 text-[#7342E2] px-2 py-0.5 rounded-full font-medium">Varsayılan</span>}
                    {p.isVerified && <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Check className="w-3 h-3" />Doğrulandı</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{p.username} · {p.host}:{p.port}</p>
                  {p.lastTestResult && <p className="text-xs text-muted-foreground mt-0.5">Son test: {p.lastTestResult}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!p.isPrimary && (
                  <button onClick={() => setDefault(p._id)} title="Varsayılan yap"
                    className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-[#7342E2]">
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => testProvider(p._id)} disabled={testing === p._id}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-emerald-600">
                  {testing === p._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                </button>
                <button onClick={() => deleteProvider(p._id, p.name)}
                  className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
