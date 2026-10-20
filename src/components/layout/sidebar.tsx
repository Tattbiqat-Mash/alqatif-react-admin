"use client"

import Image from "next/image"
import Link from "next/link"
import { PanelRightCloseIcon, PanelRightOpenIcon } from "lucide-react"
import { cn } from "cn"

import { SidebarNav } from "@/components/layout/sidebar-nav"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const BRAND = "القطيف اليوم"

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link
      href="/dashboard"
      className="flex min-w-0 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      aria-label={collapsed ? BRAND : undefined}
    >
      <Image
        src="/logo.jpeg"
        alt=""
        width={40}
        height={40}
        className="size-10 shrink-0 rounded-md"
        priority
      />
      {!collapsed && (
        <span className="truncate text-base font-semibold text-sidebar-accent-foreground">{BRAND}</span>
      )}
    </Link>
  )
}

function CollapseButton({ onToggle }: { onToggle: () => void }) {
  const label = "طي القائمة"
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onToggle}
          aria-label={label}
          aria-expanded
          className="flex size-9 shrink-0 items-center justify-center rounded-md text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring [&_svg]:size-5"
        >
          <PanelRightCloseIcon aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

/** Collapsed sidebar: the logo itself expands it, and turns into the expand icon on hover/focus. */
function ExpandLogoButton({ onToggle }: { onToggle: () => void }) {
  const label = "توسيع القائمة"
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onToggle}
          aria-label={label}
          aria-expanded={false}
          className="group/expand relative flex size-10 shrink-0 items-center justify-center rounded-md text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <Image
            src="/logo.jpeg"
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-md transition-opacity group-hover/expand:opacity-0 group-focus-visible/expand:opacity-0 motion-reduce:transition-none"
            priority
          />
          <PanelRightOpenIcon
            aria-hidden
            className="absolute size-5 opacity-0 transition-opacity group-hover/expand:opacity-100 group-focus-visible/expand:opacity-100 motion-reduce:transition-none"
          />
        </button>
      </TooltipTrigger>
      <TooltipContent side="left" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

/** Desktop sidebar (lg and up), fixed on the inline-start side — the right in RTL. */
export function DesktopSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 start-0 z-30 hidden flex-col border-e border-sidebar-border bg-sidebar transition-[width] duration-200 motion-reduce:transition-none lg:flex",
        collapsed ? "w-20" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-3",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {collapsed ? (
          <ExpandLogoButton onToggle={onToggle} />
        ) : (
          <>
            <Brand collapsed={false} />
            <CollapseButton onToggle={onToggle} />
          </>
        )}
      </div>
      <SidebarNav collapsed={collapsed} />
    </aside>
  )
}

/** Below lg: the same menu in a drawer, always expanded. */
export function MobileSidebar({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-72 gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground sm:max-w-72 [&>[data-slot=sheet-close]]:text-sidebar-foreground"
      >
        <SheetTitle className="sr-only">القائمة الرئيسية</SheetTitle>
        <SheetDescription className="sr-only">روابط أقسام لوحة التحكم</SheetDescription>
        <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-4">
          <Brand collapsed={false} />
        </div>
        <SidebarNav collapsed={false} onNavigate={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  )
}
