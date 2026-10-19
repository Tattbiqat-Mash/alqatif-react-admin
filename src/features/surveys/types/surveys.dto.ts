/**
 * `GET /admin/surveys/getDetails/{id}` → `{ status, data: [SurveyDetailsDto] }` (a one-item
 * array). Source: rules/api-samples/surveys-details.json. Every number arrives as a string.
 */
export type SurveyDetailsDto = {
  surveyId: string | number
  categoryId: string | number
  active: string | number
  title: string
  validDays: string | number
  /** Spelled "vaild" by the API (also in the `edit` body). */
  vaildHours: string | number
  validMin: string | number
  /** A JSON-encoded string of SurveyAnswerDto[], not an array. */
  answers: string | SurveyAnswerDto[] | null
}

/** One answer option; the API calls the text "question" and the votes "answers". */
export type SurveyAnswerDto = {
  id: number
  /** Votes count. */
  answers: number
  question: string
}
