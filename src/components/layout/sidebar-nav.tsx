"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "cn"

import { useAuth } from "@/components/providers/auth-provider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { NAV, isPathActive, type NavEntry, type NavGroup, type NavLink } from "@/config/nav"

type NavProps = {
  collapsed: boolean
  /** Called after a link is clicked (closes the mobile drawer). */
  onNavigate?: () => void
}

const itemBase =
  "relative flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring [&_svg]:size-5 [&_svg]:shrink-0"
const itemActive =
  "bg-sidebar-accent text-sidebar-accent-foreground [&_svg]:text-sidebar-primary before:absolute before:inset-y-2 before:start-0 before:w-[3px] before:rounded-full before:bg-sidebar-primary"

/** Shows the label in a tooltip when the sidebar is collapsed. */
function WithTooltip({ show, label, children }: { show: boolean; label: string; children: React.ReactElement }) {
  if (!show) return children
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      {/* RTL: the sidebar is on the right, so labels open to its left. */}
      <TooltipContent side="left" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function LinkItem({ item, pathname, collapsed, onNavigate }: NavProps & { item: NavLink; pathname: string }) {
  const active = isPathActive(pathname, item.href)
  const Icon = item.icon
  return (
    <WithTooltip show={collapsed} label={item.label}>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        aria-label={collapsed ? item.label : undefined}
        className={cn(itemBase, active && itemActive, collapsed && "justify-center px-0")}
      >
        <Icon aria-hidden />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    </WithTooltip>
  )
}

function GroupItem({ group, pathname, collapsed, onNavigate }: NavProps & { group: NavGroup; pathname: string }) {
  const groupActive = isPathActive(pathname, group.basePath)
  // null = follow the route (open while inside the group); a click overrides it.
  const [manualOpen, setManualOpen] = React.useState<boolean | null>(null)
  const open = manualOpen ?? groupActive
  const Icon = group.icon

  if (collapsed) {
    return (
      <DropdownMenu>
        <WithTooltip show label={group.label}>
          <DropdownMenuTrigger
            aria-label={group.label}
            className={cn(itemBase, groupActive && itemActive, "justify-center px-0")}
          >
            <Icon aria-hidden />
          </DropdownMenuTrigger>
        </WithTooltip>
        <DropdownMenuContent side="left" align="start" sideOffset={8} className="min-w-48">
          <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
          {group.children.map((child) => (
            <DropdownMenuItem key={child.href} asChild>
              <Link
                href={child.href}
                onClick={onNavigate}
                aria-current={isPathActive(pathname, child.href) ? "page" : undefined}
                className="aria-[current=page]:font-semibold aria-[current=page]:text-primary-ink"
              >
                {child.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Collapsible open={open} onOpenChange={setManualOpen}>
      <CollapsibleTrigger className={cn(itemBase, groupActive && "text-sidebar-accent-foreground [&_svg:first-child]:text-sidebar-primary")}>
        <Icon aria-hidden />
        <span className="flex-1 truncate text-start">{group.label}</span>
        <ChevronDownIcon
          aria-hidden
          className={cn("size-4! transition-transform motion-reduce:transition-none", open && "rotate-180")}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="mt-1 flex flex-col gap-0.5 ps-8">
          {group.children.map((child) => {
            const active = isPathActive(pathname, child.href)
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-9 items-center gap-2.5 rounded-md px-3 text-sm text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                    active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn("size-1.5 shrink-0 rounded-full bg-sidebar-foreground/50", active && "bg-sidebar-primary")}
                  />
                  <span className="truncate">{child.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}

function NavList({ pathname, collapsed, onNavigate }: NavProps & { pathname: string }) {
  const { can } = useAuth()
  const visible = NAV.filter((entry: NavEntry) => !entry.permission || can(entry.permission))

  return (
    <nav aria-label="القائمة الرئيسية" className="flex-1 overflow-y-auto px-3 py-4">
      <ul className="flex flex-col gap-1">
        {visible.map((entry) => (
          <li key={entry.label}>
            {entry.kind === "link" ? (
              <LinkItem item={entry} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
            ) : (
              <GroupItem group={entry} pathname={pathname} collapsed={collapsed} onNavigate={onNavigate} />
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}

function NavWithPathname(props: NavProps) {
  const pathname = usePathname()
  return <NavList {...props} pathname={pathname} />
}

/**
 * usePathname() suspends on dynamic-param routes when Cache Components is on, so it
 * sits behind its own boundary; the fallback is the same list without an active item.
 */
export function SidebarNav(props: NavProps) {
  return (
    <React.Suspense fallback={<NavList {...props} pathname="" />}>
      <NavWithPathname {...props} />
    </React.Suspense>
  )
}
