import type { Metadata } from "next"

import { RequirePermission } from "@/components/layout/require-permission"
import { NewSurveyScreen } from "@/features/surveys/components/survey-form"

export const metadata: Metadata = { title: "إضافة استبيان" }

export default function NewSurveyPage() {
  return (
    <RequirePermission permission="allowSurveys">
      <NewSurveyScreen />
    </RequirePermission>
  )
}
