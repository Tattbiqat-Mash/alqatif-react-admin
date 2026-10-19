"use client"

import { parseAsInteger, parseAsNumberLiteral, parseAsString, useQueryStates } from "nuqs"

import type { EditorListFilters } from "@/features/editors/api/editors.api"

const parsers = {
  page: parseAsInteger.withDefault(1),
  q: parseAsString.withDefault(""),
  type: parseAsNumberLiteral([0, 1] as const),
  active: parseAsNumberLiteral([0, 1] as const),
}

export function useEditorFilters() {
  const [state, setState] = useQueryStates(parsers, { history: "replace" })
  const filters: EditorListFilters = {
    page: Math.max(1, state.page),
    search: state.q,
    type: state.type,
    active: state.active === null ? null : state.active === 1,
  }
  return {
    filters,
    hasActiveFilters: Boolean(state.q) || state.type !== null || state.active !== null,
    setPage: (page: number) => void setState({ page: page <= 1 ? null : page }, { history: "push" }),
    setSearch: (q: string) => void setState({ q: q || null, page: null }),
    setType: (type: 0 | 1 | null) => void setState({ type, page: null }),
    setActive: (active: 0 | 1 | null) => void setState({ active, page: null }),
    clear: () => void setState({ q: null, type: null, active: null, page: null }),
  }
}
