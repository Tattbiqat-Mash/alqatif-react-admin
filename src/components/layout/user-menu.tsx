"use client"

import { ChevronDownIcon, LogOutIcon } from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { messages } from "@/lib/messages"

function initial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "؟"
}

function AdminAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <Avatar className={className}>
      {/* The API has no avatar image; show the first letter. */}
      <AvatarFallback className="bg-primary-muted font-semibold text-primary-ink">{initial(name)}</AvatarFallback>
    </Avatar>
  )
}

export function UserMenu() {
  const { admin, signOut } = useAuth()
  if (!admin) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1.5 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted">
        <span className="hidden text-sm text-muted-text sm:inline">
          مرحباً، <bdi className="font-medium text-foreground">{admin.displayName}</bdi>
        </span>
        <AdminAvatar name={admin.displayName} className="size-9" />
        <ChevronDownIcon aria-hidden className="size-4 text-muted-text" />
        <span className="sr-only">قائمة الحساب</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-64">
        <DropdownMenuLabel className="flex items-center gap-3 py-2 font-normal">
          <AdminAvatar name={admin.displayName} className="size-10" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-foreground">{admin.displayName}</span>
            {admin.email && (
              <span dir="ltr" className="truncate text-start text-xs text-muted-text">
                {admin.email}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={signOut}>
          <LogOutIcon aria-hidden />
          {messages.actions.logout}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
