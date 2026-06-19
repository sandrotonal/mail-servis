"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useWorkspace } from "@/context/WorkspaceContext"
import { authService } from "@/lib/auth"
import { toast } from "sonner"
import { useState } from "react"
import {
  IconLayoutDashboard, IconMail, IconUsers, IconKey, IconMailCheck,
  IconWebhook, IconGlobe, IconFolder, IconSettings, IconLogout,
  IconChevronDown, IconCheck, IconPlus
} from "@tabler/icons-react"

const navItems = [
  { href: "/dashboard", icon: IconLayoutDashboard, label: "Dashboard", exact: true },
  { href: "/dashboard/projects", icon: IconMail, label: "Projeler" },
  { href: "/dashboard/leads", icon: IconUsers, label: "Lead'ler" },
  { href: "/dashboard/api-keys", icon: IconKey, label: "API Keys" },
  { href: "/dashboard/smtp", icon: IconMailCheck, label: "SMTP" },
  { href: "/dashboard/webhooks", icon: IconWebhook, label: "Webhooks" },
  { href: "/dashboard/domains", icon: IconGlobe, label: "Domainler" },
  { href: "/dashboard/workspaces", icon: IconFolder, label: "Workspace'ler" },
  { href: "/dashboard/settings", icon: IconSettings, label: "Ayarlar" },
]

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace()
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await authService.logout()
      toast.success("Çıkış yapıldı")
      router.push("/auth/login")
    } catch (_) {
      toast.error("Çıkış yapılırken bir hata oluştu")
    }
  }

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-card/65 border-r border-border backdrop-blur-xl transition-all duration-300 flex flex-col",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center px-4 border-b border-border/80 shrink-0 gap-2.5">
        <button
          onClick={onToggle}
          className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7342E2] to-[#9F7AEA] flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 shrink-0 shadow-lg shadow-[#7342E2]/25"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
          <div className="absolute inset-0 rounded-xl bg-[#7342E2]/30 blur-md opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10" />
        </button>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent truncate flex items-center gap-1.5 font-sans">
            MailServis
            <span className="text-[10px] bg-primary/20 text-[#a78bfa] border border-[#7342E2]/30 px-1.5 py-0.5 rounded-md font-semibold tracking-wide">SaaS</span>
          </span>
        )}
      </div>

      {/* Workspace selector */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-2 relative">
          <button
            onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-secondary/80 border border-border/50 hover:bg-secondary transition-colors text-sm font-medium"
          >
            <span className="truncate">{activeWorkspace?.name || "Workspace Seç"}</span>
            <IconChevronDown className={cn("w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-300", wsDropdownOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {wsDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute left-3 right-3 top-full mt-1 bg-card/95 border border-border rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
              >
                {workspaces.map((ws) => (
                  <button
                    key={ws._id}
                    onClick={() => { setActiveWorkspace(ws); setWsDropdownOpen(false) }}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-secondary/70 transition-colors text-left"
                  >
                    <span className="truncate font-medium">{ws.name}</span>
                    {activeWorkspace?._id === ws._id && <IconCheck className="w-4 h-4 text-[#7342E2] shrink-0" />}
                  </button>
                ))}
                <div className="border-t border-border">
                  <Link
                    href="/dashboard/workspaces"
                    onClick={() => setWsDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#a78bfa] hover:bg-secondary/70 transition-colors"
                  >
                    <IconPlus className="w-4 h-4" />
                    Workspace Ekle
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
            >
              <Link
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 relative overflow-hidden group",
                  isActive
                    ? "bg-[#7342E2] text-white shadow-lg shadow-[#7342E2]/20"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  collapsed && "justify-center"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border shrink-0">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 w-full",
            collapsed && "justify-center"
          )}
        >
          <IconLogout className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Çıkış Yap</span>}
        </button>
      </div>
    </aside>
  )
}
