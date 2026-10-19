import type { Metadata } from "next"

import { RequirePermission } from "@/components/layout/require-permission"
import { SettingsScreen } from "@/features/settings/components/settings-screen"

export const metadata: Metadata = { title: "الإعدادات العامة" }

export default function SettingsPage() {
  return (
    <RequirePermission permission="allowSettings">
      <SettingsScreen />
    </RequirePermission>
  )
}
