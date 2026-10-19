"use client"

import * as React from "react"
import Link from "next/link"
import { ExternalLinkIcon, PencilIcon, ToggleRightIcon, Trash2Icon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { FilterItem, FiltersBar } from "@/components/ui/filters-bar"
import { FilterSelect } from "@/components/ui/filter-select"
import { IconAction } from "@/components/ui/icon-action"
import { PageHeader } from "@/components/ui/page-header"
import { SearchInput } from "@/components/ui/search-input"
import { ForbiddenState } from "@/components/ui/states"
import { StatusBadge } from "@/components/ui/status-badge"
import { publicPostUrl } from "@/config/content-types"
import type { CommentItem } from "@/features/comments/api/comments.api"
import { useCommentFilters, useCommentsList, useDeleteComment, useToggleComment } from "@/features/comments/hooks/use-comments"
import { formatDateTime } from "@/lib/format"
import { commentStatus } from "@/lib/labels"
import { messages } from "@/lib/messages"

function CommentRowActions({ comment }: { comment: CommentItem }) {
  const toggle = useToggleComment()
  const remove = useDeleteComment()
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const short = comment.text.length > 60 ? `${comment.text.slice(0, 60)}…` : comment.text

  return (
    <div className="flex items-center gap-0.5">
      <IconAction label={messages.actions.edit}>
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={`/comments/${comment.id}/edit`} aria-label={`${messages.actions.edit}: ${short}`}>
            <PencilIcon />
          </Link>
        </Button>
      </IconAction>
      <IconAction label={comment.active ? "إيقاف" : "نشر"}>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={comment.active ? "إيقاف التعليق" : "نشر التعليق"}
          disabled={toggle.isPending}
          onClick={() => toggle.mutate({ id: comment.id })}
        >
          <ToggleRightIcon />
        </Button>
      </IconAction>
      <IconAction label={messages.actions.delete}>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-danger-ink hover:bg-danger-muted hover:text-danger-ink"
          aria-label={`${messages.actions.delete}: ${short}`}
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2Icon />
        </Button>
      </IconAction>
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={messages.confirm.deleteTitle}
        description={messages.confirm.deleteDescription(short || `التعليق رقم ${comment.id}`)}
        confirmLabel={messages.actions.delete}
        destructive
        pending={remove.isPending}
        onConfirm={() => remove.mutate({ id: comment.id }, { onSettled: () => setConfirmDelete(false) })}
      />
    </div>
  )
}

const columns: DataTableColumn<CommentItem>[] = [
  { id: "id", header: "م", className: "w-20", cell: (c) => <span className="text-xs text-muted-text tabular-nums">{c.id}</span> },
  {
    id: "text",
    header: "التعليق / الخبر / التاريخ",
    className: "min-w-80",
    cell: (c) => (
      <div className="flex flex-col gap-1">
        <Link href={`/comments/${c.id}/edit`} title={c.text} className="line-clamp-2 font-medium text-foreground hover:text-primary-ink hover:underline" dir="auto">
          {c.text || "—"}
        </Link>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-text">
          {c.date && <bdi dir="ltr">{formatDateTime(c.date)}</bdi>}
          {c.date && (c.postTitle || c.postId) && <span aria-hidden>·</span>}
          {/* The post's content type is unknown here, so it opens on the public site. */}
          {c.postId ? (
            <a href={publicPostUrl(c.postId)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary-ink hover:underline">
              <span className="line-clamp-1">{c.postTitle || `الخبر رقم ${c.postId}`}</span>
              <ExternalLinkIcon className="size-3 shrink-0" aria-hidden />
            </a>
          ) : (
            c.postTitle && <span className="text-primary-ink">{c.postTitle}</span>
          )}
        </div>
      </div>
    ),
  },
  { id: "user", header: "المستخدم", className: "w-44", cell: (c) => <span className="line-clamp-2">{c.user || "—"}</span> },
  { id: "status", header: "الحالة", className: "w-28", cell: (c) => <StatusBadge entry={commentStatus.get(c.active ? 1 : 0)} /> },
  { id: "actions", header: "التحكم", className: "w-36", cell: (c) => <CommentRowActions comment={c} /> },
]

export function CommentsScreen() {
  const { filters, hasActiveFilters, setPage, setSearch, setActive, clearPost, clear } = useCommentFilters()
  const list = useCommentsList(filters)

  if (list.error?.statusCode === 403) {
    return (
      <Card>
        <ForbiddenState />
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader title="التعليقات" />
      <Card className="gap-0 py-0">
        <FiltersBar hasActiveFilters={hasActiveFilters} onClear={clear}>
          <FilterItem className="sm:w-72">
            <SearchInput value={filters.search} onChange={setSearch} placeholder="بحث في التعليقات…" />
          </FilterItem>
          <FilterItem>
            <FilterSelect<0 | 1>
              aria-label="حالة النشر"
              allLabel="كل الحالات"
              value={filters.active === null ? null : filters.active ? 1 : 0}
              onChange={setActive}
              options={commentStatus.options as { value: 0 | 1; label: string }[]}
            />
          </FilterItem>
          {filters.postId !== null && (
            <span className="inline-flex h-8 items-center gap-1 self-start rounded-full bg-primary-muted ps-3 text-xs font-medium text-primary-ink sm:self-center">
              تعليقات الخبر رقم {filters.postId}
              <Button type="button" variant="ghost" size="icon-xs" aria-label="إلغاء تصفية الخبر" onClick={clearPost}>
                <XIcon />
              </Button>
            </span>
          )}
        </FiltersBar>
        <DataTable
          columns={columns}
          data={list.data?.items}
          getRowId={(c) => c.id}
          isLoading={list.isPending}
          isFetching={list.isFetching}
          isError={list.isError}
          errorMessage={list.error?.message}
          onRetry={() => void list.refetch()}
          emptyTitle={hasActiveFilters ? "لا توجد نتائج" : "لا توجد تعليقات"}
          pagination={{
            page: filters.page,
            pageCount: list.data?.pageCount ?? null,
            hasNextPage: list.data?.hasNextPage ?? false,
            onPageChange: setPage,
          }}
        />
      </Card>
    </div>
  )
}
