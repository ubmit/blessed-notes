# blessed-notes

CLI (blessed) notes app built using Node.js, Yargs and Sanctuary

## Motivation

The idea for this app came from Andrew Mead's Node.js course. However, I decided to practice FP while learning how to create a CLI app so I added Sanctuary.

## Setup

First of all, clone this repository, go to the root of it and create your `db/notes.json` file by running `yarn db:create`.
Nice, now you are good to go!

## Usage

There are 4 available commands: `add`, `remove`, `list` and `read`.

### add

This command allows you to add a note to `db/notes.json`:

```bash
node src/app.js add --title="note title" --description="note description" --body="note body"
```

### remove

This command allows you to remove a note from `db/notes.json`:

```bash
node src/app.js add --title="note title"
```

### list

This command lists all notes available at `db/notes.json`:

```bash
node src/app.js list
```

### read

This command allows you to read a note's body:

```bash
node src/app.js read --title="note title"
```
