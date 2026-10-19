"use client"

import type * as React from "react"
import { notFound, useParams } from "next/navigation"

import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState, ForbiddenState, NotFoundState } from "@/components/ui/states"
import { BackToEditors, EditorForm } from "@/features/editors/components/editor-form"
import { useEditor } from "@/features/editors/hooks/use-editors"
import { emptyEditorValues } from "@/features/editors/schemas/editor.schema"

export function NewEditorScreen() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader title="إضافة محرر" actions={<BackToEditors />} />
      <EditorForm editorId={null} defaultValues={emptyEditorValues()} />
    </div>
  )
}

/** /editors/[id]/edit — the id is runtime data, read on the client. */
export function EditEditorScreen() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  if (!Number.isInteger(id) || id <= 0) notFound()
  return <EditEditor id={id} />
}

function EditEditor({ id }: { id: number }) {
  const editor = useEditor(id)

  let body: React.ReactNode
  if (editor.isPending) body = <Card className="h-96 p-6"><Skeleton className="h-full" /></Card>
  else if (editor.error?.statusCode === 403) body = <Card><ForbiddenState /></Card>
  else if (editor.error?.statusCode === 404) body = <Card><NotFoundState action={<BackToEditors />} /></Card>
  else if (editor.isError) body = <Card><ErrorState description={editor.error.message} onRetry={() => void editor.refetch()} /></Card>
  else body = <EditorForm key={editor.data.id} editorId={editor.data.id} defaultValues={editor.data.values} />

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader title="تعديل محرر" description={`رقم ${id}`} actions={<BackToEditors />} />
      {body}
    </div>
  )
}
