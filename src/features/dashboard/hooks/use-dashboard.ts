import { useQuery } from "@tanstack/react-query"

import { getDashboard } from "@/features/dashboard/api/dashboard.api"
import type { Dashboard } from "@/features/dashboard/types/dashboard.types"
import type { ApiError } from "@/lib/api/errors"

export const dashboardKeys = {
  home: ["dashboard", "home"] as const,
}

export function useDashboard() {
  return useQuery<Dashboard, ApiError>({
    queryKey: dashboardKeys.home,
    queryFn: getDashboard,
  })
}
