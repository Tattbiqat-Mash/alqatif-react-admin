"use client"

import * as React from "react"
import { ImageIcon, ImageOffIcon, Trash2Icon, UploadIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

type ImagePickerProps = {
  id?: string
  /** The stored value (file name or URL, as the API returns it). */
  value: string
  onChange: (value: string) => void
  /** Uploads the file and resolves to the value to store. */
  upload: (file: File, onProgress: (percent: number) => void) => Promise<string>
  /** Turns a stored value into a displayable URL, or null when it cannot be shown. */
  resolveUrl?: (value: string) => string | null
  disabled?: boolean
  /** More buttons beside "رفع مباشرة" (e.g. the posts gallery). */
  extraActions?: React.ReactNode
  "aria-describedby"?: string
}

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value)

/** Image field: preview + "رفع مباشرة" (rules/tables-and-forms.md#image-field). */
export function ImagePicker({
  id,
  value,
  onChange,
  upload,
  resolveUrl = (v) => (isAbsoluteUrl(v) ? v : null),
  disabled,
  extraActions,
  ...aria
}: ImagePickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [progress, setProgress] = React.useState<number | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [broken, setBroken] = React.useState<string | null>(null)

  const url = value ? resolveUrl(value) : null
  const uploading = progress !== null

  async function onFile(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("اختر ملف صورة.")
      return
    }
    setError(null)
    setProgress(0)
    try {
      onChange(await upload(file, setProgress))
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر رفع الصورة.")
    } finally {
      setProgress(null)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div
        className={cn(
          "relative flex aspect-video w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-surface-muted sm:w-64",
          value && "border-solid",
        )}
      >
        {url && broken !== url ? (
          // eslint-disable-next-line @next/next/no-img-element -- images come from the API's domain, not next/image
          <img src={url} alt="الصورة الرئيسية" className="size-full object-cover" onError={() => setBroken(url)} />
        ) : value ? (
          <div className="flex flex-col items-center gap-1 px-3 text-center text-xs text-muted-text">
            <ImageOffIcon className="size-6" aria-hidden />
            <bdi dir="ltr" className="break-all">{value}</bdi>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-xs text-subtle-text">
            <ImageIcon className="size-8" aria-hidden />
            لا توجد صورة
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface/80 text-sm text-foreground">
            <Spinner className="size-5 text-primary" />
            {progress}%
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={disabled || uploading}
          onChange={(e) => void onFile(e.target.files?.[0])}
          {...aria}
        />
        <Button type="button" variant="outline" disabled={disabled || uploading} onClick={() => inputRef.current?.click()}>
          <UploadIcon data-icon="inline-start" />
          رفع مباشرة
        </Button>
        {extraActions}
        {value && (
          <Button
            type="button"
            variant="destructive-ghost"
            disabled={disabled || uploading}
            onClick={() => onChange("")}
          >
            <Trash2Icon data-icon="inline-start" />
            إزالة الصورة
          </Button>
        )}
        {error && <p className="text-xs text-danger-ink">{error}</p>}
      </div>
    </div>
  )
}
