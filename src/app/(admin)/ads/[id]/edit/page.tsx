import { Suspense } from "react"
import type { Metadata } from "next"

import { RequirePermission } from "@/components/layout/require-permission"
import { Card } from "@/components/ui/card"
import { EditAdScreen } from "@/features/ads/components/ad-form-screen"

export const metadata: Metadata = { title: "تعديل إعلان" }

export default function EditAdPage() {
  return (
    <RequirePermission permission="allowAds">
      <Suspense fallback={<Card className="h-96" />}>
        <EditAdScreen />
      </Suspense>
    </RequirePermission>
  )
}
