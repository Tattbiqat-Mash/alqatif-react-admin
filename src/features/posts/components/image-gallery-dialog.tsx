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
  disabled?: boolean
  /** Controlled mode (no trigger button), e.g. opened from the editor's toolbar. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onCloseAutoFocus?: React.ComponentProps<typeof DialogContent>["onCloseAutoFocus"]
} & (
  | { multiple?: false; onPick: (value: string) => void }
  /** Click toggles; "إدراج الصور" hands over the values in the order they were picked. */
  | { multiple: true; onPick: (values: string[]) => void }
)

/** "من معرض الصور": pick an already uploaded image (posts/listImages). */
export function ImageGalleryDialog(props: ImageGalleryDialogProps) {
  const { value, disabled, open: controlledOpen, onOpenChange, onCloseAutoFocus } = props
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const controlled = controlledOpen !== undefined
  const open = controlled ? controlledOpen : uncontrolledOpen
  /** Multiple mode: picked URLs in pick order, kept across pages. */
  const [picked, setPicked] = React.useState<string[]>([])
  const setOpen = (next: boolean) => {
    if (!next) setPicked([])
    if (controlled) onOpenChange?.(next)
    else setUncontrolledOpen(next)
  }
  const [page, setPage] = React.useState(1)
  const gallery = useGalleryImages(page, open)
  const currentUrl = imageUrl(value)

  function onImageClick(url: string) {
    if (props.multiple) {
      setPicked((list) => (list.includes(url) ? list.filter((u) => u !== url) : [...list, url]))
      return
    }
    props.onPick(storedImageValue(url))
    setOpen(false)
  }

  function insertPicked() {
    if (!props.multiple || picked.length === 0) return
    props.onPick(picked.map(storedImageValue))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!controlled && (
        <DialogTrigger asChild>
          <Button type="button" variant="outline" disabled={disabled}>
            <ImagesIcon data-icon="inline-start" />
            من معرض الصور
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90svh] gap-4 overflow-hidden sm:max-w-4xl" onCloseAutoFocus={onCloseAutoFocus}>
        <DialogHeader>
          <DialogTitle>معرض الصور</DialogTitle>
          <DialogDescription>
            {props.multiple ? "اختر صورة أو أكثر رُفعت سابقاً — الأحدث أولاً." : "اختر صورة رُفعت سابقاً — الأحدث أولاً."}
          </DialogDescription>
        </DialogHeader>

        <div className="relative -mx-4 min-h-64 overflow-y-auto px-4" style={{ maxHeight: props.multiple ? "calc(90svh - 15rem)" : "calc(90svh - 11rem)" }}>
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
                const order = props.multiple ? picked.indexOf(url) + 1 : 0
                const selected = props.multiple ? order > 0 : url === currentUrl
                return (
                  <li key={url}>
                    <button
                      type="button"
                      onClick={() => onImageClick(url)}
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
                        <span className="absolute end-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          {order > 0 ? formatNumber(order) : <CheckIcon className="size-4" aria-hidden />}
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

        {props.multiple && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            <p className="text-sm text-muted-text" aria-live="polite">
              المحدد: <span className="font-semibold text-foreground">{formatNumber(picked.length)}</span>
            </p>
            <div className="flex gap-2">
              {picked.length > 0 && (
                <Button type="button" variant="ghost" onClick={() => setPicked([])}>
                  إلغاء التحديد
                </Button>
              )}
              <Button type="button" disabled={picked.length === 0} onClick={insertPicked}>
                <ImagesIcon data-icon="inline-start" />
                إدراج الصور
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
