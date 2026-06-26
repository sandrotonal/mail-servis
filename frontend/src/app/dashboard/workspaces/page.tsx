"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import {
  IconPlus, IconFolder, IconSettings, IconTrash, IconLoader2, IconCheck
} from "@tabler/icons-react"
import { useWorkspace } from "@/context/WorkspaceContext"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface Workspace {
  _id: string
  name: string
  slug: string
  role: string
  monthlyUsage: number
  createdAt: string
}

export default function WorkspacesPage() {
  const router = useRouter()
  const { activeWorkspace, setActiveWorkspace, refreshWorkspaces } = useWorkspace()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get<{ success: boolean; data: { workspaces: Workspace[] } }>("/workspaces")
      setWorkspaces(res.data.workspaces || [])
    } catch { 
      toast.error("Çalışma alanları yüklenirken hata oluştu")
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { 
    fetchWorkspaces() 
  }, [])

  const createWorkspace = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      await api.post("/workspaces", { name: newName.trim() })
      toast.success("Çalışma alanı oluşturuldu")
      setShowCreate(false)
      setNewName("")
      await refreshWorkspaces()
      fetchWorkspaces()
    } catch (err: any) { 
      toast.error(err.message || "Hata oluştu") 
    } finally {
      setCreating(false)
    }
  }

  const deleteWorkspace = async (id: string, name: string) => {
    if (!confirm(`"${name}" çalışma alanını silmek istediğinize emin misiniz?`)) return
    try {
      await api.delete(`/workspaces/${id}`)
      toast.success("Çalışma alanı silindi")
      await refreshWorkspaces()
      fetchWorkspaces()
    } catch (err: any) { 
      toast.error(err.message || "Silme başarısız") 
    }
  }

  const handleSelectWorkspace = (ws: any) => {
    setActiveWorkspace(ws)
    toast.success(`"${ws.name}" aktif çalışma alanı yapıldı!`)
  }

  const handleConfigureWorkspace = (ws: any) => {
    setActiveWorkspace(ws)
    router.push("/dashboard/settings")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <IconLoader2 className="w-8 h-8 animate-spin text-[#7342E2]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Çalışma Alanları</h1>
          <p className="text-muted-foreground mt-1">Projelerinizi ve iş arkadaşlarınızı organize ettiğiniz alanlar</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#7342E2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7342E2]/90 transition-colors shadow-sm"
        >
          <IconPlus className="h-4 w-4" />
          Yeni Çalışma Alanı
        </button>
      </div>

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
                  <IconFolder className="w-5.5 h-5.5 text-[#7342E2]" />
                  Yeni Çalışma Alanı
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
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Çalışma Alanı Adı *</label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="örn. Pazarlama Departmanı"
                    className="input-premium"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && createWorkspace()}
                  />
                </div>
                <div className="flex gap-3.5 pt-3">
                  <button
                    onClick={createWorkspace}
                    disabled={creating || !newName.trim()}
                    className="flex-1 btn-primary text-white"
                  >
                    {creating ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <IconPlus className="w-4 h-4" />}
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

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspaces.map((ws) => {
          const isActive = activeWorkspace?._id === ws._id
          return (
            <motion.div
              key={ws._id}
              whileHover={{ y: -2 }}
              className={`card-premium relative group flex flex-col justify-between ${
                isActive ? "border-[#7342E2] shadow-[#7342E2]/5 shadow-lg bg-[#7342E2]/[0.02]" : ""
              }`}
            >
              {isActive && (
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#7342E2]/10 text-[#7342E2] px-2.5 py-1 rounded-full text-xs font-semibold border border-[#7342E2]/20">
                  <IconCheck className="w-3 h-3" />
                  Aktif
                </div>
              )}

              <div className="space-y-4 text-foreground">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#7342E2]/10 p-2.5">
                    <IconFolder className="h-5 w-5 text-[#7342E2]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{ws.name}</h3>
                    <p className="text-xs text-muted-foreground font-medium capitalize mt-0.5">{ws.role}</p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Aylık Gönderim Limiti: <span className="font-semibold text-foreground">{ws.monthlyUsage || 0}</span> adet kullanıldı
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                <button
                  onClick={() => handleSelectWorkspace(ws)}
                  disabled={isActive}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                    isActive
                      ? "bg-transparent border-transparent text-muted-foreground cursor-default"
                      : "bg-[#7342E2] hover:bg-[#7342E2]/90 border-transparent text-white"
                  }`}
                >
                  {isActive ? "Seçili" : "Çalışma Alanına Geç"}
                </button>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleConfigureWorkspace(ws)}
                    className="p-2 rounded-lg border border-border bg-background hover:bg-secondary transition-colors"
                    title="Ayarlar"
                  >
                    <IconSettings className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => deleteWorkspace(ws._id, ws.name)}
                    disabled={ws.role !== "owner"}
                    className="p-2 rounded-lg border border-border bg-background hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-colors disabled:opacity-40"
                    title="Sil"
                  >
                    <IconTrash className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
