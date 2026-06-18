"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard, FolderKanban, Users, Mail, Key,
  Settings, Webhook, MailCheck, BarChart3, LogOut, ChevronLeft
} from "lucide-react"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/workspaces", icon: FolderKanban, label: "Workspaces" },
  { href: "/dashboard/projects", icon: Mail, label: "Projects" },
  { href: "/dashboard/leads", icon: Users, label: "Leads (CRM)" },
  { href: "/dashboard/api-keys", icon: Key, label: "API Keys" },
  { href: "/dashboard/smtp", icon: MailCheck, label: "SMTP Providers" },
  { href: "/dashboard/webhooks", icon: Webhook, label: "Webhooks" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
]

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname()

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <Mail className="h-5 w-5 text-primary" />
            MailServis
          </Link>
        )}
        <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <nav className="p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className={cn("absolute bottom-0 left-0 right-0 p-2 border-t border-border", collapsed && "p-2")}>
        <button className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full",
          collapsed && "justify-center"
        )}>
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Çıkış Yap</span>}
        </button>
      </div>
    </aside>
  )
}
