'use strict';

import {loadNotes, saveNotes, type Note} from './notes-store';
import {log} from './utils';

type NoteArgs = {
  title: string;
  body: string;
  description?: string;
};

type TitleArgs = {
  title: string;
};

const hasTitle = (title: string) => (note: Note) => note.title === title;

export const addNote = ({title, body}: NoteArgs) => {
  const notesResult = loadNotes();

  if (notesResult.isErr()) {
    log.warning('unable to load notes');
    return;
  }

  const notes = notesResult.value;
  const duplicateNote = notes.find(hasTitle(title));

  if (!duplicateNote) {
    const newNotes = [...notes, {title, body}];
    const saveResult = saveNotes(newNotes);

    if (saveResult.isOk()) {
      log.success('new note added!');
    } else {
      log.warning('unable to save note');
    }
  } else {
    log.warning('note title taken');
  }
};

export const removeNote = ({title}: TitleArgs) => {
  const notesResult = loadNotes();

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
    const saveResult = saveNotes(newNotes);

    if (saveResult.isOk()) {
      log.success('the note was successfully removed!');
    } else {
      log.warning('unable to save notes');
    }
  }
};

export const listNotes = () => {
  const notesResult = loadNotes();

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

export const readNote = ({title}: TitleArgs) => {
  const notesResult = loadNotes();

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
