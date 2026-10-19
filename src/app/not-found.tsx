import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = { title: "الصفحة غير موجودة" }

/** Unknown URLs. Rendered outside the admin shell, so it needs no session. */
export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <p className="text-4xl font-bold text-primary-ink">404</p>
          <h1 className="text-lg font-semibold text-foreground">الصفحة غير موجودة</h1>
          <p className="text-sm text-muted-text">الرابط الذي فتحته غير صحيح أو أن الصفحة نُقلت.</p>
          <Button asChild className="mt-2">
            <Link href="/dashboard">العودة للرئيسية</Link>
          </Button>
        </div>
      </Card>
    </main>
  )
}
