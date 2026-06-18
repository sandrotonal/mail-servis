"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Webhook, Plus, Trash2, Activity } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface WebhookType {
  _id: string
  name: string
  url: string
  events: string[]
  isActive: boolean
  lastTriggered: string
  lastStatus: string
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookType[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWebhooks = async () => {
    try {
      const workspaceId = localStorage.getItem("activeWorkspace")
      if (!workspaceId) return
      const res = await api.get<{ success: boolean; data: { webhooks: WebhookType[] } }>(`/workspaces/${workspaceId}/webhooks`)
      setWebhooks(res.data.webhooks)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchWebhooks() }, [])

  const deleteWebhook = async (webhookId: string) => {
    try {
      const workspaceId = localStorage.getItem("activeWorkspace")
      await api.delete(`/workspaces/${workspaceId}/webhooks/${webhookId}`)
      toast.success("Webhook silindi")
      fetchWebhooks()
    } catch (err: any) { toast.error(err.message) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Webhooks</h1>
        <p className="text-muted-foreground">Event tabanlı webhook entegrasyonları</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {webhooks.map((w) => (
          <div key={w._id} className="rounded-xl border border-border p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2"><Webhook className="h-5 w-5 text-primary" /></div>
                <div>
                  <h3 className="font-semibold">{w.name}</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{w.url}</p>
                </div>
              </div>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${w.isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                {w.isActive ? "Aktif" : "Pasif"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {w.events.map((e) => (
                <span key={e} className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">{e}</span>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{w.lastTriggered ? formatDate(w.lastTriggered) : "Henüz tetiklenmedi"}</span>
              <button onClick={() => deleteWebhook(w._id)} className="p-1 rounded-lg hover:bg-muted text-destructive"><Trash2 className="h-3 w-3" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
