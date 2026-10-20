"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { UserPenIcon } from "lucide-react"
import { Controller, useForm, useWatch, type Control } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { FormErrorBanner, FormField } from "@/components/ui/form-field"
import { ImagePicker } from "@/components/ui/image-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { SuggestionsList } from "@/components/ui/suggestions-list"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { contentHref, imageUrl, type ContentTypeConfig } from "@/config/content-types"
import { isDeathsCategory } from "@/features/categories/api/categories.api"
import { useCategories } from "@/features/categories/hooks/use-categories"
import type { PostMeta } from "@/features/posts/api/post-form.api"
import { BannerPicker } from "@/features/posts/components/banner-picker"
import { ImageGalleryDialog } from "@/features/posts/components/image-gallery-dialog"
import { useAuthorNames } from "@/features/posts/hooks/use-author-names"
import { useSavePost, useUploadPostImage } from "@/features/posts/hooks/use-post-form"
import { postFormSchema, type PostFormValues } from "@/features/posts/schemas/post.schema"
import { bannersStatus, khatmaKind, khatmaSize, postStatus } from "@/lib/labels"
import { messages } from "@/lib/messages"
import { listReturnHref } from "@/lib/list-return"

/** Which fields each content type shows (rules/tasks/06-posts-form.md#fields-per-type). */
function fieldsFor(content: ContentTypeConfig) {
  const t = content.type
  return {
    categorySelect: content.categoryId === null,
    titleAsTextarea: t === 3,
    editor: t === 0 || t === 1,
    author: t === 0,
    comments: t !== 3,
    breaking: t === 0,
    image: t !== 3,
    banners: t === 0,
    khatma: t === 0,
  }
}

function SwitchRow({
  control,
  name,
  label,
  description,
}: {
  control: Control<PostFormValues>
  name: "commentStatus" | "authorStatus" | "sendNotification" | "fixed" | "quickNewsStatus" | "khatamatStatus"
  label: string
  description?: string
}) {
  const id = `field-${name}`
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex flex-col gap-0.5">
            <Label htmlFor={id} className="text-sm font-medium text-foreground">
              {label}
            </Label>
            {description && <p className="text-xs text-muted-text">{description}</p>}
          </div>
          <Switch id={id} checked={field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} ref={field.ref} />
        </div>
      )}
    />
  )
}

/** A select over a numeric enum map from `@/lib/labels`. */
function EnumSelect<V extends number>({
  id,
  value,
  onChange,
  options,
  invalid,
  disabledValues = [],
}: {
  id: string
  value: V
  onChange: (value: V) => void
  options: readonly { value: number; label: string }[]
  invalid?: boolean
  disabledValues?: readonly number[]
}) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v) as V)}>
      <SelectTrigger id={id} className="w-full" aria-invalid={invalid}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
        {options.map((o) => (
          <SelectItem key={o.value} value={String(o.value)} disabled={disabledValues.includes(o.value)}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * The gallery opened from the editor's toolbar. The chosen image is inserted only after the
 * dialog has closed, so its focus trap cannot move the editor's cursor.
 */
function useContentGallery() {
  const [isOpen, setIsOpen] = React.useState(false)
  const insert = React.useRef<((url: string) => void) | null>(null)
  const picked = React.useRef<string[]>([])
  return {
    open: React.useCallback((next: (url: string) => void) => {
      insert.current = next
      picked.current = []
      setIsOpen(true)
    }, []),
    pick: (values: string[]) => {
      picked.current = values.map((value) => imageUrl(value) ?? value)
    },
    dialogProps: {
      open: isOpen,
      onOpenChange: setIsOpen,
      onCloseAutoFocus: (event: Event) => {
        // The editor takes focus back itself when it inserts.
        event.preventDefault()
        for (const url of picked.current) insert.current?.(url)
        picked.current = []
        insert.current = null
      },
    },
  }
}

type PostFormProps = {
  content: ContentTypeConfig
  /** null = create. */
  postId: number | null
  defaultValues: PostFormValues
  /** Edit mode only. */
  meta?: PostMeta
}

export function PostForm({ content, postId, defaultValues, meta }: PostFormProps) {
  const router = useRouter()
  const { admin } = useAuth()
  const openByOther = meta?.openBy && meta.openBy.id !== admin?.id ? meta.openBy : null
  const show = fieldsFor(content)
  const listHref = contentHref(content.slug)
  const save = useSavePost(content, postId)
  const upload = useUploadPostImage()
  const contentUpload = useUploadPostImage()
  const contentGallery = useContentGallery()
  const categories = useCategories(content.type, { enabled: show.categorySelect })
  const writers = useAuthorNames()

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues,
  })
  const { control, register, handleSubmit, formState } = form
  const { errors, isDirty } = formState

  const [categoryId, authorStatus, quickNews, khatma, bannersValue] = useWatch({
    control,
    name: ["categoryId", "authorStatus", "quickNewsStatus", "khatamatStatus", "bannersStatus"],
  })
  const selectedCategory = categories.data?.find((c) => c.id === categoryId)
  const showKhatma = show.khatma && isDeathsCategory(selectedCategory)

  const [confirmNotify, setConfirmNotify] = React.useState<PostFormValues | null>(null)
  const [confirmLeave, setConfirmLeave] = React.useState(false)
  const saved = React.useRef(false)

  // Closing the tab or reloading with unsaved changes asks the browser's own question.
  React.useEffect(() => {
    if (!isDirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (saved.current) return
      event.preventDefault()
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [isDirty])

  function submit(values: PostFormValues) {
    save.mutate(values, {
      onSuccess: () => {
        saved.current = true
        setConfirmNotify(null)
        toast.success(messages.toasts.saved)
        router.push(listReturnHref(listHref))
      },
      onError: () => setConfirmNotify(null),
    })
  }

  const onValid = (values: PostFormValues) => {
    // A push notification reaches every app user — confirm it first.
    if (values.sendNotification) setConfirmNotify(values)
    else submit(values)
  }

  const leave = () => (isDirty && !saved.current ? setConfirmLeave(true) : router.push(listReturnHref(listHref)))

  return (
    <form onSubmit={(event) => void handleSubmit(onValid)(event)} noValidate>
      <Card>
        <CardContent className="flex flex-col gap-6">
          <FormErrorBanner message={save.error?.message} />
          {openByOther && (
            <div role="status" className="flex items-start gap-2 rounded-md bg-warning-muted px-3 py-2.5 text-sm text-warning-ink">
              <UserPenIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
              <p>
                هذا الخبر مفتوح للتحرير حالياً بواسطة <bdi className="font-semibold">{openByOther.name || `محرر رقم ${openByOther.id}`}</bdi>.
                الحفظ الآن قد يستبدل تعديلاته.
              </p>
            </div>
          )}

          <div className={show.categorySelect ? "grid gap-6 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]" : "grid gap-6"}>
            {show.categorySelect ? (
              <FormField id="categoryId" label="التصنيف" required error={errors.categoryId?.message}>
                {(field) => (
                  <Controller
                    control={control}
                    name="categoryId"
                    render={({ field: f }) => (
                      <Select
                        value={f.value === null ? "" : String(f.value)}
                        onValueChange={(v) => {
                          f.onChange(Number(v))
                          // Custom banners belong to a category; the old picks do not apply to the new one.
                          if (form.getValues("bannersStatus") === 2 && form.getValues("banners")) {
                            form.setValue("banners", "", { shouldDirty: true })
                          }
                        }}
                        disabled={categories.isPending}
                      >
                        <SelectTrigger
                          id={field.id}
                          aria-invalid={field["aria-invalid"]}
                          aria-describedby={field["aria-describedby"]}
                          className="w-full"
                        >
                          <SelectValue placeholder={categories.isPending ? messages.states.loading : "اختر التصنيف"} />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {categories.data?.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.title}
                            </SelectItem>
                          ))}
                          {/* Keep an id the list does not contain (e.g. an inactive category) selectable. */}
                          {f.value !== null && categories.data && !selectedCategory && (
                            <SelectItem value={String(f.value)}>تصنيف رقم {f.value}</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </FormField>
            ) : (
              <p className="text-sm text-muted-text">
                القسم: <span className="font-medium text-foreground">{content.title}</span>
              </p>
            )}

            <FormField
              id="title"
              label={show.titleAsTextarea ? "النص" : "العنوان"}
              required
              error={errors.title?.message}
            >
              {(field) =>
                show.titleAsTextarea ? (
                  <Textarea {...field} {...register("title")} rows={5} dir="auto" />
                ) : (
                  <Input {...field} {...register("title")} dir="auto" />
                )
              }
            </FormField>
          </div>

          {categories.isError && show.categorySelect && (
            <FormErrorBanner message={`تعذر تحميل التصنيفات: ${categories.error.message}`} />
          )}

          {show.editor && (
            <>
              <FormField
                id="content"
                label={content.type === 1 ? "المحتوى (رابط الفيديو والوصف)" : "المحتوى"}
                hint={
                  meta?.legacyText
                    ? "خبر قديم بصيغة نصية: تُعرض الأسطر كما هي، ويُحفظ المحتوى دون تغيير ما لم تعدّله."
                    : undefined
                }
              >
                {(field) => (
                  <Controller
                    control={control}
                    name="content"
                    render={({ field: f }) => (
                      <RichTextEditor
                        id={field.id}
                        preserveLineBreaks={meta?.legacyText}
                        value={f.value}
                        onChange={f.onChange}
                        onBlur={f.onBlur}
                        uploadImage={(file, onProgress) => contentUpload.mutateAsync({ file, onProgress })}
                        pickImage={contentGallery.open}
                        aria-invalid={field["aria-invalid"]}
                      />
                    )}
                  />
                )}
              </FormField>
              <ImageGalleryDialog value="" multiple onPick={contentGallery.pick} {...contentGallery.dialogProps} />
            </>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <section aria-label="خيارات النشر" className="flex flex-col divide-y divide-border rounded-lg border border-border px-4">
              {show.author && (
                <div className="flex flex-col pb-3">
                  <SwitchRow control={control} name="authorStatus" label="إظهار اسم الكاتب" />
                  {authorStatus && (
                    <FormField id="authorName" label="اسم الكاتب" required error={errors.authorName?.message}>
                      {(field) => (
                        <>
                          <Input
                            {...field}
                            {...register("authorName")}
                            dir="auto"
                            list="post-writer-names"
                            autoComplete="off"
                            placeholder="مثال: القطيف اليوم"
                          />
                          <SuggestionsList id="post-writer-names" options={writers.data} />
                        </>
                      )}
                    </FormField>
                  )}
                </div>
              )}
              {show.comments && <SwitchRow control={control} name="commentStatus" label="السماح بالتعليقات" />}
              <SwitchRow
                control={control}
                name="sendNotification"
                label="إرسال إشعار"
                description="يُرسل إشعار لمستخدمي التطبيق عند الحفظ."
              />
              <SwitchRow control={control} name="fixed" label="مثبت" />
              {show.breaking && (
                <div className="flex flex-col pb-3">
                  <SwitchRow control={control} name="quickNewsStatus" label="الظهور في شريط الأخبار" />
                  {quickNews && (
                    <FormField id="quickNewsTitle" label="عنوان شريط الأخبار" hint="اتركه فارغاً لاستخدام عنوان الخبر.">
                      {(field) => <Input {...field} {...register("quickNewsTitle")} dir="auto" />}
                    </FormField>
                  )}
                </div>
              )}
            </section>

            <div className="flex flex-col gap-6">
              {show.image && (
                <FormField id="mainImage" label="الصورة الرئيسية">
                  {(field) => (
                    <Controller
                      control={control}
                      name="mainImage"
                      render={({ field: f }) => (
                        <ImagePicker
                          id={field.id}
                          value={f.value}
                          onChange={(v) => f.onChange(v)}
                          upload={(file, onProgress) => upload.mutateAsync({ file, onProgress })}
                          resolveUrl={imageUrl}
                          extraActions={<ImageGalleryDialog value={f.value} onPick={f.onChange} disabled={upload.isPending} />}
                        />
                      )}
                    />
                  )}
                </FormField>
              )}

              <FormField id="active" label="الحالة" required>
                {(field) => (
                  <Controller
                    control={control}
                    name="active"
                    render={({ field: f }) => (
                      <EnumSelect id={field.id} value={f.value} onChange={f.onChange} options={postStatus.options} />
                    )}
                  />
                )}
              </FormField>

              {show.banners && (
                <FormField
                  id="bannersStatus"
                  label="اختيار بانرات للعرض"
                  required
                >
                  {(field) => (
                    <Controller
                      control={control}
                      name="bannersStatus"
                      render={({ field: f }) => (
                        <EnumSelect
                          id={field.id}
                          value={f.value}
                          onChange={f.onChange}
                          options={bannersStatus.options}
                        />
                      )}
                    />
                  )}
                </FormField>
              )}
            </div>
          </div>

          {show.banners && bannersValue === 2 && (
            <section aria-label="البانرات الخاصة" className="flex flex-col gap-3 rounded-lg border border-border p-4">
              <FormField id="banners" label="البانرات الخاصة" required error={errors.banners?.message}>
                {(field) => (
                  <Controller
                    control={control}
                    name="banners"
                    render={({ field: f }) => (
                      <BannerPicker
                        categoryId={content.categoryId ?? categoryId}
                        value={f.value}
                        onChange={f.onChange}
                        aria-describedby={field["aria-describedby"]}
                      />
                    )}
                  />
                )}
              </FormField>
            </section>
          )}

          {showKhatma && (
            <section aria-label="الختمة" className="flex flex-col gap-4 rounded-lg border border-border px-4 pb-4">
              <SwitchRow control={control} name="khatamatStatus" label="إضافة ختمة" />
              {khatma && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField id="khatamatKind" label="نوع الختمة">
                    {(field) => (
                      <Controller
                        control={control}
                        name="khatamatKind"
                        render={({ field: f }) => (
                          <EnumSelect id={field.id} value={f.value} onChange={f.onChange} options={khatmaKind.options} />
                        )}
                      />
                    )}
                  </FormField>
                  <FormField id="khatamatSize" label="حجم الجزء">
                    {(field) => (
                      <Controller
                        control={control}
                        name="khatamatSize"
                        render={({ field: f }) => (
                          <EnumSelect id={field.id} value={f.value} onChange={f.onChange} options={khatmaSize.options} />
                        )}
                      />
                    )}
                  </FormField>
                  <FormField id="khatamatCount" label="عدد الختمات المطلوبة" error={errors.khatamatCount?.message}>
                    {(field) => (
                      <Input
                        {...field}
                        type="number"
                        inputMode="numeric"
                        min={1}
                        dir="ltr"
                        {...register("khatamatCount", { valueAsNumber: true })}
                      />
                    )}
                  </FormField>
                </div>
              )}
            </section>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <Button type="submit" size="lg" disabled={save.isPending || upload.isPending || contentUpload.isPending}>
              {save.isPending && <Spinner />}
              {save.isPending ? messages.states.saving : messages.actions.save}
            </Button>
            <Button type="button" size="lg" variant="outline" onClick={leave} disabled={save.isPending}>
              {messages.actions.cancel}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmNotify !== null}
        onOpenChange={(open) => !open && setConfirmNotify(null)}
        title="إرسال إشعار"
        description="سيُرسل إشعار بهذا الخبر لجميع مستخدمي التطبيق عند الحفظ. متابعة؟"
        confirmLabel="حفظ وإرسال"
        pending={save.isPending}
        onConfirm={() => confirmNotify && submit(confirmNotify)}
      />
      <ConfirmDialog
        open={confirmLeave}
        onOpenChange={setConfirmLeave}
        title={messages.confirm.discardTitle}
        description={messages.confirm.discardDescription}
        confirmLabel="تجاهل التغييرات"
        destructive
        onConfirm={() => {
          saved.current = true
          setConfirmLeave(false)
          router.push(listReturnHref(listHref))
        }}
      />
    </form>
  )
}
