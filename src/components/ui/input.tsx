import * as React from "react"
import { cn } from "cn"

/** Field types whose value is always left-to-right, even in the Arabic UI. */
const LTR_TYPES = new Set(["email", "password", "url", "tel"])

type InputProps = React.ComponentProps<"input"> & {
  /** Icon at the inline start of the field (the right side in RTL). */
  startIcon?: React.ReactNode
  /** Icon or button at the inline end of the field. */
  endAdornment?: React.ReactNode
}

function Input({
  className,
  type,
  dir,
  startIcon,
  endAdornment,
  ...props
}: InputProps) {
  const fieldDir = dir ?? (type && LTR_TYPES.has(type) ? "ltr" : undefined)

  const input = (
    <input
      type={type}
      dir={fieldDir}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-input bg-surface px-3 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-subtle-text focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 read-only:bg-surface-muted md:text-sm",
        startIcon && "ps-9",
        endAdornment && "pe-10",
        className
      )}
      {...props}
    />
  )

  if (!startIcon && !endAdornment) return input

  // The wrapper takes the field's direction so `ps-`/`pe-` on the input and
  // `start-`/`end-` on the icons resolve to the same side.
  return (
    <div dir={fieldDir} className="relative w-full">
      {startIcon && (
        <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-subtle-text [&_svg]:size-4">
          {startIcon}
        </span>
      )}
      {input}
      {endAdornment && (
        <span className="absolute inset-y-0 end-1 flex items-center text-muted-text [&_svg]:size-4">
          {endAdornment}
        </span>
      )}
    </div>
  )
}

export { Input }
export type { InputProps }
