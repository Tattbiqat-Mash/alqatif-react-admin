"use client"

import type * as React from "react"
import { EyeIcon, NewspaperIcon, UsersIcon, type LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { ColumnChart, HorizontalBarChart } from "@/features/dashboard/components/charts"
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard"
import type { ChartPoint, TopPost } from "@/features/dashboard/types/dashboard.types"
import { formatNumber } from "@/lib/format"

function StatCard({ label, value, icon: Icon }: { label: string; value: number | undefined; icon: LucideIcon }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-muted text-primary-ink">
          <Icon aria-hidden className="size-6" />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-sm text-muted-text">{label}</p>
          {value === undefined ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <p className="text-3xl font-semibold text-foreground">{formatNumber(value)}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="gap-0">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  )
}

function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-6" style={{ width: `${90 - i * 12}%` }} />
      ))}
    </div>
  )
}

function ChartPanel({
  title,
  data,
  loading,
  labelHeader,
  variant,
}: {
  title: string
  data: ChartPoint[] | undefined
  loading: boolean
  labelHeader: string
  variant: "horizontal" | "columns"
}) {
  return (
    <Panel title={title}>
      {loading ? (
        <PanelSkeleton />
      ) : !data || data.length === 0 ? (
        <EmptyState className="py-10" />
      ) : variant === "horizontal" ? (
        <HorizontalBarChart data={data} caption={title} labelHeader={labelHeader} />
      ) : (
        <ColumnChart data={data} caption={title} labelHeader={labelHeader} />
      )}
    </Panel>
  )
}

function TopPostsPanel({ posts, loading }: { posts: TopPost[] | undefined; loading: boolean }) {
  return (
    <Panel title="أكثر 10 أخبار قراءة هذا الأسبوع">
      {loading ? (
        <PanelSkeleton />
      ) : !posts || posts.length === 0 ? (
        <EmptyState className="py-10" />
      ) : (
        <ol className="flex flex-col divide-y divide-border">
          {posts.map((post, index) => (
            <li key={`${index}-${post.title}`} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-medium text-muted-text">
                {formatNumber(index + 1)}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="line-clamp-2 text-sm font-medium text-foreground" title={post.title}>
                  {post.title}
                </p>
                {post.category && <p className="text-xs text-primary-ink">{post.category}</p>}
              </div>
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-neutral-muted px-2 py-0.5 text-xs font-medium text-neutral-ink">
                <EyeIcon aria-hidden className="size-3.5" />
                {formatNumber(post.views)}
                <span className="sr-only">مشاهدة</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  )
}

export function DashboardScreen() {
  const { data, isPending, isError, error, refetch } = useDashboard()

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader title="الرئيسية" />

      {isError && !data ? (
        <Card>
          <ErrorState description={error.message} onRetry={() => refetch()} />
        </Card>
      ) : (
        <>
          <section aria-label="ملخص اليوم" className="grid gap-4 sm:grid-cols-3 md:gap-6">
            <StatCard label="عدد الأخبار اليوم" value={data?.today.news} icon={NewspaperIcon} />
            <StatCard label="عدد الزوار اليوم" value={data?.today.visitors} icon={UsersIcon} />
            <StatCard label="مجموع مشاهدات اليوم" value={data?.today.views} icon={EyeIcon} />
          </section>

          <div className="grid gap-4 lg:grid-cols-2 md:gap-6">
            <ChartPanel
              title="أكثر الأقسام قراءة هذا الأسبوع"
              data={data?.topCategories}
              loading={isPending}
              labelHeader="القسم"
              variant="horizontal"
            />
            <TopPostsPanel posts={data?.topPosts} loading={isPending} />
            <ChartPanel
              title="أعلى أيام الأسبوع زيارة"
              data={data?.weekDays}
              loading={isPending}
              labelHeader="اليوم"
              variant="columns"
            />
            <ChartPanel
              title="أكثر 10 أيام زيارة هذا الشهر"
              data={data?.monthDays}
              loading={isPending}
              labelHeader="التاريخ"
              variant="columns"
            />
          </div>
        </>
      )}
    </div>
  )
}
