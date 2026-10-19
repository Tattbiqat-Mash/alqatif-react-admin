import { Suspense } from "react"
import type { Metadata } from "next"

import { RequirePermission } from "@/components/layout/require-permission"
import { Card } from "@/components/ui/card"
import { CommentEditScreen } from "@/features/comments/components/comment-edit-screen"

export const metadata: Metadata = { title: "تعديل تعليق" }

export default function CommentEditPage() {
  return (
    <RequirePermission permission="allowComments">
      <Suspense fallback={<Card className="h-80" />}>
        <CommentEditScreen />
      </Suspense>
    </RequirePermission>
  )
}
