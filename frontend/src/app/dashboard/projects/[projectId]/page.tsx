"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useWorkspace } from "@/context/WorkspaceContext"
import {
  ArrowLeft, Save, Plus, Trash2, Settings, Shield,
  Globe, Mail, FileText, Check, AlertTriangle, ChevronDown,
  Layout, Eye, Loader2, Sparkles, Code
} from "lucide-react"
import Link from "next/link"

interface Field {
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file'
  name: string
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

interface ProjectSettings {
  successMessage: string
  redirectUrl?: string
  allowedDomains: string[]
  enableFileUploads: boolean
  spamProtection: boolean
  honeypotEnabled: boolean
  recaptchaEnabled: boolean
}

interface Project {
  _id: string
  name: string
  projectId: string
  settings: ProjectSettings
  fields: Field[]
  isActive: boolean
}

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const router = useRouter()
  const { projectId } = use(params)
  const { activeWorkspace } = useWorkspace()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"fields" | "settings" | "security">("fields")

  // For adding a new field
  const [newFieldType, setNewFieldType] = useState<Field["type"]>("text")

  // For managing domain tag input
  const [domainInput, setDomainInput] = useState("")

  const fetchProject = async () => {
    if (!activeWorkspace || !projectId) return
    try {
      const res = await api.get<{ success: boolean; data: { project: Project } }>(
        `/workspaces/${activeWorkspace._id}/projects/${projectId}`
      )
      setProject(res.data.project)
    } catch (err: any) {
      toast.error(err.message || "Proje yüklenirken hata oluştu")
      router.push("/dashboard/projects")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeWorkspace && projectId) {
      fetchProject()
    }
  }, [activeWorkspace, projectId])

  const addField = () => {
    if (!project) return
    const defaultLabel = newFieldType.charAt(0).toUpperCase() + newFieldType.slice(1)
    const newField: Field = {
      type: newFieldType,
      name: `${newFieldType}_${Date.now().toString(36)}`,
      label: defaultLabel,
      placeholder: `Lütfen ${defaultLabel.toLowerCase()} girin...`,
      required: false,
      options: ['select', 'radio', 'checkbox'].includes(newFieldType) ? ['Seçenek 1', 'Seçenek 2'] : undefined
    }

    setProject({
      ...project,
      fields: [...project.fields, newField]
    })
    toast.success("Alan eklendi! Kaydetmeyi unutmayın.")
  }

  const removeField = (index: number) => {
    if (!project) return
    const updatedFields = [...project.fields]
    updatedFields.splice(index, 1)
    setProject({ ...project, fields: updatedFields })
  }

  const updateField = (index: number, key: keyof Field, value: any) => {
    if (!project) return
    const updatedFields = [...project.fields]
    updatedFields[index] = { ...updatedFields[index], [key]: value }
    setProject({ ...project, fields: updatedFields })
  }

  const addDomain = () => {
    if (!project || !domainInput.trim()) return
    const domain = domainInput.trim().toLowerCase()
    if (project.settings.allowedDomains.includes(domain)) {
      toast.error("Bu alan adı zaten ekli.")
      return
    }
    setProject({
      ...project,
      settings: {
        ...project.settings,
        allowedDomains: [...project.settings.allowedDomains, domain]
      }
    })
    setDomainInput("")
  }

  const removeDomain = (domainToRemove: string) => {
    if (!project) return
    setProject({
      ...project,
      settings: {
        ...project.settings,
        allowedDomains: project.settings.allowedDomains.filter(d => d !== domainToRemove)
      }
    })
  }

  const saveProject = async () => {
    if (!project || !activeWorkspace) return
    setSaving(true)
    try {
      // 1. Save general settings
      await api.put(`/workspaces/${activeWorkspace._id}/projects/${project._id}`, {
        name: project.name,
        settings: project.settings,
        isActive: project.isActive
      })

      // 2. Save form fields
      await api.put(`/workspaces/${activeWorkspace._id}/projects/${project._id}/fields`, {
        fields: project.fields
      })

      toast.success("Değişiklikler başarıyla kaydedildi!")
      fetchProject()
    } catch (err: any) {
      toast.error(err.message || "Kaydedilirken bir hata oluştu")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#7342E2]" />
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/projects"
            className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground mt-1 font-mono text-xs">ID: {project.projectId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/projects/${project._id}/submissions`}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-secondary transition-colors"
          >
            Gönderimleri Gör
          </Link>
          <button
            onClick={saveProject}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#7342E2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#7342E2]/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Kaydet
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex gap-4">
        <button
          onClick={() => setActiveTab("fields")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "fields" ? "border-[#7342E2] text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layout className="w-4 h-4" />
          Form Alanları
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "settings" ? "border-[#7342E2] text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Settings className="w-4 h-4" />
          Form Ayarları
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "security" ? "border-[#7342E2] text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Shield className="w-4 h-4" />
          Spam & Güvenlik
        </button>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Panel */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "fields" && (
              <motion.div
                key="fields"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Field Builder Card */}
                <div className="card-premium p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-semibold text-lg">Alanları Yapılandır</h3>
                      <p className="text-sm text-muted-foreground">Formunuzda toplanacak bilgileri belirleyin</p>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value as Field["type"])}
                        className="bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#7342E2]"
                      >
                        <option value="text">Metin (Single Line)</option>
                        <option value="email">E-posta</option>
                        <option value="phone">Telefon</option>
                        <option value="textarea">Uzun Metin (Textarea)</option>
                        <option value="select">Açılır Liste (Select)</option>
                        <option value="checkbox">Çoklu Seçim (Checkbox)</option>
                        <option value="radio">Tekli Seçim (Radio)</option>
                        <option value="date">Tarih</option>
                        <option value="file">Dosya Yükleme</option>
                      </select>
                      <button
                        onClick={addField}
                        className="inline-flex items-center gap-1 bg-[#7342E2] hover:bg-[#7342E2]/90 text-white rounded-xl px-3 py-2 text-sm font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Ekle
                      </button>
                    </div>
                  </div>

                  {project.fields.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-muted/20">
                      <Layout className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="font-medium text-sm">Henüz form alanı eklenmedi</p>
                      <p className="text-xs text-muted-foreground mt-1">Sağ üstten alan seçerek eklemeye başlayın.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {project.fields.map((field, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-xl border border-border bg-background flex flex-col md:flex-row md:items-center gap-4 group"
                        >
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Type (Disabled) */}
                            <div>
                              <span className="text-xs text-muted-foreground block mb-1">Tip</span>
                              <div className="text-sm font-medium px-3 py-2 bg-secondary/30 border border-border rounded-lg capitalize">
                                {field.type}
                              </div>
                            </div>
                            {/* Label */}
                            <div>
                              <span className="text-xs text-muted-foreground block mb-1">Etiket (Label)</span>
                              <input
                                value={field.label}
                                onChange={(e) => updateField(index, "label", e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#7342E2]"
                              />
                            </div>
                            {/* Name (for key) */}
                            <div>
                              <span className="text-xs text-muted-foreground block mb-1">API Anahtarı (Name)</span>
                              <input
                                value={field.name}
                                onChange={(e) => updateField(index, "name", e.target.value.replace(/\s+/g, "_"))}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#7342E2]"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-border">
                            {/* Required */}
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateField(index, "required", e.target.checked)}
                                className="rounded border-border text-[#7342E2] focus:ring-[#7342E2] w-4 h-4"
                              />
                              <span className="text-xs font-medium">Zorunlu</span>
                            </label>

                            {/* Delete */}
                            <button
                              onClick={() => removeField(index)}
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="card-premium p-6 space-y-4">
                  <h3 className="font-semibold text-lg mb-2">Form Aksiyonları</h3>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Başarılı Mesajı</label>
                    <textarea
                      value={project.settings.successMessage}
                      onChange={(e) => setProject({
                        ...project,
                        settings: { ...project.settings, successMessage: e.target.value }
                      })}
                      className="input-premium h-20 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Yönlendirme URL'si (Redirect)</label>
                    <input
                      value={project.settings.redirectUrl || ""}
                      onChange={(e) => setProject({
                        ...project,
                        settings: { ...project.settings, redirectUrl: e.target.value || undefined }
                      })}
                      placeholder="https://siteniz.com/tesekkurler"
                      className="input-premium"
                    />
                  </div>
                </div>

                <div className="card-premium p-6 space-y-4">
                  <h3 className="font-semibold text-lg mb-2">Genel Bilgiler</h3>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Proje Adı</label>
                    <input
                      value={project.name}
                      onChange={(e) => setProject({ ...project, name: e.target.value })}
                      className="input-premium"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/10">
                    <div>
                      <span className="text-sm font-semibold block">Proje Durumu</span>
                      <span className="text-xs text-muted-foreground">Aktif formlar dışarıdan gönderim alabilir.</span>
                    </div>
                    <button
                      onClick={() => setProject({ ...project, isActive: !project.isActive })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${project.isActive ? "bg-emerald-500" : "bg-muted"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${project.isActive ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Security options */}
                <div className="card-premium p-6 space-y-4">
                  <h3 className="font-semibold text-lg mb-2">Spam Koruması</h3>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                    <div>
                      <span className="text-sm font-semibold block">AI Spam Filtresi</span>
                      <span className="text-xs text-muted-foreground">Akıllı spam skoru hesaplama algoritmasını aktif et.</span>
                    </div>
                    <button
                      onClick={() => setProject({
                        ...project,
                        settings: { ...project.settings, spamProtection: !project.settings.spamProtection }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${project.settings.spamProtection ? "bg-[#7342E2]" : "bg-muted"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${project.settings.spamProtection ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                    <div>
                      <span className="text-sm font-semibold block">Honeypot Alanı</span>
                      <span className="text-xs text-muted-foreground">Botlar için görünmez tuzak alanlar ekleyerek tespiti kolaylaştırır.</span>
                    </div>
                    <button
                      onClick={() => setProject({
                        ...project,
                        settings: { ...project.settings, honeypotEnabled: !project.settings.honeypotEnabled }
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${project.settings.honeypotEnabled ? "bg-[#7342E2]" : "bg-muted"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${project.settings.honeypotEnabled ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>

                {/* Whitelist domains */}
                <div className="card-premium p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#7342E2]" />
                    <h3 className="font-semibold text-lg">Alan Adı Beyaz Listesi (CORS)</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Sadece aşağıdaki alan adlarından gelen form istekleri kabul edilir. Boş bırakırsanız, her adresten gönderim yapılabilir.
                  </p>
                  <div className="flex gap-2">
                    <input
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      placeholder="örn. siteniz.com"
                      className="input-premium py-2"
                      onKeyDown={(e) => e.key === "Enter" && addDomain()}
                    />
                    <button
                      onClick={addDomain}
                      className="bg-[#7342E2] hover:bg-[#7342E2]/90 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                    >
                      Ekle
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.settings.allowedDomains.map(domain => (
                      <span key={domain} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary/80 text-foreground border border-border">
                        {domain}
                        <button onClick={() => removeDomain(domain)} className="text-muted-foreground hover:text-destructive transition-colors font-bold">×</button>
                      </span>
                    ))}
                    {project.settings.allowedDomains.length === 0 && (
                      <span className="text-xs text-muted-foreground italic">Herhangi bir alan adı kısıtlaması yok.</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Side Info Panel */}
        <div className="space-y-6">
          <div className="card-premium p-6 space-y-4">
            <h3 className="font-semibold text-lg">Hızlı Başlangıç</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Formunuza alan ekledikten sonra, entegrasyonu tamamlamak için embed kodunu veya endpoint'i kopyalayın.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={`/dashboard/projects/${project._id}/embed`}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold hover:bg-secondary/80 transition-all border border-border"
              >
                <Code className="w-4 h-4 text-[#7342E2]" />
                Embed Kodu Al
              </Link>
            </div>
          </div>

          <div className="card-premium p-6 bg-yellow-500/5 border-yellow-500/20 text-yellow-600 dark:text-yellow-500 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h4 className="font-semibold text-sm">Kaydetmeyi Unutmayın</h4>
            </div>
            <p className="text-xs leading-relaxed opacity-90">
              Yaptığınız alan veya ayar değişikliklerinin aktif olması için sağ üstteki <strong>Kaydet</strong> butonuna tıklamanız gerekir.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
