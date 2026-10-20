"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { cn } from "cn"

import { Header } from "@/components/layout/header"
import { DesktopSidebar, MobileSidebar } from "@/components/layout/sidebar"
import { useSidebarCollapsed } from "@/components/layout/use-sidebar-collapsed"

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { collapsed, toggle } = useSidebarCollapsed()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  // The page scrolls inside <main>, not the window, so Next.js no longer resets it on navigation.
  const pathname = usePathname()
  const mainRef = React.useRef<HTMLElement>(null)
  React.useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div data-admin-shell className="h-svh overflow-hidden bg-background">
      <DesktopSidebar collapsed={collapsed} onToggle={toggle} />
      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />

      <div
        className={cn(
          "flex h-full min-w-0 flex-col transition-[padding] duration-200 motion-reduce:transition-none",
          collapsed ? "lg:ps-20" : "lg:ps-64",
        )}
      >
        <Header onOpenMenu={() => setMobileOpen(true)} />
        <main ref={mainRef} className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
