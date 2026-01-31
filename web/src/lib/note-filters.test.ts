import { describe, expect, test } from 'vitest'

import {
  filterAndSortNotes,
  matchesTag,
  normalizeTags,
  type SortOption,
} from './note-filters'

const notes = [
  { title: 'Alpha', body: 'First idea #work' },
  { title: 'Beta', body: 'Home chores list' },
  { title: 'Gamma', body: 'Meeting prep and notes #meetings' },
]

describe('note-filters', () => {
  test('normalizeTags filters and dedupes', () => {
    const result = normalizeTags('Work, work, home, nope', ['work', 'home'])
    expect(result).toEqual(['work', 'home'])
  })

  test('matchesTag detects hashtags and words', () => {
    expect(matchesTag(notes[0], 'work')).toBe(true)
    expect(matchesTag(notes[1], 'home')).toBe(true)
    expect(matchesTag(notes[2], 'work')).toBe(false)
  })

  test('filterAndSortNotes handles query, tags, and sort', () => {
    const sorted = filterAndSortNotes({
      notes,
      query: 'notes',
      tags: ['meetings'],
      sort: 'title' satisfies SortOption,
    })
    expect(sorted.map((note) => note.title)).toEqual(['Gamma'])
  })
})
