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
  LayoutDashboard, FolderKanban, Users, Mail, Key,
  Settings, Webhook, MailCheck, LogOut, Globe,
  ChevronDown, Check, PlusCircle,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/dashboard/projects", icon: Mail, label: "Projeler" },
  { href: "/dashboard/leads", icon: Users, label: "Lead'ler" },
  { href: "/dashboard/api-keys", icon: Key, label: "API Keys" },
  { href: "/dashboard/smtp", icon: MailCheck, label: "SMTP" },
  { href: "/dashboard/webhooks", icon: Webhook, label: "Webhooks" },
  { href: "/dashboard/domains", icon: Globe, label: "Domainler" },
  { href: "/dashboard/workspaces", icon: FolderKanban, label: "Workspace'ler" },
  { href: "/dashboard/settings", icon: Settings, label: "Ayarlar" },
]

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace()
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await authService.logout()
    toast.success("Çıkış yapıldı")
    router.push("/auth/login")
  }

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center px-4 border-b border-border shrink-0 gap-2">
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg bg-[#7342E2] flex items-center justify-center hover:scale-105 transition-transform shrink-0"
          aria-label="Toggle sidebar"
        >
          <Mail className="w-4 h-4 text-white" />
        </button>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight truncate">MailServis</span>
        )}
      </div>

      {/* Workspace selector */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-2 relative">
          <button
            onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors text-sm font-medium"
          >
            <span className="truncate">{activeWorkspace?.name || "Workspace Seç"}</span>
            <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform", wsDropdownOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {wsDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute left-3 right-3 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden"
              >
                {workspaces.map((ws) => (
                  <button
                    key={ws._id}
                    onClick={() => { setActiveWorkspace(ws); setWsDropdownOpen(false) }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-secondary transition-colors"
                  >
                    <span className="truncate">{ws.name}</span>
                    {activeWorkspace?._id === ws._id && <Check className="w-4 h-4 text-[#7342E2] shrink-0" />}
                  </button>
                ))}
                <div className="border-t border-border">
                  <Link
                    href="/dashboard/workspaces"
                    onClick={() => setWsDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
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
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative overflow-hidden group",
                  isActive
                    ? "bg-[#7342E2] text-white shadow-sm shadow-[#7342E2]/30"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
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
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 w-full",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Çıkış Yap</span>}
        </button>
      </div>
    </aside>
  )
}
