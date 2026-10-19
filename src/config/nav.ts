import {
  BellIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  MegaphoneIcon,
  MessageSquareIcon,
  NewspaperIcon,
  SettingsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { CONTENT_TYPES, contentHref } from "@/config/content-types"
import type { AdminPermission } from "@/features/auth/types/auth.types"

export type NavLink = {
  label: string
  href: string
  icon: LucideIcon
  /** Omitted = every signed-in admin. */
  permission?: AdminPermission
}

export type NavGroup = {
  label: string
  icon: LucideIcon
  permission?: AdminPermission
  /** Opens automatically when the current path starts with this. */
  basePath: string
  children: Omit<NavLink, "icon" | "permission">[]
}

export type NavEntry = ({ kind: "link" } & NavLink) | ({ kind: "group" } & NavGroup)

/** Sidebar order and permissions (rules/auth-and-permissions.md#permissions). */
export const NAV: NavEntry[] = [
  { kind: "link", label: "الرئيسية", href: "/dashboard", icon: LayoutDashboardIcon },
  {
    kind: "group",
    label: "المحتوى",
    icon: NewspaperIcon,
    permission: "allowPosts",
    basePath: "/content",
    children: CONTENT_TYPES.map((c) => ({ label: c.title, href: contentHref(c.slug) })),
  },
  { kind: "link", label: "التعليقات", href: "/comments", icon: MessageSquareIcon, permission: "allowComments" },
  { kind: "link", label: "الإعلانات", href: "/ads", icon: MegaphoneIcon, permission: "allowAds" },
  { kind: "link", label: "المحررين", href: "/editors", icon: UsersIcon, permission: "allowAdmins" },
  { kind: "link", label: "الإشعارات", href: "/notifications", icon: BellIcon, permission: "allowNotifications" },
  { kind: "link", label: "الاستبيانات", href: "/surveys", icon: ListChecksIcon, permission: "allowSurveys" },
  { kind: "link", label: "الإعدادات العامة", href: "/settings", icon: SettingsIcon, permission: "allowSettings" },
]

/** `/content/news/12/edit` is inside `/content/news`; `/ads` is not inside `/a`. */
export function isPathActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}
