# blessed-notes web

TanStack Start + Tailwind v4 + shadcn/ui (Base UI).

## Run

```bash
pnpm install
pnpm dev
```

Dev server: `http://localhost:3000`.

## Build

```bash
pnpm build
pnpm preview
```

## Tests

```bash
pnpm test
```

## Data / API

- CRUD at `/api/notes` (GET/POST/PUT/DELETE).
- Backed by shared notes store in `../db/notes.json`.
- `NOTES_DB_PATH` overrides file path (resolved from cwd).
- Plain `[]` auto-migrates to v1 on first load.

## Routes

- `/` main UI.
- `/demo/*` scaffold demos; safe to delete if not needed.
