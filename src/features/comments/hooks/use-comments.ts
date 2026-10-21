"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { parseAsInteger, parseAsNumberLiteral, parseAsString, useQueryStates } from "nuqs"
import { toast } from "sonner"

import {
  deleteComment,
  getComment,
  listComments,
  saveComment,
  type CommentItem,
  type CommentListFilters,
} from "@/features/comments/api/comments.api"
import type { ApiError } from "@/lib/api/errors"
import type { ListResult } from "@/lib/api/list"
import { messages } from "@/lib/messages"
import { useRememberListUrl } from "@/lib/list-return"

export const commentKeys = {
  all: ["comments"] as const,
  lists: () => [...commentKeys.all, "list"] as const,
  list: (filters: CommentListFilters) => [...commentKeys.lists(), filters] as const,
  detail: (id: number) => [...commentKeys.all, "detail", id] as const,
}

const parsers = {
  page: parseAsInteger.withDefault(1),
  q: parseAsString.withDefault(""),
  active: parseAsNumberLiteral([0, 1] as const),
  // Set by "التعليقات" on a post row.
  postId: parseAsInteger,
}

export function useCommentFilters() {
  const [state, setState] = useQueryStates(parsers, { history: "replace" })
  useRememberListUrl()
  const filters: CommentListFilters = {
    page: Math.max(1, state.page),
    search: state.q,
    active: state.active === null ? null : state.active === 1,
    postId: state.postId,
  }
  return {
    filters,
    hasActiveFilters: Boolean(state.q) || state.active !== null || state.postId !== null,
    setPage: (page: number) => void setState({ page: page <= 1 ? null : page }, { history: "push" }),
    setSearch: (q: string) => void setState({ q: q || null, page: null }),
    setActive: (active: 0 | 1 | null) => void setState({ active, page: null }),
    clearPost: () => void setState({ postId: null, page: null }),
    clear: () => void setState({ q: null, active: null, postId: null, page: null }),
  }
}

export function useCommentsList(filters: CommentListFilters) {
  return useQuery<ListResult<CommentItem>, ApiError>({
    queryKey: commentKeys.list(filters),
    queryFn: () => listComments(filters),
    placeholderData: keepPreviousData,
  })
}

export function useComment(id: number) {
  return useQuery<CommentItem, ApiError>({
    queryKey: commentKeys.detail(id),
    queryFn: () => getComment(id),
    refetchOnMount: "always",
  })
}

function useInvalidate() {
  const queryClient = useQueryClient()
  return (id?: number) => {
    void queryClient.invalidateQueries({ queryKey: commentKeys.lists() })
    if (id !== undefined) void queryClient.invalidateQueries({ queryKey: commentKeys.detail(id) })
  }
}

export function useSaveComment(id: number) {
  const invalidate = useInvalidate()
  return useMutation<unknown, ApiError, { comment: string; active: boolean }>({
    mutationFn: (values) => saveComment(id, values),
    onSuccess: () => invalidate(id),
  })
}

export function useDeleteComment() {
  const invalidate = useInvalidate()
  return useMutation<unknown, ApiError, { id: number }>({
    mutationFn: ({ id }) => deleteComment(id),
    onSuccess: () => toast.success(messages.toasts.deleted),
    onError: (error) => toast.error(error.message),
    onSettled: (_d, _e, { id }) => invalidate(id),
  })
}
