"use client"

import * as React from "react"

/** Desktop sidebar collapsed state, remembered in this browser. */
const STORAGE_KEY = "sidebar_collapsed"

const listeners = new Set<() => void>()

function read(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

function write(collapsed: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0")
  } catch {
    // Storage blocked — the state still applies until reload.
  }
  memory = collapsed
  for (const listener of listeners) listener()
}

let memory: boolean | undefined

function getSnapshot() {
  if (memory === undefined) memory = read()
  return memory
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Expanded on the server and during hydration; the stored value applies right after. */
export function useSidebarCollapsed() {
  const collapsed = React.useSyncExternalStore(subscribe, getSnapshot, () => false)
  const toggle = React.useCallback(() => write(!getSnapshot()), [])
  return { collapsed, toggle }
}
