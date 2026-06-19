"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useWorkspace } from "@/context/WorkspaceContext"
import { Webhook, Plus, Trash2, TestTube, Loader2, Check, Zap, ToggleLeft, ToggleRight } from "lucide-react"

const WEBHOOK_EVENTS = [
  { value: "message.received", label: "Mesaj Alındı" },
  { value: "message.sent", label: "Mesaj Gönderildi" },
  { value: "message.failed", label: "Mesaj Başarısız" },
  { value: "project.created", label: "Proje Oluşturuldu" },
  { value: "api_key.created", label: "API Key Oluşturuldu" },
]

interface WebhookDoc {
  _id: string
  name: string
  url: string
  events: string[]
  isActive: boolean
  lastDeliveryAt?: string
  lastDeliveryStatus?: string
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", url: "", events: [] as string[] })
  const { activeWorkspace } = useWorkspace()

  const fetchWebhooks = async () => {
    if (!activeWorkspace) return
    try {
      const res = await api.get<{ success: boolean; data: { webhooks: WebhookDoc[] } }>(
        `/workspaces/${activeWorkspace._id}/webhooks`
      )
      setWebhooks(res.data.webhooks || [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchWebhooks() }, [activeWorkspace])

  const toggleEvent = (event: string) => {
    setForm(f => ({
      ...f,
      events: f.events.includes(event) ? f.events.filter(e => e !== event) : [...f.events, event],
    }))
  }

  const saveWebhook = async () => {
    if (!activeWorkspace || !form.name || !form.url || form.events.length === 0) return
    setSaving(true)
    try {
      await api.post(`/workspaces/${activeWorkspace._id}/webhooks`, form)
      toast.success("Webhook eklendi!")
      setShowForm(false)
      setForm({ name: "", url: "", events: [] })
      fetchWebhooks()
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Hata") }
    finally { setSaving(false) }
  }

  const testWebhook = async (id: string) => {
    if (!activeWorkspace) return
    setTesting(id)
    try {
      const res = await api.post<{ success: boolean; data: { status: string } }>(
        `/workspaces/${activeWorkspace._id}/webhooks/${id}/test`
      )
      if (res.data.status === "success") toast.success("Webhook test başarılı!")
      else toast.error("Webhook test başarısız")
      fetchWebhooks()
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Test başarısız") }
    finally { setTesting(null) }
  }

  const deleteWebhook = async (id: string, name: string) => {
    if (!confirm(`"${name}" webhook'unu silmek istiyor musunuz?`)) return
    if (!activeWorkspace) return
    try {
      await api.delete(`/workspaces/${activeWorkspace._id}/webhooks/${id}`)
      toast.success("Webhook silindi")
      fetchWebhooks()
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Hata") }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Webhooks</h1>
          <p className="text-muted-foreground mt-1">Olaylar için HTTP bildirimler</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#7342E2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7342E2]/90 transition-colors">
          <Plus className="h-4 w-4" /> Webhook Ekle
        </button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowForm(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl z-50">
              <h2 className="text-xl font-semibold mb-4">Webhook Ekle</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Ad *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-premium" placeholder="Slack Bildirimi" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">URL *</label>
                  <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} className="input-premium" placeholder="https://hooks.slack.com/..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Olaylar *</label>
                  <div className="space-y-2">
                    {WEBHOOK_EVENTS.map(ev => (
                      <label key={ev.value} className="flex items-center gap-2.5 cursor-pointer group">
                        <div onClick={() => toggleEvent(ev.value)}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${form.events.includes(ev.value) ? "bg-[#7342E2] border-[#7342E2]" : "border-border group-hover:border-[#7342E2]/50"}`}>
                          {form.events.includes(ev.value) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-sm">{ev.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={saveWebhook} disabled={saving || !form.name || !form.url || form.events.length === 0}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#7342E2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7342E2]/90 disabled:opacity-50 transition-colors">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} Kaydet
                  </button>
                  <button onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary transition-colors">İptal</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="card-premium p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" /></div>
      ) : webhooks.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <Webhook className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium">Henüz webhook yok</p>
          <p className="text-sm text-muted-foreground mt-1">Olaylar gerçekleştiğinde HTTP bildirim alın</p>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh) => (
            <motion.div key={wh._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="card-premium flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{wh.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${wh.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                    {wh.isActive ? "Aktif" : "Pasif"}
                  </span>
                  {wh.lastDeliveryStatus && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${wh.lastDeliveryStatus === "success" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30" : "bg-red-100 text-red-700"}`}>
                      Son: {wh.lastDeliveryStatus}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{wh.url}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {wh.events.map(ev => (
                    <span key={ev} className="text-xs bg-secondary px-2 py-0.5 rounded-full">{ev}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => testWebhook(wh._id)} disabled={testing === wh._id} title="Test et"
                  className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-emerald-600">
                  {testing === wh._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                </button>
                <button onClick={() => deleteWebhook(wh._id, wh.name)} title="Sil"
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
