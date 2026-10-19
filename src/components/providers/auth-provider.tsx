"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"

import { setAuthTokenGetter, setUnauthorizedHandler } from "@/lib/api/client"
import {
  clearSession,
  getSession,
  saveSession,
  subscribeSession,
} from "@/lib/auth/session-storage"
import type { Admin, AdminPermission, Session } from "@/features/auth/types/auth.types"

// Registered at module load, not in an effect: child effects run before parent ones,
// so the first queries would otherwise go out without the token.
setAuthTokenGetter(() => getSession()?.token ?? null)
// Any 401 ends the session. The admin guard (Task 03) then sends the user to
// /login?redirect=<current page>, and the provider below clears the query cache.
setUnauthorizedHandler(() => {
  if (getSession()) clearSession()
})

type AuthStatus = "loading" | "signed-in" | "signed-out"

type AuthContextValue = {
  status: AuthStatus
  admin: Admin | null
  /** `type=0` admins can do everything (⚠ TBD: confirm the API treats them that way). */
  can: (permission: AdminPermission) => boolean
  signIn: (session: Session, remember: boolean) => void
  signOut: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

/** On the server and during hydration the session is unknown ("loading"). */
const getServerSession = (): Session | null | undefined => undefined

/** `/login?redirect=%2Fcontent%2Fnews%3Fpage%3D2` */
export function loginUrl(redirectTo?: string | null) {
  return redirectTo && redirectTo !== "/" && !redirectTo.startsWith("/login")
    ? `/login?redirect=${encodeURIComponent(redirectTo)}`
    : "/login"
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const session = React.useSyncExternalStore<Session | null | undefined>(
    subscribeSession,
    getSession,
    getServerSession,
  )

  const status: AuthStatus =
    session === undefined ? "loading" : session ? "signed-in" : "signed-out"

  // Drop every cached response when the session ends (logout, 401, another tab).
  React.useEffect(() => {
    if (status === "signed-out") queryClient.clear()
  }, [status, queryClient])

  const value = React.useMemo<AuthContextValue>(() => {
    const admin = session?.admin ?? null
    return {
      status,
      admin,
      can: (permission) => admin !== null && (admin.type === 0 || admin.permissions[permission]),
      signIn: (next, remember) => {
        queryClient.clear()
        saveSession(next, remember)
      },
      signOut: () => {
        clearSession()
        router.replace("/login")
      },
    }
  }, [session, status, queryClient, router])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>")
  return context
}

export { AuthProvider, useAuth }
