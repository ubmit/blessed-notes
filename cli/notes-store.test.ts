'use strict';

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, beforeEach, expect, test} from 'vitest';

import {loadNotes, saveNotes} from './notes-store';

let tempDir = '';
let notesPath = '';

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'blessed-notes-'));
  notesPath = path.join(tempDir, 'notes.json');
  process.env.NOTES_DB_PATH = notesPath;
});

afterEach(() => {
  delete process.env.NOTES_DB_PATH;
  fs.rmSync(tempDir, {recursive: true, force: true});
});

test('loadNotes returns empty array and bootstraps versioned file', () => {
  const result = loadNotes();
  expect(result.isOk()).toBe(true);
  if (result.isErr()) {
    throw result.error;
  }

  expect(result.value).toEqual([]);
  const stored = JSON.parse(fs.readFileSync(notesPath, 'utf8'));
  expect(stored).toEqual({version: 1, notes: []});
});

test('saveNotes writes versioned data', () => {
  const result = saveNotes([{title: 'Alpha', body: 'First'}]);
  expect(result.isOk()).toBe(true);
  if (result.isErr()) {
    throw result.error;
  }

  const stored = JSON.parse(fs.readFileSync(notesPath, 'utf8'));
  expect(stored).toEqual({
    version: 1,
    notes: [{title: 'Alpha', body: 'First'}],
  });
});

test('loadNotes migrates legacy array format', () => {
  fs.writeFileSync(
    notesPath,
    JSON.stringify([{title: 'Legacy', body: 'Old format'}]),
  );

  const result = loadNotes();
  expect(result.isOk()).toBe(true);
  if (result.isErr()) {
    throw result.error;
  }

  expect(result.value).toEqual([{title: 'Legacy', body: 'Old format'}]);
  const stored = JSON.parse(fs.readFileSync(notesPath, 'utf8'));
  expect(stored).toEqual({
    version: 1,
    notes: [{title: 'Legacy', body: 'Old format'}],
  });
});
