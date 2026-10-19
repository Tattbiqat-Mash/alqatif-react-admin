import { z } from "zod"

import { messages } from "@/lib/messages"

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export const adSchema = z
  .object({
    title: z.string().trim().min(1, messages.validation.required),
    /** 0 بانر · 1 اقتحامي · 2 بانر داخل الخبر */
    type: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    requiredViews: z.number({ error: messages.validation.required }).int().min(0, "لا يقل عن 0"),
    image: z.string(),
    /** 0 خبر (postId) · 1 لينك خارجي (link) */
    kind: z.union([z.literal(0), z.literal(1)]),
    postId: z.number().int().positive().nullable(),
    link: z.string().trim(),
    startDate: z.string().regex(ISO_DATE, messages.validation.required),
    endDate: z.string().regex(ISO_DATE, messages.validation.required),
    active: z.boolean(),
    categories: z.array(z.number().int().positive()),
  })
  .superRefine((v, ctx) => {
    if (v.kind === 0 && v.postId === null) {
      ctx.addIssue({ code: "custom", path: ["postId"], message: "أدخل رقم الخبر" })
    }
    if (v.kind === 1) {
      let ok = false
      try {
        ok = /^https?:$/.test(new URL(v.link).protocol)
      } catch {
        ok = false
      }
      if (!ok) ctx.addIssue({ code: "custom", path: ["link"], message: messages.validation.invalidUrl })
    }
    if (ISO_DATE.test(v.startDate) && ISO_DATE.test(v.endDate) && v.endDate < v.startDate) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "تاريخ النهاية قبل تاريخ العرض" })
    }
    if (v.categories.length === 0) {
      ctx.addIssue({ code: "custom", path: ["categories"], message: "اختر تصنيفاً واحداً على الأقل" })
    }
  })

export type AdFormValues = z.infer<typeof adSchema>

function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export function emptyAdValues(): AdFormValues {
  return {
    title: "",
    type: 0,
    requiredViews: 0,
    image: "",
    kind: 1,
    postId: null,
    link: "",
    startDate: today(),
    endDate: today(),
    active: true,
    categories: [],
  }
}
