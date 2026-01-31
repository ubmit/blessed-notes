# Project Plan: Blessed Notes GUI + Tooling

## Status Legend
- ✅ Done
- 🟡 In progress
- ⏳ Not started

## Phase 1 — Replace Sanctuary with neverthrow (CLI core)
**Status:** ✅ Done

Replace Sanctuary helpers with `neverthrow` in the CLI data layer and keep behavior consistent.

## Phase 1.5 — Replace ESLint/Prettier with Biome
**Status:** ✅ Done

Add Biome config and scripts; remove ESLint configuration files.

## Phase 2 — Bootstrap TanStack Start web app
**Status:** ✅ Done

Create `web/` with TanStack Start + Tailwind v4 scaffolding and base routing.

## Phase 3 — Build the UI with shadcn/ui
**Status:** ✅ Done

Implement the dashboard layout and core UI components aligned to the reference design.

## Phase 4 — Convert CLI code to TypeScript
**Status:** ✅ Done

Convert `cli/*.js` to `.ts`, add build tooling, and update CLI run scripts.

## Phase 5 — Move to pnpm
**Status:** ✅ Done

Switch repo tooling from Yarn to pnpm and update scripts/docs accordingly.

**Notes:**
- Root `pnpm-lock.yaml` checked in.

## Phase 6 — Data/API layer integration
**Status:** ✅ Done

Expose notes data via API routes for the web app and share data access logic.

## Phase 7 — Polish UX and responsiveness
**Status:** ✅ Done

Finalize spacing, typography, and responsive behavior to match the reference UI.

## Phase 8 — Notes CRUD UI + client state
**Status:** ✅ Done

Add create/edit/delete flows, empty states, and optimistic updates.

## Phase 9 — Validation + error handling
**Status:** ✅ Done

Unify form validation, API error display, and user feedback (toasts).

## Phase 10 — Search, filters, and sorting
**Status:** ✅ Done

Add fast search, tag filters, and sort options with URL state.

## Phase 11 — Persistence + data migration
**Status:** ✅ Done

Harden storage, add migrations, and validate legacy data.

## Phase 12 — Tests + CI
**Status:** ✅ Done

Add CLI + web tests and automate via CI.

## Phase 13 — Release + docs
**Status:** ✅ Done

Versioning, changelog, and user docs updates.
