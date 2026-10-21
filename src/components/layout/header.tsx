"use client"

import { MenuIcon } from "lucide-react"

import { usePageChrome } from "@/components/layout/page-chrome"
import { UserMenu } from "@/components/layout/user-menu"
import { Button } from "@/components/ui/button"

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { title } = usePageChrome()
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
      {/* Phones only: the page title moves up here. The page keeps its <h1> for screen readers. */}
      {title && (
        <p aria-hidden className="min-w-0 truncate text-lg font-semibold text-foreground sm:hidden">
          {title}
        </p>
      )}
      <div className="ms-auto">
        <UserMenu />
      </div>
    </header>
  )
}
