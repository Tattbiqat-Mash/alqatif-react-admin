"use client"

import * as React from "react"
import Link from "next/link"
import { BellIcon, ExternalLinkIcon, MessageSquareIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { IconAction } from "@/components/ui/icon-action"
import { contentEditHref, publicPostUrl, type ContentTypeConfig } from "@/config/content-types"
import { useDeletePost, useSendPostNotification } from "@/features/posts/hooks/use-posts"
import type { PostListItem } from "@/features/posts/types/posts.types"
import { messages } from "@/lib/messages"

export function PostRowActions({ post, content }: { post: PostListItem; content: ContentTypeConfig }) {
  const sendNotification = useSendPostNotification()
  const deletePost = useDeletePost()
  const [confirmNotify, setConfirmNotify] = React.useState(false)
  const [confirmDelete, setConfirmDelete] = React.useState(false)

  return (
    <div className="flex items-center gap-0.5">
      <IconAction label={messages.actions.edit}>
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={contentEditHref(content.slug, post.id)} aria-label={`${messages.actions.edit}: ${post.title}`}>
            <PencilIcon />
          </Link>
        </Button>
      </IconAction>

      <IconAction label="إرسال إشعار">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`إرسال إشعار: ${post.title}`}
          disabled={sendNotification.isPending}
          onClick={() => setConfirmNotify(true)}
        >
          <BellIcon />
        </Button>
      </IconAction>

      <IconAction label="التعليقات">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={`/comments?postId=${post.id}`} aria-label={`تعليقات: ${post.title}`}>
            <MessageSquareIcon />
          </Link>
        </Button>
      </IconAction>

      <IconAction label="مشاهدة على الموقع">
        <Button variant="ghost" size="icon-sm" asChild>
          <a href={publicPostUrl(post.id)} target="_blank" rel="noopener noreferrer" aria-label={`مشاهدة على الموقع: ${post.title}`}>
            <ExternalLinkIcon />
          </a>
        </Button>
      </IconAction>

      <IconAction label={messages.actions.delete}>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-danger-ink hover:bg-danger-muted hover:text-danger-ink"
          aria-label={`${messages.actions.delete}: ${post.title}`}
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2Icon />
        </Button>
      </IconAction>

      <ConfirmDialog
        open={confirmNotify}
        onOpenChange={setConfirmNotify}
        title="إرسال إشعار"
        description={`سيُرسل إشعار بـ«${post.title}» لجميع مستخدمي التطبيق. متابعة؟`}
        confirmLabel="إرسال"
        pending={sendNotification.isPending}
        onConfirm={() =>
          sendNotification.mutate({ id: post.id }, { onSettled: () => setConfirmNotify(false) })
        }
      />

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={messages.confirm.deleteTitle}
        description={messages.confirm.deleteDescription(post.title)}
        confirmLabel={messages.actions.delete}
        destructive
        pending={deletePost.isPending}
        onConfirm={() =>
          deletePost.mutate({ id: post.id }, { onSettled: () => setConfirmDelete(false) })
        }
      />
    </div>
  )
}
