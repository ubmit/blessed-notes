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

Convert `src/*.js` to `.ts`, add build tooling, and update CLI run scripts.

## Phase 5 — Move to pnpm
**Status:** 🟡 In progress

Switch repo tooling from Yarn to pnpm and update scripts/docs accordingly.

**Next steps:**
- Generate `pnpm-lock.yaml` once registry access is available.

## Phase 6 — Data/API layer integration
**Status:** ⏳ Not started

Expose notes data via API routes for the web app and share data access logic.

## Phase 7 — Polish UX and responsiveness
**Status:** ⏳ Not started

Finalize spacing, typography, and responsive behavior to match the reference UI.
