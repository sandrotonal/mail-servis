"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useWorkspace } from "@/context/WorkspaceContext"
import { Globe, Plus, CheckCircle, XCircle, Clock, Trash2, RefreshCw, Loader2, Copy, ChevronDown } from "lucide-react"

interface DomainDoc {
  _id: string
  domain: string
  verificationStatus: "pending" | "verified" | "failed"
  dnsRecords: {
    spf: { value: string; verified: boolean }
    dkim: { value: string; verified: boolean }
    dmarc: { value: string; verified: boolean }
  }
  verifiedAt?: string
  createdAt: string
}

interface AddResponse {
  success: boolean
  data: {
    domain: DomainDoc
    verificationToken: string
    instructions: {
      txt: { name: string; value: string }
      spf: { type: string; name: string; value: string }
      dkim: { type: string; name: string; value: string }
      dmarc: { type: string; name: string; value: string }
    }
  }
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<DomainDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [adding, setAdding] = useState(false)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [newDomain, setNewDomain] = useState("")
  const [instructions, setInstructions] = useState<AddResponse["data"]["instructions"] | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { activeWorkspace } = useWorkspace()

  const fetchDomains = async () => {
    if (!activeWorkspace) return
    try {
      const res = await api.get<{ success: boolean; data: { domains: DomainDoc[] } }>(
        `/workspaces/${activeWorkspace._id}/domains`
      )
      setDomains(res.data.domains || [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDomains() }, [activeWorkspace])

  const addDomain = async () => {
    if (!newDomain.trim() || !activeWorkspace) return
    setAdding(true)
    try {
      const res = await api.post<AddResponse>(`/workspaces/${activeWorkspace._id}/domains`, { domain: newDomain.trim() })
      setInstructions(res.data.instructions)
      toast.success("Domain eklendi! DNS kayıtlarını yapılandırın.")
      setNewDomain("")
      fetchDomains()
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Hata") }
    finally { setAdding(false) }
  }

  const verifyDomain = async (id: string) => {
    if (!activeWorkspace) return
    setVerifying(id)
    try {
      const res = await api.post<{ success: boolean; data: { domain: DomainDoc } }>(
        `/workspaces/${activeWorkspace._id}/domains/${id}/verify`
      )
      if (res.data.domain.verificationStatus === "verified") {
        toast.success("Domain doğrulandı! ✅")
      } else {
        toast.error("DNS kayıtları henüz doğrulanamadı. Birkaç dakika bekleyin.")
      }
      fetchDomains()
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Hata") }
    finally { setVerifying(null) }
  }

  const deleteDomain = async (id: string, domain: string) => {
    if (!confirm(`"${domain}" domainini silmek istiyor musunuz?`)) return
    if (!activeWorkspace) return
    try {
      await api.delete(`/workspaces/${activeWorkspace._id}/domains/${id}`)
      toast.success("Domain silindi")
      fetchDomains()
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Hata") }
  }

  const copyText = (text: string) => { navigator.clipboard.writeText(text); toast.success("Kopyalandı!") }

  const statusIcon = (status: string) => {
    if (status === "verified") return <CheckCircle className="w-5 h-5 text-emerald-500" />
    if (status === "failed") return <XCircle className="w-5 h-5 text-red-500" />
    return <Clock className="w-5 h-5 text-yellow-500" />
  }

  const statusLabel = (status: string) => {
    if (status === "verified") return { label: "Doğrulandı", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" }
    if (status === "failed") return { label: "Başarısız", cls: "bg-red-100 text-red-700" }
    return { label: "Bekliyor", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" }
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Domainler</h1>
          <p className="text-muted-foreground mt-1">SPF, DKIM ve DMARC doğrulaması</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#7342E2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7342E2]/90 transition-colors">
          <Plus className="h-4 w-4" /> Domain Ekle
        </button>
      </motion.div>

      {/* Add Domain Modal */}
      <AnimatePresence>
        {showAdd && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setShowAdd(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl z-50">
              <h2 className="text-xl font-semibold mb-4">Domain Ekle</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Domain adı</label>
                  <input value={newDomain} onChange={e => setNewDomain(e.target.value)} placeholder="ornek.com"
                    className="input-premium" onKeyDown={(e) => e.key === "Enter" && addDomain()} />
                </div>
                <div className="flex gap-3">
                  <button onClick={addDomain} disabled={adding || !newDomain.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#7342E2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7342E2]/90 disabled:opacity-50 transition-colors">
                    {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />} Ekle
                  </button>
                  <button onClick={() => setShowAdd(false)} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary transition-colors">İptal</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DNS Instructions (shown after adding) */}
      <AnimatePresence>
        {instructions && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="card-premium border-[#7342E2]/30 bg-[#7342E2]/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#7342E2]">DNS Yapılandırma Talimatları</h3>
              <button onClick={() => setInstructions(null)} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Aşağıdaki DNS kayıtlarını domain sağlayıcınızın paneline ekleyin:</p>
            {[
              { label: "Doğrulama TXT", type: "TXT", name: instructions.txt.name, value: instructions.txt.value },
              { label: "SPF", ...instructions.spf },
              { label: "DMARC", ...instructions.dmarc },
            ].map((rec) => (
              <div key={rec.label} className="mb-3 last:mb-0">
                <p className="text-xs font-semibold text-muted-foreground mb-1">{rec.label} ({rec.type})</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-background border border-border rounded-lg p-2 text-xs font-mono overflow-x-auto">
                    <span className="text-muted-foreground">@{rec.name} → </span>{rec.value}
                  </div>
                  <button onClick={() => copyText(rec.value)} className="p-2 rounded-lg hover:bg-secondary transition-colors shrink-0">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Domain List */}
      {loading ? (
        <div className="card-premium p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" /></div>
      ) : domains.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <Globe className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-medium">Henüz domain yok</p>
          <p className="text-sm text-muted-foreground mt-1">Email deliverability için domain doğrulaması yapın</p>
        </div>
      ) : (
        <div className="space-y-3">
          {domains.map((d) => {
            const { label, cls } = statusLabel(d.verificationStatus)
            return (
              <motion.div key={d._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="card-premium">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {statusIcon(d.verificationStatus)}
                    <div className="min-w-0">
                      <p className="font-semibold">{d.domain}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 ${cls}`}>{label}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {d.verificationStatus !== "verified" && (
                      <button onClick={() => verifyDomain(d._id)} disabled={verifying === d._id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#7342E2]/10 text-[#7342E2] hover:bg-[#7342E2]/20 transition-colors disabled:opacity-50">
                        {verifying === d._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        Doğrula
                      </button>
                    )}
                    <button onClick={() => setExpandedId(expandedId === d._id ? null : d._id)}
                      className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === d._id ? "rotate-180" : ""}`} />
                    </button>
                    <button onClick={() => deleteDomain(d._id, d.domain)}
                      className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* DNS Records expanded */}
                <AnimatePresence>
                  {expandedId === d._id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-4 pt-4 border-t border-border">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { label: "SPF", verified: d.dnsRecords.spf.verified, value: d.dnsRecords.spf.value },
                          { label: "DKIM", verified: d.dnsRecords.dkim.verified, value: d.dnsRecords.dkim.value },
                          { label: "DMARC", verified: d.dnsRecords.dmarc.verified, value: d.dnsRecords.dmarc.value },
                        ].map(rec => (
                          <div key={rec.label} className="bg-secondary/50 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 mb-2">
                              {rec.verified ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-yellow-500" />}
                              <span className="text-xs font-semibold">{rec.label}</span>
                            </div>
                            <p className="text-xs font-mono text-muted-foreground break-all leading-relaxed">{rec.value}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
