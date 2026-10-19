/**
 * Raw API shapes for auth. Source: rules/api-samples/auth-login.json.
 * Map them to `auth.types.ts` models in the API layer; components never see these.
 */

/** A permission flag as the API sends it: `null` on full admins (`type=0`). */
type FlagDto = 0 | 1 | "0" | "1" | null

/** An admin account (`data` of the login response). */
export type AdminDto = {
  id: number
  userName: string
  /** MD5 hash — the API returns it, but it is never read or stored by this app. */
  password?: string
  displayName: string | null
  user_nicename: string | null
  email: string | null
  registerdDate: string | null
  type: number | string
  /** ⚠ TBD meaning: comma-separated category ids (e.g. "1,2"). */
  allwoedCats: string | null
  /** ⚠ TBD meaning (sample value: 2). */
  permissions: number | null
  active: number | string
  updatedBy: number | null
  allowPosts: FlagDto
  allowComments: FlagDto
  allowAds: FlagDto
  allowAdmins: FlagDto
  allowNotifications: FlagDto
  allowSurveys: FlagDto
  allowSettings: FlagDto
}

export type LoginResponseDto = {
  status: "success"
  /** RS256 JWT, valid 30 days. Claims: iat, exp, userId, type, userName, displayName. */
  token: string
  data: AdminDto
}
