import { endpoints } from "@/config/endpoints"
import { apiGet, apiPost } from "@/lib/api/client"
import { normalizeList, toApiPage, type ListEnvelopeDto, type ListResult } from "@/lib/api/list"
import { pickNumber, pickText, toArray, toNumber, toText, unreadableDetails } from "@/lib/api/parse"
import type { SurveyFormValues } from "@/features/surveys/schemas/survey.schema"
import type { SurveyAnswerDto, SurveyDetailsDto } from "@/features/surveys/types/surveys.dto"

/**
 * ⚠ TBD — PROVISIONAL list mapping: no surveys/list sample yet (getDetails is real, see below). Keys come from
 * the collection's add/edit bodies and the old admin's columns. Replace with real DTOs.
 */
type RawRow = Record<string, unknown>

export type SurveyItem = {
  id: number
  title: string
  category: string
  publishedAt: string | null
  active: boolean
  /** عدد الإجابات (votes). */
  answersCount: number
}

export function mapSurvey(row: RawRow): SurveyItem {
  return {
    id: pickNumber(row, ["id"], 0),
    title: pickText(row, ["title"]),
    category: pickText(row, ["categoryTitle", "catTitle", "category", "catName"]),
    publishedAt: pickText(row, ["publishDate", "puplishDate", "createdAt", "created_at", "addDate", "date"]) || null,
    active: pickNumber(row, ["active", "status"], 0) === 1,
    answersCount: pickNumber(row, ["answersCount", "votesCount", "votes", "count", "answers"], 0),
  }
}

export type SurveyListFilters = { page: number; search: string; active: boolean | null }

export async function listSurveys(filters: SurveyListFilters): Promise<ListResult<SurveyItem>> {
  const raw = await apiPost<ListEnvelopeDto<RawRow>>(endpoints.surveys.list, {
    page: toApiPage(filters.page),
    search: filters.search || undefined,
    active: filters.active === null ? undefined : filters.active ? 1 : 0,
  })
  return normalizeList(raw, filters.page, mapSurvey)
}

/** An answer option (the API calls them "questions"). */
export type SurveyAnswer = { id: number; text: string; votes: number }

export type SurveyDetails = { id: number; values: SurveyFormValues; answers: SurveyAnswer[] }

/** `answers` arrives as a JSON string; a broken one reads as no answers. */
function parseAnswers(value: SurveyDetailsDto["answers"]): SurveyAnswerDto[] {
  if (Array.isArray(value)) return value
  if (typeof value !== "string" || value.trim() === "") return []
  try {
    return toArray<SurveyAnswerDto>(JSON.parse(value))
  } catch {
    return []
  }
}

export function mapSurveyDetails(raw: unknown): SurveyDetails {
  const data = (raw as { data?: unknown } | null)?.data
  const dto = (Array.isArray(data) ? data[0] : null) as SurveyDetailsDto | null | undefined
  const id = toNumber(dto?.surveyId, 0)
  if (!dto || id <= 0) {
    throw unreadableDetails(raw, "surveys/getDetails", "تعذر قراءة الاستبيان من رد الخادم.")
  }
  const catId = toNumber(dto.categoryId, 0)
  return {
    id,
    values: {
      catId: catId > 0 ? catId : null,
      title: toText(dto.title),
      validDays: toNumber(dto.validDays, 0),
      validHours: toNumber(dto.vaildHours, 0),
      validMin: toNumber(dto.validMin, 0),
      active: toNumber(dto.active, 0) === 1,
      answers: [],
    },
    answers: parseAnswers(dto.answers)
      .map((a) => ({ id: toNumber(a?.id, 0), text: toText(a?.question), votes: toNumber(a?.answers, 0) }))
      .filter((a) => a.id > 0),
  }
}

export async function getSurvey(id: number) {
  return mapSurveyDetails(await apiGet<unknown>(endpoints.surveys.details(id)))
}

// ⚠ TBD: the replies of every write below are unknown; any non-error reply counts as success.

export function createSurvey(values: SurveyFormValues) {
  return apiPost<unknown>(endpoints.surveys.add, {
    catId: values.catId ?? 0,
    title: values.title.trim(),
    validDays: values.validDays,
    validHours: values.validHours,
    validMin: values.validMin,
    // ⚠ TBD: the collection shows both "a,b,c" (sent) and a JSON array (described).
    questions: values.answers.map((a) => a.text.trim()).filter(Boolean),
    active: values.active ? 1 : 0,
  })
}

export function updateSurvey(id: number, values: SurveyFormValues) {
  return apiPost<unknown>(endpoints.surveys.edit, {
    id,
    catId: values.catId ?? 0,
    title: values.title.trim(),
    validDays: values.validDays,
    // The collection's edit spells it "vaildHours"; both are sent so either name is read.
    validHours: values.validHours,
    vaildHours: values.validHours,
    validMin: values.validMin,
    active: values.active ? 1 : 0,
  })
}

export const deleteSurvey = (id: number) => apiGet<unknown>(endpoints.surveys.delete(id))
export const addAnswer = (surveyId: number, text: string) =>
  apiPost<unknown>(endpoints.surveys.addAnswer, { surveyId, question: text.trim() })
export const editAnswer = (id: number, text: string) =>
  apiPost<unknown>(endpoints.surveys.editAnswer, { id, question: text.trim() })
export const deleteAnswer = (id: number) => apiGet<unknown>(endpoints.surveys.deleteAnswer(id))
