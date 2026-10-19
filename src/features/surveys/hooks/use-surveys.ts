"use client"

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { parseAsInteger, parseAsNumberLiteral, parseAsString, useQueryStates } from "nuqs"
import { toast } from "sonner"

import {
  addAnswer,
  createSurvey,
  deleteAnswer,
  deleteSurvey,
  editAnswer,
  getSurvey,
  listSurveys,
  toggleSurvey,
  updateSurvey,
  type SurveyDetails,
  type SurveyItem,
  type SurveyListFilters,
} from "@/features/surveys/api/surveys.api"
import type { SurveyFormValues } from "@/features/surveys/schemas/survey.schema"
import type { ApiError } from "@/lib/api/errors"
import type { ListResult } from "@/lib/api/list"
import { messages } from "@/lib/messages"

export const surveyKeys = {
  all: ["surveys"] as const,
  lists: () => [...surveyKeys.all, "list"] as const,
  list: (filters: SurveyListFilters) => [...surveyKeys.lists(), filters] as const,
  detail: (id: number) => [...surveyKeys.all, "detail", id] as const,
}

const parsers = {
  page: parseAsInteger.withDefault(1),
  q: parseAsString.withDefault(""),
  active: parseAsNumberLiteral([0, 1] as const),
}

export function useSurveyFilters() {
  const [state, setState] = useQueryStates(parsers, { history: "replace" })
  const filters: SurveyListFilters = {
    page: Math.max(1, state.page),
    search: state.q,
    active: state.active === null ? null : state.active === 1,
  }
  return {
    filters,
    hasActiveFilters: Boolean(state.q) || state.active !== null,
    setPage: (page: number) => void setState({ page: page <= 1 ? null : page }, { history: "push" }),
    setSearch: (q: string) => void setState({ q: q || null, page: null }),
    setActive: (active: 0 | 1 | null) => void setState({ active, page: null }),
    clear: () => void setState({ q: null, active: null, page: null }),
  }
}

export function useSurveysList(filters: SurveyListFilters) {
  return useQuery<ListResult<SurveyItem>, ApiError>({
    queryKey: surveyKeys.list(filters),
    queryFn: () => listSurveys(filters),
    placeholderData: keepPreviousData,
  })
}

export function useSurvey(id: number) {
  return useQuery<SurveyDetails, ApiError>({
    queryKey: surveyKeys.detail(id),
    queryFn: () => getSurvey(id),
    refetchOnMount: "always",
  })
}

function useInvalidate() {
  const queryClient = useQueryClient()
  return (id?: number) => {
    void queryClient.invalidateQueries({ queryKey: surveyKeys.lists() })
    if (id !== undefined) void queryClient.invalidateQueries({ queryKey: surveyKeys.detail(id) })
  }
}

export function useSaveSurvey(id: number | null) {
  const invalidate = useInvalidate()
  return useMutation<unknown, ApiError, SurveyFormValues>({
    mutationFn: (values) => (id === null ? createSurvey(values) : updateSurvey(id, values)),
    onSuccess: () => invalidate(id ?? undefined),
  })
}

/** Toggle / delete from the list. */
export function useSurveyRowMutations() {
  const invalidate = useInvalidate()
  const toggle = useMutation<unknown, ApiError, { id: number }>({
    mutationFn: ({ id }) => toggleSurvey(id),
    onSuccess: () => toast.success(messages.toasts.statusChanged),
    onError: (error) => toast.error(error.message),
    onSettled: (_d, _e, { id }) => invalidate(id),
  })
  const remove = useMutation<unknown, ApiError, { id: number }>({
    mutationFn: ({ id }) => deleteSurvey(id),
    onSuccess: () => toast.success(messages.toasts.deleted),
    onError: (error) => toast.error(error.message),
    onSettled: (_d, _e, { id }) => invalidate(id),
  })
  return { toggle, remove }
}

/** Answers on the edit page save one by one, immediately. */
export function useAnswerMutations(surveyId: number) {
  const invalidate = useInvalidate()
  const done = (message: string) => ({
    onSuccess: () => toast.success(message),
    onError: (error: ApiError) => toast.error(error.message),
    onSettled: () => invalidate(surveyId),
  })
  return {
    add: useMutation<unknown, ApiError, string>({ mutationFn: (text) => addAnswer(surveyId, text), ...done("تمت إضافة الإجابة") }),
    edit: useMutation<unknown, ApiError, { id: number; text: string }>({
      mutationFn: ({ id, text }) => editAnswer(id, text),
      ...done(messages.toasts.saved),
    }),
    remove: useMutation<unknown, ApiError, number>({ mutationFn: (id) => deleteAnswer(id), ...done(messages.toasts.deleted) }),
  }
}
