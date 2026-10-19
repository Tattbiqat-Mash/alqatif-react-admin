"use client"

import type * as React from "react"

import { useAuth } from "@/components/providers/auth-provider"
import { Card } from "@/components/ui/card"
import { ForbiddenState } from "@/components/ui/states"
import type { AdminPermission } from "@/features/auth/types/auth.types"

/** Wraps a page whose route needs a permission flag (no redirect — the shell stays). */
export function RequirePermission({
  permission,
  children,
}: {
  permission: AdminPermission
  children: React.ReactNode
}) {
  const { can } = useAuth()
  if (!can(permission)) {
    return (
      <Card>
        <ForbiddenState />
      </Card>
    )
  }
  return children
}
