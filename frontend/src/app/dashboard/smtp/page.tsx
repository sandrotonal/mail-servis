"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Plus, MailCheck, Trash2, CheckCircle2, XCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface SmtpProvider {
  _id: string
  name: string
  provider: string
  host: string
  fromEmail: string
  isPrimary: boolean
  isVerified: boolean
  lastTested: string
  lastTestResult: string
}

export default function SmtpPage() {
  const [providers, setProviders] = useState<SmtpProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  const fetchProviders = async () => {
    try {
      const workspaceId = localStorage.getItem("activeWorkspace")
      if (!workspaceId) return
      const res = await api.get<{ success: boolean; data: { providers: SmtpProvider[] } }>(`/workspaces/${workspaceId}/smtp`)
      setProviders(res.data.providers)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchProviders() }, [])

  const testProvider = async (providerId: string) => {
    try {
      const workspaceId = localStorage.getItem("activeWorkspace")
      const res = await api.post(`/workspaces/${workspaceId}/smtp/${providerId}/test`)
      toast.success(res.success ? "SMTP bağlantısı başarılı" : "SMTP testi başarısız")
      fetchProviders()
    } catch (err: any) { toast.error(err.message) }
  }

  const deleteProvider = async (providerId: string) => {
    try {
      const workspaceId = localStorage.getItem("activeWorkspace")
      await api.delete(`/workspaces/${workspaceId}/smtp/${providerId}`)
      toast.success("SMTP sağlayıcı silindi")
      fetchProviders()
    } catch (err: any) { toast.error(err.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SMTP Providers</h1>
          <p className="text-muted-foreground">Email gönderim sağlayıcıları</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          <Plus className="h-4 w-4" /> Yeni SMTP
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((p) => (
          <div key={p._id} className="rounded-xl border border-border p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5"><MailCheck className="h-5 w-5 text-primary" /></div>
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.provider} • {p.host}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {p.isVerified ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
              </div>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              <p>From: {p.fromEmail}</p>
              {p.lastTested && <p>Son test: {formatDate(p.lastTested)}</p>}
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => testProvider(p._id)} className="flex-1 rounded-lg border border-border py-1.5 text-xs hover:bg-muted">Test Et</button>
              <button onClick={() => deleteProvider(p._id)} className="rounded-lg border border-border p-1.5 hover:bg-muted text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
