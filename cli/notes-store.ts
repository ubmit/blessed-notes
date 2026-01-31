import fs from 'node:fs'
import path from 'node:path'
import { err, ok, type Result } from 'neverthrow'

export type Note = {
  title: string
  body: string
}

type NotesDataV1 = {
  version: 1
  notes: Note[]
}

type NotesData = NotesDataV1

type ParsedNotes = {
  data: NotesData
  migrated: boolean
}

const currentVersion = 1
const defaultNotesPath = path.join('db', 'notes.json')

const resolveNotesPath = () => {
  const envPath = process.env.NOTES_DB_PATH?.trim()
  if (envPath) {
    return path.resolve(process.cwd(), envPath)
  }

  const cwdPath = path.resolve(process.cwd(), defaultNotesPath)
  if (fs.existsSync(cwdPath)) {
    return cwdPath
  }

  const parentPath = path.resolve(process.cwd(), '..', defaultNotesPath)
  if (fs.existsSync(parentPath)) {
    return parentPath
  }

  return cwdPath
}

const readNotesFile = (): Result<string, Error> => {
  try {
    const notesPath = resolveNotesPath()
    return ok(fs.readFileSync(notesPath, 'utf8'))
  } catch (error) {
    const typedError = error as NodeJS.ErrnoException
    if (typedError.code === 'ENOENT') {
      return ok('[]')
    }
    return err(typedError)
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isNote = (value: unknown): value is Note => {
  if (!isRecord(value)) {
    return false
  }
  return typeof value.title === 'string' && typeof value.body === 'string'
}

const parseNotesArray = (value: unknown): Result<Note[], Error> => {
  if (!Array.isArray(value)) {
    return err(new Error('notes data should be an array'))
  }
  if (!value.every(isNote)) {
    return err(new Error('notes data contains invalid entries'))
  }
  return ok(value)
}

const parseNotesData = (value: unknown): Result<ParsedNotes, Error> => {
  if (Array.isArray(value)) {
    const notesResult = parseNotesArray(value)
    return notesResult.map((notes) => ({
      data: { version: 1, notes },
      migrated: true,
    }))
  }

  if (!isRecord(value)) {
    return err(new Error('notes data should be an object'))
  }

  if (value.version !== currentVersion) {
    return err(new Error('unsupported notes data version'))
  }

  const notesResult = parseNotesArray(value.notes)
  return notesResult.map((notes) => ({
    data: { version: 1, notes },
    migrated: false,
  }))
}

const parseNotes = (data: string): Result<ParsedNotes, Error> => {
  try {
    const parsed = JSON.parse(data) as unknown
    return parseNotesData(parsed)
  } catch (error) {
    return err(error as Error)
  }
}

const ensureNotesDir = () => {
  const notesPath = resolveNotesPath()
  fs.mkdirSync(path.dirname(notesPath), { recursive: true })
  return notesPath
}

const writeNotesData = (data: NotesData): Result<NotesData, Error> => {
  try {
    const notesPath = ensureNotesDir()
    fs.writeFileSync(notesPath, JSON.stringify(data, null, 2))
    return ok(data)
  } catch (error) {
    return err(error as Error)
  }
}

export const loadNotes = () =>
  readNotesFile()
    .andThen(parseNotes)
    .andThen(({ data, migrated }) => {
      if (migrated) {
        const writeResult = writeNotesData(data)
        if (writeResult.isErr()) {
          return err(writeResult.error)
        }
      }

      return ok(data.notes)
    })

export const saveNotes = (notes: Note[]): Result<Note[], Error> =>
  writeNotesData({ version: currentVersion, notes }).map((data) => data.notes)
