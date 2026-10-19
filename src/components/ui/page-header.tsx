import type * as React from "react"
import { cn } from "cn"

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

export function PageHeader({ title, description, count, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          {title}
          {count != null && (
            <span className="rounded-full bg-neutral-muted px-2 py-0.5 text-xs font-medium text-neutral-ink">
              {formatNumber(count)}
            </span>
          )}
        </h1>
        {description && <p className="text-sm text-muted-text">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
