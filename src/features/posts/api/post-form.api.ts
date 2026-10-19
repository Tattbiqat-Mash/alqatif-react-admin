import { endpoints } from "@/config/endpoints"
import type { ContentTypeConfig } from "@/config/content-types"
import { apiGet, apiPost } from "@/lib/api/client"
import { uploadImageTo } from "@/lib/api/upload"
import { ApiError } from "@/lib/api/errors"
import { toNumber, toText } from "@/lib/api/parse"
import { emptyPostValues, type PostFormValues } from "@/features/posts/schemas/post.schema"
import type {
  PostDetailsDto,
  PostDetailsResponseDto,
  PostSaveRequestDto,
  CategoryBannersResponseDto,
  ListImagesResponseDto,
} from "@/features/posts/types/posts.dto"

const bit = (value: boolean): 0 | 1 => (value ? 1 : 0)
const isOn = (value: unknown) => toNumber(value) === 1

function oneOf<T extends number>(value: unknown, allowed: readonly T[], fallback: T): T {
  const n = toNumber(value, -1)
  return (allowed as readonly number[]).includes(n) ? (n as T) : fallback
}

/** Form values → the add/edit body. Every field is always sent. */
export function toPostSaveRequest(
  values: PostFormValues,
  content: ContentTypeConfig,
  id?: number,
): PostSaveRequestDto {
  return {
    id,
    title: values.title.trim(),
    content: values.content,
    mainImage: values.mainImage,
    // Fixed-category sections always send their own category.
    categoryId: content.categoryId ?? values.categoryId ?? 0,
    active: values.active,
    commentStatus: bit(values.commentStatus),
    quickNewsStatus: bit(values.quickNewsStatus),
    // The breaking-news bar falls back to the post title.
    quickNewsTitle: values.quickNewsStatus ? values.quickNewsTitle.trim() || values.title.trim() : values.quickNewsTitle,
    bannersStatus: values.bannersStatus,
    banners: values.banners,
    khatamatStatus: bit(values.khatamatStatus),
    khatamatKind: values.khatamatKind,
    khatamatSize: values.khatamatSize,
    khatamatCount: values.khatamatCount,
    fixed: bit(values.fixed),
    authorStatus: bit(values.authorStatus),
    sendNotification: bit(values.sendNotification),
    authorName: values.authorName.trim(),
  }
}

/** Extra facts about a loaded post that are not form fields. */
export type PostMeta = {
  publishedAt: string | null
  /**
   * Old WordPress posts store plain text with "\r\n" line breaks instead of <p> tags.
   * The editor shows their line breaks as they are and never converts the format.
   */
  legacyText: boolean
  /** Who has the post open in the editor (`editorOpen` / `editorName`), if anyone. */
  openBy: { id: number; name: string } | null
}

const BLOCK_TAG = /<(p|div|br|h[1-6]|ul|ol|li|table|blockquote|figure|section)\b/i

export function isLegacyText(content: string) {
  return /\n/.test(content) && !BLOCK_TAG.test(content)
}

/** `data` is an array with one post (rules/api-samples/posts-details.json). */
export function mapPostDetails(raw: PostDetailsResponseDto | null | undefined): {
  id: number
  values: PostFormValues
  meta: PostMeta
} {
  const dto: PostDetailsDto | undefined = Array.isArray(raw?.data) ? raw.data[0] : undefined
  const id = toNumber(dto?.id, Number.NaN)
  if (!dto || !Number.isFinite(id)) {
    throw new ApiError({
      statusCode: 404,
      message: "الخبر غير موجود.",
      serverMessage: "posts/getDetails: empty data array",
    })
  }
  const categoryId = toNumber(dto.categoryId, Number.NaN)
  const content = typeof dto.content === "string" ? dto.content : ""
  const openById = toNumber(dto.editorOpen, 0)
  return {
    id,
    values: {
      ...emptyPostValues(Number.isFinite(categoryId) && categoryId > 0 ? categoryId : null),
      title: toText(dto.title),
      // Kept byte-for-byte; never trimmed or normalised here.
      content,
      mainImage: toText(dto.mainImage),
      active: oneOf(dto.active, [0, 1, 2] as const, 0),
      commentStatus: isOn(dto.commentStatus),
      authorStatus: isOn(dto.authorStatus),
      authorName: toText(dto.authorName),
      // Never re-send a notification just because the post is saved again.
      sendNotification: false,
      fixed: isOn(dto.fixed),
      quickNewsStatus: isOn(dto.quickNewsStatus),
      quickNewsTitle: toText(dto.quickNewsTitle),
      bannersStatus: oneOf(dto.bannersStatus, [0, 1, 2] as const, 0),
      banners: toText(dto.banners),
      khatamatStatus: isOn(dto.khatamatStatus),
      khatamatKind: oneOf(dto.khatamatKind, [0, 1, 2] as const, 0),
      khatamatSize: oneOf(dto.khatamatSize, [0, 1, 2, 3, 4, 5] as const, 0),
      khatamatCount: Math.max(0, toNumber(dto.khatamatCount)),
    },
    meta: {
      publishedAt: toText(dto.puplishDate) || null,
      legacyText: isLegacyText(content),
      openBy: openById > 0 ? { id: openById, name: toText(dto.editorName) } : null,
    },
  }
}

export async function getPost(id: number) {
  return mapPostDetails(await apiGet<PostDetailsResponseDto>(endpoints.posts.details(id)))
}

// ⚠ TBD: add/edit responses are unknown; any non-error reply counts as success.
export function createPost(values: PostFormValues, content: ContentTypeConfig) {
  return apiPost<unknown>(endpoints.posts.add, toPostSaveRequest(values, content))
}

export function updatePost(id: number, values: PostFormValues, content: ContentTypeConfig) {
  return apiPost<unknown>(endpoints.posts.edit, toPostSaveRequest(values, content, id))
}

/**
 * `POST /admin/posts/uploadImage` (multipart `attachment`) →
 * `{ status, rowsCount, fileName, filePath }`. Source: rules/api-samples/posts-upload-image.json.
 *
 * `mainImage` holds a **full URL** (confirmed by the user from posts created by the old
 * admin), so the upload resolves to `filePath/fileName`.
 */
export function uploadPostImage(file: File, onProgress?: (percent: number) => void): Promise<string> {
  return uploadImageTo(endpoints.posts.uploadImage, file, onProgress)
}

export type GalleryPage = {
  /** Full image URLs, newest first. */
  files: string[]
  page: number
  pageCount: number
}

/** "من معرض الصور": one page of uploaded images (`page` is 1-based, like the endpoint). */
export async function listGalleryImages(page: number): Promise<GalleryPage> {
  const raw = await apiGet<ListImagesResponseDto>(endpoints.posts.images(page))
  const files = Array.isArray(raw?.files) ? raw.files.filter((f): f is string => typeof f === "string" && f !== "") : []
  return { files, page, pageCount: Math.max(1, toNumber(raw?.pages, 1)) }
}

export type CategoryBanner = {
  id: number
  image: string | null
  /** Where the banner leads: its link, or the post it points to. */
  target: string | null
  type: number
}

/** "بانرات خاصة": the banners available for a category. */
export async function listCategoryBanners(categoryId: number): Promise<CategoryBanner[]> {
  const raw = await apiGet<CategoryBannersResponseDto>(endpoints.posts.banners(categoryId))
  return (Array.isArray(raw?.data) ? raw.data : [])
    .map((b) => {
      const postId = toNumber(b.postId)
      return {
        id: toNumber(b.id, Number.NaN),
        image: toText(b.image) || null,
        target: toText(b.link) || (postId > 0 ? `خبر رقم ${postId}` : null),
        type: toNumber(b.type, -1),
      }
    })
    .filter((b) => Number.isFinite(b.id) && b.id > 0)
}

/** `banners` is stored as comma-separated ids ("494300,494293"). */
export function parseBannerIds(value: string): number[] {
  return value
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0)
}
