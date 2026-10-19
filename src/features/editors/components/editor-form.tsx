"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRightIcon } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { FormErrorBanner, FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { ADMIN_PERMISSIONS, type AdminPermission } from "@/features/auth/types/auth.types"
import { useSaveEditor } from "@/features/editors/hooks/use-editors"
import { editorSchema, type EditorFormValues } from "@/features/editors/schemas/editor.schema"
import { updateSessionAdmin } from "@/lib/auth/session-storage"
import { editorStatus, editorType } from "@/lib/labels"
import { messages } from "@/lib/messages"

/** Labels as in the old admin's صلاحيات row. */
const PERMISSION_LABELS: Record<AdminPermission, string> = {
  allowPosts: "المواضيع",
  allowComments: "التعليقات",
  allowAds: "الإعلانات",
  allowAdmins: "المحررين",
  allowNotifications: "الإشعارات",
  allowSurveys: "الاستبيانات",
  allowSettings: "الإعدادات",
}

export function BackToEditors() {
  return (
    <Button variant="outline" asChild>
      <Link href="/editors">
        <ArrowRightIcon data-icon="inline-start" />
        {messages.actions.backToList}
      </Link>
    </Button>
  )
}

type EditorFormProps = {
  /** null = create. */
  editorId: number | null
  defaultValues: EditorFormValues
}

export function EditorForm({ editorId, defaultValues }: EditorFormProps) {
  const router = useRouter()
  const { admin } = useAuth()
  const mode = editorId === null ? "create" : "edit"
  const isSelf = editorId !== null && editorId === admin?.id
  const save = useSaveEditor(editorId)
  const schema = React.useMemo(() => editorSchema(mode), [mode])
  const { control, register, handleSubmit, formState } = useForm<EditorFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })
  const { errors } = formState
  const type = useWatch({ control, name: "type" })
  const [confirmDeactivate, setConfirmDeactivate] = React.useState<EditorFormValues | null>(null)

  function submit(values: EditorFormValues) {
    save.mutate(values, {
      onSuccess: () => {
        setConfirmDeactivate(null)
        if (isSelf) {
          // Keep the header and the sidebar in step with the edited account.
          updateSessionAdmin({
            userName: values.userName.trim(),
            displayName: values.displayName.trim(),
            email: values.email.trim(),
            type: values.type,
            permissions: values.permissions,
          })
        }
        toast.success(messages.toasts.saved)
        router.push("/editors")
      },
      onError: () => setConfirmDeactivate(null),
    })
  }

  const onValid = (values: EditorFormValues) =>
    // Switching an active account to موقوف signs that editor out — confirm it.
    mode === "edit" && defaultValues.active && !values.active ? setConfirmDeactivate(values) : submit(values)

  return (
    <form onSubmit={(event) => void handleSubmit(onValid)(event)} noValidate>
      <Card>
        <CardContent className="flex flex-col gap-6">
          <FormErrorBanner message={save.error?.message} />

          <div className="grid gap-5 md:grid-cols-2">
            <FormField id="userName" label="اسم المستخدم" required hint="يُستخدم لتسجيل الدخول." error={errors.userName?.message}>
              {(field) => <Input {...field} {...register("userName")} dir="ltr" autoComplete="off" spellCheck={false} />}
            </FormField>
            <FormField id="email" label="البريد الإلكتروني" required error={errors.email?.message}>
              {(field) => <Input {...field} {...register("email")} type="email" autoComplete="off" />}
            </FormField>
            <FormField
              id="password"
              label="كلمة المرور"
              required={mode === "create"}
              hint={mode === "edit" ? "اتركها فارغة للإبقاء على كلمة المرور الحالية." : undefined}
              error={errors.password?.message}
            >
              {(field) => <PasswordInput {...field} {...register("password")} autoComplete="new-password" />}
            </FormField>
            <FormField id="displayName" label="الاسم الذي يظهر مع الخبر" required error={errors.displayName?.message}>
              {(field) => <Input {...field} {...register("displayName")} dir="auto" />}
            </FormField>
            <FormField
              id="type"
              label="النوع"
              required
              hint={isSelf ? "لا يمكنك تغيير نوع حسابك." : undefined}
            >
              {(field) => (
                <Controller
                  control={control}
                  name="type"
                  render={({ field: f }) => (
                    <Select value={String(f.value)} onValueChange={(v) => f.onChange(Number(v))} disabled={isSelf}>
                      <SelectTrigger id={field.id} className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {editorType.options.map((o) => (
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
            <FormField id="active" label="الحالة" required hint={isSelf ? "لا يمكنك إيقاف حسابك." : undefined}>
              {(field) => (
                <Controller
                  control={control}
                  name="active"
                  render={({ field: f }) => (
                    <Select value={f.value ? "1" : "0"} onValueChange={(v) => f.onChange(v === "1")} disabled={isSelf}>
                      <SelectTrigger id={field.id} className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {editorStatus.options.map((o) => (
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

          <fieldset className="flex flex-col gap-3 rounded-lg border border-border p-4" aria-describedby={errors.permissions ? "permissions-error" : undefined}>
            <legend className="px-1 text-sm font-medium text-foreground">
              الصلاحيات {type === 1 && <span className="text-danger">*</span>}
            </legend>
            {type === 0 ? (
              <p className="text-sm text-muted-text">الأدمن يملك كل الصلاحيات.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {ADMIN_PERMISSIONS.map((permission) => (
                  <Controller
                    key={permission}
                    control={control}
                    name={`permissions.${permission}`}
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`perm-${permission}`}
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(checked === true)}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                        <Label htmlFor={`perm-${permission}`} className="text-sm font-normal">
                          {PERMISSION_LABELS[permission]}
                        </Label>
                      </div>
                    )}
                  />
                ))}
              </div>
            )}
            {errors.permissions?.message && (
              <p id="permissions-error" className="text-xs text-danger-ink">
                {errors.permissions.message}
              </p>
            )}
          </fieldset>

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <Button type="submit" size="lg" disabled={save.isPending}>
              {save.isPending && <Spinner />}
              {save.isPending ? messages.states.saving : messages.actions.save}
            </Button>
            <Button type="button" size="lg" variant="outline" onClick={() => router.push("/editors")} disabled={save.isPending}>
              {messages.actions.cancel}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmDeactivate !== null}
        onOpenChange={(open) => !open && setConfirmDeactivate(null)}
        title="إيقاف المحرر"
        description={`سيتم إيقاف حساب «${defaultValues.displayName || defaultValues.userName}» ولن يتمكن من الدخول إلى لوحة التحكم.`}
        confirmLabel="حفظ وإيقاف"
        destructive
        pending={save.isPending}
        onConfirm={() => confirmDeactivate && submit(confirmDeactivate)}
      />
    </form>
  )
}
