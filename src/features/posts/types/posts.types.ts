/** Post status (`active`): 0 تحت المراجعة · 1 منشور · 2 موقوف. */
export type PostStatus = 0 | 1 | 2

export type PostListItem = {
  id: number
  title: string
  status: PostStatus | null
  pinned: boolean
  /** الكاتب — may be empty. */
  writer: string
  /** المحرر — the admin's display name. */
  editor: string
  /** `YYYY-MM-DD HH:mm:ss`, or null. */
  publishedAt: string | null
  category: string
  views: number
  commentsEnabled: boolean
  breaking: boolean
  hasKhatma: boolean
}

/** List filters as the UI holds them (URL state). Null = "الكل". */
export type PostListFilters = {
  page: number
  search: string
  /** Ignored for sections with a fixed category. */
  categoryId: number | null
  /** Admin id of the post's editor (المحرر) — the API's `author` filter. */
  editorId: number | null
  /** الكاتب (`authorName`), "" = all. */
  writer: string
  status: PostStatus | null
  pinned: boolean | null
}
