import type * as React from "react"

import { AdminShell } from "@/components/layout/admin-shell"
import { AuthGuard } from "@/components/layout/auth-guard"

/**
 * The session lives in the browser, so on the server AuthGuard always renders its
 * loader instead of the page. Instant-navigation validation would then report every
 * admin page as a "dropped segment"; the admin area opts out of it (the pages load
 * their data client-side anyway). See rules/architecture.md#nextjs-16-notes.
 */
export const instant = false

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  )
}
