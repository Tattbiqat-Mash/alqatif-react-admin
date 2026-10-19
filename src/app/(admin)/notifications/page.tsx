import type { Metadata } from "next"

import { RequirePermission } from "@/components/layout/require-permission"
import { NotificationsScreen } from "@/features/notifications/components/notifications-screen"

export const metadata: Metadata = { title: "الإشعارات" }

export default function NotificationsPage() {
  return (
    <RequirePermission permission="allowNotifications">
      <NotificationsScreen />
    </RequirePermission>
  )
}
