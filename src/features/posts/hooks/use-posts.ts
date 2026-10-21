import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { ContentTypeConfig } from "@/config/content-types"
import { deletePost, listPosts, sendPostNotification } from "@/features/posts/api/posts.api"
import type { PostListFilters, PostListItem } from "@/features/posts/types/posts.types"
import type { ListResult } from "@/lib/api/list"
import type { ApiError } from "@/lib/api/errors"
import { messages } from "@/lib/messages"

export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (slug: string, filters: PostListFilters) => [...postKeys.lists(), slug, filters] as const,
  detail: (id: number) => [...postKeys.all, "detail", id] as const,
}

export function usePostsList(content: ContentTypeConfig, filters: PostListFilters) {
  return useQuery<ListResult<PostListItem>, ApiError>({
    queryKey: postKeys.list(content.slug, filters),
    queryFn: () => listPosts(content, filters),
    placeholderData: keepPreviousData,
  })
}

type ListSnapshot = [readonly unknown[], ListResult<PostListItem> | undefined][]

/**
 * Optimistically patches one post in every cached list, and returns a rollback.
 * Lists are refetched afterwards anyway, so the server stays the source of truth.
 */
function usePatchPostInLists() {
  const queryClient = useQueryClient()
  return async (id: number, patch: (post: PostListItem) => PostListItem | null) => {
    await queryClient.cancelQueries({ queryKey: postKeys.lists() })
    const snapshot: ListSnapshot = queryClient.getQueriesData<ListResult<PostListItem>>({
      queryKey: postKeys.lists(),
    })
    queryClient.setQueriesData<ListResult<PostListItem>>({ queryKey: postKeys.lists() }, (old) =>
      old
        ? {
            ...old,
            items: old.items.flatMap((post) => {
              if (post.id !== id) return [post]
              const next = patch(post)
              return next ? [next] : []
            }),
          }
        : old,
    )
    return () => {
      for (const [key, data] of snapshot) queryClient.setQueryData(key, data)
    }
  }
}

function useListMutation<TVars extends { id: number }>(options: {
  mutationFn: (vars: TVars) => Promise<unknown>
  patch: (post: PostListItem, vars: TVars) => PostListItem | null
  successMessage: string
}) {
  const queryClient = useQueryClient()
  const patchLists = usePatchPostInLists()

  return useMutation<unknown, ApiError, TVars, { rollback: () => void }>({
    mutationFn: options.mutationFn,
    onMutate: async (vars) => ({ rollback: await patchLists(vars.id, (post) => options.patch(post, vars)) }),
    onError: (error, _vars, context) => {
      context?.rollback()
      toast.error(error.message)
    },
    onSuccess: () => toast.success(options.successMessage),
    onSettled: (_data, _error, vars) => {
      void queryClient.invalidateQueries({ queryKey: postKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: postKeys.detail(vars.id) })
    },
  })
}

/** Pushes a notification for the post to the app's users. Changes nothing in the lists. */
export function useSendPostNotification() {
  return useMutation<unknown, ApiError, { id: number }>({
    mutationFn: ({ id }) => sendPostNotification(id),
    onError: (error) => toast.error(error.message),
    onSuccess: () => toast.success("تم إرسال الإشعار"),
  })
}

export function useDeletePost() {
  return useListMutation<{ id: number }>({
    mutationFn: ({ id }) => deletePost(id),
    patch: () => null,
    successMessage: messages.toasts.deleted,
  })
}
