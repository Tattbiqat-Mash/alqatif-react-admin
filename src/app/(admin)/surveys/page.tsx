import type { Metadata } from "next"

import { RequirePermission } from "@/components/layout/require-permission"
import { ScreenPlaceholder } from "@/components/layout/screen-placeholder"

export const metadata: Metadata = { title: "الاستبيانات" }

export default function Page() {
  return (
    <RequirePermission permission="allowSurveys">
      <ScreenPlaceholder title="الاستبيانات" task="11" />
    </RequirePermission>
  )
}
