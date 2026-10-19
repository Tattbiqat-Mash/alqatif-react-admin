"use client"

import { useQuery } from "@tanstack/react-query"
import { CheckIcon, ImageOffIcon, XIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/states"
import { listCategoryBanners, parseBannerIds, type CategoryBanner } from "@/features/posts/api/post-form.api"
import { postKeys } from "@/features/posts/hooks/use-posts"
import type { ApiError } from "@/lib/api/errors"
import { formatNumber } from "@/lib/format"

type BannerPickerProps = {
  categoryId: number | null
  /** Comma-separated ids, as stored in `banners`. */
  value: string
  onChange: (value: string) => void
  "aria-describedby"?: string
}

/** "بانرات خاصة": tick the category's banners this post shows. */
export function BannerPicker({ categoryId, value, onChange, ...aria }: BannerPickerProps) {
  const banners = useQuery<CategoryBanner[], ApiError>({
    queryKey: [...postKeys.all, "banners", categoryId],
    queryFn: () => listCategoryBanners(categoryId!),
    enabled: categoryId !== null,
    staleTime: 60_000,
  })

  const selected = parseBannerIds(value)
  const toggle = (id: number) =>
    onChange((selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]).join(","))

  if (categoryId === null) return <p className="text-sm text-muted-text">اختر التصنيف أولاً لعرض بانراته.</p>
  if (banners.isPending) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-md" />
        ))}
      </div>
    )
  }
  if (banners.isError) return <ErrorState description={banners.error.message} onRetry={() => void banners.refetch()} className="py-6" />

  const known = new Set(banners.data.map((b) => b.id))
  // Ids saved on the post that the category no longer offers (expired or moved ads).
  const unknown = selected.filter((id) => !known.has(id))

  return (
    <div className="flex flex-col gap-3" {...aria}>
      {banners.data.length === 0 ? (
        <p className="text-sm text-muted-text">لا توجد بانرات متاحة لهذا التصنيف.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="بانرات التصنيف">
          {banners.data.map((banner) => {
            const checked = selected.includes(banner.id)
            return (
              <li key={banner.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggle(banner.id)}
                  className={cn(
                    "group relative flex w-full flex-col overflow-hidden rounded-md border bg-surface text-start outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50",
                    checked ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary",
                  )}
                >
                  <span className="flex h-20 items-center justify-center bg-surface-muted">
                    {banner.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- images come from the API's domain
                      <img src={banner.image} alt="" loading="lazy" className="size-full object-cover" />
                    ) : (
                      <ImageOffIcon className="size-6 text-subtle-text" aria-hidden />
                    )}
                  </span>
                  <span className="flex flex-col gap-0.5 px-2 py-1.5 text-xs">
                    <span className="font-medium text-foreground">بانر رقم {banner.id}</span>
                    {banner.target && (
                      <bdi dir="ltr" className="truncate text-start text-muted-text">
                        {banner.target.replace(/^https?:\/\/(www\.)?/, "")}
                      </bdi>
                    )}
                  </span>
                  <span
                    className={cn(
                      "absolute end-1.5 top-1.5 flex size-6 items-center justify-center rounded-full border",
                      checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface/90",
                    )}
                    aria-hidden
                  >
                    {checked && <CheckIcon className="size-4" />}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {unknown.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-text">
          <span>بانرات محفوظة غير متاحة حالياً:</span>
          {unknown.map((id) => (
            <span key={id} className="inline-flex items-center gap-1 rounded-full bg-neutral-muted ps-2.5 text-neutral-ink">
              {id}
              <Button type="button" variant="ghost" size="icon-xs" aria-label={`إزالة البانر ${id}`} onClick={() => toggle(id)}>
                <XIcon />
              </Button>
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-text">تم اختيار {formatNumber(selected.length)} بانر.</p>
    </div>
  )
}
