"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Users, Mail, Phone, Tag, MoreHorizontal } from "lucide-react"
import { formatDate, truncate } from "@/lib/utils"

interface Lead {
  _id: string
  email: string
  name: string
  phone: string
  status: string
  source: string
  createdAt: string
}

const statusColors: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-500",
  contacted: "bg-yellow-500/10 text-yellow-500",
  qualified: "bg-purple-500/10 text-purple-500",
  proposal: "bg-orange-500/10 text-orange-500",
  won: "bg-green-500/10 text-green-500",
  lost: "bg-red-500/10 text-red-500",
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const workspaceId = localStorage.getItem("activeWorkspace")
        if (!workspaceId) return
        const res = await api.get<{ success: boolean; data: { data: Lead[] } }>(`/workspaces/${workspaceId}/leads`)
        setLeads(res.data.data)
      } catch {} finally { setLoading(false) }
    }
    fetchLeads()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leads (CRM)</h1>
        <p className="text-muted-foreground">Formlardan gelen lead kayıtları</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">İsim</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Telefon</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Durum</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Kaynak</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-sm font-medium">{lead.name || "---"}</td>
                  <td className="p-4 text-sm text-muted-foreground">{lead.email}</td>
                  <td className="p-4 text-sm text-muted-foreground">{lead.phone || "---"}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[lead.status] || ""}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{lead.source}</td>
                  <td className="p-4 text-sm text-muted-foreground">{formatDate(lead.createdAt)}</td>
                </tr>
              ))}
              {leads.length === 0 && !loading && (
                <tr><td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">Henüz lead kaydı yok</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
