import { cn } from "cn"

/**
 * Thin top progress bar while data already on screen is being refreshed.
 * The parent must be `relative overflow-hidden`.
 */
export function FetchingBar({ active, className }: { active: boolean; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden transition-opacity",
        active ? "opacity-100" : "opacity-0",
        className,
      )}
    >
      {active && <div className="h-full w-1/3 animate-fetching-bar bg-primary motion-reduce:animate-none" />}
    </div>
  )
}
