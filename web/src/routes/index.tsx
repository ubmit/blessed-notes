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
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Palette,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'

import { Badge } from '@web/components/ui/badge'
import { Button } from '@web/components/ui/button'
import { Card } from '@web/components/ui/card'
import { Checkbox } from '@web/components/ui/checkbox'
import { Input } from '@web/components/ui/input'
import { ScrollArea } from '@web/components/ui/scroll-area'
import { Separator } from '@web/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@web/components/ui/tabs'
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

const noteTints = [
  'bg-[var(--sky)] text-[var(--ink)]',
  'bg-[var(--peach)] text-[var(--ink)]',
  'bg-[var(--lilac)] text-[var(--ink)]',
  'bg-[var(--mint)] text-[var(--ink)]',
  'bg-[var(--sun)] text-[var(--ink)]',
  'bg-[var(--blueberry)] text-white',
]

const tagOptions: TagOption[] = [
  { key: 'home', label: 'Home', accent: 'bg-[var(--mint)]' },
  { key: 'meetings', label: 'Meetings', accent: 'bg-[var(--sky)]' },
  { key: 'personal', label: 'Personal', accent: 'bg-[var(--lilac)]' },
  { key: 'work', label: 'Work', accent: 'bg-[var(--peach)]' },
  { key: 'deleted', label: 'Deleted', accent: 'bg-[var(--muted)]' },
]

const sortOptions: Array<{ key: SortOption; label: string }> = [
  { key: 'recent', label: 'Recent' },
  { key: 'title', label: 'Title' },
  { key: 'length', label: 'Length' },
]

const colorSwatches = [
  { name: 'Sun', value: 'bg-[var(--sun)]' },
  { name: 'Sky', value: 'bg-[var(--sky)]' },
  { name: 'Mint', value: 'bg-[var(--mint)]' },
  { name: 'Peach', value: 'bg-[var(--peach)]' },
  { name: 'Lilac', value: 'bg-[var(--lilac)]' },
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
    <main className="relative min-h-screen overflow-x-hidden">
      <BackgroundOrbs />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
        <TopBar
          onNew={focusComposer}
          query={queryValue}
          onQueryChange={handleQueryChange}
        />
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <NotesBoard
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
          />
          <AsidePanel
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
            selectedTags={selectedTags}
            tagCounts={tagCounts}
            onToggleTag={handleToggleTag}
            onClearTags={clearTags}
          />
        </div>
      </div>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </main>
  )
}

function BackgroundOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="float-slow absolute -left-20 top-24 h-56 w-56 rounded-full bg-[var(--sun)]/40 blur-[90px]" />
      <div className="float-slower absolute right-10 top-10 h-72 w-72 rounded-full bg-[var(--lilac)]/40 blur-[110px]" />
      <div className="float-slow absolute bottom-12 left-1/3 h-64 w-64 rounded-full bg-[var(--mint)]/35 blur-[100px]" />
    </div>
  )
}

function TopBar({
  onNew,
  query,
  onQueryChange,
}: {
  onNew: () => void
  query: string
  onQueryChange: (value: string) => void
}) {
  return (
    <Card className="reveal reveal-1 flex flex-col gap-4 border-0 bg-white/80 p-6 shadow-[0_25px_60px_rgba(16,20,40,0.08)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-[20px] bg-[var(--sun)] text-[var(--ink)] shadow-[0_10px_20px_rgba(255,181,89,0.35)]">
          <Sparkles className="size-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Blessed Notes</h1>
            <Badge className="rounded-full bg-[var(--lilac)] text-[var(--ink)]">Beta</Badge>
          </div>
          <p className="text-sm text-foreground/60">
            A soft place to catch ideas, tasks, and tiny wins.
          </p>
        </div>
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" />
          <Input
            placeholder="Search notes"
            className="pl-9"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
        <Button
          className="h-11 rounded-3xl px-5 shadow-[0_10px_20px_rgba(255,181,89,0.35)]"
          onClick={onNew}
          type="button"
        >
          <Plus className="size-4" />
          New note
        </Button>
      </div>
    </Card>
  )
}

function NotesBoard({
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
}) {
  const noteCount = notes.length
  const [tabValue, setTabValue] = useState('all')

  return (
    <Card className="reveal reveal-2 flex h-full flex-col gap-6 border-0 bg-white/70 p-6 shadow-[0_30px_70px_rgba(18,20,40,0.1)] backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-[18px] bg-[var(--sky)] text-[var(--ink)]">
            <FileText className="size-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Notes</h2>
            <p className="text-sm text-foreground/55">Pinned in the moment.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-full bg-[var(--mint)] text-[var(--ink)]">
            {noteCount}/{totalCount} shown
          </Badge>
          <Badge className="rounded-full bg-[var(--peach)] text-[var(--ink)]">
            {syncingCount} syncing
          </Badge>
          {hasFilters && (
            <Badge className="rounded-full bg-[var(--muted)] text-foreground/70">
              Filtered
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/40">
          Sort by
        </div>
        <ToggleGroup
          type="single"
          spacing={0}
          value={sortValue}
          onValueChange={onSortChange}
        >
          {sortOptions.map((option) => (
            <ToggleGroupItem key={option.key} value={option.key}>
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <Tabs
        value={tabValue}
        onValueChange={setTabValue}
        className="flex flex-1 flex-col gap-4"
      >
        <TabsList className="bg-[var(--muted)]">
          <TabsTrigger value="all">All notes</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="archive">Archive</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="flex-1">
          <NotesGrid
            notes={notes}
            onEdit={onEdit}
            onDelete={onDelete}
            onNew={onNew}
            hasFilters={hasFilters}
            onClearFilters={onClearFilters}
          />
          <Separator className="my-6" />
          <SectionHeader title="Drafts" count="0" />
          <EmptyState
            title="No drafts yet"
            body="Draft a note and keep it close for later edits."
            action="Start a draft"
            onAction={onNew}
          />
        </TabsContent>
        <TabsContent value="drafts" className="flex-1">
          <EmptyState
            title="Drafts stay light"
            body="Capture ideas without pressure. Save when ready."
            action="Create draft"
            onAction={onNew}
          />
        </TabsContent>
        <TabsContent value="archive" className="flex-1">
          <EmptyState
            title="Archive is empty"
            body="When you archive a note it will show up here."
            action="View all notes"
            onAction={() => setTabValue('all')}
          />
        </TabsContent>
      </Tabs>
    </Card>
  )
}

function SectionHeader({ title, count }: { title: string; count: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-base font-semibold">{title}</h3>
      <Badge className="rounded-full bg-[var(--muted)] text-foreground/60">
        {count}
      </Badge>
    </div>
  )
}

function NotesGrid({
  notes,
  onEdit,
  onDelete,
  onNew,
  hasFilters,
  onClearFilters,
}: {
  notes: NoteListItem[]
  onEdit: (note: NoteListItem) => void
  onDelete: (noteTitle: string) => void
  onNew: () => void
  hasFilters: boolean
  onClearFilters: () => void
}) {
  if (notes.length === 0) {
    return (
      <EmptyState
        title={hasFilters ? 'No matching notes' : 'No notes yet'}
        body={
          hasFilters
            ? 'Try a softer search or clear the filters.'
            : 'Start with a tiny thought, it will grow.'
        }
        action={hasFilters ? 'Clear filters' : 'Add first note'}
        onAction={hasFilters ? onClearFilters : onNew}
      />
    )
  }

  return (
    <ScrollArea className="max-h-[420px] pr-2">
      <div className="grid gap-4 sm:grid-cols-2">
        {notes.map((note, index) => (
          <NoteCard
            key={note.title}
            note={note}
            tint={noteTints[index % noteTints.length]}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </ScrollArea>
  )
}

function NoteCard({
  note,
  tint,
  onEdit,
  onDelete,
}: {
  note: NoteListItem
  tint: string
  onEdit: (note: NoteListItem) => void
  onDelete: (noteTitle: string) => void
}) {
  const tagLabel = getPrimaryTagLabel(note)

  return (
    <Card
      className={cn(
        'flex h-full flex-col gap-3 border-0 p-4 shadow-[0_18px_40px_rgba(16,20,40,0.08)]',
        tint
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold">{note.title}</p>
          <p className="text-xs text-foreground/70">{note.body}</p>
        </div>
        <Badge className="rounded-full bg-white/70 text-xs text-foreground/70">
          {tagLabel}
        </Badge>
      </div>
      <div className="mt-auto flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Badge className="rounded-full bg-white/70 text-foreground/80">
            Just now
          </Badge>
          {note.status === 'saving' && (
            <Badge className="rounded-full bg-white/80 text-foreground/70">
              <Loader2 className="size-3 animate-spin" />
              Syncing
            </Badge>
          )}
          {note.status === 'error' && (
            <Badge className="rounded-full bg-white/80 text-foreground/70">
              <AlertTriangle className="size-3" />
              Error
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-foreground/70">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onEdit(note)}
            aria-label={`Edit ${note.title}`}
          >
            <Pencil className="size-3" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => onDelete(note.title)}
            aria-label={`Delete ${note.title}`}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>
    </Card>
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
    <div className="grid place-items-center rounded-[24px] border border-dashed border-[var(--border)] bg-white/70 px-6 py-16 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-[var(--muted)]">
        <Sparkles className="size-6 text-foreground/60" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-foreground/60">{body}</p>
      <Button
        variant="outline"
        className="mt-5 rounded-3xl"
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

function AsidePanel({
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
  selectedTags,
  tagCounts,
  onToggleTag,
  onClearTags,
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
  selectedTags: string[]
  tagCounts: Record<string, number>
  onToggleTag: (tagKey: string) => void
  onClearTags: () => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <ScheduleCard />
      <CategoriesCard
        selectedTags={selectedTags}
        tagCounts={tagCounts}
        onToggleTag={onToggleTag}
        onClearTags={onClearTags}
      />
      <NoteComposerCard
        draft={draft}
        setDraft={setDraft}
        editingTitle={editingTitle}
        canSave={canSave}
        hasChanges={hasChanges}
        hasDuplicateTitle={hasDuplicateTitle}
        onSave={onSave}
        onCancel={onCancel}
        statusMessage={statusMessage}
        titleInputRef={titleInputRef}
        showInlineValidation={showInlineValidation}
        validationMessage={validationMessage}
      />
    </div>
  )
}

function ScheduleCard() {
  return (
    <Card className="reveal reveal-2 border-0 bg-white/75 p-5 shadow-[0_20px_50px_rgba(18,20,40,0.08)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-[16px] bg-[var(--lilac)] text-[var(--ink)]">
            <Calendar className="size-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Reminder schedule</h3>
            <p className="text-xs text-foreground/55">Pick a focus window.</p>
          </div>
        </div>
        <Badge className="rounded-full bg-[var(--muted)] text-foreground/60">
          3 slots
        </Badge>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <ToggleGroup type="single" defaultValue="today" spacing={0}>
          <ToggleGroupItem value="today">Today</ToggleGroupItem>
          <ToggleGroupItem value="tomorrow">Tomorrow</ToggleGroupItem>
          <ToggleGroupItem value="week">This week</ToggleGroupItem>
        </ToggleGroup>
        <div className="flex items-center justify-between rounded-3xl bg-[var(--muted)] px-4 py-3 text-sm">
          <span className="font-medium">Today, 4:30 PM</span>
          <div className="flex items-center gap-2 text-foreground/60">
            <Clock className="size-4" />
            15m
          </div>
        </div>
        <div className="rounded-[22px] border border-dashed border-[var(--border)] bg-white/70 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Palette className="size-4 text-foreground/60" />
            Colors
          </div>
          <div className="flex flex-wrap gap-2">
            {colorSwatches.map((swatch) => (
              <span
                key={swatch.name}
                className={cn(
                  'h-8 w-8 rounded-full border border-white/60 shadow-[0_10px_20px_rgba(18,20,40,0.15)]',
                  swatch.value
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

function CategoriesCard({
  selectedTags,
  tagCounts,
  onToggleTag,
  onClearTags,
}: {
  selectedTags: string[]
  tagCounts: Record<string, number>
  onToggleTag: (tagKey: string) => void
  onClearTags: () => void
}) {
  return (
    <Card className="reveal reveal-3 border-0 bg-white/75 p-5 shadow-[0_20px_45px_rgba(18,20,40,0.08)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-[16px] bg-[var(--mint)] text-[var(--ink)]">
            <Check className="size-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Categories</h3>
            <p className="text-xs text-foreground/55">Filter notes quickly.</p>
          </div>
        </div>
        <Badge className="rounded-full bg-[var(--muted)] text-foreground/60">
          {selectedTags.length > 0
            ? `${selectedTags.length} active`
            : `${tagOptions.length} tags`}
        </Badge>
      </div>
      <div className="mt-4 space-y-3">
        {tagOptions.map((category) => (
          <div
            key={category.label}
            className="flex items-center justify-between rounded-2xl bg-[var(--muted)] px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedTags.includes(category.key)}
                onCheckedChange={() => onToggleTag(category.key)}
              />
              <span className="text-sm font-medium">{category.label}</span>
            </div>
            <span className="text-xs text-foreground/60">
              {tagCounts[category.key] ?? 0}
            </span>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex-1 rounded-3xl" type="button">
            <Plus className="size-4" />
            Create new category
          </Button>
          {selectedTags.length > 0 && (
            <Button
              variant="ghost"
              className="flex-1 rounded-3xl"
              type="button"
              onClick={onClearTags}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

function NoteComposerCard({
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
  const modeLabel = editingTitle ? 'Editing' : 'New'

  return (
    <Card className="reveal reveal-4 border-0 bg-white/80 p-5 shadow-[0_20px_55px_rgba(18,20,40,0.08)]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">{modeLabel} note</h3>
          <p className="text-xs text-foreground/55">
            Keep it short and clear.
          </p>
        </div>
        <Badge className="rounded-full bg-[var(--sun)] text-[var(--ink)]">
          {editingTitle ? 'Editing' : 'Draft'}
        </Badge>
      </div>
      <form
        className="mt-4 space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          onSave()
        }}
      >
        <Input
          placeholder="Title"
          value={draft.title}
          ref={titleInputRef}
          onChange={(event) =>
            setDraft({ ...draft, title: event.target.value })
          }
        />
        <Textarea
          placeholder="What do you want to remember?"
          className="min-h-[110px]"
          value={draft.body}
          onChange={(event) =>
            setDraft({ ...draft, body: event.target.value })
          }
        />
        <p className="text-xs text-foreground/50">
          Tip: add #home, #work, #personal, or #meetings to tag notes.
        </p>
        {showInlineValidation && validationMessage && (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white/70 px-3 py-2 text-xs text-foreground/70">
            {validationMessage}
          </div>
        )}
        {statusMessage && (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white/70 px-3 py-2 text-xs text-foreground/70">
            {statusMessage}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge className="w-fit rounded-full bg-[var(--lilac)] text-[var(--ink)]">
            Today, 4:30
          </Badge>
          <div className="flex items-center gap-2">
            {editingTitle && (
              <Button
                type="button"
                variant="ghost"
                className="rounded-3xl"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="rounded-3xl"
              disabled={!canSave || !hasChanges || hasDuplicateTitle}
            >
              <Plus className="size-4" />
              {editingTitle ? 'Update note' : 'Save note'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
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
      'border-emerald-200/70 bg-emerald-50/80 text-emerald-950 shadow-[0_20px_40px_rgba(16,60,45,0.18)]',
    error:
      'border-rose-200/70 bg-rose-50/80 text-rose-950 shadow-[0_20px_40px_rgba(90,20,30,0.18)]',
    info:
      'border-[var(--border)] bg-white/90 text-foreground shadow-[0_20px_40px_rgba(16,20,40,0.15)]',
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
    <div className="pointer-events-none fixed inset-x-4 top-6 z-50 flex flex-col gap-3 sm:left-auto sm:right-8 sm:w-[320px]">
      {toasts.map((toast) => {
        const Icon = toneIcon(toast.tone)
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto rounded-3xl border px-4 py-3 backdrop-blur',
              toneStyles[toast.tone],
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid size-8 place-items-center rounded-2xl bg-white/70 text-foreground/80">
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
