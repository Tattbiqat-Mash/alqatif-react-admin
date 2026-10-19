import { endpoints } from "@/config/endpoints"
import type { ContentTypeConfig } from "@/config/content-types"
import { apiGet, apiPost } from "@/lib/api/client"
import { normalizeList, toApiPage, type ListEnvelopeDto, type ListResult } from "@/lib/api/list"
import { toNumber, toText } from "@/lib/api/parse"
import type { AuthorNamesResponseDto, PostListItemDto, PostListRequestDto } from "@/features/posts/types/posts.dto"
import type { PostListFilters, PostListItem, PostStatus } from "@/features/posts/types/posts.types"

function toStatus(value: unknown): PostStatus | null {
  const n = toNumber(value, -1)
  return n === 0 || n === 1 || n === 2 ? n : null
}

const isOn = (value: unknown) => toNumber(value) === 1

export function mapPostListItem(dto: PostListItemDto): PostListItem {
  return {
    id: dto.id,
    title: toText(dto.title),
    status: toStatus(dto.active),
    pinned: isOn(dto.fixed),
    writer: toText(dto.authorName),
    editor: toText(dto.displayName),
    publishedAt: toText(dto.puplishDate) || null,
    category: toText(dto.categoryTitle),
    views: toNumber(dto.views),
    commentsEnabled: isOn(dto.commentStatus),
    breaking: isOn(dto.quickNewsStatus),
    hasKhatma: isOn(dto.khatamatStatus),
  }
}

export function toPostListRequest(content: ContentTypeConfig, filters: PostListFilters): PostListRequestDto {
  return {
    page: toApiPage(filters.page),
    type: content.type,
    categoryId: content.categoryId ?? filters.categoryId ?? undefined,
    search: filters.search || undefined,
    author: filters.editorId ?? undefined,
    // ⚠ TBD: whether the API matches the writer name exactly or partially.
    authorName: filters.writer || undefined,
    active: filters.status ?? undefined,
    // ⚠ TBD: "كل حالات العرض" is assumed to filter on `fixed`.
    fixed: filters.pinned === null ? undefined : filters.pinned ? 1 : 0,
  }
}

export async function listPosts(
  content: ContentTypeConfig,
  filters: PostListFilters,
): Promise<ListResult<PostListItem>> {
  const raw = await apiPost<ListEnvelopeDto<PostListItemDto>>(
    endpoints.posts.list,
    toPostListRequest(content, filters),
  )
  return normalizeList(raw, filters.page, mapPostListItem)
}

// ⚠ TBD: the responses of these three are unknown; any non-error reply counts as success.
export function changePostStatus(id: number, status: PostStatus) {
  return apiGet<unknown>(endpoints.posts.changeActive(id, status))
}

export function togglePostPinned(id: number) {
  return apiGet<unknown>(endpoints.posts.changeFixed(id))
}

export function deletePost(id: number) {
  return apiGet<unknown>(endpoints.posts.delete(id))
}

/** Invisible direction marks that some stored names carry (e.g. U+200F). */
const BIDI_MARKS = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g

/**
 * Writer names for suggestions: trimmed, invisible marks removed, duplicates dropped
 * (" القطيف اليوم" and "القطيف اليوم" become one), API order kept.
 */
export async function listAuthorNames(): Promise<string[]> {
  const raw = await apiGet<AuthorNamesResponseDto>(endpoints.posts.authorNames)
  const seen = new Set<string>()
  for (const row of raw?.data ?? []) {
    const name = toText(row?.authorName).replace(BIDI_MARKS, "").trim()
    if (name) seen.add(name)
  }
  return [...seen]
}
