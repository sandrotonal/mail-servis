"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Users, Building2, Activity, MailWarning, Server } from "lucide-react"
import { formatNumber } from "@/lib/utils"

interface AdminStats {
  totalUsers: number
  totalWorkspaces: number
  totalProviders: number
  last24hLogs: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    api.get<{ success: boolean; data: AdminStats }>("/admin/stats").then((res) => setStats(res.data)).catch(() => {})
    api.get<{ success: boolean; data: { logs: any[] } }>("/admin/logs?limit=20").then((res) => setLogs(res.data.logs)).catch(() => {})
  }, [])

  const cards = [
    { label: "Toplam Kullanıcı", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Workspace", value: stats?.totalWorkspaces || 0, icon: Building2, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "SMTP Providers", value: stats?.totalProviders || 0, icon: Server, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "24s Log", value: stats?.last24hLogs || 0, icon: Activity, color: "text-orange-500", bg: "bg-orange-500/10" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground">Sistem yönetimi ve izleme</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`rounded-lg p-2.5 ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold">{formatNumber(card.value)}</p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Sistem Logları</h3>
        </div>
        <div className="divide-y divide-border max-h-96 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="p-3 text-sm">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                  log.level === "error" ? "bg-red-500/10 text-red-500" :
                  log.level === "warn" ? "bg-yellow-500/10 text-yellow-500" :
                  "bg-green-500/10 text-green-500"
                }`}>{log.level}</span>
                <span className="text-muted-foreground text-xs">{log.type}</span>
                <span className="text-xs text-muted-foreground ml-auto">{new Date(log.createdAt).toLocaleString("tr-TR")}</span>
              </div>
              <p className="mt-1">{log.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
