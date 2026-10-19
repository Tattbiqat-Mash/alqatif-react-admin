"use client"

import * as React from "react"
import dynamic from "next/dynamic"

import { Skeleton } from "@/components/ui/skeleton"

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
  toolbarSticky: true,
  // Below the 64px sticky header.
  toolbarStickyOffset: 64,
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
  // ⚠ TBD: image upload from inside the editor waits for the uploadImage response sample.
  uploader: { insertImageAsBase64URI: false },
  buttons: [
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
    "video",
    "table",
    "hr",
    "|",
    "undo",
    "redo",
    "|",
    "fullsize",
  ],
}

/** Editor events that mean the user is editing (typing, pasting, toolbar commands, source mode). */
const USER_EDIT_EVENTS = "keydown paste drop beforeCommand toggleMode"

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
  ...aria
}: RichTextEditorProps) {
  const config = React.useMemo<JoditConfig>(
    () => ({
      ...BASE_CONFIG,
      placeholder: placeholder ?? "",
      ...(preserveLineBreaks ? { style: { whiteSpace: "pre-wrap" }, enter: "br" as const } : {}),
    }),
    [placeholder, preserveLineBreaks],
  )

  const touched = React.useRef(false)
  const onChangeRef = React.useRef(onChange)
  const onBlurRef = React.useRef(onBlur)
  React.useEffect(() => {
    onChangeRef.current = onChange
    onBlurRef.current = onBlur
  })

  // Stable identity: jodit-react re-creates the editor when this callback changes.
  const editorRef = React.useCallback((editor: JoditInstance) => {
    touched.current = false
    editor.events.on(USER_EDIT_EVENTS, () => {
      touched.current = true
    })
  }, [])

  const handleChange = React.useCallback((html: string) => {
    if (touched.current) onChangeRef.current(html)
  }, [])
  const handleBlur = React.useCallback(() => onBlurRef.current?.(), [])

  return (
    <div
      id={id}
      data-invalid={aria["aria-invalid"] || undefined}
      className="overflow-hidden rounded-lg border border-input data-[invalid]:border-destructive [&_.jodit-container]:border-0!"
    >
      <JoditEditor value={value} config={config} editorRef={editorRef} onChange={handleChange} onBlur={handleBlur} />
    </div>
  )
}
