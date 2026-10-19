import { Suspense } from "react"
import type { Metadata } from "next"

import { RequirePermission } from "@/components/layout/require-permission"
import { Card } from "@/components/ui/card"
import { EditEditorScreen } from "@/features/editors/components/editor-form-screen"

export const metadata: Metadata = { title: "تعديل محرر" }

export default function EditEditorPage() {
  return (
    <RequirePermission permission="allowAdmins">
      <Suspense fallback={<Card className="h-96" />}>
        <EditEditorScreen />
      </Suspense>
    </RequirePermission>
  )
}
