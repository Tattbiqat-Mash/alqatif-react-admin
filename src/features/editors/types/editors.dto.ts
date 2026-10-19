/** `POST /admin/admins/list` row. Source: rules/api-samples/admins-list.json (no password field). */
export type EditorListItemDto = {
  id: number
  /** 0 أدمن · 1 أدمن فرعي (⚠ TBD labels, see rules/api-endpoints.md) */
  type: number
  userName: string
  displayName: string | null
  /** 0 موقوف · 1 فعال */
  active: number
}

/** Body of `POST /admin/admins/list`. Omitted keys mean "no filter". */
export type EditorListRequestDto = {
  page: number
  type?: number
  search?: string
  active?: number
}

type Flag = 0 | 1

/** Body of `POST /admin/admins/add` / `edit` (from the Postman collection). */
export type EditorSaveRequestDto = {
  /** Edit only. */
  id?: number
  userName: string
  displayName: string
  /** Omitted on edit when left empty, so the current password is kept (⚠ TBD server behaviour). */
  password?: string
  email: string
  type: number
  active: Flag
  allowPosts: Flag
  allowComments: Flag
  allowAds: Flag
  allowAdmins: Flag
  allowNotifications: Flag
  allowSurveys: Flag
  allowSettings: Flag
}

/**
 * ⚠ TBD — PROVISIONAL. No `admins/getDetails` sample yet. Assumed to be the same admin
 * record as `data` in the login response (rules/api-samples/auth-login.json), under
 * `data` (an object or a one-item array) or at the root. `password` is ignored.
 */
export type EditorDetailsDto = {
  id: number | string
  userName?: string | null
  displayName?: string | null
  email?: string | null
  type?: number | string | null
  active?: number | string | null
  allowPosts?: number | string | null
  allowComments?: number | string | null
  allowAds?: number | string | null
  allowAdmins?: number | string | null
  allowNotifications?: number | string | null
  allowSurveys?: number | string | null
  allowSettings?: number | string | null
}
