"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormErrorBanner, FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/ui/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { ErrorState, ForbiddenState } from "@/components/ui/states"
import { Textarea } from "@/components/ui/textarea"
import type { LoadedSettings } from "@/features/settings/api/settings.api"
import { useSaveSettings, useSettings } from "@/features/settings/hooks/use-settings"
import { settingsSchema, type SettingsFormValues } from "@/features/settings/schemas/settings.schema"
import { messages } from "@/lib/messages"

type LinkField = { name: "facebook" | "twitter" | "insta"; label: string; placeholder: string }

const LINKS: LinkField[] = [
  { name: "facebook", label: "فيسبوك", placeholder: "https://www.facebook.com/…" },
  { name: "twitter", label: "تويتر / X", placeholder: "https://x.com/…" },
  { name: "insta", label: "إنستغرام", placeholder: "https://instagram.com/…" },
]

const PAGES: { name: "about" | "privacy" | "info"; label: string }[] = [
  { name: "about", label: "عنّا" },
  { name: "privacy", label: "سياسة الخصوصية" },
  { name: "info", label: "معلومات" },
]

function SettingsForm({ initial }: { initial: LoadedSettings }) {
  const save = useSaveSettings()
  const form = useForm<SettingsFormValues>({ resolver: zodResolver(settingsSchema), defaultValues: initial.values })
  const { register, handleSubmit, reset, formState } = form
  const { errors } = formState

  const onValid = (values: SettingsFormValues) =>
    save.mutate({ values, extras: initial.extras }, {
      onSuccess: () => {
        toast.success(messages.toasts.saved)
        // The saved values become the new baseline for "تراجع".
        reset(values)
      },
    })

  return (
    <form onSubmit={(event) => void handleSubmit(onValid)(event)} noValidate className="flex flex-col gap-4 md:gap-6">
      <FormErrorBanner message={save.error?.message} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">وسائل التواصل</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          {LINKS.map((link) => (
            <FormField key={link.name} id={link.name} label={link.label} required error={errors[link.name]?.message}>
              {(field) => <Input {...field} {...register(link.name)} type="url" placeholder={link.placeholder} />}
            </FormField>
          ))}
          <FormField id="whatsapp" label="واتساب" required hint={"مثال: \u200E+966558511232"} error={errors.whatsapp?.message}>
            {(field) => <Input {...field} {...register("whatsapp")} type="tel" inputMode="tel" />}
          </FormField>
          <FormField id="email" label="البريد الإلكتروني" required error={errors.email?.message}>
            {(field) => <Input {...field} {...register("email")} type="email" autoComplete="off" />}
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">الصفحات</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {PAGES.map((page) => (
            <FormField key={page.name} id={page.name} label={page.label} required error={errors[page.name]?.message}>
              {(field) => <Textarea {...field} {...register(page.name)} rows={6} dir="auto" />}
            </FormField>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={save.isPending}>
          {save.isPending && <Spinner />}
          {save.isPending ? messages.states.saving : messages.actions.save}
        </Button>
        <Button type="button" size="lg" variant="outline" disabled={save.isPending || !formState.isDirty} onClick={() => reset()}>
          {messages.actions.cancel}
        </Button>
      </div>
    </form>
  )
}

function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Card className="gap-5 p-6">
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </Card>
      <Card className="gap-5 p-6">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </Card>
    </div>
  )
}

export function SettingsScreen() {
  const settings = useSettings()

  let body: React.ReactNode
  if (settings.isPending) body = <SettingsSkeleton />
  else if (settings.error?.statusCode === 403) body = <Card><ForbiddenState /></Card>
  else if (settings.isError) body = <Card><ErrorState description={settings.error.message} onRetry={() => void settings.refetch()} /></Card>
  else body = <SettingsForm initial={settings.data} />

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader title="الإعدادات العامة" description="روابط التواصل ونصوص الصفحات الثابتة في الموقع والتطبيق." />
      {body}
    </div>
  )
}
