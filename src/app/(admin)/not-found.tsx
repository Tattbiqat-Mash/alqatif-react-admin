import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { NotFoundState } from "@/components/ui/states"

/** notFound() inside the admin area (e.g. an unknown content section) — keeps the shell. */
export default function AdminNotFound() {
  return (
    <Card>
      <NotFoundState
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard">العودة للرئيسية</Link>
          </Button>
        }
      />
    </Card>
  )
}
