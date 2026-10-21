"use client"

import * as React from "react"

/**
 * What a page hands to the shell on phones (below `sm`): its title, shown in the
 * header beside the menu button, and a toolbar slot in the page header where a
 * list's search and filter button sit beside the add button.
 */
type PageChrome = {
  title: string | null
  setTitle: (title: string | null) => void
  /** The slot element, rendered by `PageHeader`. */
  toolbar: HTMLElement | null
  setToolbar: (element: HTMLElement | null) => void
  /** True while a `FiltersBar` renders into the slot, so the page header row stays visible. */
  toolbarInUse: boolean
  setToolbarInUse: (inUse: boolean) => void
}

const noop = () => {}
const OUTSIDE_SHELL: PageChrome = {
  title: null,
  setTitle: noop,
  toolbar: null,
  setToolbar: noop,
  toolbarInUse: false,
  setToolbarInUse: noop,
}

const PageChromeContext = React.createContext<PageChrome>(OUTSIDE_SHELL)

export function PageChromeProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = React.useState<string | null>(null)
  const [toolbar, setToolbar] = React.useState<HTMLElement | null>(null)
  const [toolbarInUse, setToolbarInUse] = React.useState(false)
  const value = React.useMemo(
    () => ({ title, setTitle, toolbar, setToolbar, toolbarInUse, setToolbarInUse }),
    [title, toolbar, toolbarInUse],
  )
  return <PageChromeContext.Provider value={value}>{children}</PageChromeContext.Provider>
}

export function usePageChrome() {
  return React.useContext(PageChromeContext)
}
