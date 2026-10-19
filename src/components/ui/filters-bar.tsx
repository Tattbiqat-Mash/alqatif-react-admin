import type * as React from "react"
import { XIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { messages } from "@/lib/messages"

type FiltersBarProps = {
  children: React.ReactNode
  /** Shows "مسح الفلاتر" when any filter is set. */
  hasActiveFilters?: boolean
  onClear?: () => void
  className?: string
}

/** Filter controls above a table; wraps to one column on mobile. */
export function FiltersBar({ children, hasActiveFilters, onClear, className }: FiltersBarProps) {
  return (
    <div className={cn("flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:flex-wrap sm:items-center", className)}>
      {children}
      {hasActiveFilters && onClear && (
        <Button variant="link" size="sm" onClick={onClear} className="self-start sm:self-center">
          <XIcon data-icon="inline-start" />
          {messages.actions.clearFilters}
        </Button>
      )}
    </div>
  )
}

/** Width wrapper for one filter control. */
export function FilterItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("w-full sm:w-52", className)}>{children}</div>
}
