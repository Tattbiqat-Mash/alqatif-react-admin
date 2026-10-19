import type { Metadata } from "next"

import { RequirePermission } from "@/components/layout/require-permission"
import { ScreenPlaceholder } from "@/components/layout/screen-placeholder"

export const metadata: Metadata = { title: "الإشعارات" }

export default function Page() {
  return (
    <RequirePermission permission="allowNotifications">
      <ScreenPlaceholder title="الإشعارات" task="10" />
    </RequirePermission>
  )
}
