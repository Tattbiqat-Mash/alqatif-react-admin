"use client"

import * as React from "react"
import { cn } from "cn"

import { usePageChrome } from "@/components/layout/page-chrome"
import { formatNumber } from "@/lib/format"

type PageHeaderProps = {
  title: string
  description?: string
  /** Total records, shown next to the title when known. */
  count?: number | null
  /** The page's main action(s), at the end of the row. */
  actions?: React.ReactNode
  className?: string
}

/**
 * On phones the title moves to the shell header (the <h1> stays for screen readers)
 * and a list's search and filter button take its place, beside the actions.
 */
export function PageHeader({ title, description, count, actions, className }: PageHeaderProps) {
  const { setTitle, setToolbar, toolbarInUse } = usePageChrome()

  React.useEffect(() => {
    setTitle(title)
    return () => setTitle(null)
  }, [title, setTitle])

  // Nothing left to show on a phone: take the row out of the flow (the <h1> stays readable).
  const visibleOnPhone = Boolean(description || actions || toolbarInUse)

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", !visibleOnPhone && "max-sm:sr-only", className)}>
      <div className={cn("flex min-w-0 flex-col gap-1", !description && "max-sm:sr-only")}>
        <h1 className="flex items-center gap-2 text-lg font-semibold text-foreground max-sm:sr-only">
          {title}
          {count != null && (
            <span className="rounded-full bg-neutral-muted px-2 py-0.5 text-xs font-medium text-neutral-ink">
              {formatNumber(count)}
            </span>
          )}
        </h1>
        {description && <p className="text-sm text-muted-text">{description}</p>}
      </div>
      {/* Phones: FiltersBar portals the search and filter button in here. */}
      <div ref={setToolbar} className="flex min-w-0 flex-1 items-center gap-2 empty:hidden sm:hidden" />
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
