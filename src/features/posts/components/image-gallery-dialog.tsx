"use client"

import * as React from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, ImagesIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FetchingBar } from "@/components/ui/fetching-bar"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { imageUrl, storedImageValue } from "@/config/content-types"
import { listGalleryImages, type GalleryPage } from "@/features/posts/api/post-form.api"
import { postKeys } from "@/features/posts/hooks/use-posts"
import type { ApiError } from "@/lib/api/errors"
import { formatNumber } from "@/lib/format"

const PAGE_SIZE = 40

function useGalleryImages(page: number, enabled: boolean) {
  return useQuery<GalleryPage, ApiError>({
    queryKey: [...postKeys.all, "gallery", page],
    queryFn: () => listGalleryImages(page),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}

type ImageGalleryDialogProps = {
  /** The field's current stored value, to mark it as selected. */
  value: string
  onPick: (value: string) => void
  disabled?: boolean
}

/** "من معرض الصور": pick an already uploaded image (posts/listImages). */
export function ImageGalleryDialog({ value, onPick, disabled }: ImageGalleryDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const gallery = useGalleryImages(page, open)
  const currentUrl = imageUrl(value)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" disabled={disabled}>
          <ImagesIcon data-icon="inline-start" />
          من معرض الصور
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] gap-4 overflow-hidden sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>معرض الصور</DialogTitle>
          <DialogDescription>اختر صورة رُفعت سابقاً — الأحدث أولاً.</DialogDescription>
        </DialogHeader>

        <div className="relative -mx-4 min-h-64 overflow-y-auto px-4" style={{ maxHeight: "calc(90svh - 11rem)" }}>
          <FetchingBar active={gallery.isFetching && !gallery.isPending} />
          {gallery.isPending ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 12 }, (_, i) => (
                <Skeleton key={i} className="aspect-video rounded-md" />
              ))}
            </div>
          ) : gallery.isError ? (
            <ErrorState description={gallery.error.message} onRetry={() => void gallery.refetch()} />
          ) : gallery.data.files.length === 0 ? (
            <EmptyState title="لا توجد صور" />
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {gallery.data.files.map((url, index) => {
                const selected = url === currentUrl
                return (
                  <li key={url}>
                    <button
                      type="button"
                      onClick={() => {
                        onPick(storedImageValue(url))
                        setOpen(false)
                      }}
                      aria-label={`اختيار الصورة ${formatNumber((page - 1) * PAGE_SIZE + index + 1)}`}
                      aria-pressed={selected}
                      className={cn(
                        "group relative block aspect-video w-full overflow-hidden rounded-md border border-border bg-surface-muted outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50",
                        selected ? "ring-3 ring-primary" : "hover:border-primary",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- images come from the API's domain */}
                      <img src={url} alt="" loading="lazy" className="size-full object-cover transition group-hover:scale-105" />
                      {selected && (
                        <span className="absolute end-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <CheckIcon className="size-4" aria-hidden />
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {gallery.data && (
          <nav aria-label="صفحات المعرض" className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <p className="text-sm text-muted-text">
              صفحة {formatNumber(page)} من {formatNumber(gallery.data.pageCount)}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1 || gallery.isFetching} onClick={() => setPage((p) => p - 1)}>
                <ChevronRightIcon data-icon="inline-start" />
                الأحدث
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= gallery.data.pageCount || gallery.isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                الأقدم
                <ChevronLeftIcon data-icon="inline-end" />
              </Button>
            </div>
          </nav>
        )}
      </DialogContent>
    </Dialog>
  )
}
