"use client"

import { useEffect, useState, use } from "react"
import { motion } from "framer-motion"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useWorkspace } from "@/context/WorkspaceContext"
import {
  IconArrowLeft, IconCopy, IconCode, IconEye, IconFileText, IconChevronRight,
  IconTerminal, IconShieldCheck, IconCheck, IconSparkles, IconLoader2
} from "@tabler/icons-react"
import Link from "next/link"

interface EmbedData {
  project: {
    id: string
    name: string
    fields: Array<{
      type: string
      name: string
      label: string
      placeholder?: string
      required: boolean
    }>
  }
  embed: {
    iframe: string
    javascript: string
    endpoint: string
    method: string
  }
}

export default function ProjectEmbedPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params)
  const { activeWorkspace } = useWorkspace()
  const [data, setData] = useState<EmbedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"html" | "react" | "webhook" | "curl">("html")

  useEffect(() => {
    const fetchEmbedData = async () => {
      if (!activeWorkspace || !projectId) return
      try {
        const res = await api.get<{ success: boolean; data: EmbedData }>(
          `/forms/${projectId}/embed`
        )
        setData(res.data)
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Entegrasyon detayları yüklenemedi.")
      } finally {
        setLoading(false)
      }
    }

    if (activeWorkspace && projectId) {
      fetchEmbedData()
    }
  }, [activeWorkspace, projectId])

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    toast.success("Kopyalandı!")
    setTimeout(() => setCopiedKey(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <IconLoader2 className="w-8 h-8 animate-spin text-[#7342E2]" />
      </div>
    )
  }

  if (!data) return null

  // Generate customized HTML code based on fields
  const generateHTML = () => {
    const fieldsHTML = data.project.fields.map(f => {
      const isReq = f.required ? " required" : ""
      if (f.type === 'textarea') {
        return `    <div class="form-group">\n      <label>${f.label}</label>\n      <textarea name="${f.name}" placeholder="${f.placeholder || ''}"${isReq}></textarea>\n    </div>`
      }
      return `    <div class="form-group">\n      <label>${f.label}</label>\n      <input type="${f.type === 'phone' ? 'tel' : f.type}" name="${f.name}" placeholder="${f.placeholder || ''}"${isReq} />\n    </div>`
    }).join('\n\n')

    return `<form action="${data.embed.endpoint}" method="POST">\n  <!-- Form Alanları -->\n${fieldsHTML}\n\n  <!-- Honeypot Bot Koruması (Önerilen) -->\n  <input type="text" name="_honeypot" style="display:none" />\n\n  <button type="submit">Gönder</button>\n</form>`
  }

  // Generate customized React component code
  const generateReact = () => {
    const stateFields = data.project.fields.map(f => `    ${f.name}: ""`).join(',\n')
    const inputsJSX = data.project.fields.map(f => {
      if (f.type === 'textarea') {
        return `      <div>\n        <label>${f.label}</label>\n        <textarea name="${f.name}" value={formData.${f.name}} onChange={handleChange} required={${f.required}} />\n      </div>`
      }
      return `      <div>\n        <label>${f.label}</label>\n        <input type="${f.type === 'phone' ? 'tel' : f.type}" name="${f.name}" value={formData.${f.name}} onChange={handleChange} required={${f.required}} />\n      </div>`
    }).join('\n\n')

    return `import { useState } from "react";\n\nexport default function ContactForm() {\n  const [formData, setFormData] = useState({\n${stateFields}\n  });\n\n  const handleChange = (e) => {\n    setFormData({ ...formData, [e.target.name]: e.target.value });\n  };\n\n  const handleSubmit = async (e) => {\n    e.preventDefault();\n    try {\n      const response = await fetch("${data.embed.endpoint}", {\n        method: "POST",\n        headers: {\n          "Content-Type": "application/json",\n          "X-API-KEY": "YOUR_API_KEY"\n        },\n        body: JSON.stringify(formData)\n      });\n      if (response.ok) {\n        alert("Form başarıyla gönderildi!");\n      }\n    } catch (err) {\n      console.error(err);\n    }\n  };\n\n  return (\n    <form onSubmit={handleSubmit}>\n${inputsJSX}\n      <button type="submit">Gönder</button>\n    </form>\n  );\n}`
  }

  const generateCurl = () => {
    const dataObj = data.project.fields.reduce((acc, f) => {
      acc[f.name] = f.type === 'email' ? 'test@siteniz.com' : 'Metin Değeri'
      return acc
    }, {} as Record<string, string>)

    return `curl -X POST "${data.embed.endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "X-API-KEY: YOUR_API_KEY" \\
  -d '${JSON.stringify(dataObj, null, 2)}'`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/projects/${data.project.id}`}
          className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-secondary transition-colors"
        >
          <IconArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Form Entegrasyonu</h1>
          <p className="text-muted-foreground mt-1">"{data.project.name}" formunu web sitenize bağlayın</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Code block wrapper */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-premium p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <IconCode className="w-5 h-5 text-[#7342E2]" />
              Entegrasyon Yöntemleri
            </h3>

            {/* Code Tabs */}
            <div className="flex gap-2 mb-6 border-b border-border pb-3">
              {(["html", "react", "curl"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
                    activeTab === tab
                      ? "bg-[#7342E2] text-white"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Code display */}
            <div className="relative rounded-2xl overflow-hidden border border-border bg-[#0B0F19] text-white">
              <div className="flex items-center justify-between px-4 py-3 bg-[#111827] border-b border-border/80 text-xs font-mono text-muted-foreground">
                <span>{activeTab === "html" ? "index.html" : activeTab === "react" ? "ContactForm.jsx" : "curl.sh"}</span>
                <button
                  onClick={() => {
                    const code = activeTab === "html" ? generateHTML() : activeTab === "react" ? generateReact() : generateCurl()
                    copyToClipboard(code, "code")
                  }}
                  className="inline-flex items-center gap-1 hover:text-white transition-colors"
                >
                  {copiedKey === "code" ? <IconCheck className="w-3.5 h-3.5 text-emerald-500" /> : <IconCopy className="w-3.5 h-3.5" />}
                  {copiedKey === "code" ? "Kopyalandı" : "Kodu Kopyala"}
                </button>
              </div>
              <pre className="p-5 font-mono text-sm overflow-x-auto max-h-[450px] leading-relaxed text-[#93C5FD]">
                <code>
                  {activeTab === "html" && generateHTML()}
                  {activeTab === "react" && generateReact()}
                  {activeTab === "curl" && generateCurl()}
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* Side Panel for info */}
        <div className="space-y-6">
          <div className="card-premium p-6 space-y-4">
            <h3 className="font-semibold text-lg">Endpoint URL</h3>
            <p className="text-xs text-muted-foreground">
              Form verilerinizi doğrudan bu uç noktaya POST isteği göndererek kaydedebilirsiniz.
            </p>
            <div className="p-3 bg-secondary/50 rounded-xl border border-border flex items-center justify-between gap-2 min-w-0">
              <span className="text-xs font-mono truncate select-all">{data.embed.endpoint}</span>
              <button
                onClick={() => copyToClipboard(data.embed.endpoint, "endpoint")}
                className="p-2 bg-background border border-border hover:bg-secondary rounded-lg transition-colors shrink-0"
              >
                {copiedKey === "endpoint" ? <IconCheck className="w-3.5 h-3.5 text-emerald-500" /> : <IconCopy className="w-3.5 h-3.5 text-muted-foreground" />}
              </button>
            </div>
          </div>

          <div className="card-premium p-6 space-y-3 bg-[#7342E2]/5 border-[#7342E2]/20">
            <div className="flex items-center gap-2">
              <IconShieldCheck className="w-5 h-5 text-[#7342E2]" />
              <h3 className="font-semibold text-sm">CORS & Güvenlik</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              API anahtarınızı güvende tutmak için form gönderimlerinde CORS veya Whitelist domain kısıtlamalarını etkinleştirmenizi öneririz.
            </p>
            <Link
              href={`/dashboard/projects/${data.project.id}`}
              className="text-xs font-semibold text-[#7342E2] inline-flex items-center gap-1 hover:underline"
            >
              CORS Ayarlarını Düzenle
              <IconChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
