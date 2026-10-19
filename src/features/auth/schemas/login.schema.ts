import { z } from "zod"

import { messages } from "@/lib/messages"

export const loginSchema = z.object({
  userName: z.string().trim().min(1, messages.validation.required),
  password: z.string().min(1, messages.validation.required),
  remember: z.boolean(),
})

export type LoginFormValues = z.infer<typeof loginSchema>
