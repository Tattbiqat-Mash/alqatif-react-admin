import { endpoints } from "@/config/endpoints"
import { apiGet, apiPost } from "@/lib/api/client"
import { normalizeList, toApiPage, type ListEnvelopeDto, type ListResult } from "@/lib/api/list"
import { pickNumber, pickText, unwrapDetails, unreadableDetails } from "@/lib/api/parse"

/**
 * The first name in each list is the field `comments/getDetails` sends
 * (rules/api-samples/comments-details.json): `id`, `postId`, `comment_author`,
 * `comment_author_email`, `commentDate`, `comment`, `active`, `userId`, `title` (the post's),
 * all strings. ⚠ TBD: no comments/list sample yet — the other names stay as fallbacks for it.
 */
const KEYS = {
  id: ["id"],
  text: ["comment", "content", "text", "commentText"],
  active: ["active", "status"],
  postId: ["postId", "post_id"],
  postTitle: ["title", "postTitle", "post_title", "postName"],
  user: ["comment_author", "userName", "name", "commentUserName", "commenterName", "displayName", "user"],
  date: ["commentDate", "date", "createdAt", "created_at", "addDate", "puplishDate"],
} as const

type RawRow = Record<string, unknown>

export type CommentItem = {
  id: number
  text: string
  /** 1 منشور · 0 موقوف (⚠ TBD labels). */
  active: boolean
  postId: number | null
  postTitle: string
  user: string
  date: string | null
}

export function mapComment(row: RawRow): CommentItem {
  const postId = pickNumber(row, KEYS.postId, 0)
  return {
    id: pickNumber(row, KEYS.id, 0),
    text: pickText(row, KEYS.text),
    active: pickNumber(row, KEYS.active, 0) === 1,
    postId: postId > 0 ? postId : null,
    postTitle: pickText(row, KEYS.postTitle),
    user: pickText(row, KEYS.user),
    date: pickText(row, KEYS.date) || null,
  }
}

export type CommentListFilters = {
  /** 1-based (URL). */
  page: number
  search: string
  active: boolean | null
  postId: number | null
}

export async function listComments(filters: CommentListFilters): Promise<ListResult<CommentItem>> {
  const raw = await apiPost<ListEnvelopeDto<RawRow>>(endpoints.comments.list, {
    page: toApiPage(filters.page),
    search: filters.search || undefined,
    active: filters.active === null ? undefined : filters.active ? 1 : 0,
    postId: filters.postId ?? undefined,
  })
  return normalizeList(raw, filters.page, mapComment)
}

export async function getComment(id: number): Promise<CommentItem> {
  const raw = await apiGet<unknown>(endpoints.comments.details(id))
  const row = unwrapDetails(raw)
  const comment = row ? mapComment(row) : null
  if (!comment || comment.id <= 0) throw unreadableDetails(raw, "comments/getDetails", "تعذر قراءة التعليق من رد الخادم.")
  return comment
}

// ⚠ TBD: the replies of edit / delete are unknown; any non-error reply counts as success.

/** Body from the collection: `id`, `comment`, `active`. */
export function saveComment(id: number, values: { comment: string; active: boolean }) {
  return apiPost<unknown>(endpoints.comments.edit, { id, comment: values.comment, active: values.active ? 1 : 0 })
}

export function deleteComment(id: number) {
  return apiGet<unknown>(endpoints.comments.delete(id))
}
