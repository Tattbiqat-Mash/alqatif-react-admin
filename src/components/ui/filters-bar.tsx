"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { SlidersHorizontalIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import { usePageChrome } from "@/components/layout/page-chrome"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { messages } from "@/lib/messages"
import { SM_UP, useMediaQuery } from "@/lib/use-media-query"

type FiltersBarProps = {
  /** The search field: always in the bar, on phones too. */
  search?: React.ReactNode
  /** The other filters (`FilterItem`s): inline from `sm`, in a dialog behind a button below it. */
  children?: React.ReactNode
  /** How many of `children` are set — shown on the phone button. */
  activeCount?: number
  /** Stays in the bar on phones too, e.g. a chip for a filter set from another page. */
  extra?: React.ReactNode
  /** Shows "مسح الفلاتر" when any filter (search included) is set. */
  hasActiveFilters?: boolean
  onClear?: () => void
  className?: string
}

/**
 * Filter controls above a table. From `sm` they sit in one wrapping row. On phones
 * the search and a "الفلاتر" button (opening a dialog with the rest) move up into the
 * page header, beside the add button (see PageHeader). The filters are rendered once
 * (in one place or the other), so ids and debounces are not doubled.
 */
export function FiltersBar({ search, children, activeCount = 0, extra, hasActiveFilters, onClear, className }: FiltersBarProps) {
  const inline = useMediaQuery(SM_UP)
  const { toolbar, setToolbarInUse } = usePageChrome()
  const canClear = Boolean(hasActiveFilters && onClear)

  React.useEffect(() => {
    if (inline) return
    setToolbarInUse(true)
    return () => setToolbarInUse(false)
  }, [inline, setToolbarInUse])

  if (inline) {
    return (
      <div className={cn("flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:flex-wrap sm:items-center", className)}>
        {search && <FilterItem className="sm:w-72">{search}</FilterItem>}
        {children}
        {extra}
        {canClear && (
          <Button variant="link" size="sm" onClick={onClear} className="self-start sm:self-center">
            <XIcon data-icon="inline-start" />
            {messages.actions.clearFilters}
          </Button>
        )}
      </div>
    )
  }

  const controls = (
    <>
      {search && <div className="min-w-0 flex-1">{search}</div>}
      {children && (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative"
              aria-label={activeCount > 0 ? `الفلاتر (${activeCount} مفعّل)` : "الفلاتر"}
            >
              <SlidersHorizontalIcon />
              {activeCount > 0 && (
                <span
                  aria-hidden
                  className="absolute -end-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[0.7rem] font-semibold text-primary-foreground"
                >
                  {activeCount}
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>الفلاتر</DialogTitle>
              <DialogDescription className="sr-only">تُطبَّق الفلاتر على القائمة فور اختيارها.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">{children}</div>
            <DialogFooter>
              {canClear && (
                <Button variant="outline" onClick={onClear}>
                  <XIcon data-icon="inline-start" />
                  {messages.actions.clearFilters}
                </Button>
              )}
              <DialogClose asChild>
                <Button>{messages.actions.done}</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )

  return (
    <>
      {/* Without a PageHeader slot (not rendered yet, or none on the page) the controls stay in the card. */}
      {toolbar ? createPortal(controls, toolbar) : <div className={cn("flex items-center gap-2 border-b border-border p-4", className)}>{controls}</div>}
      {extra && <div className={cn("flex border-b border-border p-4", className)}>{extra}</div>}
    </>
  )
}

/** Width wrapper for one filter control. */
export function FilterItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("w-full sm:w-52", className)}>{children}</div>
}

/** Number of set filters, for `activeCount` (null, undefined and "" are unset). */
export function countActive(...values: unknown[]): number {
  return values.filter((value) => value !== null && value !== undefined && value !== "").length
}
