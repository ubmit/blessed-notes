import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { loadNotes, saveNotes } from '@cli/notes-store'

export const Route = createFileRoute('/api/notes')({
  server: {
    handlers: {
      GET: () => {
        const notesResult = loadNotes()

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

        const notesResult = loadNotes()

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
    },
  },
})
