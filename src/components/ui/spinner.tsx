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

function FullPageLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <Spinner className="size-8 text-primary" />
    </div>
  )
}

export { Spinner, FullPageLoader }
