"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { api } from "@/lib/api"

interface Workspace {
  _id: string
  name: string
  slug: string
  plan: string
  monthlyUsage: number
  monthlyLimit: number
  owner: string
}

interface WorkspaceContextType {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  setActiveWorkspace: (ws: Workspace) => void
  loading: boolean
  refreshWorkspaces: () => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaces: [],
  activeWorkspace: null,
  setActiveWorkspace: () => {},
  loading: true,
  refreshWorkspaces: async () => {},
})

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshWorkspaces = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: { workspaces: Workspace[] } }>("/workspaces")
      const list = res.data.workspaces || []
      setWorkspaces(list)

      // Restore last active workspace from localStorage
      const savedId = localStorage.getItem("activeWorkspaceId")
      const saved = list.find((w) => w._id === savedId)
      setActiveWorkspaceState(saved || list[0] || null)
    } catch (_) {
      // User may not be logged in yet
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshWorkspaces()
  }, [refreshWorkspaces])

  const setActiveWorkspace = useCallback((ws: Workspace) => {
    setActiveWorkspaceState(ws)
    localStorage.setItem("activeWorkspaceId", ws._id)
  }, [])

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, setActiveWorkspace, loading, refreshWorkspaces }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  return useContext(WorkspaceContext)
}
