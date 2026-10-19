"use client"

import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState, ForbiddenState, NotFoundState } from "@/components/ui/states"
import { contentHref, getContentType, type ContentTypeConfig } from "@/config/content-types"
import { PostForm } from "@/features/posts/components/post-form"
import { usePost } from "@/features/posts/hooks/use-post-form"
import { emptyPostValues } from "@/features/posts/schemas/post.schema"
import { messages } from "@/lib/messages"

function BackButton({ content }: { content: ContentTypeConfig }) {
  return (
    <Button variant="outline" asChild>
      <Link href={contentHref(content.slug)}>
        <ArrowRightIcon data-icon="inline-start" />
        {messages.actions.backToList}
      </Link>
    </Button>
  )
}

function FormSkeleton() {
  return (
    <Card className="gap-6 p-6">
      <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
        <Skeleton className="h-10" />
        <Skeleton className="h-10" />
      </div>
      <Skeleton className="h-[480px]" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </Card>
  )
}

/** /content/[type]/new */
export function NewPostScreen({ slug }: { slug: string }) {
  const content = getContentType(slug)!
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader title={`إضافة — ${content.title}`} actions={<BackButton content={content} />} />
      <PostForm content={content} postId={null} defaultValues={emptyPostValues(content.categoryId)} />
    </div>
  )
}

/** /content/[type]/[id]/edit — reads both params on the client (the id is runtime data). */
export function EditPostScreen() {
  const params = useParams<{ type: string; id: string }>()
  const content = getContentType(params.type)
  const id = Number(params.id)
  if (!content || !Number.isInteger(id) || id <= 0) notFound()

  return <EditPost content={content} id={id} />
}

function EditPost({ content, id }: { content: ContentTypeConfig; id: number }) {
  const post = usePost(id)

  let body: React.ReactNode
  if (post.isPending) body = <FormSkeleton />
  else if (post.error?.statusCode === 403) body = <Card><ForbiddenState /></Card>
  else if (post.error?.statusCode === 404) body = <Card><NotFoundState action={<BackButton content={content} />} /></Card>
  else if (post.isError) body = <Card><ErrorState description={post.error.message} onRetry={() => void post.refetch()} /></Card>
  // key: a fresh form per loaded post, so defaultValues apply.
  else body = <PostForm key={post.data.id} content={content} postId={post.data.id} defaultValues={post.data.values} meta={post.data.meta} />

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader title={`تعديل — ${content.title}`} description={`رقم ${id}`} actions={<BackButton content={content} />} />
      {body}
    </div>
  )
}
