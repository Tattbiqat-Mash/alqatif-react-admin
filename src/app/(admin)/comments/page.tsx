import { Suspense } from "react"
import type { Metadata } from "next"

import { RequirePermission } from "@/components/layout/require-permission"
import { Card } from "@/components/ui/card"
import { CommentsScreen } from "@/features/comments/components/comments-screen"

export const metadata: Metadata = { title: "التعليقات" }

export default function CommentsPage() {
  return (
    <RequirePermission permission="allowComments">
      {/* Filters live in the URL (nuqs → useSearchParams), which needs a boundary. */}
      <Suspense fallback={<Card className="h-96" />}>
        <CommentsScreen />
      </Suspense>
    </RequirePermission>
  )
}
