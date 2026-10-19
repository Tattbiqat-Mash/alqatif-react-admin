import type { Metadata } from "next"

import { RequirePermission } from "@/components/layout/require-permission"
import { ScreenPlaceholder } from "@/components/layout/screen-placeholder"

export const metadata: Metadata = { title: "الإعلانات" }

export default function Page() {
  return (
    <RequirePermission permission="allowAds">
      <ScreenPlaceholder title="الإعلانات" task="08" />
    </RequirePermission>
  )
}
