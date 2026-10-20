"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"

/**
 * A list's search, filters and page live in its URL query (nuqs). The list remembers its last
 * URL here, so its create / edit pages return to the same view (after save, "العودة للقائمة",
 * "إلغاء") instead of the bare list. sessionStorage: per tab, and it survives reloading the
 * edit page; the in-memory copy covers browsers where storage throws.
 */
const STORAGE_PREFIX = "list-return:"
const memory = new Map<string, string>()

function read(path: string): string | null {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_PREFIX + path)
    if (stored !== null) return stored
  } catch {
    // Storage blocked: fall back to memory.
  }
  return memory.get(path) ?? null
}

function write(path: string, href: string) {
  memory.set(path, href)
  try {
    window.sessionStorage.setItem(STORAGE_PREFIX + path, href)
  } catch {
    // Storage blocked: memory only.
  }
}

/** Call in a list's filters hook: keeps the list's current URL (path + query). */
export function useRememberListUrl() {
  const pathname = usePathname()
  const query = useSearchParams().toString()
  React.useEffect(() => {
    write(pathname, query ? `${pathname}?${query}` : pathname)
  }, [pathname, query])
}

/** The list's last remembered URL, or the bare `path`. For navigation in event handlers. */
export function listReturnHref(path: string): string {
  if (typeof window === "undefined") return path
  return read(path) ?? path
}

const subscribe = () => () => {}

/** `listReturnHref` for rendering (e.g. a Link): the server and hydration render use the bare path. */
export function useListReturnHref(path: string): string {
  return React.useSyncExternalStore(
    subscribe,
    () => listReturnHref(path),
    () => path,
  )
}
