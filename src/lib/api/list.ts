import { toArray, toNumber } from "@/lib/api/parse"

/**
 * The API's list envelope (confirmed from rules/api-samples/posts-list.json and
 * categories-list.json): `{ status, rowsCount, pagesCount, data: [] }` — `rowsCount` is
 * the number of rows in this page (40 for a full posts page), `pagesCount` the number of
 * pages. There is no total count.
 */
export type ListEnvelopeDto<T> = {
  status: "success"
  rowsCount?: number | string
  pagesCount?: number | string
  data?: T[]
}

/** Normalised shape every list screen consumes. */
export type ListResult<T> = {
  items: T[]
  /** 1-based, as shown in the URL. */
  page: number
  /** Null when the API sends no `pagesCount`. */
  pageCount: number | null
  hasNextPage: boolean
}

export function normalizeList<TDto, T>(
  raw: ListEnvelopeDto<TDto>,
  page: number,
  map: (dto: TDto) => T,
): ListResult<T> {
  const items = toArray<TDto>(raw?.data).map(map)
  const pagesCount = toNumber(raw?.pagesCount, Number.NaN)
  const pageCount = Number.isFinite(pagesCount) ? Math.max(1, pagesCount) : null
  const pageSize = toNumber(raw?.rowsCount, 0)
  return {
    items,
    page,
    pageCount,
    // Without pagesCount, a full page suggests there may be another one.
    hasNextPage: pageCount !== null ? page < pageCount : pageSize > 0 && items.length >= pageSize,
  }
}

/** URL pages are 1-based; the API's `page` starts at 0. */
export function toApiPage(urlPage: number): number {
  return Math.max(0, urlPage - 1)
}
