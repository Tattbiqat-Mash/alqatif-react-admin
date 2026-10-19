"use client"

import * as React from "react"
import { CheckIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { IconAction } from "@/components/ui/icon-action"
import { Input } from "@/components/ui/input"
import type { SurveyAnswer } from "@/features/surveys/api/surveys.api"
import { useAnswerMutations } from "@/features/surveys/hooks/use-surveys"
import { formatNumber } from "@/lib/format"
import { messages } from "@/lib/messages"

function AnswerRow({ answer, surveyId }: { answer: SurveyAnswer; surveyId: number }) {
  const { edit, remove } = useAnswerMutations(surveyId)
  const [editing, setEditing] = React.useState(false)
  const [text, setText] = React.useState(answer.text)
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  const save = () => {
    const trimmed = text.trim()
    if (!trimmed || trimmed === answer.text) return setEditing(false)
    edit.mutate({ id: answer.id, text: trimmed }, { onSuccess: () => setEditing(false) })
  }

  return (
    <li className="flex items-center gap-3 py-2.5">
      {editing ? (
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              save()
            }
            if (e.key === "Escape") setEditing(false)
          }}
          dir="auto"
          autoFocus
          aria-label="نص الإجابة"
          className="flex-1"
        />
      ) : (
        <span className="flex-1 text-sm text-foreground" dir="auto">
          {answer.text}
        </span>
      )}
      <span className="shrink-0 rounded-full bg-neutral-muted px-2 py-0.5 text-xs text-neutral-ink">
        {formatNumber(answer.votes)} صوت
      </span>
      <div className="flex shrink-0 items-center gap-0.5">
        {editing ? (
          <>
            <IconAction label={messages.actions.save}>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={messages.actions.save} onClick={save} disabled={edit.isPending}>
                <CheckIcon />
              </Button>
            </IconAction>
            <IconAction label={messages.actions.cancel}>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={messages.actions.cancel}
                onClick={() => {
                  setText(answer.text)
                  setEditing(false)
                }}
              >
                <XIcon />
              </Button>
            </IconAction>
          </>
        ) : (
          <IconAction label={messages.actions.edit}>
            <Button type="button" variant="ghost" size="icon-sm" aria-label={`${messages.actions.edit}: ${answer.text}`} onClick={() => setEditing(true)}>
              <PencilIcon />
            </Button>
          </IconAction>
        )}
        <IconAction label={messages.actions.delete}>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-danger-ink hover:bg-danger-muted hover:text-danger-ink"
            aria-label={`${messages.actions.delete}: ${answer.text}`}
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2Icon />
          </Button>
        </IconAction>
      </div>
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="حذف الإجابة"
        description={`هل تريد حذف الإجابة «${answer.text}»؟ ستُحذف أصواتها أيضاً.`}
        confirmLabel={messages.actions.delete}
        destructive
        pending={remove.isPending}
        onConfirm={() => remove.mutate(answer.id, { onSettled: () => setConfirmDelete(false) })}
      />
    </li>
  )
}

/** Edit page: answers save one by one, independently of the survey's "حفظ". */
export function SurveyAnswers({ surveyId, answers }: { surveyId: number; answers: SurveyAnswer[] }) {
  const { add } = useAnswerMutations(surveyId)
  const [draft, setDraft] = React.useState("")

  const submit = () => {
    const text = draft.trim()
    if (!text) return
    add.mutate(text, { onSuccess: () => setDraft("") })
  }

  return (
    <section aria-label="الإجابات" className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">الإجابات</h2>
        <p className="text-xs text-muted-text">تُحفظ تعديلات الإجابات فوراً.</p>
      </div>
      {answers.length === 0 ? (
        <p className="text-sm text-muted-text">لا توجد إجابات بعد.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {answers.map((a) => (
            <AnswerRow key={a.id} answer={a} surveyId={surveyId} />
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              submit()
            }
          }}
          placeholder="إجابة جديدة"
          dir="auto"
          aria-label="إجابة جديدة"
        />
        <Button type="button" variant="outline" onClick={submit} disabled={add.isPending || !draft.trim()}>
          <PlusIcon data-icon="inline-start" />
          إضافة إجابة
        </Button>
      </div>
    </section>
  )
}
