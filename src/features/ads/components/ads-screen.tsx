"use client"

import * as React from "react"
import Link from "next/link"
import { ImageOffIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { cn } from "cn"

import { AddButton } from "@/components/ui/add-button"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { countActive, FilterItem, FiltersBar } from "@/components/ui/filters-bar"
import { FilterSelect } from "@/components/ui/filter-select"
import { IconAction } from "@/components/ui/icon-action"
import { PageHeader } from "@/components/ui/page-header"
import { SearchInput } from "@/components/ui/search-input"
import { ForbiddenState } from "@/components/ui/states"
import { StatusBadge } from "@/components/ui/status-badge"
import type { AdItem } from "@/features/ads/api/ads.api"
import { useAdFilters, useAdsList, useDeleteAd } from "@/features/ads/hooks/use-ads"
import { formatDate, formatNumber } from "@/lib/format"
import { activeStatus, adType } from "@/lib/labels"
import { messages } from "@/lib/messages"

function todayIso() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function AdRowActions({ ad }: { ad: AdItem }) {
  const remove = useDeleteAd()
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const name = ad.title || `الإعلان رقم ${ad.id}`

  return (
    <div className="flex items-center gap-0.5">
      <IconAction label={messages.actions.edit}>
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={`/ads/${ad.id}/edit`} aria-label={`${messages.actions.edit}: ${name}`}>
            <PencilIcon />
          </Link>
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
        onConfirm={() => remove.mutate({ id: ad.id }, { onSettled: () => setConfirmDelete(false) })}
      />
    </div>
  )
}

function columns(today: string): DataTableColumn<AdItem>[] {
  return [
    { id: "id", header: "م", className: "w-20", cell: (a) => <span className="text-xs text-muted-text tabular-nums">{a.id}</span> },
    {
      id: "image",
      header: "الصورة",
      className: "w-36",
      cell: (a) =>
        a.image ? (
          <a href={a.image} target="_blank" rel="noopener noreferrer" aria-label="عرض الصورة بالحجم الكامل" className="block w-[120px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- images come from the API's domain */}
            <img src={a.image} alt="" loading="lazy" className="h-[68px] w-[120px] rounded-md border border-border object-cover" />
          </a>
        ) : (
          <span className="flex h-[68px] w-[120px] items-center justify-center rounded-md bg-surface-muted text-subtle-text">
            <ImageOffIcon className="size-5" aria-hidden />
          </span>
        ),
    },
    {
      id: "title",
      header: "العنوان",
      className: "min-w-44",
      cell: (a) => (
        <Link
          href={`/ads/${a.id}/edit`}
          title={a.title || undefined}
          className="line-clamp-2 font-medium text-foreground hover:text-primary-ink hover:underline"
          dir="auto"
        >
          {a.title || "—"}
        </Link>
      ),
    },
    { id: "type", header: "النوع", className: "w-36", cell: (a) => adType.get(a.type)?.label ?? "—" },
    { id: "start", header: "تاريخ العرض", className: "w-32", cell: (a) => <bdi dir="ltr">{formatDate(a.startDate)}</bdi> },
    {
      id: "end",
      header: "تاريخ النهاية",
      className: "w-32",
      cell: (a) => (
        // Past end dates stand out: the ad no longer shows.
        <bdi dir="ltr" className={cn(a.endDate && a.endDate.slice(0, 10) < today && "font-medium text-danger-ink")}>
          {formatDate(a.endDate)}
        </bdi>
      ),
    },
    { id: "views", header: "عدد مرات الظهور", className: "w-32", cell: (a) => formatNumber(a.views) },
    { id: "active", header: "الحالة", className: "w-28", cell: (a) => <StatusBadge entry={activeStatus.get(a.active ? 1 : 0)} /> },
    { id: "actions", header: "التحكم", className: "w-36", cell: (a) => <AdRowActions ad={a} /> },
  ]
}

export function AdsScreen() {
  const { filters, hasActiveFilters, setPage, setSearch, setType, setActive, clear } = useAdFilters()
  const list = useAdsList(filters)
  const today = React.useMemo(() => todayIso(), [])

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
        title="الإعلانات"
        actions={<AddButton href="/ads/new" />}
      />
      <Card className="gap-0 py-0">
        <FiltersBar
          search={<SearchInput value={filters.search} onChange={setSearch} placeholder="بحث في العناوين…" />}
          activeCount={countActive(filters.type, filters.active)}
          hasActiveFilters={hasActiveFilters}
          onClear={clear}
        >
          <FilterItem>
            <FilterSelect<0 | 1 | 2>
              aria-label="النوع"
              allLabel="كل الأنواع"
              value={filters.type}
              onChange={setType}
              options={adType.options as { value: 0 | 1 | 2; label: string }[]}
            />
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
          columns={columns(today)}
          data={list.data?.items}
          getRowId={(a) => a.id}
          isLoading={list.isPending}
          isFetching={list.isFetching}
          isError={list.isError}
          errorMessage={list.error?.message}
          onRetry={() => void list.refetch()}
          emptyTitle={hasActiveFilters ? "لا توجد نتائج" : "لا توجد إعلانات"}
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
