import { Suspense } from "react"
import type { Metadata } from "next"

import { RequirePermission } from "@/components/layout/require-permission"
import { Card } from "@/components/ui/card"
import { EditSurveyScreen } from "@/features/surveys/components/survey-form"

export const metadata: Metadata = { title: "تعديل استبيان" }

export default function EditSurveyPage() {
  return (
    <RequirePermission permission="allowSurveys">
      <Suspense fallback={<Card className="h-96" />}>
        <EditSurveyScreen />
      </Suspense>
    </RequirePermission>
  )
}
