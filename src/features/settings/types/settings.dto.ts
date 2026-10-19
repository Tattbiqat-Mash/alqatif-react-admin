/** Body of `POST /admin/settings/edit` (from the Postman collection). Every field is sent. */
export type SettingsSaveRequestDto = {
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

export type SettingsDetailsResponseDto = {
  status: "success"
  data: SettingsDetailsDto[]
}
