"use client"

import { MenuIcon } from "lucide-react"

import { UserMenu } from "@/components/layout/user-menu"
import { Button } from "@/components/ui/button"

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-surface px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMenu}
        aria-label="فتح القائمة"
      >
        <MenuIcon />
      </Button>
      {/* The page title lives in each page's header, not here. */}
      <div className="ms-auto">
        <UserMenu />
      </div>
    </header>
  )
}
