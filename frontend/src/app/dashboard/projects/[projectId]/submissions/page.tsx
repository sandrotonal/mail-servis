"use client"

import { useEffect, useState, use } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useWorkspace } from "@/context/WorkspaceContext"
import {
  ArrowLeft, Search, Filter, Trash2, Calendar, ShieldAlert,
  Inbox, Loader2, ChevronRight, X, Globe, User, Clock, Check
} from "lucide-react"
import Link from "next/link"

interface Submission {
  _id: string
  formData: Record<string, any>
  metadata: {
    ip?: string
    userAgent?: string
    referer?: string
    country?: string
  }
  isSpam: boolean
  spamScore: number
  createdAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ProjectSubmissionsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params)
  const { activeWorkspace } = useWorkspace()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [hideSpam, setHideSpam] = useState(true)
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null)

  const fetchSubmissions = async (page = 1) => {
    if (!activeWorkspace || !projectId) return
    try {
      const queryParams: Record<string, string> = {
        page: page.toString(),
        limit: "15"
      }
      if (search) queryParams.search = search

      const res = await api.get<{ success: boolean; data: { data: Submission[]; pagination: Pagination } }>(
        `/forms/${projectId}/submissions`,
        { params: queryParams }
      )
      setSubmissions(res.data.data)
      setPagination(res.data.pagination)
    } catch (err: any) {
      toast.error(err.message || "Gönderimler yüklenemedi.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeWorkspace && projectId) {
      fetchSubmissions()
    }
  }, [activeWorkspace, projectId, hideSpam])

  const handleDelete = async (id: string) => {
    if (!confirm("Bu gönderimi kalıcı olarak silmek istediğinize emin misiniz?")) return
    try {
      // Assuming submissions delete endpoint is implemented in form controller or we just filter locally
      // Let's call DELETE /api/v1/forms/submissions/:id if existed, or let's mock/implement it in backend if needed
      // Wait, let's delete via API
      await api.delete(`/forms/submissions/${id}`)
      toast.success("Gönderim silindi")
      if (selectedSub?._id === id) setSelectedSub(null)
      fetchSubmissions(pagination?.page || 1)
    } catch (err: any) {
      // Fallback in case endpoint is pending, show success locally for testing or show error
      toast.error(err.message || "Silme işlemi sırasında hata oluştu.")
    }
  }

  // Filter spam locally if backend returns all, or let user toggle
  const displayedSubmissions = submissions.filter(sub => {
    if (hideSpam && sub.isSpam) return false
    return true
  })

  if (loading && submissions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#7342E2]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Form Gönderimleri</h1>
          <p className="text-muted-foreground mt-1">Gelen form mesajlarını ve lead bilgilerini inceleyin</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchSubmissions(1)}
            placeholder="Gönderimlerde ara... (Enter'a basın)"
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#7342E2]"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold select-none">
            <input
              type="checkbox"
              checked={hideSpam}
              onChange={(e) => setHideSpam(e.target.checked)}
              className="rounded border-border text-[#7342E2] focus:ring-[#7342E2] w-4 h-4"
            />
            Spam Mesajları Gizle
          </label>
          <button
            onClick={() => fetchSubmissions(1)}
            className="bg-secondary hover:bg-secondary/80 text-foreground border border-border rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
          >
            Filtrele
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table/List panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card-premium p-0 overflow-hidden">
            {displayedSubmissions.length === 0 ? (
              <div className="text-center py-20 bg-card">
                <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-sm">Hiç gönderim bulunamadı</p>
                <p className="text-xs text-muted-foreground mt-1">Formunuz henüz hiç mesaj almamış.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                      <th className="px-6 py-4">Gönderen</th>
                      <th className="px-6 py-4">Mesaj Özeti</th>
                      <th className="px-6 py-4">Tarih</th>
                      <th className="px-6 py-4">Spam</th>
                      <th className="px-6 py-4 text-right">Aksiyon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-sm">
                    {displayedSubmissions.map(sub => {
                      const email = sub.formData.email || sub.formData.Email || "Anonim"
                      const summary = Object.entries(sub.formData)
                        .filter(([k]) => !['email', 'Email', '_honeypot'].includes(k))
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")
                        .slice(0, 40) + "..."

                      return (
                        <tr
                          key={sub._id}
                          onClick={() => setSelectedSub(sub)}
                          className={`hover:bg-secondary/20 cursor-pointer transition-colors ${
                            selectedSub?._id === sub._id ? "bg-[#7342E2]/5 hover:bg-[#7342E2]/10" : ""
                          }`}
                        >
                          <td className="px-6 py-4 font-semibold max-w-[150px] truncate">
                            {email}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground max-w-[250px] truncate font-mono text-xs">
                            {summary}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground text-xs">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            {sub.isSpam ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
                                <ShieldAlert className="w-3 h-3" />
                                Evet ({sub.spamScore})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                Hayır
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleDelete(sub._id)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between items-center bg-card border border-border px-4 py-3 rounded-xl text-sm">
              <span className="text-muted-foreground text-xs">
                Toplam {pagination.total} kayıttan {displayedSubmissions.length} tanesi gösteriliyor
              </span>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => fetchSubmissions(pagination.page - 1)}
                  className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-secondary disabled:opacity-50 transition-colors"
                >
                  Önceki
                </button>
                <button
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => fetchSubmissions(pagination.page + 1)}
                  className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-secondary disabled:opacity-50 transition-colors"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Inspector Panel */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {selectedSub ? (
              <motion.div
                key={selectedSub._id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="card-premium p-6 space-y-6 sticky top-6 border-[#7342E2]/20 shadow-[#7342E2]/5 shadow-lg"
              >
                {/* Header */}
                <div className="flex justify-between items-start border-b border-border pb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Detaylı İnceleme</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(selectedSub.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSub(null)}
                    className="p-1 hover:bg-secondary rounded-lg transition-colors border border-border"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Data */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Form İçeriği</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedSub.formData)
                      .filter(([k]) => k !== "_honeypot")
                      .map(([key, value]) => (
                        <div key={key} className="p-3 bg-secondary/30 border border-border rounded-xl">
                          <span className="text-xs font-semibold text-muted-foreground block mb-0.5 capitalize">{key}</span>
                          <span className="text-sm font-medium break-all select-all font-mono">{String(value)}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cihaz & Konum</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 bg-secondary/20 border border-border rounded-xl flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-muted-foreground block">IP Adresi</span>
                        <span className="font-medium truncate block">{selectedSub.metadata.ip || "Bilinmiyor"}</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-secondary/20 border border-border rounded-xl flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-muted-foreground block">Ülke</span>
                        <span className="font-medium truncate block">{selectedSub.metadata.country || "Bilinmiyor"}</span>
                      </div>
                    </div>
                  </div>
                  {selectedSub.metadata.userAgent && (
                    <div className="p-2.5 bg-secondary/20 border border-border rounded-xl text-xs font-mono">
                      <span className="text-[10px] text-muted-foreground block mb-0.5">User Agent</span>
                      <span className="text-muted-foreground text-[11px] leading-relaxed break-all block">{selectedSub.metadata.userAgent}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="card-premium p-8 text-center py-20 bg-muted/10 border-dashed border-border rounded-2xl flex flex-col items-center justify-center">
                <Filter className="w-8 h-8 text-muted-foreground mb-3" />
                <h4 className="font-semibold text-sm mb-1">Detayları Gör</h4>
                <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
                  Detayları, cihaz ve konum bilgilerini incelemek için soldaki tablodan bir gönderime tıklayın.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
