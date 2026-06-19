"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"
import { api } from "@/lib/api"
import { formatNumber } from "@/lib/utils"
import { Send, Users, AlertTriangle, CheckCircle, TrendingUp, ArrowUpRight, Activity } from "lucide-react"
import { useWorkspace } from "@/context/WorkspaceContext"

interface DashboardStats {
  totalSubmissions: number
  totalLeads: number
  dailyStats: { _id: string; count: number; spam: number }[]
  leadStatusCounts: { _id: string; count: number }[]
}

const LEAD_COLORS: Record<string, string> = {
  new: "#7342E2",
  contacted: "#3B82F6",
  qualified: "#10B981",
  proposal: "#F59E0B",
  won: "#22C55E",
  lost: "#EF4444",
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { activeWorkspace } = useWorkspace()

  useEffect(() => {
    const endpoint = activeWorkspace
      ? `/workspaces/stats?workspaceId=${activeWorkspace._id}`
      : "/workspaces/stats"
    api.get<{ success: boolean; data: DashboardStats }>(endpoint)
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeWorkspace])

  const spamTotal = stats?.dailyStats?.reduce((a, d) => a + d.spam, 0) || 0
  const successTotal = (stats?.totalSubmissions || 0) - spamTotal

  const cards = [
    { label: "Toplam Mesaj", value: stats?.totalSubmissions || 0, icon: Send, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Toplam Lead", value: stats?.totalLeads || 0, icon: Users, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Başarılı Mail", value: successTotal, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Spam", value: spamTotal, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10" },
  ]

  const chartData = (stats?.dailyStats || []).slice(-14).map((d) => ({
    date: d._id?.slice(5) || d._id, // MM-DD format
    Mesaj: d.count,
    Spam: d.spam,
  }))

  const pieData = (stats?.leadStatusCounts || []).map((s) => ({
    name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
    value: s.count,
    color: LEAD_COLORS[s._id] || "#94A3B8",
  }))

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-premium h-28 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {activeWorkspace ? `${activeWorkspace.name} workspace'i` : "Hoş geldiniz!"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Canlı
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -4, scale: 1.02 }}
            className="group card-premium hover:border-[#7342E2]/30 cursor-default"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-semibold tracking-tight">{formatNumber(card.value)}</p>
            <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 card-premium"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Günlük Gönderimler</h3>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="mesajGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7342E2" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7342E2" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="spamGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="Mesaj" stroke="#7342E2" fill="url(#mesajGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="Spam" stroke="#EF4444" fill="url(#spamGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground">
              <Activity className="w-12 h-12 opacity-30 mb-3" />
              <p className="text-sm">Henüz veri yok</p>
            </div>
          )}
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card-premium"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">Lead Durumları</h3>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground">
              <Users className="w-12 h-12 opacity-30 mb-3" />
              <p className="text-sm">Henüz lead yok</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Plan Usage */}
      {activeWorkspace && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="card-premium"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Aylık Kullanım</h3>
            <span className="text-xs bg-[#7342E2]/10 text-[#7342E2] px-2 py-1 rounded-full font-medium capitalize">
              {activeWorkspace.plan} Plan
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>{activeWorkspace.monthlyUsage} / {activeWorkspace.monthlyLimit === -1 ? "∞" : activeWorkspace.monthlyLimit} mail</span>
            <span>{activeWorkspace.monthlyLimit > 0 ? Math.round((activeWorkspace.monthlyUsage / activeWorkspace.monthlyLimit) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, activeWorkspace.monthlyLimit > 0 ? (activeWorkspace.monthlyUsage / activeWorkspace.monthlyLimit) * 100 : 0)}%` }}
              transition={{ duration: 1, delay: 0.8 }}
              className="h-2 rounded-full bg-gradient-to-r from-[#7342E2] to-[#9B6DF0]"
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}
