'use strict';

const yargs = require ('yargs');
const {addNote, removeNote, listNotes, readNote} = require ('./notes');

yargs.command ({
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

yargs.command ({
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

yargs.command ({
  command: 'list',
  describe: 'list all notes',
  handler: listNotes,
});

yargs.command ({
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

yargs.parse ();
