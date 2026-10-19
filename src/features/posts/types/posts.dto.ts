/** Raw `POST /admin/posts/list` row. Source: rules/api-samples/posts-list.json. */
export type PostListItemDto = {
  id: number
  title: string
  /** 0 تحت المراجعة · 1 منشور · 2 موقوف */
  active: number | string
  /** The writer shown on the site (الكاتب); may be "". */
  authorName: string | null
  /** The admin who created the post (المحرر). */
  displayName: string | null
  /** Spelled this way by the API. `YYYY-MM-DD HH:mm:ss`. */
  puplishDate: string | null
  categoryTitle: string | null
  commentStatus: number | string
  quickNewsStatus: number | string
  fixed: number | string
  khatamatStatus: number | string
  views: number | string
}

/** Body of `POST /admin/posts/list`. Omitted keys mean "no filter". */
export type PostListRequestDto = {
  page: number
  type: number
  categoryId?: number
  search?: string
  active?: number
  fixed?: number
  author?: number
  authorName?: string
}

type NumberLike = number | string

/**
 * Body of `POST /admin/posts/add` and `/edit` (confirmed by the user; field notes in
 * rules/api-endpoints.md#posts--adminposts). Flags are 0/1.
 */
export type PostSaveRequestDto = {
  /** Edit only. */
  id?: number
  title: string
  content: string
  mainImage: string
  categoryId: number
  active: 0 | 1 | 2
  commentStatus: 0 | 1
  quickNewsStatus: 0 | 1
  quickNewsTitle: string
  bannersStatus: 0 | 1 | 2
  banners: string
  khatamatStatus: 0 | 1
  khatamatKind: 0 | 1 | 2
  khatamatSize: number
  khatamatCount: number
  fixed: 0 | 1
  authorStatus: 0 | 1
  sendNotification: 0 | 1
  authorName: string
}

/**
 * `GET /admin/posts/getDetails/{id}` → `{ status, data: [PostDetailsDto] }` (an array with
 * one item). Source: rules/api-samples/posts-details.json. Flags may be `null`.
 */
export type PostDetailsDto = {
  id: number
  /** Admin id of the creator. */
  author: number | null
  authorName: string | null
  title: string | null
  /** Full URL, e.g. http://alqhat.com/beta/wp-content/uploads/…jpg */
  mainImage: string | null
  /**
   * HTML — or, for old WordPress posts, plain text whose paragraphs are separated by
   * "\r\n\r\n" with inline <img> tags. Must be sent back unchanged unless edited.
   */
  content: string | null
  puplishDate: string | null
  guid: string | null
  commentCount: NumberLike | null
  draftContent: string | null
  draftDate: string | null
  draftStatus: NumberLike | null
  categoryId: NumberLike | null
  active: NumberLike | null
  commentStatus: NumberLike | null
  authorStatus: NumberLike | null
  bannersStatus: NumberLike | null
  quickNewsStatus: NumberLike | null
  quickNewsTitle: string | null
  khatamatStatus: NumberLike | null
  khatamatKind: NumberLike | null
  khatamatSize: NumberLike | null
  khatamatCount: NumberLike | null
  banners: string | null
  fixed: NumberLike | null
  views: NumberLike | null
  webViews: NumberLike | null
  thanks: unknown
  /** Admin id that has the post open in the editor (the edit lock), or null/0. */
  editorOpen: NumberLike | null
  editorName: string | null
  contentLong: string | null
  /** ⚠ TBD meaning: 0 on old posts. */
  htmlEditorVersion: NumberLike | null
}

export type PostDetailsResponseDto = {
  status: "success"
  data: PostDetailsDto[]
}

/** `POST /admin/posts/uploadImage`. Source: rules/api-samples/posts-upload-image.json. */
export type UploadImageResponseDto = {
  status: "success"
  rowsCount: number
  /** e.g. "9606524100662.jpeg" */
  fileName: string
  /** Folder URL without a trailing slash, e.g. "https://alqhat.com/uploadImages/medium". */
  filePath: string
}

/**
 * `GET /admin/posts/listAutherNames` — every writer name ever used (~4000), one page,
 * no `pagesCount`. Source: rules/api-samples/posts-author-names.json.
 */
export type AuthorNamesResponseDto = {
  status: "success"
  rowsCount: number
  data: { authorName: string | null }[]
}

/**
 * `GET /admin/posts/listImages/{page}` — uploaded images, newest first, 40 per page.
 * `{page}` starts at **1** (listImages/1 returned the image uploaded just before).
 * Source: rules/api-samples/posts-list-images.json.
 */
export type ListImagesResponseDto = {
  status: "success"
  /** Number of pages, e.g. 1760. */
  pages: number
  /** Full URLs, e.g. https://alqhat.com/uploadImages/medium/9606524100662.jpeg */
  files: string[]
}

/**
 * `GET /admin/posts/getBanners/{categoryId}` — the ads a post in that category can show
 * as "بانرات خاصة". Every value is a string. No title. Source: rules/api-samples/posts-banners.json.
 */
export type CategoryBannersResponseDto = {
  status: "success"
  rowsCount: number | string
  data: {
    id: string | number
    /** Ad type: 0 بانر · 1 اقتحامي · 2 بانر داخل الخبر */
    type: string | number
    /** 0 خبر (postId) · 1 لينك خارجي (link) */
    kind: string | number
    image: string | null
    link: string | null
    postId: string | number | null
    requiredViews: string | number | null
  }[]
}
