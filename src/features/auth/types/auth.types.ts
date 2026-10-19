/** Permission flags on an admin account (rules/auth-and-permissions.md#permissions). */
export const ADMIN_PERMISSIONS = [
  "allowPosts",
  "allowComments",
  "allowAds",
  "allowAdmins",
  "allowNotifications",
  "allowSurveys",
  "allowSettings",
] as const

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number]

/** `0` أدمن (full access), `1` أدمن فرعي (limited by the flags). */
export type AdminType = 0 | 1

/** The signed-in admin, as the UI uses it (mapped from the login response). */
export type Admin = {
  id: number
  userName: string
  displayName: string
  email: string | null
  avatarUrl: string | null
  type: AdminType | null
  permissions: Record<AdminPermission, boolean>
}

export type Session = {
  token: string
  admin: Admin
  /** Epoch ms from the JWT `exp` claim, or null when the token has none. */
  expiresAt: number | null
}

export type LoginValues = {
  userName: string
  password: string
  remember: boolean
}
