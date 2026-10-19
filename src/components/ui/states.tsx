import type * as React from "react"
import { FileQuestionIcon, InboxIcon, RefreshCwIcon, ShieldOffIcon, TriangleAlertIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { messages } from "@/lib/messages"

type StateProps = {
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}

function StateLayout({
  icon,
  iconClassName,
  title,
  description,
  action,
  className,
}: StateProps & { icon: React.ReactNode; iconClassName: string; title: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-4 py-12 text-center",
        className,
      )}
    >
      <div className={cn("flex size-12 items-center justify-center rounded-full [&_svg]:size-6", iconClassName)}>
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">{title}</p>
        {description && <p className="max-w-md text-sm text-muted-text">{description}</p>}
      </div>
      {action}
    </div>
  )
}

function EmptyState({ title, description, action, className }: StateProps) {
  return (
    <StateLayout
      icon={<InboxIcon />}
      iconClassName="bg-neutral-muted text-neutral-ink"
      title={title ?? messages.states.emptyTitle}
      description={description}
      action={action}
      className={className}
    />
  )
}

function ErrorState({
  title,
  description,
  onRetry,
  className,
}: Omit<StateProps, "action"> & { onRetry?: () => void }) {
  return (
    <StateLayout
      icon={<TriangleAlertIcon />}
      iconClassName="bg-danger-muted text-danger-ink"
      title={title ?? messages.states.errorTitle}
      description={description}
      className={className}
      action={
        onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCwIcon data-icon="inline-start" />
            {messages.actions.retry}
          </Button>
        )
      }
    />
  )
}

function ForbiddenState({ className }: { className?: string }) {
  return (
    <StateLayout
      icon={<ShieldOffIcon />}
      iconClassName="bg-warning-muted text-warning-ink"
      title={messages.states.forbiddenTitle}
      description={messages.states.forbiddenDescription}
      className={className}
    />
  )
}

function NotFoundState({ action, className }: Pick<StateProps, "action" | "className">) {
  return (
    <StateLayout
      icon={<FileQuestionIcon />}
      iconClassName="bg-neutral-muted text-neutral-ink"
      title={messages.states.notFoundTitle}
      description={messages.states.notFoundDescription}
      action={action}
      className={className}
    />
  )
}

export { EmptyState, ErrorState, ForbiddenState, NotFoundState }
