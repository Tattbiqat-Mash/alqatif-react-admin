"use client"

import * as React from "react"
import Link from "next/link"
import { PencilIcon, PlusIcon, ToggleRightIcon, Trash2Icon } from "lucide-react"

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
import type { SurveyItem } from "@/features/surveys/api/surveys.api"
import { useSurveyFilters, useSurveyRowMutations, useSurveysList } from "@/features/surveys/hooks/use-surveys"
import { formatDateTime, formatNumber } from "@/lib/format"
import { activeStatus } from "@/lib/labels"
import { messages } from "@/lib/messages"

function SurveyRowActions({ survey }: { survey: SurveyItem }) {
  const { toggle, remove } = useSurveyRowMutations()
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const name = survey.title || `الاستبيان رقم ${survey.id}`

  return (
    <div className="flex items-center gap-0.5">
      <IconAction label={messages.actions.edit}>
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={`/surveys/${survey.id}/edit`} aria-label={`${messages.actions.edit}: ${name}`}>
            <PencilIcon />
          </Link>
        </Button>
      </IconAction>
      <IconAction label={survey.active ? "إيقاف" : "تفعيل"}>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`${survey.active ? "إيقاف" : "تفعيل"}: ${name}`}
          disabled={toggle.isPending}
          onClick={() => toggle.mutate({ id: survey.id })}
        >
          <ToggleRightIcon />
        </Button>
      </IconAction>
      <IconAction label={messages.actions.delete}>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-danger-ink hover:bg-danger-muted hover:text-danger-ink"
          aria-label={`${messages.actions.delete}: ${name}`}
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2Icon />
        </Button>
      </IconAction>
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={messages.confirm.deleteTitle}
        description={messages.confirm.deleteDescription(name)}
        confirmLabel={messages.actions.delete}
        destructive
        pending={remove.isPending}
        onConfirm={() => remove.mutate({ id: survey.id }, { onSettled: () => setConfirmDelete(false) })}
      />
    </div>
  )
}

const columns: DataTableColumn<SurveyItem>[] = [
  { id: "id", header: "م", className: "w-20", cell: (s) => <span className="text-xs text-muted-text tabular-nums">{s.id}</span> },
  {
    id: "title",
    header: "العنوان",
    className: "min-w-56",
    cell: (s) => (
      <Link href={`/surveys/${s.id}/edit`} className="font-medium text-foreground hover:text-primary-ink hover:underline" dir="auto">
        {s.title || "—"}
      </Link>
    ),
  },
  { id: "category", header: "التصنيف", className: "w-36", cell: (s) => s.category || "—" },
  { id: "published", header: "تاريخ ووقت النشر", className: "w-44", cell: (s) => <bdi dir="ltr">{formatDateTime(s.publishedAt)}</bdi> },
  { id: "active", header: "الحالة", className: "w-28", cell: (s) => <StatusBadge entry={activeStatus.get(s.active ? 1 : 0)} /> },
  { id: "answers", header: "عدد الإجابات", className: "w-28", cell: (s) => formatNumber(s.answersCount) },
  { id: "actions", header: "التحكم", className: "w-36", cell: (s) => <SurveyRowActions survey={s} /> },
]

export function SurveysScreen() {
  const { filters, hasActiveFilters, setPage, setSearch, setActive, clear } = useSurveyFilters()
  const list = useSurveysList(filters)

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
        title="الاستبيانات"
        actions={
          <Button asChild>
            <Link href="/surveys/new">
              <PlusIcon data-icon="inline-start" />
              {messages.actions.add}
            </Link>
          </Button>
        }
      />
      <Card className="gap-0 py-0">
        <FiltersBar hasActiveFilters={hasActiveFilters} onClear={clear}>
          <FilterItem className="sm:w-72">
            <SearchInput value={filters.search} onChange={setSearch} placeholder="بحث في العناوين…" />
          </FilterItem>
          <FilterItem>
            <FilterSelect<0 | 1>
              aria-label="الحالة"
              allLabel="كل الحالات"
              value={filters.active === null ? null : filters.active ? 1 : 0}
              onChange={setActive}
              options={activeStatus.options as { value: 0 | 1; label: string }[]}
            />
          </FilterItem>
        </FiltersBar>
        <DataTable
          columns={columns}
          data={list.data?.items}
          getRowId={(s) => s.id}
          isLoading={list.isPending}
          isFetching={list.isFetching}
          isError={list.isError}
          errorMessage={list.error?.message}
          onRetry={() => void list.refetch()}
          emptyTitle={hasActiveFilters ? "لا توجد نتائج" : "لا توجد استبيانات"}
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
