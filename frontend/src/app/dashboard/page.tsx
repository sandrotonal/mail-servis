"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { formatNumber } from "@/lib/utils"
import { Mail, Send, Users, AlertTriangle, BarChart3, TrendingUp, Activity } from "lucide-react"

interface DashboardStats {
  totalSubmissions: number
  totalLeads: number
  dailyStats: { _id: string; count: number; spam: number }[]
  leadStatusCounts: { _id: string; count: number }[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get<{ success: boolean; data: DashboardStats }>("/workspaces/stats")
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: "Toplam Mesaj", value: stats?.totalSubmissions || 0, icon: Send, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Toplam Lead", value: stats?.totalLeads || 0, icon: Users, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Bu Hafta", value: "---", icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Spam", value: stats?.dailyStats?.reduce((a, d) => a + d.spam, 0) || 0, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Hoş geldiniz! İşte özet istatistikleriniz.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart3 className="h-4 w-4" />
          Canlı
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <div className={cn("rounded-lg p-2.5", card.bg)}>
                <card.icon className={cn("h-5 w-5", card.color)} />
              </div>
            </div>
            <p className="text-2xl font-bold mt-3">{formatNumber(card.value)}</p>
            <p className="text-sm text-muted-foreground">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">Günlük Gönderimler</h3>
          {stats?.dailyStats && stats.dailyStats.length > 0 ? (
            <div className="space-y-2">
              {stats.dailyStats.slice(-7).reverse().map((d) => (
                <div key={d._id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{d._id}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{d.count} mesaj</span>
                    {d.spam > 0 && <span className="text-destructive">{d.spam} spam</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Henüz veri yok</p>
          )}
        </div>

        <div className="rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4">Lead Durumları</h3>
          {stats?.leadStatusCounts && stats.leadStatusCounts.length > 0 ? (
            <div className="space-y-2">
              {stats.leadStatusCounts.map((s) => (
                <div key={s._id} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-muted-foreground">{s._id}</span>
                  <span className="font-medium">{s.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Henüz lead yok</p>
          )}
        </div>
      </div>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}
