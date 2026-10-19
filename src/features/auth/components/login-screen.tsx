"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { LoginForm } from "@/features/auth/components/login-form"
import { redirectFromLocation } from "@/features/auth/lib/safe-redirect"

export function LoginScreen() {
  const router = useRouter()
  const { status } = useAuth()

  // Already signed in (e.g. "تذكرني" from an earlier visit): skip the form.
  React.useEffect(() => {
    if (status === "signed-in") router.replace(redirectFromLocation())
  }, [status, router])

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <header className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-xl bg-sidebar p-2 shadow-sm">
            <Image
              src="/logo.jpeg"
              alt="شعار القطيف اليوم"
              width={48}
              height={48}
              priority
              className="rounded-md"
            />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold text-foreground">
              لوحة تحكم جريدة القطيف اليوم الاخبارية
            </h1>
            <p className="text-sm text-muted-text">أدخل بيانات حسابك للمتابعة</p>
          </div>
        </header>

        <Card className="border-t-4 border-t-primary">
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
