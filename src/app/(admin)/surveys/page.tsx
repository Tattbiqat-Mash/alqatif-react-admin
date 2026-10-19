import { Suspense } from "react"
import type { Metadata } from "next"

import { RequirePermission } from "@/components/layout/require-permission"
import { Card } from "@/components/ui/card"
import { SurveysScreen } from "@/features/surveys/components/surveys-screen"

export const metadata: Metadata = { title: "الاستبيانات" }

export default function SurveysPage() {
  return (
    <RequirePermission permission="allowSurveys">
      {/* Filters live in the URL (nuqs → useSearchParams), which needs a boundary. */}
      <Suspense fallback={<Card className="h-96" />}>
        <SurveysScreen />
      </Suspense>
    </RequirePermission>
  )
}
