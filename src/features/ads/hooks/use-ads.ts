"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { parseAsInteger, parseAsNumberLiteral, parseAsString, useQueryStates } from "nuqs"
import { toast } from "sonner"

import {
  createAd,
  deleteAd,
  getAd,
  listAds,
  toggleAd,
  updateAd,
  uploadAdImage,
  type AdItem,
  type AdListFilters,
} from "@/features/ads/api/ads.api"
import type { AdFormValues } from "@/features/ads/schemas/ad.schema"
import type { ApiError } from "@/lib/api/errors"
import type { ListResult } from "@/lib/api/list"
import { messages } from "@/lib/messages"

export const adKeys = {
  all: ["ads"] as const,
  lists: () => [...adKeys.all, "list"] as const,
  list: (filters: AdListFilters) => [...adKeys.lists(), filters] as const,
  detail: (id: number) => [...adKeys.all, "detail", id] as const,
}

const parsers = {
  page: parseAsInteger.withDefault(1),
  q: parseAsString.withDefault(""),
  type: parseAsNumberLiteral([0, 1, 2] as const),
  active: parseAsNumberLiteral([0, 1] as const),
}

export function useAdFilters() {
  const [state, setState] = useQueryStates(parsers, { history: "replace" })
  const filters: AdListFilters = {
    page: Math.max(1, state.page),
    search: state.q,
    type: state.type,
    active: state.active === null ? null : state.active === 1,
  }
  return {
    filters,
    hasActiveFilters: Boolean(state.q) || state.type !== null || state.active !== null,
    setPage: (page: number) => void setState({ page: page <= 1 ? null : page }, { history: "push" }),
    setSearch: (q: string) => void setState({ q: q || null, page: null }),
    setType: (type: 0 | 1 | 2 | null) => void setState({ type, page: null }),
    setActive: (active: 0 | 1 | null) => void setState({ active, page: null }),
    clear: () => void setState({ q: null, type: null, active: null, page: null }),
  }
}

export function useAdsList(filters: AdListFilters) {
  return useQuery<ListResult<AdItem>, ApiError>({
    queryKey: adKeys.list(filters),
    queryFn: () => listAds(filters),
    placeholderData: keepPreviousData,
  })
}

export function useAd(id: number) {
  return useQuery<Awaited<ReturnType<typeof getAd>>, ApiError>({
    queryKey: adKeys.detail(id),
    queryFn: () => getAd(id),
    refetchOnMount: "always",
  })
}

function useInvalidate() {
  const queryClient = useQueryClient()
  return (id?: number) => {
    void queryClient.invalidateQueries({ queryKey: adKeys.lists() })
    if (id !== undefined) void queryClient.invalidateQueries({ queryKey: adKeys.detail(id) })
  }
}

export function useSaveAd(id: number | null) {
  const invalidate = useInvalidate()
  return useMutation<unknown, ApiError, AdFormValues>({
    mutationFn: (values) => (id === null ? createAd(values) : updateAd(id, values)),
    onSuccess: () => invalidate(id ?? undefined),
  })
}

export function useToggleAd() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidate()
  return useMutation<unknown, ApiError, { id: number }, { rollback: () => void }>({
    mutationFn: ({ id }) => toggleAd(id),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: adKeys.lists() })
      const snapshot = queryClient.getQueriesData<ListResult<AdItem>>({ queryKey: adKeys.lists() })
      queryClient.setQueriesData<ListResult<AdItem>>({ queryKey: adKeys.lists() }, (old) =>
        old ? { ...old, items: old.items.map((a) => (a.id === id ? { ...a, active: !a.active } : a)) } : old,
      )
      return { rollback: () => snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data)) }
    },
    onError: (error, _vars, context) => {
      context?.rollback()
      toast.error(error.message)
    },
    onSuccess: () => toast.success(messages.toasts.statusChanged),
    onSettled: (_d, _e, { id }) => invalidate(id),
  })
}

export function useDeleteAd() {
  const invalidate = useInvalidate()
  return useMutation<unknown, ApiError, { id: number }>({
    mutationFn: ({ id }) => deleteAd(id),
    onSuccess: () => toast.success(messages.toasts.deleted),
    onError: (error) => toast.error(error.message),
    onSettled: (_d, _e, { id }) => invalidate(id),
  })
}

export function useUploadAdImage() {
  return useMutation<string, ApiError, { file: File; onProgress?: (percent: number) => void }>({
    mutationFn: ({ file, onProgress }) => uploadAdImage(file, onProgress),
  })
}
