import type * as React from "react"
import { CircleAlertIcon } from "lucide-react"
import { cn } from "cn"

import { Label } from "@/components/ui/label"

type FormFieldProps = {
  /** id of the control; the label, hint and error are linked to it. */
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  className?: string
  /** Receives the aria props to spread on the control. */
  children: (control: {
    id: string
    "aria-invalid": boolean
    "aria-describedby": string | undefined
  }) => React.ReactNode
}

/** Label on top, control, then hint or error (rules/design-system.md#components). */
function FormField({ id, label, required, hint, error, className, children }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && (
          <span aria-hidden className="text-danger">
            *
          </span>
        )}
      </Label>
      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": [errorId, hintId].filter(Boolean).join(" ") || undefined,
      })}
      {error ? (
        <p id={errorId} className="text-xs text-danger-ink">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-xs text-muted-text">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

/** Server-error banner shown above a form's fields. */
function FormErrorBanner({ message, className }: { message: string | null | undefined; className?: string }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-md bg-danger-muted px-3 py-2.5 text-sm text-danger-ink",
        className,
      )}
    >
      <CircleAlertIcon className="mt-0.5 size-4 shrink-0" />
      <p>{message}</p>
    </div>
  )
}

export { FormField, FormErrorBanner }
