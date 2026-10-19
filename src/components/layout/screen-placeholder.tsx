import { ConstructionIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"

/** Temporary page body until the screen's task is built (rules/tasks/README.md). */
export function ScreenPlaceholder({ title, task }: { title: string; task: string }) {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader title={title} />
      <Card>
        <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary-muted text-primary-ink">
            <ConstructionIcon className="size-6" />
          </div>
          <p className="font-semibold text-foreground">هذه الصفحة قيد الإنشاء</p>
          <p className="text-sm text-muted-text">سيتم بناؤها في المهمة {task}.</p>
        </div>
      </Card>
    </div>
  )
}
