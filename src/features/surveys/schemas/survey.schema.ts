import { z } from "zod"

import { messages } from "@/lib/messages"

const duration = (max: number, label: string) =>
  z.number({ error: messages.validation.required }).int().min(0, "لا يقل عن 0").max(max, `${label} ${max} كحد أقصى`)

export function surveySchema(mode: "create" | "edit") {
  return z
    .object({
      catId: z.number().int().positive().nullable(),
      title: z.string().trim().min(1, messages.validation.required),
      validDays: duration(365, "الأيام"),
      validHours: duration(23, "الساعات"),
      validMin: duration(59, "الدقائق"),
      active: z.boolean(),
      /** Create only; on edit answers are managed one by one. */
      answers: z.array(z.object({ text: z.string().trim() })),
    })
    .superRefine((v, ctx) => {
      if (v.catId === null) ctx.addIssue({ code: "custom", path: ["catId"], message: messages.validation.required })
      if (v.validDays + v.validHours + v.validMin === 0) {
        ctx.addIssue({ code: "custom", path: ["validDays"], message: "حدّد مدة الاستقصاء" })
      }
      if (mode === "create") {
        const filled = v.answers.filter((a) => a.text !== "")
        if (filled.length < 2) ctx.addIssue({ code: "custom", path: ["answers"], message: "أضف إجابتين على الأقل" })
        // `questions` is sent comma-separated (⚠ TBD format), so a comma would split an answer.
        v.answers.forEach((a, i) => {
          if (a.text.includes(",") || a.text.includes("،")) {
            ctx.addIssue({ code: "custom", path: ["answers", i, "text"], message: "الإجابة لا تحتوي على فاصلة" })
          }
        })
      }
    })
}

export type SurveyFormValues = z.infer<ReturnType<typeof surveySchema>>

export function emptySurveyValues(): SurveyFormValues {
  return {
    catId: null,
    title: "",
    validDays: 7,
    validHours: 0,
    validMin: 0,
    active: false,
    answers: [{ text: "" }, { text: "" }],
  }
}
