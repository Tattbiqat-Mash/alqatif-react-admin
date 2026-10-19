"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { loginUrl, useAuth } from "@/components/providers/auth-provider"
import { FullPageLoader } from "@/components/ui/spinner"

/**
 * Renders the admin area only for a signed-in admin. Signed out (never signed in,
 * logout, 401, expired token) → /login?redirect=<this page>.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { status } = useAuth()

  React.useEffect(() => {
    if (status !== "signed-out") return
    // Read the URL here rather than with usePathname(): see rules/auth-and-permissions.md.
    const { pathname, search } = window.location
    router.replace(loginUrl(pathname + search))
  }, [status, router])

  if (status !== "signed-in") return <FullPageLoader />
  return children
}
