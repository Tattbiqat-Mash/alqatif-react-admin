"use client"

import * as React from "react"
import Link from "next/link"
import { NewspaperIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { AddButton } from "@/components/ui/add-button"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { countActive, FilterItem, FiltersBar } from "@/components/ui/filters-bar"
import { FilterSelect } from "@/components/ui/filter-select"
import { PageHeader } from "@/components/ui/page-header"
import { SearchInput } from "@/components/ui/search-input"
import { ForbiddenState } from "@/components/ui/states"
import { StatusBadge } from "@/components/ui/status-badge"
import { IconAction } from "@/components/ui/icon-action"
import { contentHref } from "@/config/content-types"
import type { EditorListItem } from "@/features/editors/api/editors.api"
import { useEditorFilters } from "@/features/editors/hooks/use-editor-filters"
import { useDeleteEditor, useEditorsList } from "@/features/editors/hooks/use-editors"
import { editorStatus, editorType } from "@/lib/labels"
import { messages } from "@/lib/messages"

function EditorRowActions({ editor, isSelf }: { editor: EditorListItem; isSelf: boolean }) {
  const { can } = useAuth()
  const remove = useDeleteEditor()
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const label = editor.displayName

  return (
    <div className="flex items-center gap-0.5">
      <IconAction label={messages.actions.edit}>
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={`/editors/${editor.id}/edit`} aria-label={`${messages.actions.edit}: ${label}`}>
            <PencilIcon />
          </Link>
        </Button>
      </IconAction>

      {/* The news list filtered by this editor (its "المحرر" filter). */}
      {can("allowPosts") && (
        <IconAction label="أخبار المحرر">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`${contentHref("news")}?editor=${editor.id}`} aria-label={`أخبار المحرر: ${label}`}>
              <NewspaperIcon />
            </Link>
          </Button>
        </IconAction>
      )}

      {/* You cannot delete yourself from here. */}
      {!isSelf && (
        <IconAction label={messages.actions.delete}>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-danger-ink hover:bg-danger-muted hover:text-danger-ink"
            aria-label={`${messages.actions.delete}: ${label}`}
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2Icon />
          </Button>
        </IconAction>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={messages.confirm.deleteTitle}
        description={messages.confirm.deleteDescription(label)}
        confirmLabel={messages.actions.delete}
        destructive
        pending={remove.isPending}
        onConfirm={() => remove.mutate({ id: editor.id }, { onSettled: () => setConfirmDelete(false) })}
      />
    </div>
  )
}

export function EditorsScreen() {
  const { admin } = useAuth()
  const { filters, hasActiveFilters, setPage, setSearch, setType, setActive, clear } = useEditorFilters()
  const list = useEditorsList(filters)

  const columns: DataTableColumn<EditorListItem>[] = [
    {
      id: "userName",
      header: "اسم المستخدم",
      cell: (e) => (
        <Link href={`/editors/${e.id}/edit`} dir="ltr" className="font-medium text-foreground hover:text-primary-ink hover:underline">
          {e.userName}
        </Link>
      ),
    },
    { id: "displayName", header: "الاسم الظاهر", cell: (e) => e.displayName },
    { id: "type", header: "النوع", className: "w-32", cell: (e) => editorType.get(e.type)?.label ?? "—" },
    { id: "active", header: "الحالة", className: "w-28", cell: (e) => <StatusBadge entry={editorStatus.get(e.active ? 1 : 0)} /> },
    {
      id: "actions",
      header: "التحكم",
      className: "w-36",
      cell: (e) => <EditorRowActions editor={e} isSelf={e.id === admin?.id} />,
    },
  ]

  if (list.error?.statusCode === 403) {
    return (
      <Card>
        <ForbiddenState />
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader
        title="المحررين"
        actions={<AddButton href="/editors/new" />}
      />
      <Card className="gap-0 py-0">
        <FiltersBar
          search={<SearchInput value={filters.search} onChange={setSearch} placeholder="بحث بالاسم…" />}
          activeCount={countActive(filters.type, filters.active)}
          hasActiveFilters={hasActiveFilters}
          onClear={clear}
        >
          <FilterItem>
            <FilterSelect<0 | 1>
              aria-label="النوع"
              allLabel="كل الأنواع"
              value={filters.type}
              onChange={setType}
              options={editorType.options as { value: 0 | 1; label: string }[]}
            />
          </FilterItem>
          <FilterItem>
            <FilterSelect<0 | 1>
              aria-label="الحالة"
              allLabel="كل الحالات"
              value={filters.active === null ? null : filters.active ? 1 : 0}
              onChange={setActive}
              options={editorStatus.options as { value: 0 | 1; label: string }[]}
            />
          </FilterItem>
        </FiltersBar>
        <DataTable
          columns={columns}
          data={list.data?.items}
          getRowId={(e) => e.id}
          isLoading={list.isPending}
          isFetching={list.isFetching}
          isError={list.isError}
          errorMessage={list.error?.message}
          onRetry={() => void list.refetch()}
          emptyTitle={hasActiveFilters ? "لا توجد نتائج" : "لا يوجد محررون"}
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
