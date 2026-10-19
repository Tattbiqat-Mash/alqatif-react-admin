import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { ContentTypeConfig } from "@/config/content-types"
import { createPost, getPost, updatePost, uploadPostImage } from "@/features/posts/api/post-form.api"
import { postKeys } from "@/features/posts/hooks/use-posts"
import type { PostFormValues } from "@/features/posts/schemas/post.schema"
import type { ApiError } from "@/lib/api/errors"

export function usePost(id: number | null) {
  return useQuery<Awaited<ReturnType<typeof getPost>>, ApiError>({
    queryKey: postKeys.detail(id ?? 0),
    queryFn: () => getPost(id!),
    enabled: id !== null,
    // The form copies the values once; background refetches would not reach it anyway.
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnMount: "always",
  })
}

export function useSavePost(content: ContentTypeConfig, id: number | null) {
  const queryClient = useQueryClient()
  return useMutation<unknown, ApiError, PostFormValues>({
    mutationFn: (values) => (id === null ? createPost(values, content) : updatePost(id, values, content)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: postKeys.lists() })
      if (id !== null) void queryClient.invalidateQueries({ queryKey: postKeys.detail(id) })
    },
  })
}

export function useUploadPostImage() {
  return useMutation<string, ApiError, { file: File; onProgress?: (percent: number) => void }>({
    mutationFn: ({ file, onProgress }) => uploadPostImage(file, onProgress),
  })
}
