import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  createEditor,
  deleteEditor,
  getEditor,
  listAllEditors,
  listEditors,
  updateEditor,
  type EditorListFilters,
  type EditorListItem,
} from "@/features/editors/api/editors.api"
import type { EditorFormValues } from "@/features/editors/schemas/editor.schema"
import type { ApiError } from "@/lib/api/errors"
import type { ListResult } from "@/lib/api/list"
import { messages } from "@/lib/messages"

export const editorKeys = {
  all: ["editors"] as const,
  options: () => [...editorKeys.all, "options"] as const,
  lists: () => [...editorKeys.all, "list"] as const,
  list: (filters: EditorListFilters) => [...editorKeys.lists(), filters] as const,
  detail: (id: number) => [...editorKeys.all, "detail", id] as const,
}

/** All admin accounts, for filters (not the paginated المحررين screen). */
export function useEditorOptions(options: { enabled?: boolean } = {}) {
  return useQuery<EditorListItem[], ApiError>({
    queryKey: editorKeys.options(),
    queryFn: listAllEditors,
    staleTime: 5 * 60_000,
    enabled: options.enabled ?? true,
  })
}

export function useEditorsList(filters: EditorListFilters) {
  return useQuery<ListResult<EditorListItem>, ApiError>({
    queryKey: editorKeys.list(filters),
    queryFn: () => listEditors(filters),
    placeholderData: keepPreviousData,
  })
}

export function useEditor(id: number) {
  return useQuery<Awaited<ReturnType<typeof getEditor>>, ApiError>({
    queryKey: editorKeys.detail(id),
    queryFn: () => getEditor(id),
    refetchOnMount: "always",
  })
}

/** Lists, the filter options and the detail all change together. */
function useInvalidateEditors() {
  const queryClient = useQueryClient()
  return (id?: number) => {
    void queryClient.invalidateQueries({ queryKey: editorKeys.lists() })
    void queryClient.invalidateQueries({ queryKey: editorKeys.options() })
    if (id !== undefined) void queryClient.invalidateQueries({ queryKey: editorKeys.detail(id) })
  }
}

export function useSaveEditor(id: number | null) {
  const invalidate = useInvalidateEditors()
  return useMutation<unknown, ApiError, EditorFormValues>({
    mutationFn: (values) => (id === null ? createEditor(values) : updateEditor(id, values)),
    onSuccess: () => invalidate(id ?? undefined),
  })
}

export function useDeleteEditor() {
  const invalidate = useInvalidateEditors()
  return useMutation<unknown, ApiError, { id: number }>({
    mutationFn: ({ id }) => deleteEditor(id),
    onSuccess: () => toast.success(messages.toasts.deleted),
    onError: (error) => toast.error(error.message),
    onSettled: (_d, _e, { id }) => invalidate(id),
  })
}
