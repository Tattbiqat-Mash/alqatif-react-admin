"use client"

import * as React from "react"
import dynamic from "next/dynamic"

import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { formatNumber } from "@/lib/format"

// Jodit touches `window` on import, so it only loads in the browser.
const JoditEditor = dynamic(() => import("jodit-react"), {
  ssr: false,
  loading: () => <Skeleton className="h-[480px] w-full rounded-lg" />,
})

type JoditProps = React.ComponentProps<typeof JoditEditor>
type JoditConfig = NonNullable<JoditProps["config"]>
type JoditInstance = Parameters<NonNullable<JoditProps["editorRef"]>>[0]

/**
 * Settings chosen to keep legacy post HTML (tables, iframes, WordPress shortcodes)
 * exactly as it is, and to load nothing from a CDN (rules/tasks/06-posts-form.md).
 */
const BASE_CONFIG: JoditConfig = {
  direction: "rtl",
  language: "ar",
  height: 480,
  minHeight: 320,
  toolbarAdaptive: false,
  // Jodit's own sticky toolbar only follows window scroll; the page scrolls inside <main>,
  // so the toolbar is made sticky with CSS on the wrapper below.
  toolbarSticky: false,
  statusbar: true,
  showCharsCounter: false,
  showWordsCounter: true,
  showXPathInStatusbar: false,
  hidePoweredByJodit: true,
  askBeforePasteHTML: false,
  askBeforePasteFromWord: false,
  // Do not rewrite what is already there.
  cleanHTML: {
    fillEmptyParagraph: false,
    removeEmptyElements: false,
    replaceOldTags: false,
  },
  // Both would download scripts from cdnjs at runtime.
  beautifyHTML: false,
  sourceEditor: "area",
  // Jodit's "image" button keeps only its URL tab; uploads and the gallery are the custom buttons below.
  uploader: { insertImageAsBase64URI: false },
}

const BUTTONS_BEFORE_IMAGES = [
  "source",
  "|",
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "eraser",
  "|",
  "ul",
  "ol",
  "outdent",
  "indent",
  "|",
  "font",
  "fontsize",
  "brush",
  "paragraph",
  "|",
  "left",
  "center",
  "right",
  "justify",
  "|",
  "link",
  "image",
]

const BUTTONS_AFTER_IMAGES = ["video", "table", "hr", "|", "undo", "redo", "|", "fullsize"]

/** Jodit's MODE_WYSIWYG: the custom image buttons are disabled in source view. */
const MODE_WYSIWYG = 1 as const

/** Inserted images never overflow the post's column. */
const INSERTED_IMAGE_STYLE = { maxWidth: "100%", height: "auto" }

/** Editor events that mean the user is editing (typing, pasting, toolbar commands, source mode). */
const USER_EDIT_EVENTS = "keydown paste drop beforeCommand toggleMode"

type UploadProgress = { index: number; total: number; percent: number }

type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  onBlur?: () => void
  placeholder?: string
  id?: string
  /**
   * For old WordPress posts stored as plain text with "\r\n" line breaks: show the breaks
   * as they are (white-space: pre-wrap) and make Enter insert <br>, so the stored format
   * is never converted to <p> paragraphs.
   */
  preserveLineBreaks?: boolean
  /** Adds "رفع صورة من الجهاز": uploads one image and resolves to its full URL. */
  uploadImage?: (file: File, onProgress: (percent: number) => void) => Promise<string>
  /**
   * Adds "إدراج من معرض الصور": open a picker and call `insert` with the chosen full URL
   * once the picker has closed (a dialog's focus trap would otherwise steal the cursor).
   */
  pickImage?: (insert: (url: string) => void) => void
  "aria-invalid"?: boolean
}

/**
 * HTML editor for post content. `value` seeds it; `onChange` reports **user** edits only —
 * Jodit may re-serialise the HTML when it loads, and that must not count as a change,
 * so a post whose content was not touched is saved with its content byte-for-byte.
 */
export function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder,
  id,
  preserveLineBreaks = false,
  uploadImage,
  pickImage,
  ...aria
}: RichTextEditorProps) {
  const touched = React.useRef(false)
  const editorInstance = React.useRef<JoditInstance | null>(null)
  /** The cursor when an image button was pressed; the file dialog or the gallery takes focus away. */
  const savedRange = React.useRef<Range | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [progress, setProgress] = React.useState<UploadProgress | null>(null)
  const [imageError, setImageError] = React.useState<string | null>(null)

  const onChangeRef = React.useRef(onChange)
  const onBlurRef = React.useRef(onBlur)
  const uploadImageRef = React.useRef(uploadImage)
  const pickImageRef = React.useRef(pickImage)
  const uploadingRef = React.useRef(false)
  React.useEffect(() => {
    onChangeRef.current = onChange
    onBlurRef.current = onBlur
    uploadImageRef.current = uploadImage
    pickImageRef.current = pickImage
    uploadingRef.current = progress !== null
  })

  const insertImage = React.useCallback((url: string) => {
    const editor = editorInstance.current
    if (!editor) return
    const range = savedRange.current
    editor.s.focus()
    if (range && editor.editor.contains(range.startContainer)) editor.s.selectRange(range)
    else editor.s.setCursorIn(editor.editor, false)
    touched.current = true
    editor.s.insertImage(url, INSERTED_IMAGE_STYLE)
    // Several uploads in a row land one after the other.
    savedRange.current = editor.s.isInsideArea ? editor.s.range.cloneRange() : null
  }, [])

  const hasUpload = Boolean(uploadImage)
  const hasGallery = Boolean(pickImage)
  const config = React.useMemo<JoditConfig>(() => {
    // Remember the cursor and leave full screen: Jodit's full-size view covers the page's dialogs.
    const beforeImageAction = (editor: JoditInstance) => {
      savedRange.current = editor.s.isInsideArea ? editor.s.range.cloneRange() : null
      if (editor.isFullSize) editor.toggleFullSize(false)
    }
    const imageButtons: NonNullable<JoditConfig["buttons"]> = [
      ...(hasUpload
        ? [
            {
              name: "uploadImageFromDevice",
              icon: "upload",
              tooltip: "رفع صورة من الجهاز",
              mode: MODE_WYSIWYG,
              exec: (editor: JoditInstance) => {
                if (uploadingRef.current) return
                beforeImageAction(editor)
                fileInputRef.current?.click()
              },
            },
          ]
        : []),
      ...(hasGallery
        ? [
            {
              name: "insertImageFromGallery",
              icon: "folder",
              tooltip: "إدراج من معرض الصور",
              mode: MODE_WYSIWYG,
              exec: (editor: JoditInstance) => {
                beforeImageAction(editor)
                pickImageRef.current?.(insertImage)
              },
            },
          ]
        : []),
    ]
    return {
      ...BASE_CONFIG,
      buttons: [...BUTTONS_BEFORE_IMAGES, ...imageButtons, ...BUTTONS_AFTER_IMAGES],
      placeholder: placeholder ?? "",
      ...(preserveLineBreaks ? { style: { whiteSpace: "pre-wrap" }, enter: "br" as const } : {}),
    }
  }, [placeholder, preserveLineBreaks, hasUpload, hasGallery, insertImage])

  // Stable identity: jodit-react re-creates the editor when this callback changes.
  const editorRef = React.useCallback((editor: JoditInstance) => {
    editorInstance.current = editor
    touched.current = false
    editor.events.on(USER_EDIT_EVENTS, () => {
      touched.current = true
    })
  }, [])

  const handleChange = React.useCallback((html: string) => {
    if (touched.current) onChangeRef.current(html)
  }, [])
  const handleBlur = React.useCallback(() => onBlurRef.current?.(), [])

  async function onFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? [])
    if (fileInputRef.current) fileInputRef.current.value = ""
    const upload = uploadImageRef.current
    if (files.length === 0 || !upload) return
    if (files.some((file) => !file.type.startsWith("image/"))) {
      setImageError("اختر ملفات صور فقط.")
      return
    }
    setImageError(null)
    try {
      for (const [i, file] of files.entries()) {
        const step = { index: i + 1, total: files.length }
        setProgress({ ...step, percent: 0 })
        insertImage(await upload(file, (percent) => setProgress({ ...step, percent })))
      }
    } catch (e) {
      setImageError(e instanceof Error ? e.message : "تعذر رفع الصورة.")
    } finally {
      setProgress(null)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        id={id}
        data-invalid={aria["aria-invalid"] || undefined}
        aria-busy={progress !== null || undefined}
        // overflow-clip, not overflow-hidden: hidden would become the sticky toolbar's scroll container.
        className="relative overflow-clip rounded-lg border border-input data-[invalid]:border-destructive [&_.jodit-container]:border-0! [&_.jodit-toolbar__box]:sticky [&_.jodit-toolbar__box]:top-0 [&_.jodit-toolbar__box]:z-10"
      >
        <JoditEditor value={value} config={config} editorRef={editorRef} onChange={handleChange} onBlur={handleBlur} />
        {progress && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-surface/80 text-sm text-foreground">
            <Spinner className="size-5 text-primary" />
            <span>
              جارٍ رفع الصورة
              {progress.total > 1 && ` ${formatNumber(progress.index)} من ${formatNumber(progress.total)}`}
              … {formatNumber(progress.percent)}%
            </span>
          </div>
        )}
      </div>
      {hasUpload && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => void onFiles(e.target.files)}
        />
      )}
      {imageError && <p className="text-xs text-danger-ink">{imageError}</p>}
    </div>
  )
}
