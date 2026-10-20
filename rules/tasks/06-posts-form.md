# Task 06: Content Create / Edit

## Goal

Editors create and edit posts of every content type from one form whose fields depend on the type.

## Reference

Old admin: `/admin/posts/{id}/edit?type=0|1|2|3` (screenshots: news ×2, video ×2, photo, jobs, thanks, lost & found).

Screenshots: [`06-jobs-edit.png`](screenshots/06-jobs-edit.png) · [`06-lost-found-edit.png`](screenshots/06-lost-found-edit.png) · [`06-news-edit-1.png`](screenshots/06-news-edit-1.png) · [`06-news-edit-2.png`](screenshots/06-news-edit-2.png) · [`06-photo-edit.png`](screenshots/06-photo-edit.png) · [`06-thanks-edit.png`](screenshots/06-thanks-edit.png) · [`06-video-edit-1.png`](screenshots/06-video-edit-1.png) · [`06-video-edit-2.png`](screenshots/06-video-edit-2.png)

## Scope

- `src/app/(admin)/content/[type]/new/page.tsx`, `src/app/(admin)/content/[type]/[id]/edit/page.tsx`
- `src/features/posts/components/post-form.tsx` (+ field groups), `schemas/post.schema.ts`
- `src/components/ui/image-picker.tsx` (shared with Task 08), `src/components/ui/rich-text-editor.tsx`
- Endpoints: `posts/getDetails`, `posts/add`, `posts/edit`, `posts/uploadImage`, `posts/listImages`, `posts/getBanners`, `posts/listAutherNames`, `posts/changePostEditor`, `posts/freePostEditor`, `categories/list` — [api-endpoints.md](../api-endpoints.md#posts--adminposts)

## Requirements

### Fields per type

Field meanings and values: [api-endpoints.md](../api-endpoints.md#posts--adminposts).

| Field (label) | news `0` | video `1` | photos `2` | short text `3` |
|---|---|---|---|---|
| التصنيف * (`categoryId`) | select | select | select | fixed by section, shown read-only |
| العنوان * (`title`) | input | input | input | **textarea** (the post text) |
| المحتوى (`content`) | rich text | rich text (video URL / embed) | — ⚠ | — |
| إظهار اسم الكاتب (`authorStatus`) + اسم الكاتب (`authorName`) | switch + input (with suggestions from `listAutherNames`), input shown only when on | — | — | — |
| السماح بالتعليقات (`commentStatus`) | switch | switch | switch | — |
| إرسال إشعار (`sendNotification`) | switch | switch | switch | switch |
| مثبت (`fixed`) | switch | switch | switch | switch |
| الظهور في شريط الأخبار (`quickNewsStatus`) + عنوان الخبر العاجل (`quickNewsTitle`) | switch + input when on | — | — | — |
| الصورة الرئيسية (`mainImage`) | image picker | image picker | image picker | — |
| الحالة * (`active`) | select | select | select | select |
| اختيار بانرات للعرض * (`bannersStatus` + `banners`) | select: لا / بانرات القسم / بانرات خاصة; "بانرات خاصة" shows a multi-select from `getBanners/{categoryId}` | — | — | — |
| الختمة (`khatamat*`) | ⚠ see open questions | — | — | — |

Defaults on create: `active` = منشور? ⚠ (confirm), `commentStatus` on, `authorStatus` on, others off, `bannersStatus` = بانرات القسم.

### Behaviour

- Layout and footer as in [tables-and-forms.md](../tables-and-forms.md#create-and-edit-pages); page header "العودة للقائمة".
- "إرسال إشعار" on: confirm on save that a push notification will be sent.
- Changing the category reloads the banner options; clear selected custom banners that no longer exist.
- Image picker: "رفع مباشرة" + "من معرض الصور" — see [tables-and-forms.md](../tables-and-forms.md#image-field-srccomponentsuiimage-pickertsx-built-in-task-06).
- After save: back to the section list, toast "تم الحفظ بنجاح".

### Rich-text editor (decide first)

Pick the editor before building the form, and get the user's OK on the choice. Requirements:

- RTL, Arabic, works with React 19.
- **Round-trips the existing HTML** of old posts without stripping tags, attributes, or WordPress shortcodes such as `[banner caption_position="bottom" …]` (seen in video posts). Test with the `content` of 3 real posts from the user's samples before committing to it.
- Toolbar parity with the old CKEditor: bold, italic, underline, strike, clear format, link/unlink, lists, indent, quote, horizontal rule, table, alignment, text colour, font size, image (upload / from gallery), source-code view, full screen.
- Toolbar like the old CKEditor (built): "تنسيق الفقرة" is a select-shaped dropdown showing the current format (عادي, العنوان 1–6, منسق, عنوان, عادي (DIV) — each previewed); "اقتباس" is its own toggle button (quotes the selected line(s) like the formats; on a quote it takes the quote away and restores the line break); the mode switch is a segmented "المحرر | HTML" control above the toolbar (no "source" button), with تراجع / إعادة / ملء الشاشة as icon buttons at the other end of that bar (not in Jodit's toolbar). Full screen is the wrapper's own (`fixed inset-0 z-40`, under dialogs; Esc leaves it; Jodit gets the height via `setHeight`) — Jodit's own full-size view would cover that bar. The saved HTML keeps the old admin's line layout (newline after `<br>` / `<hr>`, blank line after each block, never in `<pre>` or old plain-text posts) because the site lays posts out by newlines, and drops `data-cke-*`; pasted URLs stay plain text and `<a href="URL">URL</a>` to an embedded site (x.com, YouTube) is saved as the plain URL, because the app embeds every such URL it finds — see [api-endpoints.md](../api-endpoints.md#posts--adminposts). Inline-style colours are saved as hex: browsers write a colour set through the CSSOM (and pasted content brings) `rgb()` / `rgba()`, so `colorsToHex` rewrites them inside `style="…"` only (never the text) on Jodit's `afterGetValueFromEditor` — onChange and the HTML view both see hex (`#rrggbb`, `#rrggbbaa` when translucent); untouched posts are still saved byte-for-byte. Ctrl+Z / Ctrl+Y also work on an Arabic keyboard layout (Jodit matches `event.key`; the editor matches `event.code` for non-Latin keys); and what counts as an edit: changes before the first interaction (pointer / key / paste / drop on the editor, its bar, or a `.jodit-popup` / `.jodit-dialog`) are Jodit's own and only set the baseline; after it every change reaches the form whatever made it (typing, the HTML view, the image properties dialog, resize handles…), and content back at the baseline reports the original value. (An event list — keydown / beforeCommand… — missed dialogs: image margins and radius were dropped.); A format applies to the selected line(s) only: when the block holds several lines (old posts are one block split by `<br>` or, shown pre-wrap, by newlines), `formatLines` cuts the line out between the nearest breaks (dropping the break after it) and splits a `<p>` around it (the new block copies the `<p>`'s attributes — alignment, `dir`, classes — as CKEditor does; an `id` stays on the first part only); a block that is already one line goes through Jodit's `formatBlock`. "لون النص" and "لون الخلفية" are two separate palette buttons (Jodit's `brush` is not used). Jodit edits inside the page, so Tailwind's preflight would flatten headings, lists and links there; `globals.css` gives `.jodit-wysiwyg` and the dropdown previews (`.jodit-popup`) their default look back (display only).
- Images inside the content (built): Jodit's "image" button inserts by URL only; two custom toolbar buttons — "رفع صورة من الجهاز" (one or more files through `posts/uploadImage`, progress overlay) and "إدراج من معرض الصور" (the `listImages` dialog in multi-select mode: numbered picks kept across pages, inserted in pick order) — insert `<img src="{full URL}" style="max-width:100%;height:auto">` at the cursor.
- Candidates: CKEditor 5 (General HTML Support keeps unknown markup) or TipTap (needs extensions to preserve unknown HTML). Record the decision in [architecture.md](../architecture.md#stack).

## Open questions (⚠ TBD)

- ✅ `getDetails` — [sample](../api-samples/posts-details.json); `data` is a one-item array; legacy plain-text content handled (see api-endpoints.md#posts--adminposts).
- ✅ `uploadImage` / `listImages` — samples in `api-samples/`; `mainImage` holds the full URL (`filePath/fileName`); `listImages/{page}` is 1-based.
- ✅ Khatma fields show only for the وفيات category (user's decision). Still open: is `getKhtmat` needed in the form?
- Photo posts: is `content` really unused, and is `uploadMultipleImages` meant for a photo gallery inside the post?
- **Edit lock — DEFERRED by the user (2026-10-19), revisit before release.** Today: `editorOpen` / `editorName` from `getDetails` show a non-blocking warning when another admin has the post open; the app does not claim or release the lock. Proposed (option 1): call `changePostEditor` (`id`) when the edit page opens and `freePostEditor` (`id`) on save / تراجع / navigating away; keep it a warning, never a block — locks go stale when a tab is closed (post 1171 from 2016 still shows `editorOpen: 12`). Needs the two responses from Postman first.
- ✅ Default status on create: تحت المراجعة (`active` 0, user's decision).
- `sendPostNotification/{id}` — is it a separate action, or is `sendNotification=1` on save enough?

## Out of scope

Post preview inside the admin, revision history, scheduling.

## Acceptance criteria

- [ ] Create and edit build the right request bodies for all six sections, with only that type's fields visible; the user confirms on `/v2`.
- [ ] Editing an old post and saving without changes leaves its HTML content unchanged (compare before/after).
- [ ] Image upload and gallery pick both set the main image; preview updates.
- [ ] Required fields block save with Arabic messages; server errors show in the banner.
- [ ] Leaving a dirty form asks for confirmation.
- [ ] `pnpm check` passes.
