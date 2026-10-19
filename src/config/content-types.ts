/**
 * The six content sections. They share one posts module (rules/PROJECT_CONTEXT.md#7-important-decisions);
 * this config is what makes each one different.
 */
export type ContentTypeConfig = {
  slug: string
  /** Section title (page header, sidebar). */
  title: string
  /** API post `type`: 0 news · 1 video · 2 photos · 3 short text. */
  type: 0 | 1 | 2 | 3
  /** Fixed category for `type=3` sections; null = the admin picks a category. */
  categoryId: number | null
}

export const CONTENT_TYPES = [
  { slug: "news", title: "الأخبار", type: 0, categoryId: null },
  { slug: "videos", title: "الفيديوهات", type: 1, categoryId: null },
  { slug: "photos", title: "الصور", type: 2, categoryId: null },
  // ⚠ TBD: category ids come from the live admin (/v1); confirm them on /v2.
  { slug: "jobs", title: "وظائف", type: 3, categoryId: 79 },
  { slug: "thanks", title: "رسائل شكر", type: 3, categoryId: 81 },
  { slug: "lost-found", title: "مفقودات وموجودات", type: 3, categoryId: 80 },
] as const satisfies readonly ContentTypeConfig[]

export type ContentSlug = (typeof CONTENT_TYPES)[number]["slug"]

export function getContentType(slug: string): ContentTypeConfig | undefined {
  return CONTENT_TYPES.find((c) => c.slug === slug)
}

export function contentHref(slug: ContentSlug | string) {
  return `/content/${slug}`
}

export function contentEditHref(slug: ContentSlug | string, id: number) {
  return `/content/${slug}/${id}/edit`
}

/** "مشاهدة الخبر" on the public site. ⚠ TBD: `/q/{id}` is the short link seen in an ad. */
export function publicPostUrl(id: number) {
  return `https://alqhat.com/q/${id}`
}

/** Where images uploaded through the API live (`filePath` of uploadImage). */
export const UPLOADED_IMAGES_BASE = "https://alqhat.com/uploadImages/medium"

/** A stored image value → a URL to show: full URLs as they are, bare file names under the upload folder. */
export function imageUrl(value: string): string | null {
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  return `${UPLOADED_IMAGES_BASE}/${encodeURIComponent(value)}`
}

/**
 * The value to store for an image picked from the gallery. `mainImage` holds full URLs
 * (confirmed by the user), and the gallery already returns full URLs, so it is kept as is.
 */
export function storedImageValue(url: string): string {
  return url
}
