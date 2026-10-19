"use client"

import * as React from "react"
import { useMutation } from "@tanstack/react-query"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SendIcon } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { FormErrorBanner, FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/ui/page-header"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { sendNotification, type NotificationValues } from "@/features/notifications/api/notifications.api"
import type { ApiError } from "@/lib/api/errors"
import { formatNumber } from "@/lib/format"
import { messages } from "@/lib/messages"

// ⚠ TBD: the API's real limits; these keep a push readable on a phone.
const TITLE_MAX = 100
const MESSAGE_MAX = 500

const schema = z.object({
  title: z.string().trim().min(1, messages.validation.required).max(TITLE_MAX, `العنوان ${TITLE_MAX} حرف كحد أقصى`),
  message: z.string().trim().min(1, messages.validation.required).max(MESSAGE_MAX, `المحتوى ${MESSAGE_MAX} حرف كحد أقصى`),
})

export function NotificationsScreen() {
  const send = useMutation<unknown, ApiError, NotificationValues>({ mutationFn: sendNotification })
  const { control, register, handleSubmit, reset, formState } = useForm<NotificationValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", message: "" },
  })
  const message = useWatch({ control, name: "message" })
  const [pending, setPending] = React.useState<NotificationValues | null>(null)

  const confirmSend = () => {
    if (!pending) return
    send.mutate(pending, {
      onSuccess: () => {
        toast.success("تم إرسال الإشعار")
        reset()
      },
      onSettled: () => setPending(null),
    })
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader title="الإشعارات" description="إرسال إشعار لمستخدمي تطبيق القطيف اليوم." />
      <form onSubmit={(event) => void handleSubmit(setPending)(event)} noValidate>
        <Card className="max-w-3xl">
          <CardContent className="flex flex-col gap-6">
            <FormErrorBanner message={send.error?.message} />
            <FormField id="title" label="العنوان" required error={formState.errors.title?.message}>
              {(field) => <Input {...field} {...register("title")} dir="auto" maxLength={TITLE_MAX} />}
            </FormField>
            <FormField
              id="message"
              label="المحتوى"
              required
              hint={`${formatNumber(message.length)} / ${formatNumber(MESSAGE_MAX)}`}
              error={formState.errors.message?.message}
            >
              {(field) => <Textarea {...field} {...register("message")} rows={5} dir="auto" maxLength={MESSAGE_MAX} />}
            </FormField>
            <FormField id="type" label="نوع الإشعار" required hint="يُرسل لجميع مستخدمي التطبيق.">
              {(field) => <Input {...field} value="عام" readOnly />}
            </FormField>
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
              <Button type="submit" size="lg" disabled={send.isPending}>
                {send.isPending ? <Spinner /> : <SendIcon data-icon="inline-start" />}
                {messages.actions.send}
              </Button>
              <Button type="button" size="lg" variant="outline" onClick={() => reset()} disabled={send.isPending || !formState.isDirty}>
                {messages.actions.cancel}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && !send.isPending && setPending(null)}
        title="إرسال إشعار"
        description={`سيتم إرسال الإشعار «${pending?.title ?? ""}» لجميع مستخدمي التطبيق. لا يمكن التراجع بعد الإرسال.`}
        confirmLabel="إرسال"
        pending={send.isPending}
        onConfirm={confirmSend}
      />
    </div>
  )
}
