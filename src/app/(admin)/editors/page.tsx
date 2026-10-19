import { Suspense } from "react"
import type { Metadata } from "next"

import { RequirePermission } from "@/components/layout/require-permission"
import { Card } from "@/components/ui/card"
import { EditorsScreen } from "@/features/editors/components/editors-screen"

export const metadata: Metadata = { title: "المحررين" }

export default function EditorsPage() {
  return (
    <RequirePermission permission="allowAdmins">
      {/* Filters live in the URL (nuqs → useSearchParams), which needs a boundary. */}
      <Suspense fallback={<Card className="h-96" />}>
        <EditorsScreen />
      </Suspense>
    </RequirePermission>
  )
}
