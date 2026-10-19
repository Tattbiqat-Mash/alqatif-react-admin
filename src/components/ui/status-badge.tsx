import { cn } from "cn"

import type { EnumEntry, Tone } from "@/lib/labels"

const toneClasses: Record<Tone, string> = {
  success: "bg-success-muted text-success-ink",
  warning: "bg-warning-muted text-warning-ink",
  danger: "bg-danger-muted text-danger-ink",
  info: "bg-info-muted text-info-ink",
  neutral: "bg-neutral-muted text-neutral-ink",
}

type StatusBadgeProps = {
  /** An entry from a label map in `@/lib/labels`, e.g. `postStatus.get(post.active)`. */
  entry: EnumEntry | undefined
  className?: string
}

/** The only way to show a status. Unknown values render a neutral "—". */
function StatusBadge({ entry, className }: StatusBadgeProps) {
  return (
    <span
      data-slot="status-badge"
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        toneClasses[entry?.tone ?? "neutral"],
        className,
      )}
    >
      {entry?.label ?? "—"}
    </span>
  )
}

export { StatusBadge }
