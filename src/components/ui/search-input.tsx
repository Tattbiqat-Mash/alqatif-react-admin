"use client"

import * as React from "react"
import { SearchIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type SearchInputProps = {
  /** The committed value (usually from the URL). */
  value: string
  /** Called after typing pauses, and immediately on clear. */
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  debounceMs?: number
  className?: string
  "aria-label"?: string
  /** id of a <datalist> with suggestions (see SuggestionsList). */
  listId?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = "بحث…",
  maxLength = 100,
  debounceMs = 400,
  className,
  "aria-label": ariaLabel = "بحث",
  listId,
}: SearchInputProps) {
  const [draft, setDraft] = React.useState(value)
  const [committed, setCommitted] = React.useState(value)

  // The value changed from outside (e.g. "مسح الفلاتر"): adopt it.
  if (value !== committed) {
    setCommitted(value)
    setDraft(value)
  }

  const onChangeRef = React.useRef(onChange)
  React.useEffect(() => {
    onChangeRef.current = onChange
  })

  React.useEffect(() => {
    if (draft === committed) return
    const timer = window.setTimeout(() => onChangeRef.current(draft.trim()), debounceMs)
    return () => window.clearTimeout(timer)
  }, [draft, committed, debounceMs])

  return (
    <Input
      type="search"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onChange(draft.trim())
      }}
      placeholder={placeholder}
      maxLength={maxLength}
      aria-label={ariaLabel}
      list={listId}
      autoComplete={listId ? "off" : undefined}
      // Our own clear button replaces the browser's.
      className={cn("[&::-webkit-search-cancel-button]:appearance-none", className)}
      startIcon={<SearchIcon />}
      endAdornment={
        draft && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="مسح البحث"
            onClick={() => {
              setDraft("")
              onChange("")
            }}
          >
            <XIcon />
          </Button>
        )
      }
    />
  )
}
