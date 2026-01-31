import {
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react'

import { Badge } from '@web/components/ui/badge'
import { Button } from '@web/components/ui/button'
import { Input } from '@web/components/ui/input'
import { ScrollArea } from '@web/components/ui/scroll-area'
import { Separator } from '@web/components/ui/separator'
import { Textarea } from '@web/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@web/components/ui/toggle-group'
import { getNotes } from '@web/data/notes'
import {
  filterAndSortNotes,
  matchesTag,
  normalizeTags,
  type SortOption,
} from '@web/lib/note-filters'
import { cn } from '@web/lib/utils'
import type { Note } from '@cli/notes-store'

type NoteStatus = 'saving' | 'error'
type NoteListItem = Note & { status?: NoteStatus }
type NoteDraft = { title: string; body: string }
type ToastTone = 'success' | 'error' | 'info'
type ToastEntry = {
  id: string
  title: string
  description?: string
  tone: ToastTone
}
type TagOption = {
  key: string
  label: string
  accent: string
}

const tagOptions: TagOption[] = [
  { key: 'home', label: 'Home', accent: 'bg-[var(--tag-sand)]' },
  { key: 'meetings', label: 'Meetings', accent: 'bg-[var(--tag-sky)]' },
  { key: 'personal', label: 'Personal', accent: 'bg-[var(--tag-lilac)]' },
  { key: 'work', label: 'Work', accent: 'bg-[var(--tag-moss)]' },
  { key: 'deleted', label: 'Deleted', accent: 'bg-[var(--tag-rose)]' },
]

const sortOptions: Array<{ key: SortOption; label: string }> = [
  { key: 'recent', label: 'Recent' },
  { key: 'title', label: 'Title' },
  { key: 'length', label: 'Length' },
]

const sortKeys = new Set(sortOptions.map((option) => option.key))

const getPrimaryTagLabel = (note: NoteListItem) => {
  const match = tagOptions.find((tag) => matchesTag(note, tag.key))
  return match?.label ?? 'Unsorted'
}

export const Route = createFileRoute('/')({
  component: NotesHome,
  loader: async () => {
    return (await getNotes()) as Note[]
  },
  validateSearch: (search) => {
    const q = typeof search.q === 'string' ? search.q : undefined
    const tags = typeof search.tags === 'string' ? search.tags : undefined
    const sort =
      typeof search.sort === 'string' && sortKeys.has(search.sort as SortOption)
        ? (search.sort as SortOption)
        : undefined

    return { q, tags, sort }
  },
})

function NotesHome() {
  const initialNotes = Route.useLoaderData() ?? []
  const [notes, setNotes] = useState<NoteListItem[]>(() =>
    initialNotes.map((note) => ({ ...note })),
  )
  const [draft, setDraft] = useState<NoteDraft>({ title: '', body: '' })
  const [editingTitle, setEditingTitle] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [showValidation, setShowValidation] = useState(false)
  const [toasts, setToasts] = useState<ToastEntry[]>([])
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const queryValue = search.q ?? ''
  const sortValue = (search.sort ?? 'recent') as SortOption
  const selectedTags = useMemo(
    () => normalizeTags(search.tags, tagOptions.map((tag) => tag.key)),
    [search.tags],
  )
  const titleInputRef = useRef<HTMLInputElement>(null)
  const editingNote = notes.find((note) => note.title === editingTitle)
  const trimmedTitle = draft.title.trim()
  const trimmedBody = draft.body.trim()
  const canSave = trimmedTitle.length > 0 && trimmedBody.length > 0
  const hasChanges = editingTitle
    ? trimmedTitle !== editingTitle || trimmedBody !== (editingNote?.body ?? '')
    : true
  const hasDuplicateTitle = useMemo(() => {
    if (!trimmedTitle) {
      return false
    }
    return notes.some(
      (note) => note.title === trimmedTitle && note.title !== editingTitle,
    )
  }, [notes, trimmedTitle, editingTitle])
  const tagCounts = useMemo(() => {
    return tagOptions.reduce<Record<string, number>>((acc, tag) => {
      acc[tag.key] = notes.filter((note) => matchesTag(note, tag.key)).length
      return acc
    }, {})
  }, [notes])
  const filteredNotes = useMemo(
    () =>
      filterAndSortNotes({
        notes,
        query: queryValue,
        tags: selectedTags,
        sort: sortValue,
      }),
    [notes, queryValue, selectedTags, sortValue],
  )
  const hasFilters = queryValue.trim().length > 0 || selectedTags.length > 0
  const syncingCount = notes.filter((note) => note.status === 'saving').length
  const noChanges = Boolean(editingTitle) && !hasChanges
  const validationMessage =
    (hasDuplicateTitle ? 'Title already used.' : null) ??
    (noChanges ? 'No changes to save yet.' : null) ??
    (!trimmedTitle ? 'Add a title to keep it findable.' : null) ??
    (!trimmedBody ? 'Write a few words for the note body.' : null)
  const showInlineValidation =
    (showValidation || hasDuplicateTitle || noChanges) && validationMessage

  const pushToast = (entry: Omit<ToastEntry, 'id'>) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((current) => [...current, { ...entry, id }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3600)
  }

  const dismissToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  const updateSearch = (next: {
    q?: string
    tags?: string
    sort?: SortOption
  }) => {
    navigate({
      search: (prev) => ({
        ...prev,
        ...next,
      }),
    })
  }

  const handleQueryChange = (value: string) => {
    updateSearch({ q: value ? value : undefined })
  }

  const handleSortChange = (value: string | null) => {
    if (!value || !sortKeys.has(value as SortOption)) {
      return
    }

    const nextSort = value as SortOption
    updateSearch({ sort: nextSort === 'recent' ? undefined : nextSort })
  }

  const handleToggleTag = (tagKey: string) => {
    const nextTags = selectedTags.includes(tagKey)
      ? selectedTags.filter((tag) => tag !== tagKey)
      : [...selectedTags, tagKey]

    updateSearch({ tags: nextTags.length ? nextTags.join(',') : undefined })
  }

  const clearFilters = () => {
    updateSearch({ q: undefined, tags: undefined })
  }

  const clearTags = () => {
    updateSearch({ tags: undefined })
  }

  const resetDraft = () => {
    setDraft({ title: '', body: '' })
    setEditingTitle(null)
    setStatusMessage(null)
    setShowValidation(false)
  }

  const focusComposer = () => {
    resetDraft()
    requestAnimationFrame(() => {
      titleInputRef.current?.focus()
    })
  }

  const handleEdit = (note: NoteListItem) => {
    setDraft({ title: note.title, body: note.body })
    setEditingTitle(note.title)
    setStatusMessage(null)
    setShowValidation(false)
  }

  const handleDelete = async (noteTitle: string) => {
    if (!confirm(`Delete "${noteTitle}"?`)) {
      return
    }

    const previousNotes = notes
    setNotes((current) => current.filter((note) => note.title !== noteTitle))
    setStatusMessage(null)

    const response = await fetch('/api/notes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: noteTitle }),
    })

    if (!response.ok) {
      setNotes(previousNotes)
      setStatusMessage('Unable to delete note. Try again.')
      pushToast({
        tone: 'error',
        title: 'Delete failed',
        description: 'Unable to delete note. Try again.',
      })
      return
    }

    pushToast({
      tone: 'success',
      title: 'Note deleted',
      description: `Removed "${noteTitle}".`,
    })
  }

  const handleSave = async () => {
    if (!canSave || hasDuplicateTitle || !hasChanges) {
      setShowValidation(true)
      if (validationMessage) {
        pushToast({
          tone: 'error',
          title: 'Fix the note',
          description: validationMessage,
        })
      }
      return
    }

    const nextNote: NoteListItem = {
      title: trimmedTitle,
      body: trimmedBody,
      status: 'saving',
    }
    const previousNotes = notes

    if (editingTitle) {
      setNotes((current) =>
        current.map((note) =>
          note.title === editingTitle ? nextNote : note,
        ),
      )
      setStatusMessage(null)

      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: nextNote.title,
          body: nextNote.body,
          originalTitle: editingTitle,
        }),
      })

      if (!response.ok) {
        setNotes(previousNotes)
        setStatusMessage('Unable to update note. Try again.')
        pushToast({
          tone: 'error',
          title: 'Update failed',
          description: 'Unable to update note. Try again.',
        })
        return
      }

      pushToast({
        tone: 'success',
        title: 'Note updated',
        description: `Updated "${nextNote.title}".`,
      })
    } else {
      setNotes((current) => [...current, nextNote])
      setStatusMessage(null)

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: nextNote.title, body: nextNote.body }),
      })

      if (!response.ok) {
        setNotes(previousNotes)
        setStatusMessage(
          response.status === 409
            ? 'Title already used. Pick a new name.'
            : 'Unable to save note. Try again.',
        )
        pushToast({
          tone: 'error',
          title: 'Save failed',
          description:
            response.status === 409
              ? 'Title already used. Pick a new name.'
              : 'Unable to save note. Try again.',
        })
        return
      }

      pushToast({
        tone: 'success',
        title: 'Note saved',
        description: `Saved "${nextNote.title}".`,
      })
    }

    setNotes((current) =>
      current.map((note) =>
        note.title === nextNote.title ? { ...note, status: undefined } : note,
      ),
    )
    resetDraft()
  }

  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-foreground">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <SidebarNav
          selectedTags={selectedTags}
          tagCounts={tagCounts}
          onToggleTag={handleToggleTag}
          onClearTags={clearTags}
          totalCount={notes.length}
        />
        <NotesListPanel
          notes={filteredNotes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onNew={focusComposer}
          totalCount={notes.length}
          syncingCount={syncingCount}
          sortValue={sortValue}
          onSortChange={handleSortChange}
          hasFilters={hasFilters}
          onClearFilters={clearFilters}
          query={queryValue}
          onQueryChange={handleQueryChange}
          activeTitle={editingTitle}
          selectedTags={selectedTags}
        />
        <EditorPanel
          draft={draft}
          setDraft={setDraft}
          editingTitle={editingTitle}
          canSave={canSave}
          hasChanges={hasChanges}
          hasDuplicateTitle={hasDuplicateTitle}
          onSave={handleSave}
          onCancel={resetDraft}
          statusMessage={statusMessage}
          titleInputRef={titleInputRef}
          showInlineValidation={showInlineValidation}
          validationMessage={validationMessage}
        />
      </div>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </main>
  )
}

function SidebarNav({
  selectedTags,
  tagCounts,
  onToggleTag,
  onClearTags,
  totalCount,
}: {
  selectedTags: string[]
  tagCounts: Record<string, number>
  onToggleTag: (tagKey: string) => void
  onClearTags: () => void
  totalCount: number
}) {
  return (
    <aside className="flex w-full flex-col bg-[var(--sidebar)] text-[var(--sidebar-foreground)] lg:w-60">
      <div className="flex items-center justify-between px-5 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-white/10 text-white">
            <FileText className="size-4" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">
              Notes
            </p>
            <p className="text-sm font-semibold">Blessed</p>
          </div>
        </div>
        <Badge className="rounded-full bg-white/10 text-xs text-white/70">
          {totalCount}
        </Badge>
      </div>
      <div className="px-4 pb-4">
        <div className="space-y-1">
          <SidebarNavButton
            icon={FileText}
            label="All notes"
            count={totalCount}
            active
          />
          <SidebarNavButton
            icon={Trash2}
            label="Trash"
            count={tagCounts.deleted ?? 0}
          />
        </div>
      </div>
      <Separator className="mx-4 bg-white/10" />
      <div className="flex items-center gap-2 px-5 pt-4 text-xs uppercase tracking-[0.35em] text-white/40">
        <Tag className="size-3" />
        Tags
      </div>
      <ScrollArea className="mt-3 flex-1 px-3 pb-4">
        <div className="space-y-1">
          {tagOptions.map((tag) => (
            <SidebarTagButton
              key={tag.key}
              tag={tag}
              count={tagCounts[tag.key] ?? 0}
              active={selectedTags.includes(tag.key)}
              onToggle={onToggleTag}
            />
          ))}
        </div>
      </ScrollArea>
      {selectedTags.length > 0 && (
        <div className="px-4 pb-5">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center rounded-xl bg-white/5 text-white/70 hover:text-white"
            onClick={onClearTags}
            type="button"
          >
            Clear filters
          </Button>
        </div>
      )}
    </aside>
  )
}

function SidebarNavButton({
  icon: Icon,
  label,
  count,
  active = false,
}: {
  icon: typeof FileText
  label: string
  count?: number
  active?: boolean
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      data-active={active}
      className={cn(
        'w-full justify-start gap-2 rounded-xl px-3 text-[13px] text-white/70 hover:text-white data-[active=true]:bg-white/15 data-[active=true]:text-white',
      )}
    >
      <Icon className="size-4" />
      <span className="flex-1 text-left">{label}</span>
      {typeof count === 'number' && (
        <span className="text-xs text-white/50">{count}</span>
      )}
    </Button>
  )
}

function SidebarTagButton({
  tag,
  count,
  active,
  onToggle,
}: {
  tag: TagOption
  count: number
  active: boolean
  onToggle: (tagKey: string) => void
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      data-active={active}
      onClick={() => onToggle(tag.key)}
      className={cn(
        'w-full justify-start gap-2 rounded-xl px-3 text-[13px] text-white/65 hover:text-white data-[active=true]:bg-white/12 data-[active=true]:text-white',
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', tag.accent)} />
      <span className="flex-1 text-left">{tag.label}</span>
      <span className="text-xs text-white/45">{count}</span>
    </Button>
  )
}

function NotesListPanel({
  notes,
  onEdit,
  onDelete,
  onNew,
  totalCount,
  syncingCount,
  sortValue,
  onSortChange,
  hasFilters,
  onClearFilters,
  query,
  onQueryChange,
  activeTitle,
  selectedTags,
}: {
  notes: NoteListItem[]
  onEdit: (note: NoteListItem) => void
  onDelete: (noteTitle: string) => void
  onNew: () => void
  totalCount: number
  syncingCount: number
  sortValue: SortOption
  onSortChange: (value: string | null) => void
  hasFilters: boolean
  onClearFilters: () => void
  query: string
  onQueryChange: (value: string) => void
  activeTitle: string | null
  selectedTags: string[]
}) {
  const noteCount = notes.length

  return (
    <section className="flex w-full flex-col border-l border-black/5 bg-[var(--panel-muted)] lg:w-[340px]">
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-foreground/40">
            Library
          </p>
          <h2 className="text-lg font-semibold">Notes</h2>
        </div>
        <Button
          size="sm"
          className="rounded-full bg-[var(--accent-strong)] text-white shadow-[0_6px_14px_rgba(180,85,60,0.2)] hover:bg-[var(--accent-strong)]/90"
          onClick={onNew}
          type="button"
        >
          <Plus className="size-4" />
          New
        </Button>
      </div>
      <div className="px-5 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" />
          <Input
            placeholder="Search notes"
            className="h-9 rounded-xl border-transparent bg-white/70 pl-9 text-sm shadow-sm"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-foreground/60">
          <span>
            {noteCount}/{totalCount} shown
          </span>
          {syncingCount > 0 && (
            <span className="flex items-center gap-1">
              <Loader2 className="size-3 animate-spin" />
              {syncingCount} syncing
            </span>
          )}
          {hasFilters && (
            <Badge className="rounded-full bg-white/70 text-[10px] text-foreground/70">
              Filtered {selectedTags.length > 0 ? `(${selectedTags.length})` : ''}
            </Badge>
          )}
        </div>
        <ToggleGroup
          type="single"
          spacing={0}
          value={sortValue}
          onValueChange={onSortChange}
          className="mt-3 w-full rounded-2xl bg-white/70 p-1"
        >
          {sortOptions.map((option) => (
            <ToggleGroupItem
              key={option.key}
              value={option.key}
              className="flex-1 justify-center text-xs"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full justify-center rounded-xl text-foreground/60 hover:text-foreground"
            onClick={onClearFilters}
            type="button"
          >
            Clear filters
          </Button>
        )}
      </div>
      <Separator className="bg-black/5" />
      <ScrollArea className="flex-1 px-2 pb-4">
        <div className="space-y-1 px-1 py-3">
          {notes.length === 0 ? (
            <EmptyState
              title={hasFilters ? 'No matching notes' : 'No notes yet'}
              body={
                hasFilters
                  ? 'Try a softer search or clear the filters.'
                  : 'Start with a tiny thought. It will grow.'
              }
              action={hasFilters ? 'Clear filters' : 'Add first note'}
              onAction={hasFilters ? onClearFilters : onNew}
            />
          ) : (
            notes.map((note) => (
              <NoteListRow
                key={note.title}
                note={note}
                active={note.title === activeTitle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </section>
  )
}

function NoteListRow({
  note,
  active,
  onEdit,
  onDelete,
}: {
  note: NoteListItem
  active: boolean
  onEdit: (note: NoteListItem) => void
  onDelete: (noteTitle: string) => void
}) {
  const tagLabel = getPrimaryTagLabel(note)

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'group relative flex gap-3 rounded-2xl px-4 py-3 text-left transition',
        active
          ? 'bg-white shadow-[0_6px_12px_rgba(22,26,38,0.1)]'
          : 'hover:bg-white/70',
      )}
      onClick={() => onEdit(note)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onEdit(note)
        }
      }}
    >
      <span
        className={cn(
          'absolute left-2 top-3 h-[calc(100%-24px)] w-1 rounded-full',
          active ? 'bg-[var(--accent-strong)]' : 'bg-transparent',
        )}
      />
      <div className="min-w-0 flex-1 pl-2">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold">{note.title}</p>
          <Badge className="rounded-full bg-[var(--accent-soft)] text-[10px] text-foreground/70">
            {tagLabel}
          </Badge>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-foreground/60">
          {note.body}
        </p>
        <div className="mt-2 flex items-center justify-between text-[11px] text-foreground/50">
          <span>Just now</span>
          {note.status === 'saving' && (
            <span className="flex items-center gap-1">
              <Loader2 className="size-3 animate-spin" />
              Syncing
            </span>
          )}
          {note.status === 'error' && (
            <span className="flex items-center gap-1">
              <AlertTriangle className="size-3" />
              Error
            </span>
          )}
        </div>
      </div>
      <Button
        size="icon-xs"
        variant="ghost"
        className="mt-1 text-foreground/40 opacity-0 transition hover:text-foreground group-hover:opacity-100"
        onClick={(event) => {
          event.stopPropagation()
          onDelete(note.title)
        }}
        aria-label={`Delete ${note.title}`}
        type="button"
      >
        <Trash2 className="size-3" />
      </Button>
    </div>
  )
}

function EditorPanel({
  draft,
  setDraft,
  editingTitle,
  canSave,
  hasChanges,
  hasDuplicateTitle,
  onSave,
  onCancel,
  statusMessage,
  titleInputRef,
  showInlineValidation,
  validationMessage,
}: {
  draft: NoteDraft
  setDraft: Dispatch<SetStateAction<NoteDraft>>
  editingTitle: string | null
  canSave: boolean
  hasChanges: boolean
  hasDuplicateTitle: boolean
  onSave: () => void
  onCancel: () => void
  statusMessage: string | null
  titleInputRef: RefObject<HTMLInputElement>
  showInlineValidation: boolean
  validationMessage: string | null
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col border-l border-black/5 bg-[var(--paper)]">
      <EditorToolbar modeLabel={editingTitle ? 'Editing' : 'New note'} />
      <ScrollArea className="flex-1">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-6 py-8">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              onSave()
            }}
          >
            <div className="rounded-[28px] border border-black/5 bg-white px-6 py-6 shadow-[0_10px_24px_rgba(20,24,35,0.08)]">
              <Input
                placeholder="Write down your idea"
                value={draft.title}
                ref={titleInputRef}
                onChange={(event) =>
                  setDraft({ ...draft, title: event.target.value })
                }
                className="h-auto rounded-none border-none bg-transparent px-0 text-3xl font-semibold focus-visible:ring-0"
              />
              <Separator className="my-4 bg-black/5" />
              <Textarea
                placeholder="Keep going. Links, lists, and tags are welcome."
                className="min-h-[320px] resize-none rounded-none border-none bg-transparent px-0 text-[17px] font-editor leading-relaxed focus-visible:ring-0"
                value={draft.body}
                onChange={(event) =>
                  setDraft({ ...draft, body: event.target.value })
                }
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-foreground/60">
              <span>
                Tip: add #home, #work, #personal, or #meetings to tag notes.
              </span>
              <Badge className="rounded-full bg-[var(--accent-soft)] text-[10px] text-foreground/70">
                Markdown ready
              </Badge>
            </div>
            {showInlineValidation && validationMessage && (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white/70 px-4 py-2 text-xs text-foreground/70">
                {validationMessage}
              </div>
            )}
            {statusMessage && (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white/70 px-4 py-2 text-xs text-foreground/70">
                {statusMessage}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-foreground/50">
                <Badge className="rounded-full bg-[var(--panel-muted)] text-foreground/60">
                  {editingTitle ? 'Editing' : 'Draft'}
                </Badge>
                <span>Today, 4:30</span>
              </div>
              <div className="flex items-center gap-2">
                {editingTitle && (
                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-2xl"
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  className="rounded-2xl"
                  disabled={!canSave || !hasChanges || hasDuplicateTitle}
                >
                  <Plus className="size-4" />
                  {editingTitle ? 'Update note' : 'Save note'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </ScrollArea>
    </section>
  )
}

function EditorToolbar({ modeLabel }: { modeLabel: string }) {
  return (
    <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-foreground/40">
        <span className="rounded-lg bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-semibold tracking-[0.2em] text-foreground/70">
          Format
        </span>
        <span className="hidden sm:inline">Compose</span>
      </div>
      <div className="flex items-center gap-2">
        <Badge className="rounded-full bg-[var(--panel-muted)] text-foreground/60">
          {modeLabel}
        </Badge>
        <Button variant="ghost" size="icon-sm" className="rounded-full">
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function EmptyState({
  title,
  body,
  action,
  onAction,
}: {
  title: string
  body: string
  action: string
  onAction?: () => void
}) {
  return (
    <div className="rounded-2xl border border-dashed border-black/10 bg-white/70 px-4 py-8 text-center">
      <div className="mx-auto mb-3 grid size-10 place-items-center rounded-full bg-[var(--accent-soft)] text-foreground/70">
        <Sparkles className="size-4" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-foreground/60">{body}</p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4 rounded-full"
        onClick={onAction}
        type="button"
        disabled={!onAction}
      >
        <Plus className="size-4" />
        {action}
      </Button>
    </div>
  )
}

function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastEntry[]
  onDismiss: (id: string) => void
}) {
  if (toasts.length === 0) {
    return null
  }

  const toneStyles: Record<ToastTone, string> = {
    success:
      'border-emerald-200/70 bg-emerald-50/90 text-emerald-950 shadow-[0_10px_22px_rgba(16,60,45,0.16)]',
    error:
      'border-rose-200/70 bg-rose-50/90 text-rose-950 shadow-[0_10px_22px_rgba(90,20,30,0.16)]',
    info:
      'border-[var(--border)] bg-white/95 text-foreground shadow-[0_10px_22px_rgba(16,20,40,0.14)]',
  }

  const toneIcon = (tone: ToastTone) => {
    if (tone === 'success') {
      return CheckCircle2
    }
    if (tone === 'error') {
      return AlertTriangle
    }
    return Sparkles
  }

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-[320px] flex-col gap-3">
      {toasts.map((toast) => {
        const Icon = toneIcon(toast.tone)
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto rounded-2xl border px-4 py-3 backdrop-blur',
              toneStyles[toast.tone],
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-8 place-items-center rounded-2xl bg-white/80 text-foreground/80">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.description && (
                    <p className="text-xs text-foreground/70">
                      {toast.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="text-foreground/60 transition hover:text-foreground"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
