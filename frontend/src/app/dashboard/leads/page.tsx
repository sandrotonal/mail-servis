"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useWorkspace } from "@/context/WorkspaceContext"
import { Users, Search, ChevronDown, Mail, Phone, MessageSquare, Loader2 } from "lucide-react"

interface Lead {
  _id: string
  email: string
  name?: string
  phone?: string
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost"
  source: string
  createdAt: string
  notes?: { content: string; addedBy: string; createdAt: string }[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "Yeni", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  contacted: { label: "İletişim Kuruldu", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  qualified: { label: "Nitelikli", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
  proposal: { label: "Teklif Verildi", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
  won: { label: "Kazanıldı", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  lost: { label: "Kaybedildi", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
}

const STATUSES = Object.keys(STATUS_CONFIG)

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [note, setNote] = useState("")
  const [addingNote, setAddingNote] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const { activeWorkspace } = useWorkspace()

  const fetchLeads = async () => {
    if (!activeWorkspace) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (filterStatus) params.set("status", filterStatus)
      const res = await api.get<{ success: boolean; data: { data: Lead[] } }>(
        `/workspaces/${activeWorkspace._id}/leads?${params}`
      )
      setLeads(res.data.data || [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchLeads() }, [activeWorkspace, search, filterStatus])

  const updateStatus = async (lead: Lead, status: string) => {
    if (!activeWorkspace) return
    // Optimistic update
    setLeads(prev => prev.map(l => l._id === lead._id ? { ...l, status: status as Lead["status"] } : l))
    if (selectedLead?._id === lead._id) {
      setSelectedLead(prev => prev ? { ...prev, status: status as Lead["status"] } : null)
    }
    try {
      await api.put(`/workspaces/${activeWorkspace._id}/leads/${lead._id}/status`, { status })
      toast.success("Durum güncellendi")
    } catch (err: unknown) {
      // Revert if error
      fetchLeads()
      toast.error(err instanceof Error ? err.message : "Hata oluştu")
    }
  }

  const addNote = async () => {
    if (!note.trim() || !selectedLead || !activeWorkspace) return
    setAddingNote(true)
    try {
      const res = await api.post<{ success: boolean; data: { lead: Lead } }>(
        `/workspaces/${activeWorkspace._id}/leads/${selectedLead._id}/notes`,
        { content: note.trim() }
      )
      setSelectedLead(res.data.lead)
      setNote("")
      toast.success("Not eklendi")
      fetchLeads()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Hata oluştu")
    } finally { setAddingNote(false) }
  }

  const statusCfg = (s: string) => STATUS_CONFIG[s] || STATUS_CONFIG.new

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Lead&apos;ler</h1>
          <p className="text-muted-foreground mt-1">Formlardan gelen potansiyel müşteriler</p>
        </div>
        <span className="text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
          {leads.length} lead
        </span>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İsim veya email ara..."
            className="input-premium pl-10"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-premium sm:w-48"
        >
          <option value="">Tüm Durumlar</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{statusCfg(s).label}</option>
          ))}
        </select>
      </div>

      {/* Layout */}
      <div className={`flex gap-6 ${selectedLead ? "flex-col lg:flex-row" : ""}`}>
        {/* Table */}
        <div className="flex-1 card-premium overflow-hidden p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Yükleniyor...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium">Henüz lead yok</p>
              <p className="text-sm text-muted-foreground mt-1">Formlarınızdan gelen veriler burada görünecek</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">İsim / Email</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Telefon</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Durum</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Kaynak</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const cfg = statusCfg(lead.status)
                    return (
                      <motion.tr
                        key={lead._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer ${selectedLead?._id === lead._id ? "bg-[#7342E2]/5" : ""}`}
                        onClick={() => setSelectedLead(lead)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#7342E2]/10 flex items-center justify-center text-[#7342E2] font-semibold text-xs shrink-0">
                              {(lead.name || lead.email)[0].toUpperCase()}
                            </div>
                            <div>
                              {lead.name && <p className="font-medium">{lead.name}</p>}
                              <p className="text-muted-foreground text-xs">{lead.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{lead.phone || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground capitalize">{lead.source}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <select
                              value={lead.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => updateStatus(lead, e.target.value)}
                              disabled={updatingStatus === lead._id}
                              className="text-xs border border-border rounded-lg px-2 py-1.5 bg-background focus:outline-none focus:ring-1 focus:ring-[#7342E2]"
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>{statusCfg(s).label}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedLead && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-80 card-premium shrink-0"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Lead Detayı</h3>
              <button onClick={() => setSelectedLead(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
            </div>
            <div className="space-y-3 mb-6">
              {selectedLead.name && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedLead.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="break-all">{selectedLead.email}</span>
              </div>
              {selectedLead.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedLead.phone}</span>
                </div>
              )}
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg(selectedLead.status).bg} ${statusCfg(selectedLead.status).color}`}>
                {statusCfg(selectedLead.status).label}
              </div>
            </div>

            {/* Notes */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" /> Notlar
              </h4>
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {(selectedLead.notes || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">Henüz not yok</p>
                ) : (
                  selectedLead.notes?.map((n, i) => (
                    <div key={i} className="bg-secondary/50 rounded-lg p-2.5 text-xs">
                      <p>{n.content}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Not ekle..."
                  className="flex-1 text-xs border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-[#7342E2]"
                  onKeyDown={(e) => e.key === "Enter" && addNote()}
                />
                <button
                  onClick={addNote}
                  disabled={addingNote || !note.trim()}
                  className="px-3 py-2 rounded-lg bg-[#7342E2] text-white text-xs font-medium disabled:opacity-50 hover:bg-[#7342E2]/90 transition-colors"
                >
                  {addingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Ekle"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
