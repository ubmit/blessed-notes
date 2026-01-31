# blessed-notes

CLI + web notes app (Node.js, neverthrow, TanStack Start, Tailwind v4).

## Setup

```bash
pnpm install
pnpm db:create
pnpm build
```

## CLI

Commands: `add`, `remove`, `list`, `read`.

```bash
node dist/app.js add --title="note title" --body="note body"
node dist/app.js remove --title="note title"
node dist/app.js list
node dist/app.js read --title="note title"
```

## Web app

```bash
pnpm -C web install
pnpm -C web dev
```

Open `http://localhost:3000`.

## Data

- Default path: `db/notes.json`
- Format: `{ "version": 1, "notes": [{ "title": "...", "body": "..." }] }`
- `pnpm db:create` writes `[]`; app auto-migrates to v1 on first load.
- Override path: `NOTES_DB_PATH` (resolved from cwd).

## Tests

```bash
pnpm test
pnpm -C web test
```
