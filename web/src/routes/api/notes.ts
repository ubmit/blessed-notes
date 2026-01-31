import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { loadNotes, saveNotes } from '@cli/notes-store'

const loadNotesOrBootstrap = () => {
  const notesResult = loadNotes()

  if (notesResult.isOk()) {
    return notesResult
  }

  const bootstrapResult = saveNotes([])
  if (bootstrapResult.isOk()) {
    return bootstrapResult
  }

  return notesResult
}

export const Route = createFileRoute('/api/notes')({
  server: {
    handlers: {
      GET: () => {
        const notesResult = loadNotesOrBootstrap()

        if (notesResult.isErr()) {
          return json({ error: 'unable to load notes' }, { status: 500 })
        }

        return json(notesResult.value)
      },
      POST: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as
          | { title?: string; body?: string }
          | null

        if (!body?.title || !body?.body) {
          return json(
            { error: 'title and body are required' },
            { status: 400 },
          )
        }

        const notesResult = loadNotesOrBootstrap()

        if (notesResult.isErr()) {
          return json({ error: 'unable to load notes' }, { status: 500 })
        }

        const notes = notesResult.value
        const duplicateNote = notes.find((note) => note.title === body.title)

        if (duplicateNote) {
          return json({ error: 'note title taken' }, { status: 409 })
        }

        const saveResult = saveNotes([...notes, { title: body.title, body: body.body }])

        if (saveResult.isErr()) {
          return json({ error: 'unable to save notes' }, { status: 500 })
        }

        return json({ ok: true })
      },
      PUT: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as
          | { title?: string; body?: string; originalTitle?: string }
          | null

        if (!body?.title || !body?.body) {
          return json(
            { error: 'title and body are required' },
            { status: 400 },
          )
        }

        const notesResult = loadNotes()

        if (notesResult.isErr()) {
          return json({ error: 'unable to load notes' }, { status: 500 })
        }

        const notes = notesResult.value
        const targetTitle = body.originalTitle ?? body.title
        const targetIndex = notes.findIndex((note) => note.title === targetTitle)

        if (targetIndex < 0) {
          return json({ error: 'note not found' }, { status: 404 })
        }

        if (body.title !== targetTitle) {
          const duplicateNote = notes.find((note) => note.title === body.title)
          if (duplicateNote) {
            return json({ error: 'note title taken' }, { status: 409 })
          }
        }

        const updatedNotes = notes.map((note, index) =>
          index === targetIndex
            ? { title: body.title, body: body.body }
            : note,
        )
        const saveResult = saveNotes(updatedNotes)

        if (saveResult.isErr()) {
          return json({ error: 'unable to save notes' }, { status: 500 })
        }

        return json({ ok: true })
      },
      DELETE: async ({ request }) => {
        const body = (await request.json().catch(() => null)) as
          | { title?: string }
          | null

        if (!body?.title) {
          return json({ error: 'title is required' }, { status: 400 })
        }

        const notesResult = loadNotes()

        if (notesResult.isErr()) {
          return json({ error: 'unable to load notes' }, { status: 500 })
        }

        const notes = notesResult.value
        const remainingNotes = notes.filter((note) => note.title !== body.title)

        if (remainingNotes.length === notes.length) {
          return json({ error: 'note not found' }, { status: 404 })
        }

        const saveResult = saveNotes(remainingNotes)

        if (saveResult.isErr()) {
          return json({ error: 'unable to save notes' }, { status: 500 })
        }

        return json({ ok: true })
      },
    },
  },
})
