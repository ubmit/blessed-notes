import fs from 'node:fs'
import path from 'node:path'
import { err, ok, type Result } from 'neverthrow'

export type Note = {
  title: string
  body: string
}

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
    return ok(fs.readFileSync(resolveNotesPath(), 'utf8'))
  } catch (error) {
    return err(error as Error)
  }
}

const parseNotes = (data: string): Result<Note[], Error> => {
  try {
    const parsed = JSON.parse(data) as unknown
    if (!Array.isArray(parsed)) {
      return err(new Error('notes data should be an array'))
    }
    return ok(parsed as Note[])
  } catch (error) {
    return err(error as Error)
  }
}

export const loadNotes = () => readNotesFile().andThen(parseNotes)

export const saveNotes = (notes: Note[]): Result<Note[], Error> => {
  try {
    const data = JSON.stringify(notes)
    fs.writeFileSync(resolveNotesPath(), data)
    return ok(notes)
  } catch (error) {
    return err(error as Error)
  }
}
