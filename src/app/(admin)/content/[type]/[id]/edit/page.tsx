import { Suspense } from "react"
import type { Metadata } from "next"

import { RequirePermission } from "@/components/layout/require-permission"
import { Card } from "@/components/ui/card"
import { EditPostScreen } from "@/features/posts/components/post-form-screen"

export const metadata: Metadata = { title: "تعديل" }

// The post id is only known at request time, so the screen reads it (useParams) behind a boundary.
export default function EditPostPage() {
  return (
    <RequirePermission permission="allowPosts">
      <Suspense fallback={<Card className="h-96" />}>
        <EditPostScreen />
      </Suspense>
    </RequirePermission>
  )
}
