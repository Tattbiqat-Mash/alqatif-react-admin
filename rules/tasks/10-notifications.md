# Task 10: Notifications (الاشعارات)

## Goal

Admins send a push notification to app users.

## Reference

Old admin: `/admin/notifications/create`.

Screenshots: [`10-notifications.png`](screenshots/10-notifications.png)

## Scope

- `src/app/(admin)/notifications/page.tsx`, `src/features/notifications/*`
- Endpoint: `POST /admin/settings/sendNotification` — [api-endpoints.md](../api-endpoints.md#notifications--adminsettings)
- Permission: `allowNotifications`

## Requirements

- One card with the form; there is no list of sent notifications (no endpoint).
- Fields: العنوان * (`title`), المحتوى * (`message`, textarea with a character counter), نوع الإشعار * (`type`, default "عام").
- If the type targets a category, show a category select (`catId`) — ⚠ see below.
- "إرسال" (primary, `Send` icon) opens a confirm dialog: "سيتم إرسال الإشعار «{title}» لجميع مستخدمي التطبيق. متابعة؟"
- On success: toast "تم إرسال الإشعار", reset the form. "تراجع" goes to `/dashboard`.

> **Status:** built (`src/features/notifications/`): title + message + type shown as "عام"; sends `type=0&topic=all` (no `catId`), after a confirm dialog; limits 100 / 500 chars are the app's own. Verified on a local mock.

## Open questions (⚠ TBD)

- All values of `type` and their labels (only "عام" is visible in the old form).
- When to send `catId` and `topic`; is `topic=all` the general case, and is a category's `notificationTopic` used for category notifications?
- Title / message length limits.

## Acceptance criteria

- [ ] The form builds the right request; the user sends a test notification to a test device (never to real users) and confirms.
- [ ] Validation and confirm dialog work; the form resets after success.
- [ ] `pnpm check` passes.
