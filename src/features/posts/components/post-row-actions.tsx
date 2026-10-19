"use client"

import * as React from "react"
import Link from "next/link"
import {
  CheckIcon,
  ExternalLinkIcon,
  MessageSquareIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  ToggleRightIcon,
  Trash2Icon,
} from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IconAction } from "@/components/ui/icon-action"
import { contentEditHref, publicPostUrl, type ContentTypeConfig } from "@/config/content-types"
import { useChangePostStatus, useDeletePost, useTogglePostPinned } from "@/features/posts/hooks/use-posts"
import type { PostListItem, PostStatus } from "@/features/posts/types/posts.types"
import { postStatus } from "@/lib/labels"
import { messages } from "@/lib/messages"

export function PostRowActions({ post, content }: { post: PostListItem; content: ContentTypeConfig }) {
  const changeStatus = useChangePostStatus()
  const togglePinned = useTogglePostPinned()
  const deletePost = useDeletePost()
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

      <DropdownMenu>
        <IconAction label="تغيير الحالة">
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="تغيير الحالة" disabled={changeStatus.isPending}>
              <ToggleRightIcon />
            </Button>
          </DropdownMenuTrigger>
        </IconAction>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>تغيير الحالة</DropdownMenuLabel>
          {postStatus.options.map((option) => {
            const current = option.value === post.status
            return (
              <DropdownMenuItem
                key={option.value}
                disabled={current}
                onSelect={() => changeStatus.mutate({ id: post.id, status: option.value as PostStatus })}
              >
                <CheckIcon className={cn(!current && "invisible")} aria-hidden />
                {option.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <IconAction label={post.pinned ? "إلغاء التثبيت" : "تثبيت"}>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={post.pinned ? "إلغاء التثبيت" : "تثبيت"}
          aria-pressed={post.pinned}
          disabled={togglePinned.isPending}
          onClick={() => togglePinned.mutate({ id: post.id, pinned: !post.pinned })}
        >
          {post.pinned ? <PinOffIcon /> : <PinIcon />}
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
