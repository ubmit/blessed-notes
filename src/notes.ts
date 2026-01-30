'use strict';

import fs from 'fs';
import {resolve} from 'path';
import {err, ok, type Result} from 'neverthrow';
import {log} from './utils';

type Note = {
  title: string;
  body: string;
};

type NoteArgs = {
  title: string;
  body: string;
  description?: string;
};

type TitleArgs = {
  title: string;
};

const stringify = (value: unknown) => JSON.stringify(value);

const readFile = (path: string): Result<string, Error> => {
  try {
    return ok(fs.readFileSync(resolve(__dirname, path), 'utf8'));
  } catch (error) {
    return err(error as Error);
  }
};

const writeFile = (path: string, data: string): Result<string, Error> => {
  try {
    fs.writeFileSync(resolve(__dirname, path), data);
    return ok(data);
  } catch (error) {
    return err(error as Error);
  }
};

const parseNotes = (data: string): Result<Note[], Error> => {
  try {
    const parsed = JSON.parse(data) as unknown;
    if (!Array.isArray(parsed)) {
      return err(new Error('notes data should be an array'));
    }
    return ok(parsed as Note[]);
  } catch (error) {
    return err(error as Error);
  }
};

const saveJSON = (path: string) => (notes: Note[]) => writeFile(path, stringify(notes));

const loadJSON = (path: string) => readFile(path).andThen(parseNotes);

const hasTitle = (title: string) => (note: Note) => note.title === title;

const addNote = ({title, body}: NoteArgs) => {
  const notesResult = loadJSON('../db/notes.json');

  if (notesResult.isErr()) {
    log.warning('unable to load notes');
    return;
  }

  const notes = notesResult.value;
  const duplicateNote = notes.find(hasTitle(title));

  if (!duplicateNote) {
    const newNotes = [...notes, {title, body}];
    const saveResult = saveJSON('../db/notes.json')(newNotes);

    if (saveResult.isOk()) {
      log.success('new note added!');
    } else {
      log.warning('unable to save note');
    }
  } else {
    log.warning('note title taken');
  }
};

const removeNote = ({title}: TitleArgs) => {
  const notesResult = loadJSON('../db/notes.json');

  if (notesResult.isErr()) {
    log.warning('unable to load notes');
    return;
  }

  const notes = notesResult.value;
  const newNotes = notes.filter(note => note.title !== title);

  if (notes.length === newNotes.length) {
    log.warning('note not found');
  } else {
    log.warning(`the following note will be removed: ${title}`);
    const saveResult = saveJSON('../db/notes.json')(newNotes);

    if (saveResult.isOk()) {
      log.success('the note was successfully removed!');
    } else {
      log.warning('unable to save notes');
    }
  }
};

const listNotes = () => {
  const notesResult = loadJSON('../db/notes.json');

  if (notesResult.isErr()) {
    log.warning('unable to load notes');
    return;
  }

  const notes = notesResult.value;

  if (notes.length === 0) {
    log.warning('no notes were found :cry:');
  } else {
    log.success('your notes:');
    notes.forEach(note => log.plain(note.title));
  }
};

const readNote = ({title}: TitleArgs) => {
  const notesResult = loadJSON('../db/notes.json');

  if (notesResult.isErr()) {
    log.warning('unable to load notes');
    return;
  }

  const note = notesResult.value.find(hasTitle(title));

  if (!note) {
    log.warning('no note was found :cry:');
  } else {
    log.strong(title);
    log.plain(note.body);
  }
};

export {addNote, listNotes, readNote, removeNote};
