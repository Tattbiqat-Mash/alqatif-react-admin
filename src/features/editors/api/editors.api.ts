import { endpoints } from "@/config/endpoints"
import { apiGet, apiPost } from "@/lib/api/client"
import { normalizeList, toApiPage, type ListEnvelopeDto, type ListResult } from "@/lib/api/list"
import { toArray, toNumber, toText, unreadableDetails } from "@/lib/api/parse"
import { ADMIN_PERMISSIONS } from "@/features/auth/types/auth.types"
import type { EditorFormValues } from "@/features/editors/schemas/editor.schema"
import type {
  EditorDetailsDto,
  EditorListItemDto,
  EditorListRequestDto,
  EditorSaveRequestDto,
} from "@/features/editors/types/editors.dto"

export type EditorListItem = {
  id: number
  type: number
  userName: string
  /** Falls back to the user name when empty. */
  displayName: string
  active: boolean
}

export function mapEditorListItem(dto: EditorListItemDto): EditorListItem {
  const userName = toText(dto.userName)
  return {
    id: toNumber(dto.id),
    type: toNumber(dto.type, -1),
    userName,
    displayName: toText(dto.displayName) || userName,
    active: toNumber(dto.active) === 1,
  }
}

/** Safety cap for the "all editors" fetch used by filters. */
const MAX_PAGES = 10

/**
 * Every admin account, for the "كل المحررين" filter.
 * ⚠ TBD: assumes that omitting `type` returns both أدمن and أدمن فرعي (the sample was type 0 only).
 */
export async function listAllEditors(): Promise<EditorListItem[]> {
  const rows: EditorListItemDto[] = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const body: EditorListRequestDto = { page }
    const raw = await apiPost<ListEnvelopeDto<EditorListItemDto>>(endpoints.editors.list, body)
    rows.push(...toArray<EditorListItemDto>(raw?.data))
    if (page + 1 >= toNumber(raw?.pagesCount, 1)) break
  }
  return rows.map(mapEditorListItem).filter((e) => e.id > 0)
}

// ---------------------------------------------------------------------------
// المحررين screen (Task 09)

export type EditorListFilters = {
  /** 1-based (URL). */
  page: number
  search: string
  type: 0 | 1 | null
  active: boolean | null
}

export async function listEditors(filters: EditorListFilters): Promise<ListResult<EditorListItem>> {
  const body: EditorListRequestDto = {
    page: toApiPage(filters.page),
    search: filters.search || undefined,
    type: filters.type ?? undefined,
    active: filters.active === null ? undefined : filters.active ? 1 : 0,
  }
  const raw = await apiPost<ListEnvelopeDto<EditorListItemDto>>(endpoints.editors.list, body)
  return normalizeList(raw, filters.page, mapEditorListItem)
}

const isOn = (value: unknown) => toNumber(value) === 1
const bit = (value: boolean): 0 | 1 => (value ? 1 : 0)

/** ⚠ TBD — provisional, see EditorDetailsDto. */
export function mapEditorDetails(raw: unknown): { id: number; values: EditorFormValues } {
  const root = (raw ?? {}) as { data?: unknown }
  const data = Array.isArray(root.data) ? root.data[0] : root.data
  const dto = (typeof data === "object" && data !== null ? data : root) as EditorDetailsDto
  const id = toNumber(dto?.id, Number.NaN)
  if (!Number.isFinite(id) || typeof dto.userName !== "string") {
    throw unreadableDetails(raw, "admins/getDetails", "تعذر قراءة بيانات المحرر من الخادم.")
  }
  return {
    id,
    values: {
      userName: toText(dto.userName),
      displayName: toText(dto.displayName),
      email: toText(dto.email),
      // Never pre-filled: an empty field keeps the current password.
      password: "",
      type: toNumber(dto.type) === 0 ? 0 : 1,
      active: isOn(dto.active),
      permissions: Object.fromEntries(ADMIN_PERMISSIONS.map((p) => [p, isOn(dto[p])])) as EditorFormValues["permissions"],
    },
  }
}

export function toEditorSaveRequest(values: EditorFormValues, id?: number): EditorSaveRequestDto {
  // A full admin (type 0) has every permission; the flags are sent on for consistency.
  const flag = (p: (typeof ADMIN_PERMISSIONS)[number]) => bit(values.type === 0 || values.permissions[p])
  return {
    id,
    userName: values.userName.trim(),
    displayName: values.displayName.trim(),
    // Left out on edit when empty so the server never receives a blank password.
    password: values.password ? values.password : undefined,
    email: values.email.trim(),
    type: values.type,
    active: bit(values.active),
    allowPosts: flag("allowPosts"),
    allowComments: flag("allowComments"),
    allowAds: flag("allowAds"),
    allowAdmins: flag("allowAdmins"),
    allowNotifications: flag("allowNotifications"),
    allowSurveys: flag("allowSurveys"),
    allowSettings: flag("allowSettings"),
  }
}

export async function getEditor(id: number) {
  return mapEditorDetails(await apiGet<unknown>(endpoints.editors.details(id)))
}

// ⚠ TBD: the replies of add / edit / delete are unknown; any non-error reply counts as success.
export function createEditor(values: EditorFormValues) {
  return apiPost<unknown>(endpoints.editors.add, toEditorSaveRequest(values))
}

export function updateEditor(id: number, values: EditorFormValues) {
  return apiPost<unknown>(endpoints.editors.edit, toEditorSaveRequest(values, id))
}

export function deleteEditor(id: number) {
  return apiGet<unknown>(endpoints.editors.delete(id))
}
