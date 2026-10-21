"use client"

import * as React from "react"

/** Tailwind's `sm` breakpoint (40rem): below it is the phone layout. */
export const SM_UP = "(min-width: 40rem)"

/** Whether a CSS media query matches, kept in sync as the window resizes. False on the server. */
export function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    [query],
  )
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}
