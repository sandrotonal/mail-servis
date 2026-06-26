"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useWorkspace } from "@/context/WorkspaceContext"
import {
  IconKey, IconPlus, IconCopy, IconTrash, IconLoader2, IconShieldCheck
} from "@tabler/icons-react"

interface ApiKey {
  _id: string
  name: string
  keyPreview: string  // last 4 chars
  createdAt: string
  lastUsedAt?: string
  isActive: boolean
}

interface NewKeyResponse {
  success: boolean
  data: { apiKey: ApiKey & { rawKey: string } }
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [revealedKey, setRevealedKey] = useState<{ id: string; raw: string } | null>(null)
  const [showRaw, setShowRaw] = useState(false)
  const { activeWorkspace } = useWorkspace()

  const fetchKeys = async () => {
    if (!activeWorkspace) return
    try {
      const res = await api.get<{ success: boolean; data: { apiKeys: ApiKey[] } }>(
        `/workspaces/${activeWorkspace._id}/api-keys`
      )
      setKeys(res.data.apiKeys || [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchKeys() }, [activeWorkspace])

  const createKey = async () => {
    if (!newKeyName.trim() || !activeWorkspace) return
    setCreating(true)
    try {
      const res = await api.post<NewKeyResponse>(
        `/workspaces/${activeWorkspace._id}/api-keys`,
        { name: newKeyName.trim() }
      )
      const { rawKey, ...keyDoc } = res.data.apiKey
      setKeys((prev) => [keyDoc, ...prev])
      setRevealedKey({ id: keyDoc._id, raw: rawKey })
      setShowRaw(true)
      setShowCreate(false)
      setNewKeyName("")
      toast.success("API key oluşturuldu! Lütfen hemen kopyalayın.")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Hata oluştu")
    } finally { setCreating(false) }
  }

  const copyKey = (raw: string) => {
    navigator.clipboard.writeText(raw)
    toast.success("API key kopyalandı!")
  }

  const deleteKey = async (key: ApiKey) => {
    if (!confirm(`"${key.name}" API key'ini silmek istediğinize emin misiniz?`)) return
    if (!activeWorkspace) return
    try {
      await api.delete(`/workspaces/${activeWorkspace._id}/api-keys/${key._id}`)
      setKeys((prev) => prev.filter((k) => k._id !== key._id))
      toast.success("API key silindi")
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Hata oluştu")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground mt-1">Form gönderimi için API anahtarlarınız</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#7342E2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7342E2]/90 transition-colors"
        >
          <IconPlus className="h-4 w-4" />
          Yeni API Key
        </button>
      </motion.div>

      {/* Security Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-start gap-3 bg-[#7342E2]/5 border border-[#7342E2]/20 rounded-xl p-4"
      >
        <IconShieldCheck className="w-5 h-5 text-[#7342E2] shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          API key&apos;ler veritabanında hashlenmiş olarak saklanır. Ham key yalnızca oluşturulduğunda bir kez gösterilir.{" "}
          <strong>Güvenli bir yerde saklayın!</strong>
        </p>
      </motion.div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <IconKey className="w-5.5 h-5.5 text-[#7342E2]" />
                  Yeni API Key Oluştur
                </h2>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors text-lg font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Key Adı *</label>
                  <input
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="örn. Web Sitesi, Mobil Uygulama"
                    className="input-premium"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && createKey()}
                  />
                </div>
                <div className="flex gap-3.5 pt-3">
                  <button
                    onClick={createKey}
                    disabled={creating || !newKeyName.trim()}
                    className="flex-1 btn-primary"
                  >
                    {creating ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <IconKey className="w-4 h-4" />}
                    Oluştur
                  </button>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="flex-1 btn-secondary"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Revealed Key Banner */}
      <AnimatePresence>
        {revealedKey && showRaw && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                ✅ API Key oluşturuldu — Sadece bu sefer görüntülenir!
              </p>
              <button onClick={() => setShowRaw(false)} className="text-emerald-600 hover:text-emerald-800 text-lg leading-none">×</button>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-emerald-100 dark:bg-emerald-900/40 px-3 py-2 rounded-lg font-mono break-all text-foreground">
                {revealedKey.raw}
              </code>
              <button
                onClick={() => copyKey(revealedKey.raw)}
                className="shrink-0 p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                <IconCopy className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keys List */}
      <div className="card-premium overflow-hidden p-0">
        {loading ? (
          <div className="p-8 text-center">
            <IconLoader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Yükleniyor...</p>
          </div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center">
            <IconKey className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-medium">Henüz API key yok</p>
            <p className="text-sm text-muted-foreground mt-1">Form gönderimi için bir API key oluşturun</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ad</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Key</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Son Kullanım</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Durum</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <motion.tr
                    key={key._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{key.name}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-secondary px-2 py-1 rounded font-mono text-foreground">
                        ••••••••{key.keyPreview || "????"}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString("tr-TR") : "Kullanılmadı"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${key.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700"}`}>
                        {key.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => deleteKey(key)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                          title="Sil"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
