import type { Metadata } from "next"

import { RequirePermission } from "@/components/layout/require-permission"
import { ScreenPlaceholder } from "@/components/layout/screen-placeholder"

export const metadata: Metadata = { title: "التعليقات" }

export default function Page() {
  return (
    <RequirePermission permission="allowComments">
      <ScreenPlaceholder title="التعليقات" task="07" />
    </RequirePermission>
  )
}
