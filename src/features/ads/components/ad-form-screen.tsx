"use client"

import type * as React from "react"
import { notFound, useParams } from "next/navigation"

import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState, ForbiddenState, NotFoundState } from "@/components/ui/states"
import { AdForm, BackToAds } from "@/features/ads/components/ad-form"
import { useAd } from "@/features/ads/hooks/use-ads"
import { emptyAdValues } from "@/features/ads/schemas/ad.schema"

export function NewAdScreen() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader title="إضافة إعلان" actions={<BackToAds />} />
      <AdForm adId={null} defaultValues={emptyAdValues()} />
    </div>
  )
}

/** /ads/[id]/edit — the id is runtime data, read on the client. */
export function EditAdScreen() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  if (!Number.isInteger(id) || id <= 0) notFound()
  const ad = useAd(id)

  let body: React.ReactNode
  if (ad.isPending) body = <Card className="h-96 p-6"><Skeleton className="h-full" /></Card>
  else if (ad.error?.statusCode === 403) body = <Card><ForbiddenState /></Card>
  else if (ad.error?.statusCode === 404) body = <Card><NotFoundState action={<BackToAds />} /></Card>
  else if (ad.isError) body = <Card><ErrorState description={ad.error.message} onRetry={() => void ad.refetch()} /></Card>
  else body = <AdForm key={ad.data.id} adId={ad.data.id} defaultValues={ad.data.values} />

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader title="تعديل إعلان" description={`رقم ${id}`} actions={<BackToAds />} />
      {body}
    </div>
  )
}
