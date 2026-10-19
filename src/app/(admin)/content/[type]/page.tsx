import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { RequirePermission } from "@/components/layout/require-permission"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CONTENT_TYPES, getContentType } from "@/config/content-types"
import { PostsScreen } from "@/features/posts/components/posts-screen"

// All six sections are known at build time, so `params` is not runtime data here.
export function generateStaticParams() {
  return CONTENT_TYPES.map((c) => ({ type: c.slug }))
}

export async function generateMetadata({ params }: PageProps<"/content/[type]">): Promise<Metadata> {
  const { type } = await params
  return { title: getContentType(type)?.title }
}

function ListFallback() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <Skeleton className="h-8 w-40" />
      <Card className="h-96" />
    </div>
  )
}

export default async function ContentListPage({ params }: PageProps<"/content/[type]">) {
  const { type } = await params
  if (!getContentType(type)) notFound()

  return (
    <RequirePermission permission="allowPosts">
      {/* The list reads its filters from the URL (nuqs → useSearchParams), which needs a boundary. */}
      <Suspense fallback={<ListFallback />}>
        <PostsScreen slug={type} />
      </Suspense>
    </RequirePermission>
  )
}
