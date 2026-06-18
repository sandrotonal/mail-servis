"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Plus, Mail, Copy, ExternalLink, Eye } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Project {
  _id: string
  name: string
  projectId: string
  totalSubmissions: number
  isActive: boolean
  createdAt: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")

  const fetchProjects = async () => {
    try {
      const workspaceId = localStorage.getItem("activeWorkspace")
      if (!workspaceId) return
      const res = await api.get<{ success: boolean; data: { projects: Project[] } }>(`/workspaces/${workspaceId}/projects`)
      setProjects(res.data.projects)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchProjects() }, [])

  const createProject = async () => {
    try {
      const workspaceId = localStorage.getItem("activeWorkspace")
      await api.post(`/workspaces/${workspaceId}/projects`, { name: newName })
      toast.success("Proje oluşturuldu")
      setShowCreate(false)
      setNewName("")
      fetchProjects()
    } catch (err: any) { toast.error(err.message) }
  }

  const copyEndpoint = (projectId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/api/v1/forms/${projectId}/send`)
    toast.success("Endpoint kopyalandı")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Form projeleriniz</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Yeni Proje
        </button>
      </div>

      {showCreate && (
        <div className="rounded-xl border border-border p-4 flex gap-3">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Proje adı" className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <button onClick={createProject} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Oluştur</button>
          <button onClick={() => setShowCreate(false)} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">İptal</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div key={project._id} className="rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-lg bg-primary/10 p-2"><Mail className="h-5 w-5 text-primary" /></div>
              <div>
                <h3 className="font-semibold">{project.name}</h3>
                <p className="text-xs text-muted-foreground">ID: {project.projectId?.slice(0, 12)}...</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{project.totalSubmissions} gönderim</span>
              <span className={project.isActive ? "text-green-500" : "text-red-500"}>{project.isActive ? "Aktif" : "Pasif"}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => copyEndpoint(project.projectId)} className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-xs hover:bg-muted"><Copy className="h-3 w-3" /> Kopyala</button>
              <button className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-xs hover:bg-muted"><Eye className="h-3 w-3" /> Detay</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
