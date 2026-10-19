# Project Context

> Product identity, scope, pages, and decisions already made. Technical rules live in the other files in `rules/`.

## 1. Project

- **Name:** القطيف اليوم — Admin (لوحة تحكم جريدة القطيف اليوم الاخبارية)
- **Type:** Internal admin dashboard (CMS) for a news website and mobile app
- **Description:** Editors and admins publish and manage the content of the "القطيف اليوم" news site/app: news, videos, photos, short posts (jobs, thank-you notes, lost & found), comments, ads, push notifications, surveys, and site settings.
- **Users:** The newspaper's admins and editors (أدمن / أدمن فرعي). Not public.
- **Market:** Qatif, Eastern Province, Saudi Arabia
- **Public site:** `https://www.alqhat.com` (short post links: `https://alqhat.com/q/{id}`)
- **Logo:** `public/logo.jpeg` (palm trees on sunset). ⚠ It is only 48×48 px — ask for a high-resolution PNG/SVG before using it larger than 48px.

This project replaces the existing admin at `https://www.alqhat.com/admin`. The screenshots of that admin define **what each page contains** (fields, columns, filters, actions) — not how it looks. The look follows [design-system.md](design-system.md).

## 2. Language, direction, theme

- **Arabic only**, RTL only. No language switcher, no i18n library.
- **Light mode only.** No dark mode, no theme toggle.
- Details: [rtl-and-arabic.md](rtl-and-arabic.md).

## 3. Brand colours

| Role | Hex |
|---|---|
| Primary | `#FFA800` |
| Accent | `#f1416c` |
| Sidebar / dark surfaces | `#1e1e2d` |

Full token set and usage rules: [design-system.md](design-system.md).

## 4. Pages

Routes are this app's routes (the old admin's paths are in brackets for reference). Every page except `/login` is inside the authenticated shell (sidebar + header).

| Page (sidebar label) | Route | Purpose | Permission flag |
|---|---|---|---|
| تسجيل الدخول | `/login` | Username, password, "تذكرني", sign in | public |
| الرئيسية | `/dashboard` | Today's stats, weekly/monthly charts, top-read posts | any signed-in admin |
| المحتوى ▸ الأخبار | `/content/news` (+ `/new`, `/[id]/edit`) | News posts (`type=0`) | `allowPosts` |
| المحتوى ▸ الفيديوهات | `/content/videos` (+ `/new`, `/[id]/edit`) | Video posts (`type=1`) | `allowPosts` |
| المحتوى ▸ الصور | `/content/photos` (+ `/new`, `/[id]/edit`) | Photo posts (`type=2`) | `allowPosts` |
| المحتوى ▸ وظائف | `/content/jobs` (+ `/new`, `/[id]/edit`) | Short text posts (`type=3`, jobs category) | `allowPosts` |
| المحتوى ▸ رسائل شكر | `/content/thanks` (+ `/new`, `/[id]/edit`) | Short text posts (`type=3`, thanks category) | `allowPosts` |
| المحتوى ▸ مفقودات وموجودات | `/content/lost-found` (+ `/new`, `/[id]/edit`) | Short text posts (`type=3`, lost & found category) | `allowPosts` |
| التعليقات | `/comments` (+ `/[id]/edit`) | Moderate readers' comments | `allowComments` |
| الإعلانات | `/ads` (+ `/new`, `/[id]/edit`) | Banners, pop-ups ("اقتحامي"), post banners | `allowAds` |
| المحررين | `/editors` (+ `/new`, `/[id]/edit`) | Admin accounts and their permissions | `allowAdmins` |
| الاشعارات | `/notifications` | Send a push notification | `allowNotifications` |
| الاستبيانات | `/surveys` (+ `/new`, `/[id]/edit`) | Surveys and their answer options | `allowSurveys` |
| الاعدادات العامة | `/settings` | Social links, contact email, about / privacy / info texts | `allowSettings` |

`/` redirects to `/dashboard` (or to `/login` when signed out).

## 5. Content tone

Short, formal Modern Standard Arabic. Action labels are verbs: "إضافة"، "حفظ"، "تراجع"، "حذف"، "إرسال". No marketing language, no emoji.

## 6. Out of scope (for now)

Endpoints exist in the collection but have no page in the current admin. Do not build screens for them unless a task asks:

- `categories/*` CRUD (categories are only *read* for filters and selects)
- `users/*` (readers' accounts)
- `fixedpages/*`, `webPost`, `webHome`, `getFixedPage` (public-site endpoints)
- `admins/changeMyPassword` (candidate for a later "change password" item in the user menu)

## 7. Important decisions

- **New UI, same content.** Rebuild with the new design system; keep every field, column, filter and action from the old admin unless a task removes it.
- **Create / edit are full pages** (`/new`, `/[id]/edit`), as in the old admin — the post editor needs the space. No create/edit drawers.
- **One posts module for all six content types.** News, videos, photos, jobs, thanks and lost & found share one feature (`src/features/posts`) driven by a per-type config, not six copies.
- **API version:** all calls go to `https://dreamapi.alqhat.com/v2` (the collection's `{{demo}}`). The collection's `{{live}}` (`/v1`) entries are used as `/v2` too.
- **The browser calls the API directly** (CORS allows `*`). No Next.js proxy/BFF layer.
- **Post editor: Jodit** (user's choice, 2026-10-18).
- **New posts start "تحت المراجعة"** (`active=0`) (user's choice).
- **Khatma fields show only for the deaths category** (وفيات) in the news form (user's choice).
