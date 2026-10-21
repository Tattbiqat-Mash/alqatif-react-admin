# API Endpoints

Summary of `alqhat2022-Admin.postman_collection.json`. Paths are relative to `NEXT_PUBLIC_API_URL` (`https://dreamapi.alqhat.com/v2`). POST bodies are form-urlencoded (see [api.md](api.md#request-format)).

Field notes in Arabic are copied from the collection's own descriptions. **Response shapes are not in the collection** — fill the "Response" lines from the user's samples in [`api-samples/`](api-samples/README.md), and remove the ⚠ marker. Never call the API to find out.

---

## Auth — `admin/admins`

| Method | Path | Body / params |
|---|---|---|
| POST | `/admin/admins/login` | `userName`, `password` (no auth header) |
| POST | `/admin/admins/changeMyPassword` | `password` — not used yet |

- Failure: `401 {"status":"error","errorCode":"Invalid credentials"}`.
- Success ([sample](api-samples/auth-login.json), types in `src/features/auth/types/auth.dto.ts`): `{ status: "success", token, data: Admin }`.
  - `token`: RS256 JWT, **valid 30 days**; claims `iat`, `exp`, `userId` (string), `type` (string), `userName`, `displayName`.
  - `data`: `id`, `userName`, `displayName`, `email`, `type` (number), `active`, `registerdDate`, `allwoedCats` (e.g. `"1,2"`, ⚠ TBD meaning), `permissions` (number, ⚠ TBD meaning), `updatedBy`, and the seven `allow*` flags — **`null` for a full admin (`type=0`)**.
  - No avatar field.
  - ⚠ Security: `data.password` contains the account's unsalted MD5 hash. The app ignores it and never stores it; the backend should stop returning it.

## Dashboard — `admin/settings`

| Method | Path | Notes |
|---|---|---|
| GET | `/admin/settings/adminHome` | Stats for الرئيسية ([sample](api-samples/dashboard-admin-home.json), types in `src/features/dashboard/types/dashboard.dto.ts`) |

- `todaySummary`: `todayNews`, `todayViews`, `todayVistores` (sic) — numbers as **strings**.
- `topCategories[]`: `title`, `totalViews` (string); includes zero-view categories (the UI drops them).
- `topPosts[]`: `title`, `categoryTitle`, `views` — **no id or type**, so the list cannot link to the post.
- `topWeekDays[]`: `dayname`, `totalViews`; `monthDays[]`: `openDate`, `totalViews`. With no data the API sends one row with an empty label (`dayname: ""`). ⚠ TBD: the format of `dayname` (English names are translated if they come) and `openDate` (assumed `YYYY-MM-DD`).

## Posts — `admin/posts`

| Method | Path | Body / params |
|---|---|---|
| POST | `/admin/posts/list` | `page`, `search`, `active`, `orderCase`, `categoryId`, `type`, `fixed`, `author` (admin id), `authorName` (writer name), `filter` (⚠ TBD — not needed so far) |
| GET | `/admin/posts/getDetails/{id}` | |
| POST | `/admin/posts/add` | see fields below |
| POST | `/admin/posts/edit` | `id` + same fields as add |
| GET | `/admin/posts/delete/{id}` | |
| GET | `/admin/posts/changeActive/{id}/{active}` | sets the status to `{active}` (0/1/2) |
| GET | `/admin/posts/changeFixed/{id}` | toggles pinned |
| GET | `/admin/posts/listAutherNames` | writer names for the "كل الكتاب" filter — `{ status, rowsCount: ~3979, data: [{ authorName }] }`, all in one reply, no `pagesCount` ([sample](api-samples/posts-author-names.json), trimmed). Names contain leading spaces, U+200F marks and near-duplicates; the app trims, strips the marks and de-duplicates them. ⚠ TBD: whether the list's `authorName` filter matches exactly or partially |
| GET | `/admin/posts/getBanners/{categoryId}` | banners available for a category — `{ status, rowsCount, data: [{ id, type, kind, image, link, postId, requiredViews }] }`, **every value a string**, no title ([sample](api-samples/posts-banners.json)). Picked ids go into `banners` comma-separated; ids no longer offered are kept and shown as "غير متاح حالياً"; changing the category clears the picks |
| GET | `/admin/posts/getKhtmat/{postId}` | khatma details of a post |
| POST | `/admin/posts/changePostEditor` | `id` — claim the post for editing (⚠ TBD behaviour: likely an edit lock) |
| POST | `/admin/posts/freePostEditor` | `id` — release the claim |
| GET | `/admin/posts/sendPostNotification/{id}` | push a notification for a post — the bell in the posts list's row actions (confirm first). ⚠ TBD: reply shape (any non-error reply counts as success) |
| POST | `/admin/posts/uploadImage` | multipart `attachment` |
| POST | `/admin/posts/uploadMultipleImages` | multipart `images[]` |
| GET | `/admin/posts/listImages/{page}` | image gallery ("من معرض الصور") — `{ status, pages, files: [full URLs] }`, 40 per page, newest first; **`{page}` starts at 1** ([sample](api-samples/posts-list-images.json)). A picked URL is stored as is (full URL) |

Post fields (`add` / `edit`):

| Field | Meaning | Values |
|---|---|---|
| `title` | العنوان | text (for `type=3` this is the whole short post) |
| `content` | المحتوى | HTML |
| `mainImage` | الصورة الرئيسية | value returned by `uploadImage` / gallery |
| `categoryId` | التصنيف | category id |
| `active` | الحالة | `0` تحت المراجعة · `1` منشور · `2` موقوف |
| `commentStatus` | السماح بالتعليقات | `0` لا · `1` نعم |
| `quickNewsStatus` | الظهور في شريط الأخبار (عاجل) | `0` لا · `1` نعم |
| `quickNewsTitle` | عنوان الخبر العاجل | text |
| `bannersStatus` | عرض بانرات | `0` لا · `1` بانرات القسم · `2` بانرات خاصة |
| `banners` | البانرات الخاصة | comma-separated ids (when `bannersStatus=2`) |
| `khatamatStatus` | إضافة ختمة | `0` لا · `1` نعم |
| `khatamatKind` | نوع الختمة | `0` أجزاء · `1` أحزاب · `2` سور |
| `khatamatSize` | حجم الجزء | `0` جزء · `1` نصف جزء · `2` حزب · `3` نصف حزب · `4` ربع حزب · `5` سورة |
| `khatamatCount` | عدد الختمات المطلوبة | number |
| `fixed` | مثبت | `0` لا · `1` نعم |
| `authorStatus` | إظهار اسم الكاتب | `0` لا · `1` نعم |
| `authorName` | اسم الكاتب | text |
| `sendNotification` | إرسال إشعار | `0` لا · `1` نعم |
| `type` (list filter) | نوع المحتوى | `0` أخبار · `1` فيديو · `2` صور · `3` نصي (مختصرات) · `4` وفيات |

`list` response ([sample](api-samples/posts-list.json), types in `src/features/posts/types/posts.dto.ts`): the list envelope (`rowsCount` 40, `pagesCount`) with rows `id`, `title`, `active`, `authorName` (الكاتب, may be `""`), `displayName` (المحرر), `puplishDate` (sic, `YYYY-MM-DD HH:mm:ss`), `categoryTitle`, `commentStatus`, `quickNewsStatus`, `fixed`, `khatamatStatus`, `views`. No `categoryId` or `type` in the rows. Omitted filter keys = no filter.

`add` / `edit` bodies are confirmed (the user's field lists match the table above; `edit` = `id` + the same fields). The app always sends every field — fields a content type does not show keep their loaded values.

`getDetails` response ([sample](api-samples/posts-details.json), types in `posts.dto.ts`): `{ status, data: [post] }` — **`data` is an array with one item**. Same field names as the body, flags may be `null`, `mainImage` is a full URL, plus `puplishDate`, `editorOpen` / `editorName` (who has the post open — shown as a warning; ⚠ TBD whether `changePostEditor` / `freePostEditor` should be called), `htmlEditorVersion` (0 on old posts, ⚠ TBD meaning), `draftContent`, `contentLong`, `views`, `webViews`.

**Newlines matter on the site.** The public site lays a post out by the newlines in `content`, not by `<p>` / `<br>`: the same HTML saved without newlines (Jodit's output) showed as one run-on line, while the old admin's CKEditor writes `<br>` + newline and a blank line after every block (`</p>\r\n\r\n<p>`). The editor writes that layout too (`formatLikeCkeditor` in `rich-text-editor.tsx`) and drops CKEditor's `data-cke-*` editing attributes, which come in when content is pasted from the old admin and broke links on the site (`"…" href="…">…` shown as text). Seen by the user on post 498159, 2026-10-20. **Embedded URLs:** the app embeds the x.com / YouTube URLs it finds in `content` (a tweet, a video), and the old admin stored them as plain text; `<a href="URL">URL</a>` was embedded twice (href + text). The editor keeps pasted URLs as plain text (Jodit's `link.processPastedLink` / `processVideoLink` off — the latter turned a YouTube URL into an `<iframe>`) and saves `<a href="URL">URL</a>` for x.com / twitter.com / youtube.com / youtu.be as the plain URL (`unlinkEmbeddedUrls`); a link with its own text stays a link. ⚠ TBD: the full list of sites the app embeds. Also seen there: the server prepends `style="margin-top:10px;margin-bottom:10px;width:80%;height:100% !important;"` to every `<img>` even when it has a `style` (two `style` attributes; the browser keeps the first, so image styles set in the editor are lost) — ⚠ backend to fix; and the old admin saves an N1ED `<script src="https://cdn.n1ed.com/widgets.js…">` into `content`.

**Legacy content.** Old WordPress posts store plain text with `

` between paragraphs and inline `<img>` tags (no `<p>`). The app must never convert that format: the editor shows such content with `white-space: pre-wrap`, Enter inserts `<br>`, and an untouched content field is sent back byte-for-byte (verified end-to-end). When the user does edit it, the browser normalises `
` → `
` and `<img … />` → `<img …>` — equivalent HTML, paragraphs kept, no `<p>`/`<br>` added.

`uploadImage` response ([sample](api-samples/posts-upload-image.json)): `{ status, rowsCount, fileName, filePath }`, e.g. `fileName: "9606524100662.jpeg"`, `filePath: "https://alqhat.com/uploadImages/medium"` — the image is at `filePath/fileName`. **`mainImage` holds a full URL** (confirmed by the user from posts created by the old admin), so an upload is stored as `filePath/fileName` and a gallery pick as its URL. Previews go through `imageUrl()` in `src/config/content-types.ts` (which still accepts bare file names, just in case).

⚠ TBD (flagged in code): the `add` / `edit` / `changeActive` / `changeFixed` / `delete` replies (any non-error reply counts as success), `listImages`, `getBanners`.

## Categories — `admin/categories` (read-only in this app)

| Method | Path | Body / params |
|---|---|---|
| POST | `/admin/categories/list` | `page`, `type`, `search`, `active` |
| GET | `/admin/categories/getDetails/{id}` | |

Category `type`: `0` news · `1` video · `2` image · `3` text · `4` deaths. `add` / `edit` / `delete` / `changeActive` exist but are out of scope.

`list` response ([sample](api-samples/categories-list.json)): the list envelope with rows `id`, `type`, `title`, `notificationTopic` (e.g. `deaths_topic`), `active`. The app requests `type=<content type>&active=1` and reads every page. On `/v2` the news categories (`type=0`) are الوطن 82 · أخبارهم 70 · ادب و رأى 60 · اعلانات 59 · **وفيات 56** · محليات 55 · فعاليات 1 — وفيات is a `type: 0` category, not `type: 4`.

Known `type=3` categories (from the live admin, `/v1`): وظائف `79` · مفقودات وموجودات `80` · رسائل شكر `81`. ⚠ TBD: confirm the same ids on `/v2`.

## Comments — `admin/comments`

| Method | Path | Body / params |
|---|---|---|
| POST | `/admin/comments/list` | `page`, `postId`, `commentUser`, `search`, `active` |
| GET | `/admin/comments/getDetails/{id}` | |
| POST | `/admin/comments/edit` | `id`, `comment`, `active` |
| GET | `/admin/comments/changeActive/{id}` | toggles — not used by the app (no toggle in the list; the edit page sends `active`) |
| GET | `/admin/comments/delete/{id}` | |

Comment `active`: `0` موقوف · `1` منشور (⚠ TBD — confirm labels).

## Ads — `admin/ads`

| Method | Path | Body / params |
|---|---|---|
| POST | `/admin/ads/list` | `page`, `search`, `active`, `orderCase`, `type`, `kind` |
| GET | `/admin/ads/getDetails/{id}` | |
| POST | `/admin/ads/add` | `title`, `type`, `kind`, `image`, `link`, `postId`, `requiredViews`, `categories`, `startDate`, `endDate`, `active` |
| POST | `/admin/ads/edit` | `id` + same fields |
| GET | `/admin/ads/changeActive/{id}` | toggles — not used by the app (no toggle in the list; the ad form sends `active`) |
| GET | `/admin/ads/delete/{id}` | |
| POST | `/admin/ads/uploadImage` | multipart `attachment` |

| Field | Values |
|---|---|
| `type` نوع | `0` بانر · `1` اقتحامي (popup) · `2` بانر داخل الخبر |
| `kind` طبيعة العمل | `0` خبر (uses `postId`) · `1` لينك خارجي (uses `link`) |
| `active` الحالة | `0` غير فعال · `1` فعال |
| `requiredViews` | عدد مرات الظهور للشخص الواحد |
| `categories` | التصنيف — comma-separated category ids |
| `startDate` / `endDate` | `YYYY-MM-DD` |

## Editors (admins) — `admin/admins`

| Method | Path | Body / params |
|---|---|---|
| POST | `/admin/admins/list` | `page`, `type`, `search`, `active` |
| GET | `/admin/admins/getDetails/{id}` | |
| POST | `/admin/admins/add` | `userName`, `displayName`, `password`, `email`, `type`, `active`, `allowPosts`, `allowComments`, `allowAds`, `allowAdmins`, `allowNotifications`, `allowSurveys`, `allowSettings` |
| POST | `/admin/admins/edit` | `id` + same fields (⚠ TBD: whether an empty `password` keeps the current one) |
| GET | `/admin/admins/changeActive/{id}` | toggles — not used by the app (no toggle in the list; the editor form sends `active`) |
| GET | `/admin/admins/delete/{id}` | |

- `list` response ([sample](api-samples/admins-list.json), types in `src/features/editors/types/editors.dto.ts`): the list envelope with rows `id`, `type`, `userName`, `displayName`, `active` — **no password** (unlike the login response). The "كل المحررين" filter on content lists calls it with `page` only (no `type`) and reads every page. ⚠ TBD: that omitting `type` returns both أدمن and أدمن فرعي (the sample had type 0 only), and what a sub-admin without `allowAdmins` gets (a 403 would leave the filter empty).
- `type`: `0` أدمن · `1` أدمن فرعي. ⚠ TBD: the old list shows "محرر" / "معلن" in the type column — confirm the labels with the user.
- `active`: `0` موقوف · `1` فعال.
- `allow*`: `0` / `1`. Labels: المواضيع (`allowPosts`) · التعليقات · الإعلانات · المحررين · الإشعارات · الاستبيانات · الإعدادات.

## Notifications — `admin/settings`

| Method | Path | Body |
|---|---|---|
| POST | `/admin/settings/sendNotification` | `title`, `message`, `type`, `catId`, `topic` |

⚠ TBD: the values of `type` (the old form shows "عام" as the default), and when `catId` / `topic` are needed (collection example: `topic=all`, `catId=55`, `type=0`).

## Surveys — `admin/surveys`

| Method | Path | Body / params |
|---|---|---|
| POST | `/admin/surveys/list` | `page`, `search`, `active` |
| GET | `/admin/surveys/getDetails/{id}` | |
| POST | `/admin/surveys/add` | `catId`, `title`, `validDays`, `validHours`, `validMin`, `questions`, `active` |
| POST | `/admin/surveys/edit` | `id`, `catId`, `title`, `validDays`, `vaildHours` ⚠, `validMin`, `active` |
| POST | `/admin/surveys/addQuestion` | `surveyId`, `question` |
| POST | `/admin/surveys/editQuestion` | `id`, `question` |
| GET | `/admin/surveys/deleteQuestion/{id}` | |
| GET | `/admin/surveys/changeActive/{id}` | toggles — not used by the app (no toggle in the list; the survey form sends `active`) |
| GET | `/admin/surveys/delete/{id}` | |

- "questions" are the survey's **answer options** (الإجابات).
- `questions` on add: the collection shows both `answer1,answr2,answer3` and `[{"question":"aaaa"},…]` — ⚠ TBD which one the API accepts.
- ⚠ `edit` spells the field `vaildHours` while `add` uses `validHours`. Confirm which one `/v2` reads before relying on either.
- `active`: `0` غير فعال · `1` فعال.
- `getDetails/{id}` → `{ status, data: [row] }` ([sample](api-samples/surveys-details.json)): `surveyId`, `categoryId` (not `id` / `catId`), `active`, `title`, `validDays`, **`vaildHours`**, `validMin` — all strings — and `answers`, a **JSON-encoded string** of `[{ id, answers, question }]` where `answers` is the votes count. A survey's category can be outside the active news categories (sample: `999` «تجريبي»).

## Settings — `admin/settings`

| Method | Path | Body |
|---|---|---|
| GET | `/admin/settings/getDetails` | |
| POST | `/admin/settings/edit` | `facebook`, `twitter`, `insta`, `whatsapp`, `email`, `about`, `privacy`, `info` |

`getDetails` response ([sample](api-samples/settings-details.json)): `{ status, data: [settings] }` — a one-item array with the 8 fields above **plus `snapchat`, `telegram`, `tiktok`, `mobile`**, which the collection's `edit` body does not have. ⚠ TBD: whether `edit` accepts (or wipes) those four; the form shows and sends only the 8.
