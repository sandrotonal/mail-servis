"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Settings, User, Bell, Shield, Palette } from "lucide-react"

const tabs = [
  { id: "profile", label: "Profil", icon: User },
  { id: "notifications", label: "Bildirimler", icon: Bell },
  { id: "security", label: "Güvenlik", icon: Shield },
  { id: "appearance", label: "Görünüm", icon: Palette },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground">Hesap ve uygulama ayarları</p>
      </div>

      <div className="flex gap-2 border-b border-border pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border p-6 max-w-2xl">
        {activeTab === "profile" && (
          <div className="space-y-4">
            <h3 className="font-semibold">Profil Bilgileri</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Ad Soyad</label>
              <input type="text" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Adınız" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="Email" />
            </div>
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Kaydet</button>
          </div>
        )}
        {activeTab === "appearance" && (
          <div className="space-y-4">
            <h3 className="font-semibold">Tema</h3>
            <div className="flex gap-3">
              <button className="rounded-lg border border-border px-6 py-3 text-sm hover:bg-muted">Açık</button>
              <button className="rounded-lg bg-primary px-6 py-3 text-sm text-primary-foreground">Koyu</button>
              <button className="rounded-lg border border-border px-6 py-3 text-sm hover:bg-muted">Sistem</button>
            </div>
          </div>
        )}
        {activeTab !== "profile" && activeTab !== "appearance" && (
          <p className="text-sm text-muted-foreground">Bu özellik yakında eklenecek.</p>
        )}
      </div>
    </div>
  )
}
