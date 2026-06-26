"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { useWorkspace } from "@/context/WorkspaceContext"
import { IconSettings, IconUser, IconBell, IconShield, IconTrash, IconLoader2, IconDeviceFloppy } from "@tabler/icons-react"

export default function SettingsPage() {
  const { activeWorkspace, refreshWorkspaces } = useWorkspace()
  const [wsName, setWsName] = useState(activeWorkspace?.name || "")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (activeWorkspace) {
      setWsName(activeWorkspace.name)
    }
  }, [activeWorkspace])

  const saveWorkspace = async () => {
    if (!activeWorkspace || !wsName.trim()) return
    setSaving(true)
    try {
      await api.put(`/workspaces/${activeWorkspace._id}`, { name: wsName.trim() })
      toast.success("Workspace güncellendi!")
      await refreshWorkspaces()
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Hata") }
    finally { setSaving(false) }
  }

  const deleteWorkspace = async () => {
    if (!activeWorkspace) return
    const confirm1 = confirm(`"${activeWorkspace.name}" workspace'ini silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)
    if (!confirm1) return
    const confirm2 = prompt(`Onaylamak için workspace adını yazın: "${activeWorkspace.name}"`)
    if (confirm2 !== activeWorkspace.name) { toast.error("Workspace adı eşleşmedi."); return }
    try {
      await api.delete(`/workspaces/${activeWorkspace._id}`)
      toast.success("Workspace silindi")
      window.location.href = "/dashboard"
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Hata") }
  }

  const sections = [
    {
      id: "workspace",
      icon: IconSettings,
      title: "Workspace Ayarları",
      description: "Workspace adı ve genel ayarlar",
      content: (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Workspace Adı</label>
            <div className="flex gap-3">
              <input
                value={wsName}
                onChange={e => setWsName(e.target.value)}
                className="input-premium flex-1"
                placeholder="Workspace adı"
              />
              <button
                onClick={saveWorkspace}
                disabled={saving || !wsName.trim() || wsName === activeWorkspace?.name}
                className="inline-flex items-center gap-2 rounded-xl bg-[#7342E2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7342E2]/90 disabled:opacity-50 transition-colors shrink-0"
              >
                {saving ? <IconLoader2 className="w-4 h-4 animate-spin" /> : <IconDeviceFloppy className="w-4 h-4" />}
                Kaydet
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Plan</label>
            <div className="flex items-center gap-2">
              <span className="text-sm bg-[#7342E2]/10 text-[#7342E2] px-3 py-1.5 rounded-full font-semibold capitalize">
                {activeWorkspace?.plan || "free"} Plan
              </span>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Plan Yükselt →
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "notifications",
      icon: IconBell,
      title: "Bildirimler",
      description: "Email bildirimleri ve alertler",
      content: (
        <div className="space-y-3">
          {[
            { label: "Yeni mesaj geldiğinde", sub: "Her yeni form gönderimi için email al" },
            { label: "Spam algılandığında", sub: "Spam tespit edildiğinde uyar" },
            { label: "SMTP hatası", sub: "Mail gönderilemediğinde bildir" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </div>
              <button className="relative w-11 h-6 rounded-full bg-[#7342E2] transition-colors focus:outline-none">
                <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform" />
              </button>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "danger",
      icon: IconTrash,
      title: "Tehlikeli Bölge",
      description: "Geri alınamaz işlemler",
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Workspace Sil</h4>
            <p className="text-xs text-red-600 dark:text-red-400 mb-3">
              Bu workspace&apos;e ait tüm projeler, form verileri ve ayarlar kalıcı olarak silinir.
            </p>
            <button
              onClick={deleteWorkspace}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              <IconTrash className="w-4 h-4" />
              Workspace&apos;i Sil
            </button>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold tracking-tight">Ayarlar</h1>
        <p className="text-muted-foreground mt-1">Workspace ve hesap ayarları</p>
      </motion.div>

      {sections.map((section, i) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="card-premium"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${section.id === "danger" ? "bg-red-100 dark:bg-red-900/30" : "bg-[#7342E2]/10"}`}>
              <section.icon className={`w-5 h-5 ${section.id === "danger" ? "text-red-600" : "text-[#7342E2]"}`} />
            </div>
            <div>
              <h2 className="font-semibold">{section.title}</h2>
              <p className="text-xs text-muted-foreground">{section.description}</p>
            </div>
          </div>
          {section.content}
        </motion.div>
      ))}
    </div>
  )
}
