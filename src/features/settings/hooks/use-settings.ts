import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getSettings, saveSettings } from "@/features/settings/api/settings.api"
import type { SettingsFormValues } from "@/features/settings/schemas/settings.schema"
import type { ApiError } from "@/lib/api/errors"

export const settingsKeys = {
  details: ["settings", "details"] as const,
}

export function useSettings() {
  return useQuery<SettingsFormValues, ApiError>({
    queryKey: settingsKeys.details,
    queryFn: getSettings,
    refetchOnMount: "always",
  })
}

export function useSaveSettings() {
  const queryClient = useQueryClient()
  return useMutation<unknown, ApiError, SettingsFormValues>({
    mutationFn: saveSettings,
    onSuccess: (_data, values) => queryClient.setQueryData(settingsKeys.details, values),
  })
}
