import { endpoints } from "@/config/endpoints"
import { apiGet, apiPost } from "@/lib/api/client"
import { ApiError } from "@/lib/api/errors"
import { toText } from "@/lib/api/parse"
import type {
  SettingsDetailsResponseDto,
  SettingsExtrasDto,
  SettingsSaveRequestDto,
} from "@/features/settings/types/settings.dto"
import type { SettingsFormValues } from "@/features/settings/schemas/settings.schema"

/** `data` is a one-item array (rules/api-samples/settings-details.json). */
export type LoadedSettings = { values: SettingsFormValues; extras: SettingsExtrasDto }

export function mapSettings(raw: SettingsDetailsResponseDto | null | undefined): LoadedSettings {
  const dto = Array.isArray(raw?.data) ? raw.data[0] : undefined
  if (!dto) {
    throw new ApiError({
      statusCode: 200,
      message: "تعذر قراءة الإعدادات من رد الخادم.",
      serverMessage: "settings/getDetails: empty data array",
    })
  }
  // Long texts keep their line breaks; only the short fields are trimmed.
  const values: SettingsFormValues = {
    facebook: toText(dto.facebook),
    twitter: toText(dto.twitter),
    insta: toText(dto.insta),
    whatsapp: toText(dto.whatsapp),
    email: toText(dto.email),
    about: dto.about ?? "",
    privacy: dto.privacy ?? "",
    info: dto.info ?? "",
  }
  // Raw values, untouched, so they go back exactly as they came.
  const extras: SettingsExtrasDto = {
    snapchat: dto.snapchat ?? "",
    telegram: dto.telegram ?? "",
    tiktok: dto.tiktok ?? "",
    mobile: dto.mobile ?? "",
  }
  return { values, extras }
}

export async function getSettings(): Promise<LoadedSettings> {
  return mapSettings(await apiGet<SettingsDetailsResponseDto>(endpoints.settings.details))
}

// ⚠ TBD: the reply is unknown; any non-error reply counts as success.
export function saveSettings({ values, extras }: LoadedSettings) {
  const body: SettingsSaveRequestDto = { ...extras, ...values }
  return apiPost<unknown>(endpoints.settings.edit, body)
}
