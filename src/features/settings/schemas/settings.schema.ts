import { z } from "zod"

import { messages } from "@/lib/messages"

const required = z.string().trim().min(1, messages.validation.required)

/** http(s) URL; Arabic characters in the path are fine (the current Facebook link has them). */
const url = required.refine((value) => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}, messages.validation.invalidUrl)

export const settingsSchema = z.object({
  facebook: url,
  twitter: url,
  insta: url,
  whatsapp: required.regex(/^\+?[0-9\s-]{6,20}$/, "رقم الواتساب غير صحيح"),
  email: required.pipe(z.email(messages.validation.invalidEmail)),
  about: required,
  privacy: required,
  info: required,
})

export type SettingsFormValues = z.infer<typeof settingsSchema>
