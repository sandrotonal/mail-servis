"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"
import { api } from "@/lib/api"
import { formatNumber } from "@/lib/utils"
import {
  IconSend, IconUsers, IconAlertTriangle, IconCircleCheck, IconTrendingUp,
  IconArrowUpRight, IconActivity, IconPlus, IconKey, IconMailCheck, IconMail, IconArrowRight, IconLoader2
} from "@tabler/icons-react"
import { useWorkspace } from "@/context/WorkspaceContext"
import Link from "next/link"

interface Submission {
  _id: string
  formData: Record<string, string>
  metadata: {
    ip?: string
    userAgent?: string
    country?: string
  }
  isSpam: boolean
  createdAt: string
  project?: {
    name: string
  }
}

interface DashboardStats {
  totalSubmissions: number
  totalLeads: number
  dailyStats: { _id: string; count: number; spam: number }[]
  leadStatusCounts: { _id: string; count: number }[]
  recentSubmissions: Submission[]
}

const LEAD_COLORS: Record<string, string> = {
  new: "#7342E2",
  contacted: "#F59E0B",
  qualified: "#10B981",
  proposal: "#3B82F6",
  won: "#22C55E",
  lost: "#EF4444",
}

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: "easeOut" },
  }),
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFetching, setIsFetching] = useState(false)
  const { activeWorkspace } = useWorkspace()

  useEffect(() => {
    if (!activeWorkspace) return
    if (!stats) {
      setLoading(true)
    } else {
      setIsFetching(true)
    }
    api.get<{ success: boolean; data: DashboardStats }>(
      `/workspaces/stats?workspaceId=${activeWorkspace._id}`
    )
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => {
        setLoading(false)
        setIsFetching(false)
      })
  }, [activeWorkspace])

  const spamTotal = stats?.dailyStats?.reduce((a, d) => a + d.spam, 0) || 0
  const successTotal = (stats?.totalSubmissions || 0) - spamTotal

  const cards = [
    { label: "Toplam Mesaj", value: stats?.totalSubmissions || 0, icon: IconSend, color: "text-blue-400", bg: "bg-blue-500/10", border: "hover:border-blue-500/20" },
    { label: "Toplam Lead", value: stats?.totalLeads || 0, icon: IconUsers, color: "text-violet-400", bg: "bg-violet-500/10", border: "hover:border-violet-500/20" },
    { label: "Başarılı Mail", value: successTotal, icon: IconCircleCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/20" },
    { label: "Spam", value: spamTotal, icon: IconAlertTriangle, color: "text-rose-400", bg: "bg-rose-500/10", border: "hover:border-rose-500/20" },
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

  if (loading && !stats) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-glass h-32 animate-pulse bg-muted/40 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card-glass h-[300px] animate-pulse bg-muted/40 rounded-2xl" />
          <div className="card-glass h-[300px] animate-pulse bg-muted/40 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-8 transition-all duration-300 ${isFetching ? "opacity-60 pointer-events-none" : ""}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-6"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            {activeWorkspace ? `${activeWorkspace.name} çalışma alanına genel bakış` : "Hoş geldiniz!"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold bg-[#7342E2]/10 text-[#a78bfa] border border-[#7342E2]/20 px-3.5 py-2 rounded-full self-start sm:self-auto min-w-[130px] justify-center">
          {isFetching ? (
            <>
              <IconLoader2 className="w-3.5 h-3.5 animate-spin text-[#a78bfa]" />
              <span>Güncelleniyor...</span>
            </>
          ) : (
            <>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>Canlı Takip Aktif</span>
            </>
          )}
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -4, scale: 1.02 }}
            className={`group card-glass hover:bg-card/85 cursor-default ${card.border}`}
          >
            <div className="flex items-center justify-between mb-5">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.bg} shadow-inner`}>
                <card.icon className={`w-5.5 h-5.5 ${card.color}`} />
              </div>
              <IconArrowUpRight className="w-4.5 h-4.5 text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <p className="text-3xl font-bold tracking-tight text-white">{formatNumber(card.value)}</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-2 card-glass bg-card/40"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg text-white">Günlük Gönderimler</h3>
              <p className="text-xs text-muted-foreground">Son 14 gündeki mesaj ve spam dağılımı</p>
            </div>
            <IconTrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="mesajGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7342E2" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#7342E2" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="spamGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "14px",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
                  }}
                />
                <Area type="monotone" dataKey="Mesaj" stroke="#7342E2" fill="url(#mesajGrad)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="Spam" stroke="#EF4444" fill="url(#spamGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[230px] flex flex-col items-center justify-center text-muted-foreground">
              <IconActivity className="w-12 h-12 opacity-20 mb-3 animate-pulse" />
              <p className="text-sm font-semibold">Henüz veri yok</p>
            </div>
          )}
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="card-glass bg-card/40"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg text-white">Lead Durumları</h3>
              <p className="text-xs text-muted-foreground">Müşteri potansiyeli analizi</p>
            </div>
            <IconUsers className="w-5 h-5 text-muted-foreground" />
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="42%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="hsl(var(--card))" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "14px",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
                  }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[230px] flex flex-col items-center justify-center text-muted-foreground">
              <IconUsers className="w-12 h-12 opacity-20 mb-3" />
              <p className="text-sm font-semibold">Henüz lead yok</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Action Hub & Recent Submissions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <IconMail className="w-5.5 h-5.5 text-[#7342E2]" />
              Son Gelen Mesajlar
            </h3>
          </div>

          <div className="card-glass p-0 overflow-hidden bg-card/30">
            {(!stats?.recentSubmissions || stats.recentSubmissions.length === 0) ? (
              <div className="text-center py-16">
                <IconMail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-semibold">Gelen mesaj bulunamadı</p>
                <p className="text-xs text-muted-foreground mt-1">Formlarınızdan mesaj geldikçe burada listelenecektir.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/35 text-xs font-semibold text-muted-foreground uppercase">
                      <th className="px-5 py-3.5">Proje / Form</th>
                      <th className="px-5 py-3.5">Gönderen</th>
                      <th className="px-5 py-3.5">Mesaj Özeti</th>
                      <th className="px-5 py-3.5">Tarih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {stats.recentSubmissions.map((sub) => {
                      const email = sub.formData.email || sub.formData.Email || "Anonim"
                      const details = Object.entries(sub.formData)
                        .filter(([k]) => !["email", "Email", "_honeypot"].includes(k))
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")
                        .slice(0, 35) + "..."
                      return (
                        <tr key={sub._id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-white">
                            {sub.project?.name || "Bilinmeyen Proje"}
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground font-medium">{email}</td>
                          <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs max-w-[200px] truncate">
                            {details}
                          </td>
                          <td className="px-5 py-3.5 text-muted-foreground text-xs font-medium">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Hub */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <IconKey className="w-5.5 h-5.5 text-[#7342E2]" />
            Hızlı Kısayollar
          </h3>
          <div className="grid grid-cols-1 gap-3.5">
            {[
              { href: "/dashboard/projects", label: "Yeni Proje Ekle", icon: IconPlus, desc: "Form endpoint'i oluşturun" },
              { href: "/dashboard/api-keys", label: "API Key Kopyala", icon: IconKey, desc: "Yönlendirmeleri yetkilendirin" },
              { href: "/dashboard/smtp", label: "SMTP Test Et", icon: IconMailCheck, desc: "E-posta sunucunuzu sınayın" }
            ].map((act, idx) => (
              <Link key={idx} href={act.href} className="group card-glass p-4.5 bg-card/30 hover:bg-[#7342E2]/[0.03] hover:border-[#7342E2]/40 transition-all duration-300 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center text-muted-foreground group-hover:text-[#a78bfa] group-hover:bg-[#7342E2]/15 transition-all">
                    <act.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white group-hover:text-[#a78bfa] transition-colors">{act.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{act.desc}</p>
                  </div>
                </div>
                <IconArrowRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-[#a78bfa] transform group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Usage */}
      {activeWorkspace && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="card-glass bg-card/30"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-white text-base">Aylık Kullanım Limiti</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Çalışma alanı kota tüketim tablosu</p>
            </div>
            <span className="text-xs bg-[#7342E2]/15 text-[#a78bfa] border border-[#7342E2]/25 px-3 py-1 rounded-full font-semibold capitalize">
              {activeWorkspace.plan} Plan
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span className="font-medium">
              <strong className="text-white">{activeWorkspace.monthlyUsage}</strong> / {activeWorkspace.monthlyLimit === -1 ? "∞" : activeWorkspace.monthlyLimit} mail
            </span>
            <span className="font-semibold text-[#a78bfa]">
              {activeWorkspace.monthlyLimit > 0 ? Math.round((activeWorkspace.monthlyUsage / activeWorkspace.monthlyLimit) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-secondary/80 rounded-full h-2.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, activeWorkspace.monthlyLimit > 0 ? (activeWorkspace.monthlyUsage / activeWorkspace.monthlyLimit) * 100 : 0)}%` }}
              transition={{ duration: 1, delay: 0.6 }}
              className="h-2.5 rounded-full bg-gradient-to-r from-[#7342E2] to-[#9b6df0] shadow-[0_0_10px_rgba(115,66,226,0.3)]"
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}
