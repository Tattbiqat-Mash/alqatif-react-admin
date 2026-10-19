import { endpoints } from "@/config/endpoints"
import { apiGet, apiPost } from "@/lib/api/client"
import { normalizeList, toApiPage, type ListEnvelopeDto, type ListResult } from "@/lib/api/list"
import { pickNumber, pickText, toText, unwrapDetails, unreadableDetails } from "@/lib/api/parse"
import { uploadImageTo } from "@/lib/api/upload"
import type { AdFormValues } from "@/features/ads/schemas/ad.schema"

/**
 * ⚠ TBD — PROVISIONAL. No ads/list or ads/getDetails sample yet. Keys come from the
 * collection's add body and from posts/getBanners rows (same ads table: id, type, kind,
 * image, link, postId, requiredViews). Replace with real DTOs when samples arrive.
 */
type RawRow = Record<string, unknown>

const KEYS = {
  views: ["views", "viewsCount", "showCount", "displayCount", "totalViews"],
  startDate: ["startDate", "start_date"],
  endDate: ["endDate", "end_date"],
} as const

export type AdItem = {
  id: number
  title: string
  type: number
  kind: number
  image: string | null
  startDate: string | null
  endDate: string | null
  /** عدد مرات الظهور (⚠ TBD: total views vs requiredViews). */
  views: number
  active: boolean
}

export function mapAd(row: RawRow): AdItem {
  return {
    id: pickNumber(row, ["id"], 0),
    title: pickText(row, ["title"]),
    type: pickNumber(row, ["type"], -1),
    kind: pickNumber(row, ["kind"], -1),
    image: pickText(row, ["image"]) || null,
    startDate: pickText(row, KEYS.startDate) || null,
    endDate: pickText(row, KEYS.endDate) || null,
    views: pickNumber(row, KEYS.views, 0),
    active: pickNumber(row, ["active", "status"], 0) === 1,
  }
}

export type AdListFilters = {
  page: number
  search: string
  type: 0 | 1 | 2 | null
  active: boolean | null
}

export async function listAds(filters: AdListFilters): Promise<ListResult<AdItem>> {
  const raw = await apiPost<ListEnvelopeDto<RawRow>>(endpoints.ads.list, {
    page: toApiPage(filters.page),
    search: filters.search || undefined,
    type: filters.type ?? undefined,
    active: filters.active === null ? undefined : filters.active ? 1 : 0,
  })
  return normalizeList(raw, filters.page, mapAd)
}

/** `categories` may come as "1,2", [1, 2] or [{ id }] — ⚠ TBD. */
function categoryIds(value: unknown): number[] {
  const items: unknown[] = typeof value === "string" ? value.split(",") : Array.isArray(value) ? value : []
  return items
    .map((item) =>
      typeof item === "object" && item !== null
        ? pickNumber(item as RawRow, ["id", "categoryId", "catId"], 0)
        : Number(toText(item)),
    )
    .filter((n) => Number.isInteger(n) && n > 0)
}

const toDate = (value: string) => (value.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? "")

export function mapAdDetails(raw: unknown): { id: number; values: AdFormValues } {
  const row = unwrapDetails(raw)
  const id = pickNumber(row, ["id"], 0)
  if (!row || id <= 0) {
    throw unreadableDetails(raw, "ads/getDetails", "تعذر قراءة الإعلان من رد الخادم.")
  }
  const type = pickNumber(row, ["type"], 0)
  const postId = pickNumber(row, ["postId"], 0)
  return {
    id,
    values: {
      title: pickText(row, ["title"]),
      type: type === 1 || type === 2 ? type : 0,
      requiredViews: Math.max(0, pickNumber(row, ["requiredViews"], 0)),
      image: pickText(row, ["image"]),
      kind: pickNumber(row, ["kind"], 1) === 0 ? 0 : 1,
      postId: postId > 0 ? postId : null,
      link: pickText(row, ["link"]),
      startDate: toDate(pickText(row, KEYS.startDate)),
      endDate: toDate(pickText(row, KEYS.endDate)),
      active: pickNumber(row, ["active", "status"], 0) === 1,
      categories: categoryIds(row.categories),
    },
  }
}

/** Body from the collection. Both target fields are always sent; the unused one is empty. */
export function toAdSaveRequest(values: AdFormValues, id?: number) {
  return {
    id,
    title: values.title.trim(),
    type: values.type,
    kind: values.kind,
    image: values.image,
    link: values.kind === 1 ? values.link.trim() : "",
    postId: values.kind === 0 ? (values.postId ?? 0) : 0,
    requiredViews: values.requiredViews,
    categories: values.categories,
    startDate: values.startDate,
    endDate: values.endDate,
    active: values.active ? 1 : 0,
  }
}

export async function getAd(id: number) {
  return mapAdDetails(await apiGet<unknown>(endpoints.ads.details(id)))
}

// ⚠ TBD: the replies of add / edit / changeActive / delete are unknown; any non-error reply counts as success.
export function createAd(values: AdFormValues) {
  return apiPost<unknown>(endpoints.ads.add, toAdSaveRequest(values))
}

export function updateAd(id: number, values: AdFormValues) {
  return apiPost<unknown>(endpoints.ads.edit, toAdSaveRequest(values, id))
}

export function toggleAd(id: number) {
  return apiGet<unknown>(endpoints.ads.changeActive(id))
}

export function deleteAd(id: number) {
  return apiGet<unknown>(endpoints.ads.delete(id))
}

export function uploadAdImage(file: File, onProgress?: (percent: number) => void) {
  return uploadImageTo(endpoints.ads.uploadImage, file, onProgress)
}
