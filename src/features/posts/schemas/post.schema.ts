import { z } from "zod"

import { messages } from "@/lib/messages"

const flag = z.boolean()

/**
 * One schema for every content type; fields a type does not show keep their loaded
 * (or default) values and are still sent, so editing never drops data.
 */
export const postFormSchema = z
  .object({
    categoryId: z.number().int().positive().nullable(),
    title: z.string().trim().min(1, messages.validation.required),
    content: z.string(),
    mainImage: z.string(),
    active: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    commentStatus: flag,
    authorStatus: flag,
    authorName: z.string().trim(),
    sendNotification: flag,
    fixed: flag,
    quickNewsStatus: flag,
    quickNewsTitle: z.string().trim(),
    bannersStatus: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    /** Comma-separated banner ids (kept as loaded until the banner picker exists). */
    banners: z.string(),
    khatamatStatus: flag,
    khatamatKind: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    khatamatSize: z.number().int().min(0).max(5),
    khatamatCount: z.number().int().min(0),
  })
  .superRefine((values, ctx) => {
    if (values.categoryId === null) {
      ctx.addIssue({ code: "custom", path: ["categoryId"], message: messages.validation.required })
    }
    if (values.authorStatus && !values.authorName) {
      ctx.addIssue({ code: "custom", path: ["authorName"], message: messages.validation.required })
    }
    if (values.bannersStatus === 2 && !values.banners.split(",").some((s) => s.trim() !== "")) {
      ctx.addIssue({ code: "custom", path: ["banners"], message: "اختر بانراً واحداً على الأقل" })
    }
    if (values.khatamatStatus && values.khatamatCount < 1) {
      ctx.addIssue({ code: "custom", path: ["khatamatCount"], message: "أدخل عدد الختمات المطلوبة" })
    }
  })

export type PostFormValues = z.infer<typeof postFormSchema>

/** Create-mode defaults (decision: new posts start "تحت المراجعة"). */
export function emptyPostValues(categoryId: number | null): PostFormValues {
  return {
    categoryId,
    title: "",
    content: "",
    mainImage: "",
    active: 0,
    commentStatus: true,
    authorStatus: true,
    authorName: "",
    sendNotification: false,
    fixed: false,
    quickNewsStatus: false,
    quickNewsTitle: "",
    bannersStatus: 1,
    banners: "",
    khatamatStatus: false,
    khatamatKind: 0,
    khatamatSize: 0,
    khatamatCount: 0,
  }
}
