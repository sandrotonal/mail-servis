"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { cn } from "@/lib/utils"
import { IconMenu2 } from "@tabler/icons-react"
import { WorkspaceProvider } from "@/context/WorkspaceContext"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <WorkspaceProvider>
      <div className="min-h-screen bg-background">
        {/* Mobile top bar */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center px-4">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <IconMenu2 className="w-5 h-5" />
          </button>
          <span className="ml-3 font-semibold text-lg">MailServis</span>
        </div>

        {/* Mobile overlay */}
        <div
          className={cn(
            "lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setMobileOpen(false)}
        />

        {/* Sidebar */}
        <div className={cn("lg:block", mobileOpen ? "block" : "hidden lg:block")}>
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        </div>

        {/* Main content */}
        <main className={cn("transition-all duration-300 pt-16 lg:pt-0", collapsed ? "lg:ml-20" : "lg:ml-64")}>
          <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </WorkspaceProvider>
  )
}
