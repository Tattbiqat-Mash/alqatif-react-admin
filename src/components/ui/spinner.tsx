import Image from "next/image"
import { Loader2Icon } from "lucide-react"
import { cn } from "cn"

function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <Loader2Icon
      role="status"
      aria-label={label ?? "جاري التحميل"}
      className={cn("size-4 animate-spin motion-reduce:animate-none", className)}
    />
  )
}

/**
 * While the session is read (first open, reload): the login page's brand mark and an
 * indeterminate bar, so the wait looks like the app rather than a blank screen.
 */
function FullPageLoader() {
  return (
    <div
      role="status"
      className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background px-4 duration-300 animate-in fade-in motion-reduce:animate-none"
    >
      <div className="rounded-xl bg-sidebar p-2 shadow-sm">
        <Image src="/logo.jpeg" alt="" width={56} height={56} priority className="rounded-md" />
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-base font-semibold text-foreground">القطيف اليوم</p>
        <p className="text-sm text-muted-text">لوحة التحكم</p>
      </div>
      <div aria-hidden className="h-1 w-40 overflow-hidden rounded-full bg-border">
        <div className="h-full w-1/3 animate-fetching-bar rounded-full bg-primary motion-reduce:w-full motion-reduce:animate-none" />
      </div>
      <span className="sr-only">جاري التحميل…</span>
    </div>
  )
}

export { Spinner, FullPageLoader }
