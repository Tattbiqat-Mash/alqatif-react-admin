# Design System

A clean, calm Arabic admin: white cards on a light grey canvas, a dark sidebar, amber as the brand colour. Dense enough for editors who work through long lists every day; no decoration.

Light mode only. RTL only (see [rtl-and-arabic.md](rtl-and-arabic.md)).

## Colour tokens

All colours are CSS variables in `src/app/globals.css` under `:root`, exposed to Tailwind v4 through `@theme inline`. Use the utility classes; never write a hex, `rgb()`, or arbitrary colour (`bg-[#FFA800]`) in a component. If a colour you need has no token, add the token — do not inline it.

| Purpose | Token → class | Value |
|---|---|---|
| Page canvas | `background` → `bg-background` | `#f5f8fa` |
| Cards, panels, header, inputs | `surface` → `bg-surface` | `#ffffff` |
| Table header, subtle fills, read-only fields | `surface-muted` → `bg-surface-muted` | `#f9fafb` |
| Dividers, input borders | `border` → `border-border` | `#e4e6ef` |
| Main text | `foreground` → `text-foreground` | `#181c32` |
| Secondary text | `muted-text` → `text-muted-text` | `#5e6278` |
| Placeholders, disabled text | `subtle-text` → `text-subtle-text` | `#a1a5b7` |

Brand:

| Role | Tokens | Value | Use |
|---|---|---|---|
| Primary | `primary`, `primary-hover`, `primary-muted`, `primary-foreground`, `primary-ink` | `#FFA800`, `#e69700`, `#fff4de`, `#1e1e2d`, `#9a6200` | Main buttons, active nav icon, focus ring, links, selected states |
| Accent | `danger`, `danger-muted`, `danger-ink` | `#f1416c`, `#fff5f8`, `#d1184a` | Destructive actions, highlights, required `*` |
| Sidebar | `sidebar`, `sidebar-foreground`, `sidebar-accent`, `sidebar-accent-foreground`, `sidebar-primary`, `sidebar-border` | `#1e1e2d`, `#a2a3b7`, `#1b1b28`, `#ffffff`, `#FFA800`, `#2b2b40` | Sidebar only |

The brand accent is exposed as the **`danger`** tokens, not `accent`: shadcn components use `accent` / `accent-foreground` for the neutral hover fill of menu items, so `accent` stays `#f4f5f8`. The shadcn variables (`card`, `popover`, `muted`, `muted-foreground`, `secondary`, `input`, `ring`, `destructive`, `chart-*`) are mapped onto the tokens above in `globals.css` — prefer our names (`bg-surface`, `text-muted-text`, `text-danger-ink`) in new code.

Contrast rules (measured):

- **Never put white text on `primary`** (1.9:1). Primary buttons use `bg-primary text-primary-foreground` (dark text, 8.5:1).
- Amber text on white or on `primary-muted` uses `text-primary-ink` (≥ 4.6:1), never `text-primary`.
- `danger` (`#f1416c`) is 3.7:1 on white — use it for fills, icons, borders and dots. Text and solid destructive buttons use `danger-ink` (`bg-danger-ink text-white`, `text-danger-ink`).

Semantic (status) tokens — each has a base for dots/icons, `-muted` for the tint, and `-ink` for text on the tint:

| Token | Base | Muted | Ink |
|---|---|---|---|
| `success` | `#50cd89` | `#e8fff3` | `#0f7a4a` |
| `warning` | = primary `#FFA800` | `#fff4de` | `#9a6200` |
| `danger` | brand accent `#f1416c` | `#fff5f8` | `#d1184a` |
| `info` | `#3e97ff` | `#eef6ff` | `#1a5fc0` |
| `neutral` | `#a1a5b7` | `#f1f1f4` | `#5e6278` |

## Status badges

`<StatusBadge>` (`@/components/ui/status-badge`) is the only way to show a status. It takes a semantic tone and a label from the label maps; badges are pills with `bg-<tone>-muted text-<tone>-ink`.

| Meaning | Tone | Examples |
|---|---|---|
| Published / active | success | منشور، فعال |
| Waiting | warning | تحت المراجعة |
| Stopped | danger | موقوف |
| Off / not set | neutral | غير فعال، غير مثبت |
| Pinned | info | مثبت |

Use the same tone for the same meaning on every screen.

## Shape, spacing, typography

- Radius: `--radius` 8px; cards `rounded-lg`, inputs and buttons `rounded-md`, badges `rounded-full`.
- Cards: `bg-surface border border-border rounded-lg` with at most `shadow-xs`. Shadows otherwise only on dropdowns, dialogs and popovers.
- No gradients, no glassmorphism, no decorative backgrounds (the old login's network pattern is dropped).
- Font: **Cairo** (`next/font/google`, subsets `arabic` + `latin`, variable `--font-cairo`) for everything, loaded in `src/app/layout.tsx`.
- Sizes: page title 18px semibold; card titles 16px semibold; table and form text 14px; labels 14px medium; badges and helper text 12px.
- Page padding `p-4 md:p-6`; gap between cards `gap-4 md:gap-6`.

## Layout shell

```text
┌──────────────────────────────────────────────┬──────────┐
│ Header: (start) menu btn … (end) user menu   │          │
├──────────────────────────────────────────────┤ Sidebar  │
│ Page header: title + subtitle … action btn   │ (start   │
│ Content (cards, tables, forms)               │  side)   │
└──────────────────────────────────────────────┴──────────┘
```

In RTL the sidebar sits on the right (the inline-start side). Use logical properties so it follows `dir`.

### Sidebar (`src/components/layout/sidebar.tsx`)

- Background `bg-sidebar`, full height, fixed.
- **Top:** the logo (`/logo.jpeg`, 40×40, `rounded-md`) and the name "القطيف اليوم" (hidden when collapsed), plus the collapse button.
- **States:** expanded `w-64` and collapsed `w-20` (icons only). The choice is remembered in `localStorage.sidebar_collapsed` (inside `try/catch`). Below `lg` the sidebar is a drawer (shadcn `Sheet`, `side="right"` because the start side in RTL is the right) opened from a menu button in the header; the drawer is always expanded.
- **Items** (from `src/config/nav.ts`, filtered by permission): الرئيسية · المحتوى (accordion: الأخبار، الفيديوهات، الصور، وظائف، رسائل شكر، مفقودات وموجودات) · التعليقات · الإعلانات · المحررين · الاشعارات · الاستبيانات · الاعدادات العامة.
- Item: icon + label, `text-sidebar-foreground`, hover `bg-sidebar-accent text-sidebar-accent-foreground`. Active item: `bg-sidebar-accent text-sidebar-accent-foreground` with the icon in `text-sidebar-primary` and a 3px `bg-primary` bar on the inline-start edge.
- **Accordion (المحتوى):** opens on click; open automatically when the current route is one of its children. Chevron rotates when open. Sub-items are indented with a small dot instead of an icon.
- **Collapsed:** labels hidden, tooltips (shadcn `Tooltip`, on the inline-end side) show the label; المحتوى opens its children in a popover menu instead of expanding inline.
- Every icon-only control has an `aria-label`.

### Header (`src/components/layout/header.tsx`)

- `bg-surface border-b border-border h-16`, sticky.
- Start: menu button (below `lg` only). The page title is not repeated here — it lives in the page header.
- End (the left side in RTL): "مرحباً، {displayName}" + avatar (image, or the first letter on `bg-primary-muted text-primary-ink`) + chevron-down. Clicking opens a dropdown (shadcn `DropdownMenu`) with: avatar, display name, email, a separator, and "خروج" (`LogOut` icon, `text-danger-ink`).

### Page header (`src/components/ui/page-header.tsx`)

Title (and optional subtitle / record count) at the start; the page's main action at the end — "إضافة" (`Plus`) on lists, "العودة للقائمة" on create/edit pages.

## Components

- Buttons: primary `bg-primary text-primary-foreground`; secondary `variant="outline"`; destructive `bg-danger-ink text-white`; ghost for icon actions in tables. Every button has hover, focus-visible ring (`ring-primary`), disabled and loading states.
- Form actions: "حفظ" (primary) at the start, "تراجع" (outline, navigates back to the list) next to it.
- Inputs: shadcn `Input` / `Textarea` / `Select`, `bg-surface border-border`, focus ring primary, height 40px. Labels above the field (stacked), not beside it. Required labels end with a red `*` (`text-danger`).
- Switches (`Switch`) for yes/no options (السماح بالتعليقات، إرسال إشعار، مثبت…); checkboxes for multi-select lists (permissions).
- Icons: `lucide-react` outline icons only, 16–20px. No emoji.
- Toasts: `sonner`, `position="top-center"`, `dir="rtl"`. Success after every save/delete/toggle; error when a mutation fails outside a form.

## Charts (dashboard)

`recharts` (`src/features/dashboard/components/charts.tsx` is the reference). Single-series bars in **`chart-1` = `#C27E00`** — a darker step of the primary: `#FFA800` is 1.9:1 on white, below the 3:1 a data mark needs (checked with the dataviz validator). Bars ≤ 24px with a 4px rounded data end; hairline grid in `border`; axis text `muted-text`; hover tooltip; an `sr-only` table with the same values. No legend for a single series — the card title names it.

RTL: categories start on the right (`reversed` x-axis, `orientation="right"` y-axis) and horizontal bars grow leftwards. **SVG text inherits the page's RTL direction, which swaps recharts' `textAnchor`**, so axis ticks and bar-end labels that sit beside something are custom components with the anchor written for RTL (`CategoryTick`, `ValueTick`, `BarEndLabel`). Axis numbers use `formatCompact` ("17.3 ألف", "3.2 مليون"); tooltips use `formatNumber`. Every chart has an empty state ("لا توجد بيانات").

## Motion

Subtle and functional only: sidebar collapse width transition, accordion open, dropdowns, dialogs, skeleton pulse, toasts. No page transitions. Respect `prefers-reduced-motion`.

## Responsive

Desktop-first, fully usable at 390px:

- `< lg`: sidebar becomes a drawer; header shows the menu button.
- Tables scroll horizontally inside their card; the page itself never scrolls horizontally.
- Filter bars wrap into one column on mobile; form grids become one column.

## Accessibility

Semantic HTML first (real `<button>`, `<a>`, `<label>`), correct heading order, keyboard-reachable controls with visible focus, accessible names on icon-only buttons, contrast ≥ 4.5:1 for text. Add ARIA only when native semantics cannot express it.
