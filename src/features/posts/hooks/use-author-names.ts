import { useQuery } from "@tanstack/react-query"

import { listAuthorNames } from "@/features/posts/api/posts.api"
import { postKeys } from "@/features/posts/hooks/use-posts"
import type { ApiError } from "@/lib/api/errors"

/** ~4000 writer names; fetched once per session and shared by the list filter and the form. */
export function useAuthorNames() {
  return useQuery<string[], ApiError>({
    queryKey: [...postKeys.all, "author-names"],
    queryFn: listAuthorNames,
    staleTime: 30 * 60_000,
  })
}
