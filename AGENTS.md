# AGENTS

Project-specific guidance for this repo.

## Repo map

- `cli/` Node CLI (TypeScript, builds to `dist/`).
- `web/` TanStack Start app + Tailwind v4 + shadcn/ui (Base UI).
- `db/notes.json` data store.
- `docs/plan.md` phase status + next steps.

## Setup

```bash
pnpm install
pnpm db:create
pnpm build
```

## Common scripts

```bash
pnpm test
pnpm lint
pnpm format
pnpm check
pnpm -C web dev
pnpm -C web test
```

## Data format

- Notes file: `{ "version": 1, "notes": [{ "title": "...", "body": "..." }] }`.
- `pnpm db:create` writes `[]`; app auto-migrates to v1 on first load.
- Override path via `NOTES_DB_PATH` (resolved from cwd).

## Web app

- Routes live in `web/src/routes` (file-based). Main UI: `/`.
- API: `web/src/routes/api/notes.ts` (GET/POST/PUT/DELETE).
- Prefer shadcn/ui components in `web/src/components/ui`.
- Tailwind v4 only.

## CLI

- Entry: `cli/app.ts` (yargs). Build via `pnpm build`.
- Data access: `cli/notes-store.ts`.

## Conventions

- Keep changes small + intentional.
- Prefer clarity over abstraction.
- Avoid default exports in new TS/TSX.
