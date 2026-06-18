"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Plus, FolderKanban, Settings, Trash2, Users } from "lucide-react"
import Link from "next/link"

interface Workspace {
  _id: string
  name: string
  slug: string
  role: string
  monthlyUsage: number
  createdAt: string
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get<{ success: boolean; data: { workspaces: Workspace[] } }>("/workspaces")
      setWorkspaces(res.data.workspaces)
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { fetchWorkspaces() }, [])

  const createWorkspace = async () => {
    try {
      await api.post("/workspaces", { name: newName })
      toast.success("Workspace oluşturuldu")
      setShowCreate(false)
      setNewName("")
      fetchWorkspaces()
    } catch (err: any) { toast.error(err.message) }
  }

  const deleteWorkspace = async (id: string) => {
    try {
      await api.delete(`/workspaces/${id}`)
      toast.success("Workspace silindi")
      fetchWorkspaces()
    } catch (err: any) { toast.error(err.message) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workspaces</h1>
          <p className="text-muted-foreground">Tüm çalışma alanlarınız</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Yeni Workspace
        </button>
      </div>

      {showCreate && (
        <div className="rounded-xl border border-border p-4">
          <div className="flex gap-3">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Workspace adı" className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            <button onClick={createWorkspace} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Oluştur</button>
            <button onClick={() => setShowCreate(false)} className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted">İptal</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspaces.map((ws) => (
          <div key={ws._id} className="rounded-xl border border-border p-5 hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <FolderKanban className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{ws.name}</h3>
                  <p className="text-xs text-muted-foreground">{ws.role}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>{ws.monthlyUsage} kullanım</span>
              <div className="flex gap-2">
                <Link href={`/dashboard/workspaces/${ws._id}`} className="p-1.5 rounded-lg hover:bg-muted"><Settings className="h-4 w-4" /></Link>
                <button onClick={() => deleteWorkspace(ws._id)} className="p-1.5 rounded-lg hover:bg-muted text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
