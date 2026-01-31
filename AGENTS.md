# AGENTS

<INSTRUCTIONS>
- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.

## NPM packages

- Primary method for interacting with NPM packages: `pnpm`.

## GitHub

- Primary method for interacting with GitHub: GitHub CLI (`gh`).

## Git

- When creating commits, use Conventional Commits.
- When creating branches, prefix with "gui/".
- Prefer smaller, intentional commits.

## TypeScript

- Only create an abstraction if needed.
- Prefer clear function/variable names over inline comments.
- Avoid helper functions when a simple inline expression would suffice.
- Don't unnecessarily add `try`/`catch`.
- Don't cast to `any`.
- Don't use default exports.
- Prefer inline `export` (`export function Foo() {}`).
- Use kebab-case for `.ts` files.

## Frontend Engineering

- Use `/frontend-design`.
- Use React if a frontend framework is required.
- Use TanStack Start as default React meta-framework.
- Use Astro for websites that benefit from SSG.

## React

- Avoid massive `jsx` blocks; compose smaller components.
- Colocate code that changes together.
- Avoid `useEffect` unless absolutely needed.
- Use kebab-case for component files (`.jsx`/`.tsx`).

## Tailwind CSS

- Use built-in values, occasionally allow dynamic values, rarely globals.
- Always use v4.

## UI Libraries

- Prefer project's own UI library/design system over external ones.
- Use `shadcn/ui` with Base UI.

## Browser Automation

Use `agent-browser` for web automation. Run `agent-browser --help` for commands.

Core workflow:

1. `agent-browser open <url>`
2. `agent-browser snapshot -i`
3. `agent-browser click @e1` / `fill @e2 "text"`
4. Re-snapshot after page changes

## Plans

- At end of each plan, list unresolved questions. Keep them extremely concise.

--- project-doc ---

# Agent Guidance

- Follow project plan in `docs/plan.md` for phase status and next steps.
- Prefer updating `web/` UI using shadcn/ui-style components.

## Skills

A skill is a set of local instructions stored in a `SKILL.md` file.

### Available skills

- agent-browser: Automates browser interactions for web testing, form filling, screenshots, and data extraction. Use when user needs to navigate websites, interact with web pages, fill forms, take screenshots, test web applications, or extract info from web pages. (file: /Users/gui/.agents/skills/agent-browser/SKILL.md)
- frontend-design: Create distinctive, production-grade frontend interfaces with high design quality. Use when user asks to build web components/pages/artifacts/posters/apps or to style UI. Avoid generic AI aesthetics. (file: /Users/gui/.agents/skills/frontend-design/SKILL.md)
- humanizer: Remove signs of AI writing. Use when editing/reviewing text to sound more human. Based on Wikipedia "Signs of AI writing" guide. (file: /Users/gui/.agents/skills/humanizer/SKILL.md)
- using-git-worktrees: Use when starting feature work that needs isolation or before executing implementation plans. (file: /Users/gui/.agents/skills/using-git-worktrees/SKILL.md)
- vercel-react-best-practices: React/Next.js perf guidelines. Use when writing/reviewing/refactoring React/Next.js. (file: /Users/gui/.agents/skills/vercel-react-best-practices/SKILL.md)
- web-design-guidelines: Review UI code for Web Interface Guidelines compliance. Use when asked to review UI/accessibility/UX. (file: /Users/gui/.agents/skills/web-design-guidelines/SKILL.md)
- skill-creator: Guide for creating skills. Use when users want to create/update a skill. (file: /Users/gui/.codex/skills/.system/skill-creator/SKILL.md)
- skill-installer: Install Codex skills from curated list or repo. Use when user asks to list/install skills. (file: /Users/gui/.codex/skills/.system/skill-installer/SKILL.md)

### How to use skills

- If user names a skill or task matches description, use it for that turn.
- If multiple skills apply, use minimal set; state order.
- Open skill `SKILL.md` and read only enough to follow workflow.
- Use referenced assets/scripts/templates when possible.
- Keep context small; avoid bulk-load.
- If skill missing/blocked, say so, then continue with best fallback.
</INSTRUCTIONS>
