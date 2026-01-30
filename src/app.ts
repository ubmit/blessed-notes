'use strict';

import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {addNote, listNotes, readNote, removeNote} from './notes';

const cli = yargs(hideBin(process.argv));

cli.command({
  command: 'add',
  describe: 'add a new note',
  builder: {
    title: {
      describe: 'note title',
      demandOption: true,
      type: 'string',
    },
    description: {
      describe: 'note description',
      type: 'string',
    },
    body: {
      describe: 'note body',
      demandOption: true,
      type: 'string',
    },
  },
  handler: addNote,
});

cli.command({
  command: 'remove',
  describe: 'remove a note',
  builder: {
    title: {
      describe: 'note title',
      demandOption: true,
      type: 'string',
    },
  },
  handler: removeNote,
});

cli.command({
  command: 'list',
  describe: 'list all notes',
  handler: listNotes,
});

cli.command({
  command: 'read',
  describe: 'read a note',
  builder: {
    title: {
      describe: 'note title',
      demandOption: true,
      type: 'string',
    },
  },
  handler: readNote,
});

cli.parse();
