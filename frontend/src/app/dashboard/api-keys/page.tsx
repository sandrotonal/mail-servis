"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Key, Plus, Copy, RefreshCw, Trash2, Eye, EyeOff } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface ApiKey {
  _id: string
  name: string
  keyPrefix: string
  keyLastFour: string
  permissions: { sendForms: boolean }
  lastUsed: string
  createdAt: string
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newKey, setNewKey] = useState<string | null>(null)

  const fetchKeys = async () => {
    try {
      const workspaceId = localStorage.getItem("activeWorkspace")
      if (!workspaceId) return
      const res = await api.get<{ success: boolean; data: { apiKeys: ApiKey[] } }>(`/workspaces/${workspaceId}/api-keys`)
      setKeys(res.data.apiKeys)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchKeys() }, [])

  const createKey = async () => {
    try {
      const workspaceId = localStorage.getItem("activeWorkspace")
      const res = await api.post<{ success: boolean; data: { rawKey: string } }>(`/workspaces/${workspaceId}/api-keys`, { name: newName })
      setNewKey(res.data.rawKey)
      toast.success("API key oluşturuldu")
      setShowCreate(false)
      setNewName("")
      fetchKeys()
    } catch (err: any) { toast.error(err.message) }
  }

  const deleteKey = async (keyId: string) => {
    try {
      const workspaceId = localStorage.getItem("activeWorkspace")
      await api.delete(`/workspaces/${workspaceId}/api-keys/${keyId}`)
      toast.success("API key silindi")
      fetchKeys()
    } catch (err: any) { toast.error(err.message) }
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success("Kopyalandı")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">Form entegrasyonları için API anahtarları</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          <Plus className="h-4 w-4" /> Yeni API Key
        </button>
      </div>

      {newKey && (
        <div className="rounded-xl border border-border p-4 bg-yellow-500/5">
          <p className="text-sm font-medium mb-2">API Key oluşturuldu! Bu keyi bir daha göremeyeceksiniz.</p>
          <div className="flex gap-2">
            <code className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm font-mono">{newKey}</code>
            <button onClick={() => copyKey(newKey)} className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"><Copy className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="rounded-xl border border-border p-4 flex gap-3">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="API Key adı" className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <button onClick={createKey} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Oluştur</button>
          <button onClick={() => setShowCreate(false)} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">İptal</button>
        </div>
      )}

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">İsim</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Key</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Son Kullanım</th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">Oluşturulma</th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key._id} className="border-b border-border hover:bg-muted/30">
                <td className="p-4 text-sm font-medium">{key.name}</td>
                <td className="p-4 text-sm font-mono text-muted-foreground">{key.keyPrefix}...{key.keyLastFour}</td>
                <td className="p-4 text-sm text-muted-foreground">{key.lastUsed ? formatDate(key.lastUsed) : "Kullanılmadı"}</td>
                <td className="p-4 text-sm text-muted-foreground">{formatDate(key.createdAt)}</td>
                <td className="p-4 text-right">
                  <button onClick={() => deleteKey(key._id)} className="p-1.5 rounded-lg hover:bg-muted text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
