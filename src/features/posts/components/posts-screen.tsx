"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { AddButton } from "@/components/ui/add-button"
import { Card } from "@/components/ui/card"
import { countActive, FilterItem, FiltersBar } from "@/components/ui/filters-bar"
import { FilterSelect } from "@/components/ui/filter-select"
import { ForbiddenState } from "@/components/ui/states"
import { PageHeader } from "@/components/ui/page-header"
import { SearchInput } from "@/components/ui/search-input"
import { SuggestionsList } from "@/components/ui/suggestions-list"
import { contentHref, getContentType } from "@/config/content-types"
import { useCategories } from "@/features/categories/hooks/use-categories"
import { useEditorOptions } from "@/features/editors/hooks/use-editors"
import { PostsTable } from "@/features/posts/components/posts-table"
import { useAuthorNames } from "@/features/posts/hooks/use-author-names"
import { usePostFilters } from "@/features/posts/hooks/use-post-filters"
import { usePostsList } from "@/features/posts/hooks/use-posts"
import type { PostStatus } from "@/features/posts/types/posts.types"
import { pinned as pinnedLabels, postStatus } from "@/lib/labels"

export function PostsScreen({ slug }: { slug: string }) {
  // The page validated the slug, so the config exists.
  const content = getContentType(slug)!
  const { can } = useAuth()
  const { filters, hasActiveFilters, setPage, setSearch, setCategory, setEditor, setWriter, setStatus, setPinned, clear } = usePostFilters()
  const list = usePostsList(content, filters)
  // Sections with a fixed category (jobs, thanks, lost & found) have no category filter.
  const categories = useCategories(content.type, { enabled: content.categoryId === null })
  const editors = useEditorOptions()
  const writers = useAuthorNames()

  if (list.error?.statusCode === 403) {
    return (
      <Card>
        <ForbiddenState />
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <PageHeader
        title={content.title}
        actions={can("allowPosts") && <AddButton href={`${contentHref(content.slug)}/new`} />}
      />

      <Card className="gap-0 py-0">
        <FiltersBar
          search={<SearchInput value={filters.search} onChange={setSearch} placeholder="بحث في العناوين…" />}
          activeCount={countActive(filters.categoryId, filters.editorId, filters.writer, filters.status, filters.pinned)}
          hasActiveFilters={hasActiveFilters}
          onClear={clear}
        >
          {content.categoryId === null && (
            <FilterItem>
              <FilterSelect<number>
                aria-label="التصنيف"
                allLabel={categories.isPending ? "جاري تحميل التصنيفات…" : "كل التصنيفات"}
                value={filters.categoryId}
                onChange={setCategory}
                options={(categories.data ?? []).map((c) => ({ value: c.id, label: c.title }))}
              />
            </FilterItem>
          )}
          <FilterItem>
            <FilterSelect<number>
              aria-label="المحرر"
              allLabel={editors.isPending ? "جاري تحميل المحررين…" : "كل المحررين"}
              value={filters.editorId}
              onChange={setEditor}
              options={(editors.data ?? []).map((e) => ({ value: e.id, label: e.displayName }))}
            />
          </FilterItem>
          <FilterItem>
            {/* ~4000 names: a text field with native suggestions instead of a select. */}
            <SearchInput
              value={filters.writer}
              onChange={setWriter}
              placeholder="كل الكتاب"
              aria-label="الكاتب"
              listId="writer-names"
              maxLength={200}
            />
            <SuggestionsList id="writer-names" options={writers.data} />
          </FilterItem>
          <FilterItem>
            <FilterSelect<PostStatus>
              aria-label="حالة النشر"
              allLabel="كل حالات النشر"
              value={filters.status}
              onChange={setStatus}
              options={postStatus.options as { value: PostStatus; label: string }[]}
            />
          </FilterItem>
          <FilterItem>
            <FilterSelect<number>
              aria-label="حالة العرض"
              allLabel="كل حالات العرض"
              value={filters.pinned === null ? null : filters.pinned ? 1 : 0}
              onChange={(value) => setPinned(value === null ? null : value === 1)}
              options={pinnedLabels.options}
            />
          </FilterItem>
        </FiltersBar>

        <PostsTable
          content={content}
          items={list.data?.items}
          page={filters.page}
          pageCount={list.data?.pageCount ?? null}
          hasNextPage={list.data?.hasNextPage ?? false}
          onPageChange={setPage}
          isLoading={list.isPending}
          isFetching={list.isFetching}
          isError={list.isError}
          errorMessage={list.error?.message}
          onRetry={() => void list.refetch()}
          filtered={hasActiveFilters}
        />
      </Card>
    </div>
  )
}
