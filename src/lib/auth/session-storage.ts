import type { Session } from "@/features/auth/types/auth.types"

/**
 * The only module that touches the session in Web Storage
 * (rules/auth-and-permissions.md#session-storage).
 *
 * - "تذكرني" checked → localStorage (survives closing the browser)
 * - otherwise        → sessionStorage (this tab only)
 *
 * It doubles as an external store for `useSyncExternalStore`: `getSession` returns a
 * cached object so the snapshot is stable between renders.
 */
const STORAGE_KEY = "qatif_admin_session"

type Listener = () => void
const listeners = new Set<Listener>()

/** `undefined` = not read from storage yet. */
let cache: Session | null | undefined

function safeGet(storage: () => Storage): string | null {
  try {
    return storage().getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function safeRemove(storage: () => Storage) {
  try {
    storage().removeItem(STORAGE_KEY)
  } catch {
    // Storage blocked (private mode, disabled site data) — nothing to remove.
  }
}

function isSession(value: unknown): value is Session {
  if (typeof value !== "object" || value === null) return false
  const v = value as Partial<Session>
  return (
    typeof v.token === "string" &&
    v.token !== "" &&
    typeof v.admin === "object" &&
    v.admin !== null &&
    (typeof v.expiresAt === "number" || v.expiresAt === null)
  )
}

function parse(raw: string | null): Session | null {
  if (!raw) return null
  try {
    const value: unknown = JSON.parse(raw)
    return isSession(value) ? value : null
  } catch {
    return null
  }
}

function isExpired(session: Session): boolean {
  return session.expiresAt !== null && Date.now() >= session.expiresAt
}

function emit() {
  for (const listener of listeners) listener()
}

function readFromStorage(): Session | null {
  const session =
    parse(safeGet(() => window.localStorage)) ?? parse(safeGet(() => window.sessionStorage))
  if (session && isExpired(session)) {
    safeRemove(() => window.localStorage)
    safeRemove(() => window.sessionStorage)
    return null
  }
  return session
}

export function getSession(): Session | null {
  if (cache === undefined) cache = readFromStorage()
  // An expired token counts as signed out even if it is still cached. No emit here:
  // this runs during render (useSyncExternalStore snapshot).
  if (cache && isExpired(cache)) {
    safeRemove(() => window.localStorage)
    safeRemove(() => window.sessionStorage)
    cache = null
  }
  return cache ?? null
}

/** Returns false when storage is unavailable; the session then lasts until reload. */
export function saveSession(session: Session, remember: boolean): boolean {
  safeRemove(() => window.localStorage)
  safeRemove(() => window.sessionStorage)
  cache = session
  let persisted = true
  try {
    ;(remember ? window.localStorage : window.sessionStorage).setItem(
      STORAGE_KEY,
      JSON.stringify(session),
    )
  } catch {
    persisted = false
  }
  emit()
  return persisted
}

export function clearSession() {
  safeRemove(() => window.localStorage)
  safeRemove(() => window.sessionStorage)
  cache = null
  emit()
}

export function subscribeSession(listener: Listener): () => void {
  listeners.add(listener)

  // Another tab signed in or out ("تذكرني" sessions live in localStorage).
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return
    cache = readFromStorage()
    listener()
  }
  window.addEventListener("storage", onStorage)

  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

/** Updates the signed-in admin's profile (e.g. after they edit their own account). */
export function updateSessionAdmin(patch: Partial<Session["admin"]>) {
  const current = getSession()
  if (!current) return
  const next: Session = { ...current, admin: { ...current.admin, ...patch } }
  // Keep the storage the session already lives in ("تذكرني" or not).
  let remembered = false
  try {
    remembered = window.localStorage.getItem(STORAGE_KEY) !== null
  } catch {
    // Storage blocked — fall back to this tab only.
  }
  saveSession(next, remembered)
}
