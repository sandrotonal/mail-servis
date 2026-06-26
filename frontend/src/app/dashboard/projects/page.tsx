"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useWorkspace } from "@/context/WorkspaceContext"
import {
  IconPlus, IconMail, IconCopy, IconExternalLink, IconSettings, IconLoader2,
  IconTrash, IconToggleLeft, IconToggleRight, IconSend, IconX
} from "@tabler/icons-react"

interface Project {
  _id: string
  name: string
  projectId: string
  totalSubmissions: number
  isActive: boolean
  createdAt: string
  description?: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const { activeWorkspace } = useWorkspace()

  const fetchProjects = async () => {
    if (!activeWorkspace) return
    try {
      const res = await api.get<{ success: boolean; data: { projects: Project[] } }>(
        `/workspaces/${activeWorkspace._id}/projects`
      )
      setProjects(res.data.projects || [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  useEffect(() => { if (activeWorkspace) fetchProjects() }, [activeWorkspace])

  const createProject = async () => {
    if (!newName.trim() || !activeWorkspace) return
    setCreating(true)
    try {
      await api.post(`/workspaces/${activeWorkspace._id}/projects`, {
        name: newName.trim(),
        description: newDesc.trim() || undefined,
      })
      toast.success("Proje oluşturuldu!")
      setShowCreate(false)
      setNewName("")
      setNewDesc("")
      fetchProjects()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Hata oluştu")
    } finally { setCreating(false) }
  }

  const copyEndpoint = (projectId: string) => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || window.location.origin
    navigator.clipboard.writeText(`${apiBase}/api/v1/forms/${projectId}/send`)
    toast.success("Endpoint kopyalandı!")
  }

  const toggleProject = async (project: Project) => {
    if (!activeWorkspace) return
    // Optimistic update
    setProjects(prev => prev.map(p => p._id === project._id ? { ...p, isActive: !p.isActive } : p))
    try {
      await api.put(`/workspaces/${activeWorkspace._id}/projects/${project._id}`, {
        isActive: !project.isActive,
      })
      toast.success(project.isActive ? "Proje devre dışı bırakıldı" : "Proje aktif edildi")
    } catch (err: unknown) {
      // Revert if error
      setProjects(prev => prev.map(p => p._id === project._id ? { ...p, isActive: project.isActive } : p))
      toast.error(err instanceof Error ? err.message : "Hata oluştu")
    }
  }

  const deleteProject = async (project: Project) => {
    if (!confirm(`"${project.name}" projesini silmek istediğinize emin misiniz?`)) return
    if (!activeWorkspace) return
    // Optimistic delete
    setProjects(prev => prev.filter(p => p._id !== project._id))
    try {
      await api.delete(`/workspaces/${activeWorkspace._id}/projects/${project._id}`)
      toast.success("Proje silindi")
    } catch (err: unknown) {
      // Revert if error
      fetchProjects()
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
          <h1 className="text-3xl font-semibold tracking-tight">Projeler</h1>
          <p className="text-muted-foreground mt-1">Form projelerinizi yönetin</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#7342E2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7342E2]/90 transition-colors shadow-sm"
        >
          <IconPlus className="h-4 w-4" />
          Yeni Proje
        </button>
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
                  <IconMail className="w-5.5 h-5.5 text-[#7342E2]" />
                  Yeni Proje Oluştur
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
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Proje Adı *</label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="örn. İletişim Formu"
                    className="input-premium"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && createProject()}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Açıklama</label>
                  <textarea
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Projeniz hakkında kısa bir açıklama girin..."
                    className="input-premium h-24 resize-none"
                  />
                </div>
                <div className="flex gap-3.5 pt-3">
                  <button
                    onClick={createProject}
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

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card-premium h-44 animate-pulse bg-muted" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && projects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#7342E2]/10 flex items-center justify-center mb-4">
            <IconMail className="w-8 h-8 text-[#7342E2]" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Henüz proje yok</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm">
            İlk form projenizi oluşturun ve embed kodunu web sitenize ekleyin.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#7342E2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7342E2]/90 transition-colors"
          >
            <IconPlus className="h-4 w-4" />
            İlk Projeyi Oluştur
          </button>
        </motion.div>
      )}

      {/* Project Cards */}
      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4 }}
              className="card-premium group relative text-foreground"
            >
              {/* Status dot */}
              <div className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full ${project.isActive ? "bg-emerald-500" : "bg-muted-foreground"}`} />

              <div className="flex items-start gap-3 mb-4 pr-6">
                <div className="w-10 h-10 rounded-xl bg-[#7342E2]/10 flex items-center justify-center shrink-0">
                  <IconMail className="w-5 h-5 text-[#7342E2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{project.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                    {project.projectId?.slice(0, 20)}...
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
                <IconSend className="w-4 h-4" />
                <span>{project.totalSubmissions} gönderim</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => copyEndpoint(project.projectId)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-medium hover:bg-secondary transition-colors"
                >
                  <IconCopy className="h-3.5 w-3.5" />
                  Endpoint
                </button>
                <Link
                  href={`/dashboard/projects/${project._id}/embed`}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-medium hover:bg-secondary transition-colors"
                >
                  <IconExternalLink className="h-3.5 w-3.5" />
                  Embed
                </Link>
                <Link
                  href={`/dashboard/projects/${project._id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#7342E2]/10 text-[#7342E2] py-2 text-xs font-medium hover:bg-[#7342E2]/20 transition-colors"
                >
                  <IconSettings className="h-3.5 w-3.5" />
                  Ayarlar
                </Link>
              </div>

              {/* Quick actions on hover */}
              <div className="absolute bottom-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleProject(project)}
                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                  title={project.isActive ? "Devre dışı bırak" : "Aktif et"}
                >
                  {project.isActive
                    ? <IconToggleRight className="w-4 h-4 text-emerald-500" />
                    : <IconToggleLeft className="w-4 h-4 text-muted-foreground" />
                  }
                </button>
                <button
                  onClick={() => deleteProject(project)}
                  className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                  title="Sil"
                >
                  <IconTrash className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
