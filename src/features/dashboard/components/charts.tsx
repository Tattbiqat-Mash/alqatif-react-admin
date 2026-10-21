"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts"

import type { ChartPoint } from "@/features/dashboard/types/dashboard.types"
import { formatCompact, formatNumber } from "@/lib/format"

/*
 * Single-series bar charts (rules/design-system.md#charts-dashboard):
 * one hue (--chart-1), bars ≤ 24px with a 4px rounded data end, hairline grid,
 * hover tooltip, and an sr-only table for screen readers. Mirrored for RTL:
 * categories start on the right. The ranked categories are an HTML bar list
 * instead (see HorizontalBarChart).
 */

const AXIS_TICK = { fill: "var(--muted-text)", fontSize: 12 }

/*
 * SVG text inherits the page's RTL direction, which swaps recharts' LTR-based
 * text anchors ("start" becomes the right edge). Value ticks that sit beside
 * something are therefore drawn here with the anchor stated for RTL.
 */
type TickProps = { x?: number | string; y?: number | string; payload?: { value?: string | number } }

/** Value tick on a right-hand Y axis, extending rightwards (away from the bars). */
function ValueTick({ x, y, payload }: TickProps) {
  return (
    <text x={Number(x)} y={Number(y)} dy={4} textAnchor="end" fill="var(--muted-text)" fontSize={12}>
      {formatCompact(Number(payload?.value))}
    </text>
  )
}

function ChartTooltip({ active, payload }: TooltipContentProps) {
  const point = payload?.[0]?.payload as ChartPoint | undefined
  if (!active || !point) return null
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-foreground">{point.label}</p>
      <p className="text-muted-text">
        <span className="font-semibold text-foreground">{formatNumber(point.views)}</span> مشاهدة
      </p>
    </div>
  )
}

/** Same data as the chart, for screen readers (and anyone who needs exact values). */
function ChartTable({ data, caption, labelHeader }: { data: ChartPoint[]; caption: string; labelHeader: string }) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{labelHeader}</th>
          <th scope="col">المشاهدات</th>
        </tr>
      </thead>
      <tbody>
        {data.map((p) => (
          <tr key={p.label}>
            <td>{p.label}</td>
            <td>{formatNumber(p.views)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

type ChartProps = {
  data: ChartPoint[]
  /** Accessible name (the card title). */
  caption: string
  labelHeader: string
}

/**
 * Ranked categories as a list of progress bars: name and exact views above a
 * full-width track, the fill relative to the top category. Category views are
 * heavily skewed (millions vs tens), so the track keeps every row readable and
 * a non-zero value always gets a visible sliver. Plain HTML, so the text is
 * already accessible and needs no sr-only table.
 */
export function HorizontalBarChart({ data, caption }: ChartProps) {
  const max = Math.max(...data.map((p) => p.views), 0)
  return (
    <figure>
      <figcaption className="sr-only">{caption}</figcaption>
      <ol className="flex flex-col gap-3.5">
        {data.map((point) => {
          const percent = max > 0 ? (point.views / max) * 100 : 0
          return (
            <li key={point.label} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate font-medium text-foreground" title={point.label}>
                  {point.label}
                </span>
                <span className="shrink-0 tabular-nums text-muted-text">
                  {formatNumber(point.views)}
                  <span className="sr-only"> مشاهدة</span>
                </span>
              </div>
              <div aria-hidden className="h-2 overflow-hidden rounded-full bg-primary-muted">
                <div
                  className={point.views > 0 ? "h-full min-w-1 rounded-full bg-chart-1" : "h-full"}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          )
        })}
      </ol>
    </figure>
  )
}

/** Days: columns from right to left, values on the axis and in the tooltip. */
export function ColumnChart({ data, caption, labelHeader }: ChartProps) {
  return (
    <figure>
      <div aria-hidden className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }} barCategoryGap="30%">
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="label" reversed tick={AXIS_TICK} axisLine={false} tickLine={false} interval={0} />
            <YAxis
              orientation="right"
              tick={ValueTick}
              axisLine={false}
              tickLine={false}
              width={56}
              tickCount={4}
            />
            <Tooltip cursor={{ fill: "var(--surface-muted)" }} content={ChartTooltip} />
            <Bar dataKey="views" fill="var(--chart-1)" maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartTable data={data} caption={caption} labelHeader={labelHeader} />
    </figure>
  )
}
