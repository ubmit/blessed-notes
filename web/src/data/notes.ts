import { createServerFn } from '@tanstack/react-start'

import { loadNotes } from '@cli/notes-store'

export const getNotes = createServerFn({
  method: 'GET',
}).handler(async () => {
  const notesResult = loadNotes()
  if (notesResult.isErr()) {
    return []
  }
  return notesResult.value
})
