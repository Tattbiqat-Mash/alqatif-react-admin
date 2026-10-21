import Link from "next/link"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { messages } from "@/lib/messages"

/** A list page's "إضافة" link: icon only on phones (the label stays for screen readers). */
export function AddButton({ href, label = messages.actions.add }: { href: string; label?: string }) {
  return (
    <Button asChild className="max-sm:size-10 max-sm:px-0 sm:ps-3">
      <Link href={href} title={label}>
        <PlusIcon />
        <span className="max-sm:sr-only">{label}</span>
      </Link>
    </Button>
  )
}
