"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRightIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { FormErrorBanner, FormField } from "@/components/ui/form-field"
import { ImagePicker } from "@/components/ui/image-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { imageUrl } from "@/config/content-types"
import { useSaveAd, useUploadAdImage } from "@/features/ads/hooks/use-ads"
import { adSchema, type AdFormValues } from "@/features/ads/schemas/ad.schema"
import { useCategories } from "@/features/categories/hooks/use-categories"
import { activeStatus, adKind, adType } from "@/lib/labels"
import { messages } from "@/lib/messages"

export function BackToAds() {
  return (
    <Button variant="outline" asChild>
      <Link href="/ads">
        <ArrowRightIcon data-icon="inline-start" />
        {messages.actions.backToList}
      </Link>
    </Button>
  )
}

/** A select over a numeric enum map from `@/lib/labels`. */
function EnumSelect<V extends number>({
  id,
  value,
  onChange,
  options,
}: {
  id: string
  value: V
  onChange: (value: V) => void
  options: readonly { value: number; label: string }[]
}) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v) as V)}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
        {options.map((o) => (
          <SelectItem key={o.value} value={String(o.value)}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function AdForm({ adId, defaultValues }: { adId: number | null; defaultValues: AdFormValues }) {
  const router = useRouter()
  const save = useSaveAd(adId)
  const upload = useUploadAdImage()
  // ⚠ TBD: which category types an ad can target; news categories (type 0) for now.
  const categories = useCategories(0)
  const { control, register, handleSubmit, formState } = useForm<AdFormValues>({
    resolver: zodResolver(adSchema),
    defaultValues,
  })
  const { errors } = formState
  const kind = useWatch({ control, name: "kind" })

  const onValid = (values: AdFormValues) =>
    save.mutate(values, {
      onSuccess: () => {
        toast.success(messages.toasts.saved)
        router.push("/ads")
      },
    })

  return (
    <form onSubmit={(event) => void handleSubmit(onValid)(event)} noValidate>
      <Card>
        <CardContent className="flex flex-col gap-6">
          <FormErrorBanner message={save.error?.message} />

          <div className="grid gap-5 md:grid-cols-2">
            <FormField id="title" label="العنوان" required error={errors.title?.message}>
              {(field) => <Input {...field} {...register("title")} dir="auto" />}
            </FormField>
            <FormField id="type" label="النوع" required>
              {(field) => (
                <Controller
                  control={control}
                  name="type"
                  render={({ field: f }) => <EnumSelect id={field.id} value={f.value} onChange={f.onChange} options={adType.options} />}
                />
              )}
            </FormField>
            <FormField id="requiredViews" label="عدد مرات الظهور للشخص الواحد" required error={errors.requiredViews?.message}>
              {(field) => (
                <Input {...field} {...register("requiredViews", { valueAsNumber: true })} type="number" inputMode="numeric" min={0} dir="ltr" />
              )}
            </FormField>
            <FormField id="active" label="الحالة" required>
              {(field) => (
                <Controller
                  control={control}
                  name="active"
                  render={({ field: f }) => (
                    <EnumSelect id={field.id} value={f.value ? 1 : 0} onChange={(v) => f.onChange(v === 1)} options={activeStatus.options} />
                  )}
                />
              )}
            </FormField>
          </div>

          <FormField id="image" label="الصورة">
            {(field) => (
              <Controller
                control={control}
                name="image"
                render={({ field: f }) => (
                  <ImagePicker
                    id={field.id}
                    value={f.value}
                    onChange={f.onChange}
                    resolveUrl={imageUrl}
                    upload={(file, onProgress) => upload.mutateAsync({ file, onProgress })}
                  />
                )}
              />
            )}
          </FormField>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField id="kind" label="طبيعة العمل" required>
              {(field) => (
                <Controller
                  control={control}
                  name="kind"
                  render={({ field: f }) => <EnumSelect id={field.id} value={f.value} onChange={f.onChange} options={adKind.options} />}
                />
              )}
            </FormField>
            {kind === 0 ? (
              <FormField id="postId" label="رقم الخبر" required hint="رقم الخبر كما يظهر في عمود «م» بقائمة الأخبار." error={errors.postId?.message}>
                {(field) => (
                  <Controller
                    control={control}
                    name="postId"
                    render={({ field: f }) => (
                      <Input
                        {...field}
                        type="number"
                        inputMode="numeric"
                        dir="ltr"
                        min={1}
                        value={f.value ?? ""}
                        onChange={(e) => f.onChange(e.target.value === "" ? null : Number(e.target.value))}
                        onBlur={f.onBlur}
                        ref={f.ref}
                      />
                    )}
                  />
                )}
              </FormField>
            ) : (
              <FormField id="link" label="اللينك" required error={errors.link?.message}>
                {(field) => <Input {...field} {...register("link")} type="url" placeholder="https://" />}
              </FormField>
            )}
            <FormField id="startDate" label="تاريخ العرض" required error={errors.startDate?.message}>
              {(field) => <Input {...field} {...register("startDate")} type="date" dir="ltr" />}
            </FormField>
            <FormField id="endDate" label="تاريخ النهاية" required error={errors.endDate?.message}>
              {(field) => <Input {...field} {...register("endDate")} type="date" dir="ltr" />}
            </FormField>
          </div>

          <fieldset className="flex flex-col gap-3 rounded-lg border border-border p-4">
            <legend className="px-1 text-sm font-medium text-foreground">
              التصنيف <span className="text-danger">*</span>
            </legend>
            {categories.isPending ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-5" />
                ))}
              </div>
            ) : (
              <Controller
                control={control}
                name="categories"
                render={({ field }) => {
                  const known = new Set((categories.data ?? []).map((c) => c.id))
                  const unknown = field.value.filter((id) => !known.has(id))
                  const toggle = (id: number, on: boolean) =>
                    field.onChange(on ? [...field.value, id] : field.value.filter((x) => x !== id))
                  return (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {(categories.data ?? []).map((c) => (
                        <div key={c.id} className="flex items-center gap-2">
                          <Checkbox id={`cat-${c.id}`} checked={field.value.includes(c.id)} onCheckedChange={(v) => toggle(c.id, v === true)} />
                          <Label htmlFor={`cat-${c.id}`} className="text-sm font-normal">
                            {c.title}
                          </Label>
                        </div>
                      ))}
                      {/* Saved ids the list does not offer stay selected until removed. */}
                      {unknown.map((id) => (
                        <div key={id} className="flex items-center gap-2">
                          <Checkbox id={`cat-${id}`} checked onCheckedChange={() => toggle(id, false)} />
                          <Label htmlFor={`cat-${id}`} className="text-sm font-normal text-muted-text">
                            تصنيف رقم {id}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )
                }}
              />
            )}
            {errors.categories?.message && <p className="text-xs text-danger-ink">{errors.categories.message}</p>}
          </fieldset>

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <Button type="submit" size="lg" disabled={save.isPending || upload.isPending}>
              {save.isPending && <Spinner />}
              {save.isPending ? messages.states.saving : messages.actions.save}
            </Button>
            <Button type="button" size="lg" variant="outline" onClick={() => router.push("/ads")} disabled={save.isPending}>
              {messages.actions.cancel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
