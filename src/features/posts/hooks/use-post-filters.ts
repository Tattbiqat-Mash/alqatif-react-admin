"use client"

import { parseAsInteger, parseAsNumberLiteral, parseAsString, useQueryStates } from "nuqs"

import type { PostListFilters, PostStatus } from "@/features/posts/types/posts.types"
import { useRememberListUrl } from "@/lib/list-return"

const STATUS_VALUES = [0, 1, 2] as const satisfies readonly PostStatus[]

const parsers = {
  page: parseAsInteger.withDefault(1),
  q: parseAsString.withDefault(""),
  category: parseAsInteger,
  editor: parseAsInteger,
  writer: parseAsString.withDefault(""),
  status: parseAsNumberLiteral(STATUS_VALUES),
  pinned: parseAsNumberLiteral([0, 1] as const),
}

/** List filters in the URL (`?page=2&q=…&status=1&pinned=0`) so a view survives reload and can be shared. */
export function usePostFilters() {
  const [state, setState] = useQueryStates(parsers, { history: "replace" })
  useRememberListUrl()

  const filters: PostListFilters = {
    page: Math.max(1, state.page),
    search: state.q,
    categoryId: state.category,
    editorId: state.editor,
    writer: state.writer,
    status: state.status,
    pinned: state.pinned === null ? null : state.pinned === 1,
  }

  return {
    filters,
    hasActiveFilters: Boolean(state.q) || state.category !== null || state.editor !== null || Boolean(state.writer) || state.status !== null || state.pinned !== null,
    setPage: (page: number) => void setState({ page: page <= 1 ? null : page }, { history: "push" }),
    // Changing a filter returns to page 1.
    setSearch: (q: string) => void setState({ q: q || null, page: null }),
    setCategory: (category: number | null) => void setState({ category, page: null }),
    setEditor: (editor: number | null) => void setState({ editor, page: null }),
    setWriter: (writer: string) => void setState({ writer: writer || null, page: null }),
    setStatus: (status: PostStatus | null) => void setState({ status, page: null }),
    setPinned: (pinned: boolean | null) => void setState({ pinned: pinned === null ? null : pinned ? 1 : 0, page: null }),
    clear: () => void setState({ q: null, category: null, editor: null, writer: null, status: null, pinned: null, page: null }),
  }
}
