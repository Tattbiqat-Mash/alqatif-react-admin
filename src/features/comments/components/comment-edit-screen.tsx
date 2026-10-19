"use client"

import type * as React from "react"
import Link from "next/link"
import { notFound, useParams, useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRightIcon } from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FormErrorBanner, FormField } from "@/components/ui/form-field"
import { PageHeader } from "@/components/ui/page-header"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { ErrorState, ForbiddenState, NotFoundState } from "@/components/ui/states"
import { Textarea } from "@/components/ui/textarea"
import type { CommentItem } from "@/features/comments/api/comments.api"
import { useComment, useSaveComment } from "@/features/comments/hooks/use-comments"
import { formatDateTime } from "@/lib/format"
import { commentStatus } from "@/lib/labels"
import { messages } from "@/lib/messages"

const schema = z.object({
  comment: z.string().trim().min(1, messages.validation.required),
  active: z.boolean(),
})
type Values = z.infer<typeof schema>

function Back() {
  return (
    <Button variant="outline" asChild>
      <Link href="/comments">
        <ArrowRightIcon data-icon="inline-start" />
        {messages.actions.backToList}
      </Link>
    </Button>
  )
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-muted-text">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{children}</dd>
    </div>
  )
}

function CommentForm({ comment }: { comment: CommentItem }) {
  const router = useRouter()
  const save = useSaveComment(comment.id)
  const { control, register, handleSubmit, formState } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { comment: comment.text, active: comment.active },
  })

  const onValid = (values: Values) =>
    save.mutate(values, {
      onSuccess: () => {
        toast.success(messages.toasts.saved)
        router.push("/comments")
      },
    })

  return (
    <form onSubmit={(event) => void handleSubmit(onValid)(event)} noValidate>
      <Card>
        <CardContent className="flex flex-col gap-6">
          <FormErrorBanner message={save.error?.message} />
          <dl className="grid gap-4 rounded-lg bg-surface-muted p-4 sm:grid-cols-3">
            <Info label="عنوان الخبر">{comment.postTitle || (comment.postId ? `الخبر رقم ${comment.postId}` : "—")}</Info>
            <Info label="المستخدم">{comment.user || "—"}</Info>
            <Info label="التاريخ">
              <bdi dir="ltr">{formatDateTime(comment.date)}</bdi>
            </Info>
          </dl>
          <FormField id="comment" label="التعليق" required error={formState.errors.comment?.message}>
            {(field) => <Textarea {...field} {...register("comment")} rows={5} dir="auto" />}
          </FormField>
          <FormField id="active" label="الحالة" required>
            {(field) => (
              <Controller
                control={control}
                name="active"
                render={({ field: f }) => (
                  <Select value={f.value ? "1" : "0"} onValueChange={(v) => f.onChange(v === "1")}>
                    <SelectTrigger id={field.id} className="w-full sm:w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {commentStatus.options.map((o) => (
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
          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <Button type="submit" size="lg" disabled={save.isPending}>
              {save.isPending && <Spinner />}
              {save.isPending ? messages.states.saving : messages.actions.save}
            </Button>
            <Button type="button" size="lg" variant="outline" onClick={() => router.push("/comments")} disabled={save.isPending}>
              {messages.actions.cancel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}

/** /comments/[id]/edit — the id is runtime data, read on the client. */
export function CommentEditScreen() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  if (!Number.isInteger(id) || id <= 0) notFound()
  const comment = useComment(id)

  let body: React.ReactNode
  if (comment.isPending) body = <Card className="h-80 p-6"><Skeleton className="h-full" /></Card>
  else if (comment.error?.statusCode === 403) body = <Card><ForbiddenState /></Card>
  else if (comment.error?.statusCode === 404) body = <Card><NotFoundState action={<Back />} /></Card>
  else if (comment.isError) body = <Card><ErrorState description={comment.error.message} onRetry={() => void comment.refetch()} /></Card>
  else body = <CommentForm key={comment.data.id} comment={comment.data} />

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader title="تعديل تعليق" description={`رقم ${id}`} actions={<Back />} />
      {body}
    </div>
  )
}
