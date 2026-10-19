import { Suspense } from "react"
import type { Metadata } from "next"

import { RequirePermission } from "@/components/layout/require-permission"
import { Card } from "@/components/ui/card"
import { AdsScreen } from "@/features/ads/components/ads-screen"

export const metadata: Metadata = { title: "الإعلانات" }

export default function AdsPage() {
  return (
    <RequirePermission permission="allowAds">
      {/* Filters live in the URL (nuqs → useSearchParams), which needs a boundary. */}
      <Suspense fallback={<Card className="h-96" />}>
        <AdsScreen />
      </Suspense>
    </RequirePermission>
  )
}
