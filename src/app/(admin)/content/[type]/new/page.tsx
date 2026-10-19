import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { RequirePermission } from "@/components/layout/require-permission"
import { getContentType } from "@/config/content-types"
import { NewPostScreen } from "@/features/posts/components/post-form-screen"

export async function generateMetadata({ params }: PageProps<"/content/[type]/new">): Promise<Metadata> {
  const { type } = await params
  const content = getContentType(type)
  return { title: content ? `إضافة — ${content.title}` : undefined }
}

// `type` comes from the parent's generateStaticParams, so it is known at build time.
export default async function NewPostPage({ params }: PageProps<"/content/[type]/new">) {
  const { type } = await params
  if (!getContentType(type)) notFound()
  return (
    <RequirePermission permission="allowPosts">
      <NewPostScreen slug={type} />
    </RequirePermission>
  )
}
