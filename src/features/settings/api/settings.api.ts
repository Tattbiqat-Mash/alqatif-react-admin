import { endpoints } from "@/config/endpoints"
import { apiGet, apiPost } from "@/lib/api/client"
import { ApiError } from "@/lib/api/errors"
import { toText } from "@/lib/api/parse"
import type { SettingsDetailsResponseDto, SettingsSaveRequestDto } from "@/features/settings/types/settings.dto"
import type { SettingsFormValues } from "@/features/settings/schemas/settings.schema"

/** `data` is a one-item array (rules/api-samples/settings-details.json). */
export function mapSettings(raw: SettingsDetailsResponseDto | null | undefined): SettingsFormValues {
  const dto = Array.isArray(raw?.data) ? raw.data[0] : undefined
  if (!dto) {
    throw new ApiError({
      statusCode: 200,
      message: "تعذر قراءة الإعدادات من رد الخادم.",
      serverMessage: "settings/getDetails: empty data array",
    })
  }
  // Long texts keep their line breaks; only the short fields are trimmed.
  return {
    facebook: toText(dto.facebook),
    twitter: toText(dto.twitter),
    insta: toText(dto.insta),
    whatsapp: toText(dto.whatsapp),
    email: toText(dto.email),
    about: dto.about ?? "",
    privacy: dto.privacy ?? "",
    info: dto.info ?? "",
  }
}

export async function getSettings(): Promise<SettingsFormValues> {
  return mapSettings(await apiGet<SettingsDetailsResponseDto>(endpoints.settings.details))
}

// ⚠ TBD: the reply is unknown; any non-error reply counts as success.
export function saveSettings(values: SettingsFormValues) {
  const body: SettingsSaveRequestDto = { ...values }
  return apiPost<unknown>(endpoints.settings.edit, body)
}
