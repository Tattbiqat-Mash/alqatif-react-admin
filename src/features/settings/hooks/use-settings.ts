import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getSettings, saveSettings, type LoadedSettings } from "@/features/settings/api/settings.api"
import type { ApiError } from "@/lib/api/errors"

export const settingsKeys = {
  details: ["settings", "details"] as const,
}

export function useSettings() {
  return useQuery<LoadedSettings, ApiError>({
    queryKey: settingsKeys.details,
    queryFn: getSettings,
    refetchOnMount: "always",
  })
}

export function useSaveSettings() {
  const queryClient = useQueryClient()
  return useMutation<unknown, ApiError, LoadedSettings>({
    mutationFn: saveSettings,
    onSuccess: (_data, saved) => queryClient.setQueryData(settingsKeys.details, saved),
  })
}
