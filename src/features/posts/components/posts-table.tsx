"use client"

import Link from "next/link"
import { EyeIcon } from "lucide-react"
import { cn } from "cn"

import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { contentEditHref, type ContentTypeConfig } from "@/config/content-types"
import { PostRowActions } from "@/features/posts/components/post-row-actions"
import type { PostListItem } from "@/features/posts/types/posts.types"
import { formatDateTime, formatNumber } from "@/lib/format"
import { pinned as pinnedLabels, postStatus } from "@/lib/labels"

function columns(content: ContentTypeConfig): DataTableColumn<PostListItem>[] {
  // Short-text sections (jobs, thanks, lost & found): the title is the whole post.
  const shortText = content.type === 3
  return [
    {
      id: "id",
      header: "م",
      className: "w-20",
      cell: (post) => <span className="text-xs text-muted-text tabular-nums">{post.id}</span>,
    },
    {
      id: "title",
      header: "العنوان / التصنيف / التاريخ",
      className: "min-w-80",
      cell: (post) => (
        <div className="flex flex-col gap-1">
          <Link
            href={contentEditHref(content.slug, post.id)}
            title={post.title}
            className={cn(
              "font-medium text-foreground underline-offset-4 hover:text-primary-ink hover:underline",
              shortText ? "line-clamp-3" : "line-clamp-2",
            )}
          >
            {post.title}
          </Link>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-text">
            {post.category && <span className="text-primary-ink">{post.category}</span>}
            {post.category && <span aria-hidden>·</span>}
            <bdi dir="ltr">{formatDateTime(post.publishedAt)}</bdi>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <EyeIcon aria-hidden className="size-3.5" />
              {formatNumber(post.views)}
              <span className="sr-only">مشاهدة</span>
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "editor",
      header: "المحرر",
      className: "w-32",
      cell: (post) => <span className="text-sm">{post.editor || "—"}</span>,
    },
    {
      id: "writer",
      header: "الكاتب",
      className: "w-44",
      cell: (post) => <span className="line-clamp-2 text-sm">{post.writer || "—"}</span>,
    },
    {
      id: "status",
      header: "الحالة",
      className: "w-28",
      cell: (post) => <StatusBadge entry={postStatus.get(post.status)} />,
    },
    {
      id: "pinned",
      header: "مثبت",
      className: "w-24",
      cell: (post) => <StatusBadge entry={pinnedLabels.get(post.pinned ? 1 : 0)} />,
    },
    {
      id: "actions",
      header: "التحكم",
      className: "w-56",
      cell: (post) => <PostRowActions post={post} content={content} />,
    },
  ]
}

type PostsTableProps = {
  content: ContentTypeConfig
  items: PostListItem[] | undefined
  page: number
  pageCount: number | null
  hasNextPage: boolean
  onPageChange: (page: number) => void
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  errorMessage?: string
  onRetry: () => void
  filtered: boolean
}

export function PostsTable({ content, items, filtered, ...state }: PostsTableProps) {
  return (
    <DataTable
      columns={columns(content)}
      data={items}
      getRowId={(post) => post.id}
      isLoading={state.isLoading}
      isFetching={state.isFetching}
      isError={state.isError}
      errorMessage={state.errorMessage}
      onRetry={state.onRetry}
      emptyTitle={filtered ? "لا توجد نتائج" : `لا توجد ${content.title}`}
      emptyDescription={filtered ? "جرّب تغيير البحث أو الفلاتر." : undefined}
      pagination={{
        page: state.page,
        pageCount: state.pageCount,
        hasNextPage: state.hasNextPage,
        onPageChange: state.onPageChange,
      }}
    />
  )
}
