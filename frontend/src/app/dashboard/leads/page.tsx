"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useWorkspace } from "@/context/WorkspaceContext"
import {
  IconUsers, IconSearch, IconChevronDown, IconMail, IconPhone,
  IconMessage, IconLoader2, IconX, IconBriefcase
} from "@tabler/icons-react"

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
  new: { label: "Yeni", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
  contacted: { label: "İletişim Kuruldu", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  qualified: { label: "Nitelikli", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/30" },
  proposal: { label: "Teklif Verildi", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/30" },
  won: { label: "Kazanıldı", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  lost: { label: "Kaybedildi", color: "text-red-600 dark:text-red-400", bg: "bg-red-100 dark:bg-red-900/30" },
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
    <div className="space-y-6 text-foreground">
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
        <span className="text-sm text-muted-foreground bg-secondary px-3 py-1.5 rounded-full font-semibold border border-border">
          {leads.length} lead
        </span>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
          className="input-premium sm:w-48 bg-background text-foreground"
        >
          <option value="">Tüm Durumlar</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{statusCfg(s).label}</option>
          ))}
        </select>
      </div>

      {/* Layout */}
      <div className={`flex flex-col lg:flex-row gap-6 items-start`}>
        {/* Table */}
        <div className="flex-1 w-full card-premium overflow-hidden p-0 bg-card">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <IconLoader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">Yükleniyor...</p>
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center">
              <IconUsers className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium text-foreground">Henüz lead yok</p>
              <p className="text-sm text-muted-foreground mt-1">Formlarınızdan gelen veriler burada görünecek</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs font-semibold uppercase">
                    <th className="text-left px-5 py-4 font-medium text-muted-foreground">İsim / Email</th>
                    <th className="text-left px-5 py-4 font-medium text-muted-foreground">Telefon</th>
                    <th className="text-left px-5 py-4 font-medium text-muted-foreground">Durum</th>
                    <th className="text-left px-5 py-4 font-medium text-muted-foreground">Kaynak</th>
                    <th className="text-right px-5 py-4 font-medium text-muted-foreground">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="text-foreground">
                  {leads.map((lead) => {
                    const cfg = statusCfg(lead.status)
                    return (
                      <motion.tr
                        key={lead._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`border-b border-border/50 hover:bg-secondary/35 transition-colors cursor-pointer ${selectedLead?._id === lead._id ? "bg-[#7342E2]/5 hover:bg-[#7342E2]/10" : ""}`}
                        onClick={() => setSelectedLead(lead)}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#7342E2]/10 flex items-center justify-center text-[#7342E2] font-bold text-xs shrink-0 border border-[#7342E2]/20">
                              {(lead.name || lead.email)[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              {lead.name && <p className="font-semibold text-foreground truncate">{lead.name}</p>}
                              <p className="text-muted-foreground text-xs truncate">{lead.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground font-medium">{lead.phone || "—"}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground capitalize font-medium">{lead.source}</td>
                        <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end">
                            <select
                              value={lead.status}
                              onChange={(e) => updateStatus(lead, e.target.value)}
                              disabled={updatingStatus === lead._id}
                              className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#7342E2]"
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

        {/* CRM Detail Panel */}
        <AnimatePresence>
          {selectedLead && (
            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full lg:w-85 card-premium shrink-0 bg-card border-[#7342E2]/20 shadow-xl"
            >
              {/* Profile Card Header */}
              <div className="flex items-center justify-between border-b border-border pb-4.5 mb-5">
                <div className="flex items-center gap-2">
                  <IconUsers className="w-5 h-5 text-[#7342E2]" />
                  <h3 className="font-bold text-base text-foreground">Lead Profili</h3>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1.5 hover:bg-secondary rounded-lg border border-border transition-colors text-muted-foreground hover:text-foreground"
                >
                  <IconX className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Card Body */}
              <div className="space-y-5 text-foreground">
                <div className="flex flex-col items-center text-center p-4 bg-secondary/20 rounded-2xl border border-border">
                  <div className="w-14 h-14 rounded-full bg-[#7342E2]/15 flex items-center justify-center text-[#7342E2] font-black text-lg mb-3 border-2 border-[#7342E2]/35 shadow-sm">
                    {(selectedLead.name || selectedLead.email)[0].toUpperCase()}
                  </div>
                  {selectedLead.name && <h4 className="font-bold text-base text-foreground">{selectedLead.name}</h4>}
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mt-2.5 ${statusCfg(selectedLead.status).bg} ${statusCfg(selectedLead.status).color}`}>
                    {statusCfg(selectedLead.status).label}
                  </span>
                </div>

                <div className="space-y-3.5 bg-secondary/10 p-4 rounded-2xl border border-border">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">İletişim Bilgileri</h4>
                  <div className="flex items-center gap-2.5 text-sm">
                    <IconMail className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="break-all font-semibold font-mono text-xs">{selectedLead.email}</span>
                  </div>
                  {selectedLead.phone && (
                    <div className="flex items-center gap-2.5 text-sm">
                      <IconPhone className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="font-semibold">{selectedLead.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-sm pt-2 border-t border-border/60">
                    <IconBriefcase className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">Kaynak:</span>
                    <span className="capitalize font-semibold text-xs text-foreground bg-secondary px-2 py-0.5 rounded-md">{selectedLead.source}</span>
                  </div>
                </div>

                {/* Notes section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <IconMessage className="w-4 h-4 text-[#7342E2]" /> Notlar
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {(selectedLead.notes || []).length === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-3 text-center bg-secondary/15 rounded-xl">Kayıtlı not bulunmuyor.</p>
                    ) : (
                      selectedLead.notes?.map((n, i) => (
                        <div key={i} className="bg-secondary/40 border border-border/80 rounded-xl p-3 text-xs space-y-1">
                          <p className="text-foreground leading-relaxed font-medium">{n.content}</p>
                          <span className="text-[10px] text-muted-foreground block text-right font-medium">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Add Note Input */}
                  <div className="flex gap-2 pt-1.5">
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Not ekleyin..."
                      className="flex-1 text-xs border border-border rounded-xl px-3.5 py-2.5 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-[#7342E2] placeholder:text-muted-foreground/60"
                      onKeyDown={(e) => e.key === "Enter" && addNote()}
                    />
                    <button
                      onClick={addNote}
                      disabled={addingNote || !note.trim()}
                      className="px-3.5 py-2.5 rounded-xl bg-[#7342E2] text-white text-xs font-bold disabled:opacity-50 hover:bg-[#7342E2]/90 transition-colors shrink-0"
                    >
                      {addingNote ? <IconLoader2 className="w-4 h-4 animate-spin" /> : "Ekle"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
