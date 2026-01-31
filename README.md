# blessed-notes

CLI (blessed) notes app built using Node.js, Yargs, and neverthrow

## Motivation

The idea for this app came from Andrew Mead's Node.js course. However, I decided to practice FP while learning how to create a CLI app so I added neverthrow.

## Setup

First of all, clone this repository, install dependencies, and create your `db/notes.json` file:

```bash
pnpm install
pnpm db:create
```

Then build the CLI:

```bash
pnpm build
```

Nice, now you are good to go!

## Usage

There are 4 available commands: `add`, `remove`, `list` and `read`.

### add

This command allows you to add a note to `db/notes.json`:

```bash
node dist/app.js add --title="note title" --description="note description" --body="note body"
```

### remove

This command allows you to remove a note from `db/notes.json`:

```bash
node dist/app.js remove --title="note title"
```

### list

This command lists all notes available at `db/notes.json`:

```bash
node dist/app.js list
```

### read

This command allows you to read a note's body:

```bash
node dist/app.js read --title="note title"
```
