/**
 * Labels (and badge tones) for every numeric enum the API uses. Values come from
 * rules/api-endpoints.md — never write these numbers or labels inline in components.
 */
export type Tone = "success" | "warning" | "danger" | "info" | "neutral"

export type EnumEntry = { label: string; tone?: Tone }
type EnumMap<V extends number> = Record<V, EnumEntry>

function defineEnum<V extends number>(map: EnumMap<V>) {
  const values = Object.keys(map).map(Number) as V[]
  return {
    map,
    values,
    /** Entry for a value, or undefined when the API sends something unknown. */
    get: (value: number | null | undefined): EnumEntry | undefined =>
      value === null || value === undefined ? undefined : map[value as V],
    /** `{ value, label }` pairs for selects, in declaration order. */
    options: values.map((value) => ({ value, label: map[value].label })),
  }
}

export const postStatus = defineEnum({
  0: { label: "تحت المراجعة", tone: "warning" },
  1: { label: "منشور", tone: "success" },
  2: { label: "موقوف", tone: "danger" },
})

export const postType = defineEnum({
  0: { label: "أخبار" },
  1: { label: "فيديو" },
  2: { label: "صور" },
  3: { label: "مختصرات" },
  4: { label: "وفيات" },
})

export const pinned = defineEnum({
  1: { label: "مثبت", tone: "info" },
  0: { label: "غير مثبت", tone: "neutral" },
})

export const yesNo = defineEnum({
  1: { label: "نعم" },
  0: { label: "لا" },
})

export const bannersStatus = defineEnum({
  0: { label: "لا" },
  1: { label: "بانرات القسم" },
  2: { label: "بانرات خاصة" },
})

export const khatmaKind = defineEnum({
  0: { label: "أجزاء" },
  1: { label: "أحزاب" },
  2: { label: "سور" },
})

export const khatmaSize = defineEnum({
  0: { label: "جزء" },
  1: { label: "نصف جزء" },
  2: { label: "حزب" },
  3: { label: "نصف حزب" },
  4: { label: "ربع حزب" },
  5: { label: "سورة" },
})

/** ⚠ TBD: confirm comment status labels (rules/api-endpoints.md#comments--admincomments). */
export const commentStatus = defineEnum({
  1: { label: "منشور", tone: "success" },
  0: { label: "موقوف", tone: "danger" },
})

/** Ads and surveys. */
export const activeStatus = defineEnum({
  1: { label: "فعال", tone: "success" },
  0: { label: "غير فعال", tone: "neutral" },
})

export const adType = defineEnum({
  0: { label: "بانر" },
  1: { label: "اقتحامي" },
  2: { label: "بانر داخل الخبر" },
})

export const adKind = defineEnum({
  0: { label: "خبر" },
  1: { label: "لينك خارجي" },
})

/** ⚠ TBD: the old list shows "محرر" / "معلن" — confirm the labels for type 0 / 1. */
export const editorType = defineEnum({
  0: { label: "أدمن" },
  1: { label: "أدمن فرعي" },
})

export const editorStatus = defineEnum({
  1: { label: "فعال", tone: "success" },
  0: { label: "موقوف", tone: "danger" },
})

export const categoryType = defineEnum({
  0: { label: "أخبار" },
  1: { label: "فيديو" },
  2: { label: "صور" },
  3: { label: "نصي" },
  4: { label: "وفيات" },
})
