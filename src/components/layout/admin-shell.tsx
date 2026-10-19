"use client"

import * as React from "react"
import { cn } from "cn"

import { Header } from "@/components/layout/header"
import { DesktopSidebar, MobileSidebar } from "@/components/layout/sidebar"
import { useSidebarCollapsed } from "@/components/layout/use-sidebar-collapsed"

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { collapsed, toggle } = useSidebarCollapsed()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <div className="min-h-svh bg-background">
      <DesktopSidebar collapsed={collapsed} onToggle={toggle} />
      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />

      <div
        className={cn(
          "flex min-h-svh min-w-0 flex-col transition-[padding] duration-200 motion-reduce:transition-none",
          collapsed ? "lg:ps-20" : "lg:ps-64",
        )}
      >
        <Header onOpenMenu={() => setMobileOpen(true)} />
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
