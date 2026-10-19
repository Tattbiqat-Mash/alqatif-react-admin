"use client"

import * as React from "react"
import Link from "next/link"
import { PencilIcon, PlusIcon, ToggleRightIcon, Trash2Icon } from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { FilterItem, FiltersBar } from "@/components/ui/filters-bar"
import { FilterSelect } from "@/components/ui/filter-select"
import { PageHeader } from "@/components/ui/page-header"
import { SearchInput } from "@/components/ui/search-input"
import { ForbiddenState } from "@/components/ui/states"
import { StatusBadge } from "@/components/ui/status-badge"
import { IconAction } from "@/components/ui/icon-action"
import type { EditorListItem } from "@/features/editors/api/editors.api"
import { useEditorFilters } from "@/features/editors/hooks/use-editor-filters"
import { useDeleteEditor, useEditorsList, useToggleEditor } from "@/features/editors/hooks/use-editors"
import { editorStatus, editorType } from "@/lib/labels"
import { messages } from "@/lib/messages"

function EditorRowActions({ editor, isSelf }: { editor: EditorListItem; isSelf: boolean }) {
  const toggle = useToggleEditor()
  const remove = useDeleteEditor()
  const [confirm, setConfirm] = React.useState<"deactivate" | "delete" | null>(null)
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

      {/* You cannot lock yourself out from here. */}
      {!isSelf && (
        <>
          <IconAction label={editor.active ? "إيقاف" : "تفعيل"}>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`${editor.active ? "إيقاف" : "تفعيل"}: ${label}`}
              disabled={toggle.isPending}
              // Deactivating signs the editor out of the admin, so it is confirmed first.
              onClick={() => (editor.active ? setConfirm("deactivate") : toggle.mutate({ id: editor.id }))}
            >
              <ToggleRightIcon />
            </Button>
          </IconAction>
          <IconAction label={messages.actions.delete}>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-danger-ink hover:bg-danger-muted hover:text-danger-ink"
              aria-label={`${messages.actions.delete}: ${label}`}
              onClick={() => setConfirm("delete")}
            >
              <Trash2Icon />
            </Button>
          </IconAction>
        </>
      )}

      <ConfirmDialog
        open={confirm === "deactivate"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="إيقاف المحرر"
        description={`سيتم إيقاف حساب «${label}» ولن يتمكن من الدخول إلى لوحة التحكم.`}
        confirmLabel="إيقاف"
        destructive
        pending={toggle.isPending}
        onConfirm={() => toggle.mutate({ id: editor.id }, { onSettled: () => setConfirm(null) })}
      />
      <ConfirmDialog
        open={confirm === "delete"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={messages.confirm.deleteTitle}
        description={messages.confirm.deleteDescription(label)}
        confirmLabel={messages.actions.delete}
        destructive
        pending={remove.isPending}
        onConfirm={() => remove.mutate({ id: editor.id }, { onSettled: () => setConfirm(null) })}
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
        actions={
          <Button asChild>
            <Link href="/editors/new">
              <PlusIcon data-icon="inline-start" />
              {messages.actions.add}
            </Link>
          </Button>
        }
      />
      <Card className="gap-0 py-0">
        <FiltersBar hasActiveFilters={hasActiveFilters} onClear={clear}>
          <FilterItem className="sm:w-72">
            <SearchInput value={filters.search} onChange={setSearch} placeholder="بحث بالاسم…" />
          </FilterItem>
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
