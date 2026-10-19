"use client"

import type * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { FetchingBar } from "@/components/ui/fetching-bar"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { formatNumber } from "@/lib/format"

export type DataTableColumn<T> = {
  id: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  /** Applied to both the header and the cells of this column. */
  className?: string
}

export type DataTablePagination = {
  /** 1-based. */
  page: number
  /** Known page count, or null when the API only tells whether there is a next page. */
  pageCount: number | null
  hasNextPage: boolean
  onPageChange: (page: number) => void
}

type DataTableProps<T> = {
  columns: DataTableColumn<T>[]
  data: T[] | undefined
  getRowId: (row: T) => string | number
  isLoading?: boolean
  isFetching?: boolean
  isError?: boolean
  errorMessage?: string
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  pagination?: DataTablePagination
  skeletonRows?: number
}

/** The one table every list screen uses (rules/tables-and-forms.md#datatable). */
export function DataTable<T>({
  columns,
  data,
  getRowId,
  isLoading = false,
  isFetching = false,
  isError = false,
  errorMessage,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyAction,
  pagination,
  skeletonRows = 8,
}: DataTableProps<T>) {
  const rows = data ?? []
  const showSkeleton = isLoading && rows.length === 0
  const showError = isError && rows.length === 0
  const showEmpty = !showSkeleton && !showError && rows.length === 0

  return (
    <div className="relative">
      <FetchingBar active={isFetching && !isLoading && !isError} />

      {showError ? (
        <ErrorState description={errorMessage} onRetry={onRetry} />
      ) : showEmpty ? (
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted">
                {columns.map((column) => (
                  <th
                    key={column.id}
                    scope="col"
                    className={cn(
                      "h-11 px-4 text-start align-middle text-xs font-medium whitespace-nowrap text-muted-text",
                      column.className,
                    )}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody aria-busy={isFetching || undefined}>
              {showSkeleton
                ? Array.from({ length: skeletonRows }, (_, i) => (
                    <tr key={i} className="border-b border-border last:border-b-0">
                      {columns.map((column) => (
                        <td key={column.id} className={cn("px-4 py-4", column.className)}>
                          <Skeleton className="h-4 w-full max-w-40" />
                        </td>
                      ))}
                    </tr>
                  ))
                : rows.map((row) => (
                    <tr
                      key={getRowId(row)}
                      className="border-b border-border transition-colors last:border-b-0 hover:bg-surface-muted"
                    >
                      {columns.map((column) => (
                        <td key={column.id} className={cn("px-4 py-3 align-middle", column.className)}>
                          {column.cell(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && !showError && (rows.length > 0 || pagination.page > 1) && (
        <Pagination {...pagination} disabled={isFetching} />
      )}
    </div>
  )
}

function Pagination({
  page,
  pageCount,
  hasNextPage,
  onPageChange,
  disabled,
}: DataTablePagination & { disabled: boolean }) {
  const canNext = pageCount !== null ? page < pageCount : hasNextPage
  return (
    <nav
      aria-label="التنقل بين الصفحات"
      className="flex items-center justify-between gap-3 border-t border-border px-4 py-3"
    >
      <p className="text-sm text-muted-text">
        صفحة {formatNumber(page)}
        {pageCount !== null && <> من {formatNumber(pageCount)}</>}
      </p>
      <div className="flex items-center gap-2">
        {/* RTL: "previous" points right, "next" points left. */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
        >
          <ChevronRightIcon data-icon="inline-start" />
          السابق
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || !canNext}
        >
          التالي
          <ChevronLeftIcon data-icon="inline-end" />
        </Button>
      </div>
    </nav>
  )
}
