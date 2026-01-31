import type { Note } from '@cli/notes-store'

export type SortOption = 'recent' | 'title' | 'length'

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const normalizeTags = (
  raw: string | undefined,
  validTags: string[],
) => {
  if (!raw) {
    return []
  }

  const valid = new Set(validTags.map((tag) => tag.toLowerCase()))
  const tags = raw
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0 && valid.has(tag))

  return Array.from(new Set(tags))
}

export const matchesTag = (note: Note, tagKey: string) => {
  const text = `${note.title} ${note.body}`.toLowerCase()
  const normalized = tagKey.toLowerCase()

  if (text.includes(`#${normalized}`)) {
    return true
  }

  const pattern = new RegExp(`\\b${escapeRegExp(normalized)}\\b`, 'i')
  return pattern.test(text)
}

export const filterAndSortNotes = ({
  notes,
  query,
  tags,
  sort,
}: {
  notes: Note[]
  query?: string
  tags?: string[]
  sort?: SortOption
}) => {
  const normalizedQuery = query?.trim().toLowerCase() ?? ''
  let next = notes

  if (normalizedQuery) {
    next = next.filter((note) => {
      const content = `${note.title} ${note.body}`.toLowerCase()
      return content.includes(normalizedQuery)
    })
  }

  if (tags && tags.length > 0) {
    next = next.filter((note) => tags.some((tag) => matchesTag(note, tag)))
  }

  const sorted = [...next]

  if (sort === 'title') {
    sorted.sort((a, b) => a.title.localeCompare(b.title))
  } else if (sort === 'length') {
    sorted.sort(
      (a, b) =>
        a.title.length + a.body.length - (b.title.length + b.body.length),
    )
  } else {
    sorted.reverse()
  }

  return sorted
}
