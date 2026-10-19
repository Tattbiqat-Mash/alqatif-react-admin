import { z } from "zod"

import { ADMIN_PERMISSIONS } from "@/features/auth/types/auth.types"
import { messages } from "@/lib/messages"

const permissionsShape = Object.fromEntries(ADMIN_PERMISSIONS.map((p) => [p, z.boolean()])) as Record<
  (typeof ADMIN_PERMISSIONS)[number],
  z.ZodBoolean
>

export function editorSchema(mode: "create" | "edit") {
  return z
    .object({
      userName: z.string().trim().min(1, messages.validation.required).regex(/^\S+$/, "اسم المستخدم بدون مسافات"),
      displayName: z.string().trim().min(1, messages.validation.required),
      // Lenient on purpose: existing accounts carry addresses such as "m1m@mm.com1" that a strict
      // check rejects, and that must not block editing the rest of the account.
      email: z
        .string()
        .trim()
        .min(1, messages.validation.required)
        .regex(/^[^\s@]+@[^\s@]+$/, messages.validation.invalidEmail),
      password:
        mode === "create"
          ? z.string().min(6, "كلمة المرور 6 أحرف على الأقل")
          : z.string().refine((v) => v === "" || v.length >= 6, "كلمة المرور 6 أحرف على الأقل"),
      type: z.union([z.literal(0), z.literal(1)]),
      active: z.boolean(),
      permissions: z.object(permissionsShape),
    })
    .superRefine((values, ctx) => {
      if (values.type === 1 && !Object.values(values.permissions).some(Boolean)) {
        ctx.addIssue({ code: "custom", path: ["permissions"], message: "اختر صلاحية واحدة على الأقل" })
      }
    })
}

export type EditorFormValues = z.infer<ReturnType<typeof editorSchema>>

export function emptyEditorValues(): EditorFormValues {
  return {
    userName: "",
    displayName: "",
    email: "",
    password: "",
    type: 1,
    active: true,
    permissions: Object.fromEntries(ADMIN_PERMISSIONS.map((p) => [p, false])) as EditorFormValues["permissions"],
  }
}
