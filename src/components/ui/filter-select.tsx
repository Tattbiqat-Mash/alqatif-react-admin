"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/** Radix Select cannot hold "", so "الكل" is this sentinel and maps to null. */
const ALL = "__all__"

type FilterSelectProps<V extends string | number> = {
  value: V | null
  onChange: (value: V | null) => void
  /** Label of the "no filter" option, e.g. "كل حالات النشر". */
  allLabel: string
  options: readonly { value: V; label: string }[]
  "aria-label": string
}

/** A list filter: "الكل" + options. Values round-trip through strings. */
export function FilterSelect<V extends string | number>({
  value,
  onChange,
  allLabel,
  options,
  "aria-label": ariaLabel,
}: FilterSelectProps<V>) {
  return (
    <Select
      value={value === null ? ALL : String(value)}
      onValueChange={(next) => {
        if (next === ALL) return onChange(null)
        const match = options.find((o) => String(o.value) === next)
        onChange(match ? match.value : null)
      }}
    >
      <SelectTrigger className="w-full" aria-label={ariaLabel}>
        <SelectValue placeholder={allLabel} />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={String(o.value)} value={String(o.value)}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
