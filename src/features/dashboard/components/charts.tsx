"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
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
 * categories start on the right and bars grow leftwards.
 */

const AXIS_TICK = { fill: "var(--muted-text)", fontSize: 12 }
const ROW_HEIGHT = 36

/*
 * SVG text inherits the page's RTL direction, which swaps recharts' LTR-based
 * text anchors ("start" becomes the right edge). The two labels that sit beside
 * something are therefore drawn here with the anchor stated for RTL.
 */
type TickProps = { x?: number | string; y?: number | string; payload?: { value?: string | number } }

/** Category name in the right-hand axis area, extending rightwards from the plot. */
function CategoryTick({ x, y, payload }: TickProps) {
  return (
    <text x={Number(x)} y={Number(y)} dy={4} textAnchor="end" fill="var(--muted-text)" fontSize={12}>
      {payload?.value}
    </text>
  )
}

/** Value tick on a right-hand Y axis, extending rightwards (away from the bars). */
function ValueTick({ x, y, payload }: TickProps) {
  return (
    <text x={Number(x)} y={Number(y)} dy={4} textAnchor="end" fill="var(--muted-text)" fontSize={12}>
      {formatCompact(Number(payload?.value))}
    </text>
  )
}

type BarLabelProps = { x?: number | string; y?: number | string; width?: number | string; height?: number | string; value?: unknown }

/** Value just past the bar's data end (its left side in RTL). */
function BarEndLabel({ x, y, width, height, value }: BarLabelProps) {
  const left = Math.min(Number(x), Number(x) + Number(width))
  return (
    <text
      x={left - 6}
      y={Number(y) + Number(height) / 2}
      dy={4}
      textAnchor="start"
      fill="var(--muted-text)"
      fontSize={12}
    >
      {formatCompact(Number(value))}
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

/** Ranked categories: long Arabic names on the right, bars growing left, value at the tip. */
export function HorizontalBarChart({ data, caption, labelHeader }: ChartProps) {
  return (
    <figure>
      <div aria-hidden style={{ height: data.length * ROW_HEIGHT + 32 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 64 }} barCategoryGap={10}>
            <CartesianGrid horizontal={false} stroke="var(--border)" />
            <XAxis
              type="number"
              reversed
              tickFormatter={formatCompact}
              tick={AXIS_TICK}
              axisLine={false}
              tickLine={false}
              tickCount={4}
            />
            <YAxis
              type="category"
              dataKey="label"
              orientation="right"
              width={120}
              tick={CategoryTick}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <Tooltip cursor={{ fill: "var(--surface-muted)" }} content={ChartTooltip} />
            <Bar dataKey="views" fill="var(--chart-1)" maxBarSize={18} radius={[4, 0, 0, 4]} isAnimationActive={false}>
              <LabelList dataKey="views" content={BarEndLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartTable data={data} caption={caption} labelHeader={labelHeader} />
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
