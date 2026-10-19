"use client"

import type * as React from "react"
import Link from "next/link"
import { notFound, useParams, useRouter } from "next/navigation"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRightIcon, PlusIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FormErrorBanner, FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/ui/page-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { ErrorState, ForbiddenState, NotFoundState } from "@/components/ui/states"
import { useCategories } from "@/features/categories/hooks/use-categories"
import type { SurveyAnswer } from "@/features/surveys/api/surveys.api"
import { SurveyAnswers } from "@/features/surveys/components/survey-answers"
import { useSaveSurvey, useSurvey } from "@/features/surveys/hooks/use-surveys"
import { emptySurveyValues, surveySchema, type SurveyFormValues } from "@/features/surveys/schemas/survey.schema"
import { activeStatus } from "@/lib/labels"
import { messages } from "@/lib/messages"

function Back() {
  return (
    <Button variant="outline" asChild>
      <Link href="/surveys">
        <ArrowRightIcon data-icon="inline-start" />
        {messages.actions.backToList}
      </Link>
    </Button>
  )
}

const range = (max: number) => Array.from({ length: max + 1 }, (_, i) => i)

// Selects as in the old admin; a stored value outside the range is still offered.
const DURATION = [
  { name: "validDays", label: "أيام", unit: "يوم", options: range(30) },
  { name: "validHours", label: "ساعات", unit: "ساعة", options: range(23) },
  { name: "validMin", label: "دقائق", unit: "دقيقة", options: range(59) },
] as const

function SurveyForm({
  surveyId,
  defaultValues,
  answers,
}: {
  surveyId: number | null
  defaultValues: SurveyFormValues
  /** Edit mode: the existing answers (managed one by one). */
  answers?: SurveyAnswer[]
}) {
  const router = useRouter()
  const mode = surveyId === null ? "create" : "edit"
  const save = useSaveSurvey(surveyId)
  // ⚠ TBD: which category types surveys use; news categories (type 0) for now.
  const categories = useCategories(0)
  const { control, register, handleSubmit, formState } = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema(mode)),
    defaultValues,
  })
  const { errors } = formState
  const rows = useFieldArray({ control, name: "answers" })

  const onValid = (values: SurveyFormValues) =>
    save.mutate(values, {
      onSuccess: () => {
        toast.success(messages.toasts.saved)
        router.push("/surveys")
      },
    })

  const durationError = errors.validDays?.message ?? errors.validHours?.message ?? errors.validMin?.message

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <form onSubmit={(event) => void handleSubmit(onValid)(event)} noValidate>
        <Card>
          <CardContent className="flex flex-col gap-6">
            <FormErrorBanner message={save.error?.message} />
            <div className="grid gap-5 md:grid-cols-2">
              <FormField id="catId" label="التصنيف" required error={errors.catId?.message}>
                {(field) => (
                  <Controller
                    control={control}
                    name="catId"
                    render={({ field: f }) => (
                      <Select value={f.value === null ? "" : String(f.value)} onValueChange={(v) => f.onChange(Number(v))} disabled={categories.isPending}>
                        <SelectTrigger id={field.id} aria-invalid={field["aria-invalid"]} className="w-full">
                          <SelectValue placeholder={categories.isPending ? messages.states.loading : "اختر التصنيف"} />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {categories.data?.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.title}
                            </SelectItem>
                          ))}
                          {f.value !== null && categories.data && !categories.data.some((c) => c.id === f.value) && (
                            <SelectItem value={String(f.value)}>تصنيف رقم {f.value}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </FormField>
              <FormField id="title" label="العنوان" required error={errors.title?.message}>
                {(field) => <Input {...field} {...register("title")} dir="auto" />}
              </FormField>
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 text-sm font-medium text-foreground">
                  مدة الاستقصاء <span className="text-danger">*</span>
                </legend>
                <div className="grid grid-cols-3 gap-3">
                  {DURATION.map((d) => (
                    <div key={d.name} className="flex flex-col gap-1">
                      <span id={`${d.name}-label`} className="text-xs text-muted-text">
                        {d.label}
                      </span>
                      <Controller
                        control={control}
                        name={d.name}
                        render={({ field: f }) => (
                          <Select value={String(f.value)} onValueChange={(v) => f.onChange(Number(v))}>
                            <SelectTrigger aria-labelledby={`${d.name}-label`} aria-invalid={Boolean(errors[d.name])} className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent position="popper" className="max-h-64">
                              {(d.options.includes(f.value as never) ? d.options : [...d.options, f.value]).map((n) => (
                                <SelectItem key={n} value={String(n)}>
                                  {n} {d.unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  ))}
                </div>
                {durationError && <p className="text-xs text-danger-ink">{durationError}</p>}
              </fieldset>
              <FormField id="active" label="الحالة" required>
                {(field) => (
                  <Controller
                    control={control}
                    name="active"
                    render={({ field: f }) => (
                      <Select value={f.value ? "1" : "0"} onValueChange={(v) => f.onChange(v === "1")}>
                        <SelectTrigger id={field.id} className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {activeStatus.options.map((o) => (
                            <SelectItem key={o.value} value={String(o.value)}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </FormField>
            </div>

            {mode === "create" && (
              <section aria-label="الإجابات" className="flex flex-col gap-3 rounded-lg border border-border p-4">
                <h2 className="text-sm font-semibold text-foreground">
                  الإجابات <span className="text-danger">*</span>
                </h2>
                {rows.fields.map((row, index) => (
                  <div key={row.id} className="flex flex-col gap-1">
                    <div className="flex gap-2">
                      <Input
                        {...register(`answers.${index}.text`)}
                        placeholder={`الإجابة ${index + 1}`}
                        dir="auto"
                        aria-label={`الإجابة ${index + 1}`}
                        aria-invalid={Boolean(errors.answers?.[index]?.text)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`حذف الإجابة ${index + 1}`}
                        disabled={rows.fields.length <= 2}
                        onClick={() => rows.remove(index)}
                      >
                        <XIcon />
                      </Button>
                    </div>
                    {errors.answers?.[index]?.text?.message && (
                      <p className="text-xs text-danger-ink">{errors.answers[index]?.text?.message}</p>
                    )}
                  </div>
                ))}
                {errors.answers?.message && <p className="text-xs text-danger-ink">{errors.answers.message}</p>}
                <Button type="button" variant="outline" className="self-start" onClick={() => rows.append({ text: "" })}>
                  <PlusIcon data-icon="inline-start" />
                  إضافة إجابة
                </Button>
              </section>
            )}

            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
              <Button type="submit" size="lg" disabled={save.isPending}>
                {save.isPending && <Spinner />}
                {save.isPending ? messages.states.saving : messages.actions.save}
              </Button>
              <Button type="button" size="lg" variant="outline" onClick={() => router.push("/surveys")} disabled={save.isPending}>
                {messages.actions.cancel}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Outside the survey form: answers have their own immediate saves. */}
      {surveyId !== null && answers && (
        <Card>
          <CardContent>
            <SurveyAnswers surveyId={surveyId} answers={answers} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function NewSurveyScreen() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader title="إضافة استبيان" actions={<Back />} />
      <SurveyForm surveyId={null} defaultValues={emptySurveyValues()} />
    </div>
  )
}

/** /surveys/[id]/edit — the id is runtime data, read on the client. */
export function EditSurveyScreen() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  if (!Number.isInteger(id) || id <= 0) notFound()
  const survey = useSurvey(id)

  let body: React.ReactNode
  if (survey.isPending) body = <Card className="h-96 p-6"><Skeleton className="h-full" /></Card>
  else if (survey.error?.statusCode === 403) body = <Card><ForbiddenState /></Card>
  else if (survey.error?.statusCode === 404) body = <Card><NotFoundState action={<Back />} /></Card>
  else if (survey.isError) body = <Card><ErrorState description={survey.error.message} onRetry={() => void survey.refetch()} /></Card>
  else body = <SurveyForm key={survey.data.id} surveyId={survey.data.id} defaultValues={survey.data.values} answers={survey.data.answers} />

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader title="تعديل استبيان" description={`رقم ${id}`} actions={<Back />} />
      {body}
    </div>
  )
}
