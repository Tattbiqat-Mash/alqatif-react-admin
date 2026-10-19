import { useQuery } from "@tanstack/react-query"

import { listCategories, type Category } from "@/features/categories/api/categories.api"
import type { ApiError } from "@/lib/api/errors"

export const categoryKeys = {
  all: ["categories"] as const,
  byType: (type: number) => [...categoryKeys.all, "type", type] as const,
}

export function useCategories(type: number, options: { enabled?: boolean } = {}) {
  return useQuery<Category[], ApiError>({
    queryKey: categoryKeys.byType(type),
    queryFn: () => listCategories(type),
    // Categories change rarely.
    staleTime: 5 * 60_000,
    enabled: options.enabled ?? true,
  })
}
