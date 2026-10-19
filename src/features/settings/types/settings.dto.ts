/**
 * Body of `POST /admin/settings/edit`: the collection's 8 fields, plus the 4 fields that
 * only `getDetails` shows, passed through unchanged so a save can never blank them
 * (⚠ TBD whether `edit` reads them at all).
 */
export type SettingsSaveRequestDto = SettingsExtrasDto & {
  facebook: string
  twitter: string
  insta: string
  whatsapp: string
  email: string
  about: string
  privacy: string
  info: string
}

/**
 * `GET /admin/settings/getDetails` → `{ status, data: [SettingsDetailsDto] }` (a one-item
 * array). Source: rules/api-samples/settings-details.json. It carries four fields the save
 * body does not (snapchat, telegram, tiktok, mobile) — ⚠ TBD whether `edit` accepts them.
 */
export type SettingsDetailsDto = {
  id: string | number
  facebook: string | null
  twitter: string | null
  snapchat: string | null
  insta: string | null
  whatsapp: string | null
  telegram: string | null
  tiktok: string | null
  mobile: string | null
  email: string | null
  about: string | null
  privacy: string | null
  info: string | null
}

/** Fields the form does not show but every save sends back as loaded. */
export type SettingsExtrasDto = {
  snapchat: string
  telegram: string
  tiktok: string
  mobile: string
}

export type SettingsDetailsResponseDto = {
  status: "success"
  data: SettingsDetailsDto[]
}
