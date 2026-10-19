import { endpoints } from "@/config/endpoints"
import { apiPost } from "@/lib/api/client"

/**
 * `POST /admin/settings/sendNotification` — body from the collection: `title`, `message`,
 * `type`, `catId`, `topic`. Only "عام" (type 0, topic "all") is known; ⚠ TBD the other
 * types and when `catId` / a category's `notificationTopic` are used. The reply is unknown;
 * any non-error reply counts as success.
 */
export type NotificationValues = { title: string; message: string }

export const GENERAL_NOTIFICATION = { type: 0, topic: "all" } as const

export function sendNotification(values: NotificationValues) {
  return apiPost<unknown>(endpoints.notifications.send, {
    title: values.title.trim(),
    message: values.message.trim(),
    type: GENERAL_NOTIFICATION.type,
    topic: GENERAL_NOTIFICATION.topic,
  })
}
