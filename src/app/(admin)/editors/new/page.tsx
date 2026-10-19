import type { Metadata } from "next"

import { RequirePermission } from "@/components/layout/require-permission"
import { NewEditorScreen } from "@/features/editors/components/editor-form-screen"

export const metadata: Metadata = { title: "إضافة محرر" }

export default function NewEditorPage() {
  return (
    <RequirePermission permission="allowAdmins">
      <NewEditorScreen />
    </RequirePermission>
  )
}
