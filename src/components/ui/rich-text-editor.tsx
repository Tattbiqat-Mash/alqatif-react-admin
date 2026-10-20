"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { CodeXmlIcon, Maximize2Icon, Minimize2Icon, PencilLineIcon, Redo2Icon, Undo2Icon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { IconAction } from "@/components/ui/icon-action"

import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { formatNumber } from "@/lib/format"

type ColorPicker = typeof import("jodit/esm/modules/widget/color-picker/color-picker.js").ColorPickerWidget

/** Jodit's colour palette, loaded with the editor; used by the text and background colour buttons. */
let colorPickerWidget: ColorPicker | null = null

// Jodit touches `window` on import, so it only loads in the browser.
const JoditEditor = dynamic(
  async () => {
    const [editor, colorPicker] = await Promise.all([
      import("jodit-react"),
      import("jodit/esm/modules/widget/color-picker/color-picker.js"),
    ])
    colorPickerWidget = colorPicker.ColorPickerWidget
    return editor
  },
  {
    ssr: false,
    loading: () => <Skeleton className="h-[480px] w-full rounded-lg" />,
  },
)

type JoditProps = React.ComponentProps<typeof JoditEditor>
type JoditConfig = NonNullable<JoditProps["config"]>
type JoditInstance = Parameters<NonNullable<JoditProps["editorRef"]>>[0]
type JoditButtons = NonNullable<JoditConfig["buttons"]>

/** Jodit's MODE_WYSIWYG: custom buttons with it are disabled in source view. */
const MODE_WYSIWYG = 1 as const

/** "تنسيق الفقرة", with the old CKEditor's choices and labels. */
const FORMAT_BLOCKS: Record<string, string> = {
  p: "عادي",
  h1: "العنوان 1",
  h2: "العنوان 2",
  h3: "العنوان 3",
  h4: "العنوان 4",
  h5: "العنوان 5",
  h6: "العنوان 6",
  pre: "منسق",
  address: "عنوان",
  div: "عادي (DIV)",
}
const FORMAT_LABEL = "تنسيق الفقرة"

/** Block tags that end the search for the cursor's format (a list item is not a format). */
const BLOCK_TAGS = new Set([...Object.keys(FORMAT_BLOCKS), "blockquote", "li", "td", "th", "ul", "ol", "table"])

/** The format of the block around the cursor, or "" when it is none of FORMAT_BLOCKS. */
function currentFormat(editor: JoditInstance): string {
  let node: Node | null = editor.s.current()
  while (node && node !== editor.editor) {
    const tag = node.nodeName.toLowerCase()
    if (BLOCK_TAGS.has(tag)) return tag in FORMAT_BLOCKS ? tag : ""
    node = node.parentNode
  }
  // Text straight in the editor (e.g. legacy posts with <br> lines) reads as "عادي".
  return "p"
}

/** Elements that start a new line on their own; a line never runs across them. */
const LINE_BOUNDARY_TAGS = new Set([
  ...BLOCK_TAGS,
  "tbody",
  "thead",
  "tr",
  "hr",
  "section",
  "article",
  "figure",
  "header",
  "footer",
])
/** Blocks that may hold only inline content: a format block taken out of one splits it. */
const PHRASING_BLOCKS = new Set(["p", "h1", "h2", "h3", "h4", "h5", "h6", "pre", "address"])

const NEWLINE = /\r?\n/
const isText = (node: Node): node is Text => node.nodeType === Node.TEXT_NODE
const isBr = (node: Node) => node.nodeName === "BR"
const isLineBoundary = (node: Node) => LINE_BOUNDARY_TAGS.has(node.nodeName.toLowerCase())
const hasContent = (node: Node) =>
  Array.from(node.childNodes).some((child) => !isBr(child) && !(isText(child) && !child.data.trim()))

function closestBlock(editor: JoditInstance, node: Node): Node {
  for (let el: Node | null = node; el && el !== editor.editor; el = el.parentNode) {
    if (isLineBoundary(el)) return el
  }
  return editor.editor
}

/** Newlines in `block`'s text are visible line breaks (old plain-text posts are shown pre-wrap). */
function showsNewlines(editor: JoditInstance, block: Node) {
  return editor.ew.getComputedStyle(block as Element).whiteSpace.startsWith("pre")
}

/** True when `block` holds several lines (<br>, or visible newlines). */
function hasSeveralLines(editor: JoditInstance, block: Node, newlines: boolean) {
  if (block === editor.editor || (block as Element).querySelector("br")) return true
  return newlines && Array.from(block.childNodes).some((child) => isText(child) && NEWLINE.test(child.data))
}

/** The direct child of `container` that holds `node`. */
function childOf(container: Node, node: Node): Node {
  let el = node
  while (el.parentNode && el.parentNode !== container) el = el.parentNode
  return el
}

/** Where a range edge points to, as a node: the child at `offset` for an element. */
function nodeAt(node: Node, offset: number, atEnd: boolean): Node | null {
  if (isText(node)) return node
  const children = node.childNodes
  return (atEnd ? children[offset - 1] : children[offset]) ?? children[offset] ?? children[offset - 1] ?? null
}

/**
 * Applies a format to the selected line(s) only. Jodit's formatBlock wraps the whole block,
 * and in old posts the whole post is one block (lines split by <br> or by newlines), so the
 * line under the selection is cut out of its block first, between the nearest line breaks.
 */
function formatLines(editor: JoditInstance, tag: string) {
  const range = editor.s.range
  const root = editor.editor
  const container = closestBlock(editor, range.startContainer)
  const newlines = showsNewlines(editor, container)
  if (
    !editor.s.isInsideArea ||
    closestBlock(editor, range.endContainer) !== container ||
    !hasSeveralLines(editor, container, newlines)
  ) {
    editor.execCommand("formatBlock", false, tag)
    return
  }

  // Cut text nodes that are direct children at the line's newlines (end first: offsets stay valid).
  const { startContainer, startOffset, endContainer, endOffset } = range
  let startNode = nodeAt(startContainer, startOffset, false)
  let endNode = nodeAt(endContainer, endOffset, true)
  if (newlines && isText(endContainer) && endContainer.parentNode === container) {
    const next = endContainer.data.slice(endOffset).search(NEWLINE)
    if (next >= 0) endContainer.splitText(endOffset + next)
  }
  if (newlines && isText(startContainer) && startContainer.parentNode === container) {
    const lineStart = startContainer.data.lastIndexOf("\n", startOffset - 1) + 1
    if (lineStart > 0) {
      startNode = startContainer.splitText(lineStart)
      if (endContainer === startContainer) endNode = startNode
    }
  }
  if (!startNode || !endNode) {
    editor.execCommand("formatBlock", false, tag)
    return
  }

  let first = childOf(container, startNode)
  let last = childOf(container, endNode)
  // An empty line (the cursor between two breaks) has nothing to wrap.
  if (isBr(first) || isLineBoundary(first) || isLineBoundary(last)) {
    editor.execCommand("formatBlock", false, tag)
    return
  }

  // Widen to the previous break.
  for (let prev = first.previousSibling; prev && !isBr(prev) && !isLineBoundary(prev); prev = first.previousSibling) {
    if (newlines && isText(prev) && prev.data.includes("\n")) {
      const lineStart = prev.data.lastIndexOf("\n") + 1
      if (lineStart < prev.data.length) first = prev.splitText(lineStart)
      break
    }
    first = prev
  }
  // Widen to the next break, and drop that break: the new block ends the line itself.
  for (let next = last.nextSibling; next && !isLineBoundary(next); next = last.nextSibling) {
    if (isBr(next)) {
      next.remove()
      break
    }
    if (newlines && isText(next) && NEWLINE.test(next.data)) {
      const lineEnd = next.data.search(NEWLINE)
      if (lineEnd > 0) {
        next.splitText(lineEnd)
        last = next
      }
      const rest = last === next ? (next.nextSibling as Text) : next
      rest.data = rest.data.replace(NEWLINE, "")
      if (!rest.data) rest.remove()
      break
    }
    last = next
  }

  const block = editor.createInside.element(tag)
  container.insertBefore(block, first)
  for (let node: Node | null = first; node; ) {
    const following: Node | null = node === last ? null : node.nextSibling
    block.appendChild(node)
    node = following
  }

  // A <p> (or heading…) cannot hold a block: split it around the new one.
  if (container !== root && PHRASING_BLOCKS.has(container.nodeName.toLowerCase()) && container.parentNode) {
    // The line keeps the look of the block it is cut from (alignment, direction, classes), as in
    // CKEditor; an id stays on the first part only.
    for (const { name, value } of Array.from((container as Element).attributes)) {
      if (name !== "id") block.setAttribute(name, value)
    }
    const after = container.cloneNode(false) as Element
    after.removeAttribute("id")
    while (block.nextSibling) after.appendChild(block.nextSibling)
    container.parentNode.insertBefore(block, container.nextSibling)
    if (hasContent(after)) container.parentNode.insertBefore(after, block.nextSibling)
    if (!hasContent(container)) container.parentNode.removeChild(container)
  }

  const caret = editor.ed.createRange()
  caret.selectNodeContents(block)
  caret.collapse(false)
  editor.s.selectRange(caret)
  editor.synchronizeValues()
}

/** A dropdown that shows the current format as text, like a select. */
const FORMAT_BLOCK_BUTTON = {
  name: "formatBlock",
  tooltip: FORMAT_LABEL,
  text: FORMAT_BLOCKS.p,
  mode: MODE_WYSIWYG,
  list: FORMAT_BLOCKS,
  // A template makes Jodit show text instead of an icon.
  template: (_editor: unknown, _name: string, text: string) => text,
  value: (editor: JoditInstance) => currentFormat(editor),
  update: (_editor: unknown, button: { state: { value: unknown; text: string } }) => {
    button.state.text = FORMAT_BLOCKS[String(button.state.value)] ?? FORMAT_LABEL
  },
  isChildActive: (_editor: unknown, button: { state: { value: unknown }; control: { args?: unknown[] } }) =>
    button.state.value === button.control.args?.[0],
  childExec: (editor: JoditInstance, _current: unknown, { control }: { control: { args?: unknown[] } }) => {
    const tag = control.args?.[0]
    if (typeof tag === "string") formatLines(editor, tag)
  },
  // Each choice previews its own look.
  childTemplate: (_editor: unknown, tag: string, label: string) => `<${tag} style="margin:0;padding:0">${label}</${tag}>`,
}

function closestQuote(editor: JoditInstance): HTMLElement | null {
  for (let el: Node | null = editor.s.current(); el && el !== editor.editor; el = el.parentNode) {
    if (el.nodeName === "BLOCKQUOTE") return el as HTMLElement
  }
  return null
}

/** Takes the content out of a quote, keeping its lines apart from the text around it. */
function unwrapQuote(editor: JoditInstance, quote: HTMLElement) {
  const parent = quote.parentNode
  if (!parent) return
  const last = quote.lastChild
  const next = quote.nextSibling
  while (quote.firstChild) parent.insertBefore(quote.firstChild, quote)
  parent.removeChild(quote)
  // Inline content followed by more inline content needs its line break back.
  if (last && !isLineBoundary(last) && next && !isLineBoundary(next) && !isBr(last)) {
    const lineBreak = showsNewlines(editor, parent) ? editor.ed.createTextNode("\n") : editor.createInside.element("br")
    parent.insertBefore(lineBreak, next)
  }
  if (last) {
    const caret = editor.ed.createRange()
    caret.selectNodeContents(last)
    caret.collapse(false)
    editor.s.selectRange(caret)
  }
  editor.synchronizeValues()
}

/** "اقتباس": quotes the selected line(s), or takes the quote around the cursor away. */
const QUOTE_BUTTON = {
  name: "quote",
  icon: "quote",
  tooltip: "اقتباس",
  mode: MODE_WYSIWYG,
  isActive: (editor: JoditInstance) => Boolean(closestQuote(editor)),
  exec: (editor: JoditInstance) => {
    const quote = closestQuote(editor)
    if (quote) unwrapQuote(editor, quote)
    else formatLines(editor, "blockquote")
  },
}

const QUOTE_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 19v-5.2C3 9.2 5.2 6 9.3 4.2l1 1.8C7.9 7.2 6.8 8.9 6.6 11H10v8zm11 0v-5.2c0-4.6 2.2-7.8 6.3-9.6l1 1.8c-2.4 1.2-3.5 2.9-3.7 5H21v8z"/></svg>'

const STYLE_ATTRIBUTE = /(\sstyle=")([^"]*)(")/gi
const RGB_COLOR = /rgba?\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*(?:[,/]\s*([\d.]+%?)\s*)?\)/gi
const hexByte = (n: number) => Math.min(255, Math.max(0, Math.round(n))).toString(16).padStart(2, "0")

/**
 * Inline-style colours as hex. Browsers write a `style` colour as rgb()/rgba() whatever was set
 * (#e03131 → rgb(224, 49, 49)); the content is saved with hex instead (#rrggbb, #rrggbbaa when
 * translucent). Only `style` attributes are touched, never the text.
 */
function colorsToHex(html: string): string {
  if (!/rgba?\(/i.test(html)) return html
  return html.replace(STYLE_ATTRIBUTE, (_match, open: string, css: string, close: string) => {
    const hex = css.replace(RGB_COLOR, (_color, r: string, g: string, b: string, a?: string) => {
      const alpha = a === undefined ? 1 : a.endsWith("%") ? parseFloat(a) / 100 : parseFloat(a)
      return `#${hexByte(+r)}${hexByte(+g)}${hexByte(+b)}${alpha < 1 ? hexByte(alpha * 255) : ""}`
    })
    return open + hex + close
  })
}

const PRE_BLOCK = /(<pre[\s>][\s\S]*?<\/pre>)/i
const LINE_BREAK = /(<br\s*\/?>|<hr[^>]*>|<\/li>)(?![\r\n]|$)/gi
const BLOCK_END = /(<\/(?:p|h[1-6]|div|blockquote|ul|ol|table|address|pre|figure)>)(?![\r\n]|$)/gi
const OPEN_TAG = /<[a-z][^>]*>/gi
const CKEDITOR_ATTRIBUTE = /\sdata-cke-[\w-]+="[^"]*"/gi

/**
 * The site shows a post's lines by its newlines (as in old plain-text posts), not by <p> / <br>,
 * and the old admin's CKEditor writes one after every <br> and a blank line after every block.
 * Jodit writes none, which ran the whole post into one line: write them like CKEditor did
 * (never inside <pre>; once only, so reading the value again changes nothing).
 * `data-cke-*` are CKEditor's own editing attributes (pasted from the old admin): never saved.
 */
function formatLikeCkeditor(html: string): string {
  return html
    .split(PRE_BLOCK)
    .map((part, i) =>
      i % 2 === 1 ? part : part.replace(LINE_BREAK, "$1\n").replace(BLOCK_END, "$1\n\n"),
    )
    .join("")
    .replace(OPEN_TAG, (tag) => tag.replace(CKEDITOR_ATTRIBUTE, ""))
}

/** Sites whose links the app embeds (a tweet, a video) — stored as plain URLs, like the old admin did. */
const EMBEDDED_LINK =
  /<a\s[^>]*?href="(https?:\/\/(?:www\.|mobile\.|m\.)?(?:x\.com|twitter\.com|youtube\.com|youtu\.be)\/[^"]*)"[^>]*>([^<]*)<\/a>/gi

/**
 * `<a href="URL">URL</a>` → `URL` for embedded sites: the app finds the URL in both the href and
 * the text and embeds it twice. A link with its own text ("شاهد التغريدة") stays a link.
 */
function unlinkEmbeddedUrls(html: string): string {
  return html.replace(EMBEDDED_LINK, (link, href: string, text: string) => (text.trim() === href ? href : link))
}

/** The colour set inline on the nearest element around `node`. */
function inlineStyle(editor: JoditInstance, node: Node | null, key: "color" | "backgroundColor"): string {
  for (let el = node; el && el !== editor.editor; el = el.parentNode) {
    if (el instanceof HTMLElement && el.style[key]) return el.style[key]
  }
  return ""
}

/** Text colour and background colour as two buttons (Jodit's "brush" puts both in one tabbed popup). */
function colorButton(name: string, tooltip: string, command: "forecolor" | "background", key: "color" | "backgroundColor") {
  return {
    name,
    icon: name,
    tooltip,
    mode: MODE_WYSIWYG,
    popup: (editor: JoditInstance, current: Node | null, close: () => void) => {
      if (!colorPickerWidget) return false
      return colorPickerWidget(
        editor,
        (color) => {
          // An empty colour (the palette's remove button) clears it.
          editor.execCommand(command, false, color)
          close()
        },
        inlineStyle(editor, current, key),
      )
    },
  }
}

const TEXT_COLOR_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10.6 1.5h2.8l5.6 14.5h-2.6l-1.4-3.8H8.9L7.5 16H4.9zm-.9 8.6h4.6L12 3.9z"/><rect x="2" y="19" width="20" height="4" rx="1" fill="#e03131"/></svg>'
const BACKGROUND_COLOR_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect x="0.5" y="0.5" width="23" height="23" rx="3" fill="#ffd43b"/><path d="M10.7 4h2.6l5.1 14h-2.4L14.7 14.4H9.3L8 18H5.6zm-.7 8.4h4L12 6.6z"/></svg>'

/** The editor's height outside full screen. */
const EDITOR_HEIGHT = 480

/**
 * Settings chosen to keep legacy post HTML (tables, iframes, WordPress shortcodes)
 * exactly as it is, and to load nothing from a CDN (rules/tasks/06-posts-form.md).
 */
const BASE_CONFIG: JoditConfig = {
  direction: "rtl",
  language: "ar",
  height: EDITOR_HEIGHT,
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
  // A pasted URL stays plain text, as in the old admin: the app embeds the URLs it finds in the
  // content (a tweet, a video), so `<a href="URL">URL</a>` was embedded twice, and Jodit's video
  // embed turned a pasted YouTube link into an <iframe>.
  link: { processPastedLink: false, processVideoLink: false },
  // Jodit's "image" button keeps only its URL tab; uploads and the gallery are the custom buttons below.
  uploader: { insertImageAsBase64URI: false },
  extraIcons: { textColor: TEXT_COLOR_ICON, backgroundColor: BACKGROUND_COLOR_ICON, quote: QUOTE_ICON },
}

// No "source" button: the المحرر / HTML tabs above the editor switch the mode.
const BUTTONS_BEFORE_IMAGES: JoditButtons = [
  FORMAT_BLOCK_BUTTON,
  "font",
  "fontsize",
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
  QUOTE_BUTTON,
  "|",
  colorButton("textColor", "لون النص", "forecolor", "color"),
  colorButton("backgroundColor", "لون الخلفية", "background", "backgroundColor"),
  "|",
  "left",
  "center",
  "right",
  "justify",
  "|",
  "link",
  "image",
]

// Undo, redo and full screen sit in the bar above the toolbar, beside the mode switch.
const BUTTONS_AFTER_IMAGES = ["video", "table", "hr"]

/** Inserted images never overflow the post's column. */
const INSERTED_IMAGE_STYLE = { maxWidth: "100%", height: "auto" }

/** Jodit's MODE_SOURCE (the HTML view). */
const MODE_SOURCE = 2 as const
type EditorMode = "wysiwyg" | "source"
const EDITOR_MODES: { mode: EditorMode; label: string }[] = [
  { mode: "wysiwyg", label: "المحرر" },
  { mode: "source", label: "HTML" },
]

type UploadProgress = { index: number; total: number; percent: number }

/** An icon button in the bar above the toolbar, with its label in a tooltip. */
function BarButton({
  label,
  icon: Icon,
  disabled,
  onClick,
}: {
  label: string
  icon: React.ComponentType<{ "aria-hidden"?: boolean }>
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <IconAction label={label}>
      <Button type="button" variant="ghost" size="icon-sm" aria-label={label} disabled={disabled} onClick={onClick}>
        <Icon aria-hidden />
      </Button>
    </IconAction>
  )
}

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
 *
 * Changes before the user first interacts with the editor (a pointer, key, paste or drop on it,
 * its bar, or a Jodit popup / dialog) are Jodit's own and only set the baseline. After that every
 * change is reported, whatever made it (typing, a dialog such as the image properties, dragging a
 * resize handle…), and content back at the baseline reports the original `value` again.
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
  const interacted = React.useRef(false)
  /** The editor's serialisation of `value` before any interaction. */
  const baseline = React.useRef<string | null>(null)
  /** `value` as it came in, reported again when the content is back at the baseline. */
  const initialValue = React.useRef(value)
  const valueRef = React.useRef(value)
  const preserveLineBreaksRef = React.useRef(preserveLineBreaks)
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const editorInstance = React.useRef<JoditInstance | null>(null)
  /** The cursor when an image button was pressed; the file dialog or the gallery takes focus away. */
  const savedRange = React.useRef<Range | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [progress, setProgress] = React.useState<UploadProgress | null>(null)
  const [imageError, setImageError] = React.useState<string | null>(null)
  const [mode, setMode] = React.useState<EditorMode>("wysiwyg")
  const [history, setHistory] = React.useState({ canUndo: false, canRedo: false })
  const [fullScreen, setFullScreen] = React.useState(false)
  const barRef = React.useRef<HTMLDivElement>(null)

  const onChangeRef = React.useRef(onChange)
  const onBlurRef = React.useRef(onBlur)
  const uploadImageRef = React.useRef(uploadImage)
  const pickImageRef = React.useRef(pickImage)
  const uploadingRef = React.useRef(false)
  React.useEffect(() => {
    valueRef.current = value
    preserveLineBreaksRef.current = preserveLineBreaks
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
    interacted.current = true
    editor.s.insertImage(url, INSERTED_IMAGE_STYLE)
    // Several uploads in a row land one after the other.
    savedRange.current = editor.s.isInsideArea ? editor.s.range.cloneRange() : null
  }, [])

  const hasUpload = Boolean(uploadImage)
  const hasGallery = Boolean(pickImage)
  const config = React.useMemo<JoditConfig>(() => {
    // The file dialog or the gallery takes focus away: remember the cursor.
    const beforeImageAction = (editor: JoditInstance) => {
      savedRange.current = editor.s.isInsideArea ? editor.s.range.cloneRange() : null
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
    interacted.current = false
    baseline.current = null
    initialValue.current = valueRef.current
    void editor.waitForReady().then(() => {
      // Strict Mode (dev) destroys the first instance at once; only the live one sets the baseline.
      if (editorInstance.current !== editor || editor.isInDestruct || editor.isDestructed) return
      if (!interacted.current) baseline.current = editor.value
    })
    editor.events.on("afterSetMode", () => setMode(editor.getRealMode() === MODE_SOURCE ? "source" : "wysiwyg"))
    // Jodit's hotkeys read `event.key`, which an Arabic layout turns into "ئ" / "غ" for Z / Y, so
    // Ctrl+Z / Ctrl+Y did nothing there: match the physical key instead (Latin keys stay Jodit's).
    editor.events.on(
      "keydown",
      (event: KeyboardEvent) => {
        if (!(event.ctrlKey || event.metaKey) || event.altKey || /^[a-z]$/i.test(event.key)) return
        const command = event.code === "KeyZ" ? (event.shiftKey ? "redo" : "undo") : event.code === "KeyY" ? "redo" : null
        if (!command) return
        event.preventDefault()
        editor.execCommand(command)
        return false
      },
      { top: true },
    )
    // Every read of the value (onChange → the form, the HTML view) gets hex colours and the
    // old admin's line layout; old plain-text posts (shown pre-wrap) keep their newlines as they are.
    editor.events.on("afterGetValueFromEditor", (data: { value: string }) => {
      const html = unlinkEmbeddedUrls(colorsToHex(data.value))
      data.value = preserveLineBreaksRef.current ? html : formatLikeCkeditor(html)
    })
    editor.events.on("changeStack", () =>
      setHistory({ canUndo: editor.history.canUndo(), canRedo: editor.history.canRedo() }),
    )
  }, [])

  /*
   * Full screen is the wrapper's (fixed over the page, under dialogs), not Jodit's own full-size
   * view, which would cover the bar above the toolbar. Jodit gets the height left under the bar.
   */
  React.useEffect(() => {
    const editor = editorInstance.current
    if (!editor) return
    if (!fullScreen) {
      editor.e.fire("setHeight", EDITOR_HEIGHT)
      return
    }
    const fit = () => editor.e.fire("setHeight", window.innerHeight - (barRef.current?.offsetHeight ?? 0))
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullScreen(false)
    }
    fit()
    window.addEventListener("resize", fit)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("resize", fit)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [fullScreen])

  function runHistory(command: "undo" | "redo") {
    editorInstance.current?.execCommand(command)
  }

  // Without split mode, Jodit toggles between the two views.
  const switchMode = (next: EditorMode) => {
    const editor = editorInstance.current
    if (editor && (editor.getRealMode() === MODE_SOURCE) !== (next === "source")) editor.toggleMode()
  }

  // Interactions anywhere on the editor, including Jodit's popups and dialogs (appended to <body>).
  React.useEffect(() => {
    const onInteract = (event: Event) => {
      const node = event.target
      const element = node instanceof Element ? node : node instanceof Node ? node.parentElement : null
      if (!element) return
      if (wrapperRef.current?.contains(element) || element.closest(".jodit-popup, .jodit-dialog")) {
        interacted.current = true
      }
    }
    const names = ["pointerdown", "keydown", "paste", "drop"] as const
    for (const name of names) document.addEventListener(name, onInteract, true)
    return () => {
      for (const name of names) document.removeEventListener(name, onInteract, true)
    }
  }, [])

  const handleChange = React.useCallback((html: string) => {
    // Jodit rewriting the loaded HTML is not an edit: it only moves the baseline.
    if (!interacted.current) {
      baseline.current = html
      return
    }
    onChangeRef.current(html === baseline.current ? initialValue.current : html)
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
    <div ref={wrapperRef} className="flex flex-col gap-1.5">
      <div
        id={id}
        data-invalid={aria["aria-invalid"] || undefined}
        aria-busy={progress !== null || undefined}
        // overflow-clip, not overflow-hidden: hidden would become the sticky toolbar's scroll container.
        data-full-screen={fullScreen || undefined}
        className={cn(
          "relative overflow-clip rounded-lg border border-input bg-surface data-[invalid]:border-destructive [&_.jodit-container]:border-0! [&_.jodit-toolbar__box]:sticky [&_.jodit-toolbar__box]:top-0 [&_.jodit-toolbar__box]:z-10",
          // Under dialogs (z-50), so the gallery and the confirmations still open over it.
          fullScreen && "fixed inset-0 z-40 rounded-none border-0",
        )}
      >
        <div ref={barRef} className="flex items-center justify-between gap-3 border-b border-input bg-surface-muted px-2 py-1.5">
          <div role="group" aria-label="وضع التحرير" className="inline-flex gap-0.5 rounded-lg bg-border/70 p-0.5">
            {EDITOR_MODES.map((option) => {
              const active = mode === option.mode
              const Icon = option.mode === "source" ? CodeXmlIcon : PencilLineIcon
              return (
                <button
                  key={option.mode}
                  type="button"
                  aria-pressed={active}
                  onClick={() => switchMode(option.mode)}
                  className={cn(
                    "inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-medium outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50",
                    active ? "bg-surface text-foreground shadow-sm" : "text-muted-text hover:text-foreground",
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                  <bdi>{option.label}</bdi>
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-0.5">
            <BarButton label="تراجع" icon={Undo2Icon} disabled={!history.canUndo} onClick={() => runHistory("undo")} />
            <BarButton label="إعادة" icon={Redo2Icon} disabled={!history.canRedo} onClick={() => runHistory("redo")} />
            <BarButton
              label={fullScreen ? "الخروج من ملء الشاشة" : "ملء الشاشة"}
              icon={fullScreen ? Minimize2Icon : Maximize2Icon}
              onClick={() => setFullScreen((on) => !on)}
            />
          </div>
        </div>
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
