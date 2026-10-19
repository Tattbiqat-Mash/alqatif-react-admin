import { endpoints } from "@/config/endpoints"
import { apiPost } from "@/lib/api/client"
import { toArray, toNumber, toText } from "@/lib/api/parse"
import type { ListEnvelopeDto } from "@/lib/api/list"

/** `POST /admin/categories/list` row. Source: rules/api-samples/categories-list.json. */
type CategoryDto = {
  id: number
  /** 0 أخبار · 1 فيديو · 2 صور · 3 نصي · 4 وفيات */
  type: number
  title: string
  /** Push topic for this category, e.g. "deaths_topic". */
  notificationTopic: string | null
  active: number
}

export type Category = {
  id: number
  title: string
  type: number
  notificationTopic: string | null
}

function mapCategory(dto: CategoryDto): Category | null {
  const id = toNumber(dto.id, Number.NaN)
  const title = toText(dto.title)
  if (!Number.isFinite(id) || !title) return null
  return {
    id,
    title,
    type: toNumber(dto.type, -1),
    notificationTopic: toText(dto.notificationTopic) || null,
  }
}

/** Safety cap: the sample has 7 categories on one page. */
const MAX_PAGES = 5

/** Active categories of one content type, every page. */
export async function listCategories(type: number): Promise<Category[]> {
  const rows: CategoryDto[] = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const raw = await apiPost<ListEnvelopeDto<CategoryDto>>(endpoints.categories.list, { page, type, active: 1 })
    rows.push(...toArray<CategoryDto>(raw?.data))
    if (page + 1 >= toNumber(raw?.pagesCount, 1)) break
  }
  return rows.map(mapCategory).filter((c): c is Category => c !== null)
}

/**
 * Khatma fields show only for the deaths category (user's decision, rules/PROJECT_CONTEXT.md).
 * It is a `type: 0` category titled "وفيات" (id 56 on /v2), not a `type: 4` one.
 */
export function isDeathsCategory(category: Category | undefined) {
  return Boolean(category && (category.type === 4 || category.title.includes("وفيات")))
}
