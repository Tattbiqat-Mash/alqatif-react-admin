import type { Metadata } from "next"

import { RequirePermission } from "@/components/layout/require-permission"
import { NewAdScreen } from "@/features/ads/components/ad-form-screen"

export const metadata: Metadata = { title: "إضافة إعلان" }

export default function NewAdPage() {
  return (
    <RequirePermission permission="allowAds">
      <NewAdScreen />
    </RequirePermission>
  )
}
