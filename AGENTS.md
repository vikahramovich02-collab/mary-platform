# Mary Repository Instructions

## Mandatory product context

Before changing code, UX, copy, navigation, mock data, backend behavior, or a
user flow:

1. Read `PLATFORM_CONTEXT.md`.
2. Read the relevant part of `MARY_END_TO_END_USER_FLOW.md`.
3. Read the applicable persona and journey in `PERSONAS_AND_JOURNEYS.md`.
4. Read the target section's `*_USER_FLOW.md`.
5. Inspect the current implementation and adjacent views that share the same
   entities.

Use `USER_FLOWS_INDEX.md` to find screen IDs and specifications. For Clients,
also read `CLIENTS_UX_SPEC.md`. Use `CODEX_TASK_BRIEF.md` as the per-screen task
template.

Do not implement a page as an isolated mock. For every change identify:

- the persona, journey stage, role, permissions, and first-entry state;
- the incoming route and carried entity IDs;
- the outgoing routes and return behavior;
- the source-of-truth entities that change;
- the context passed to Mary;
- direct safe actions versus changes that must happen through Mary;
- confirmation and impact-preview requirements;
- view state that must survive drawers, modals, navigation, and Back;
- effects on Inbox, Clients, Tasks, Calendar, Automations, Analytics, Knowledge,
  Integrations, Team, and Settings where applicable.

Preserve the documented cross-platform relationships. If a request conflicts
with them, explain the conflict before changing the model.

## Product direction

- Mary is the primary way a non-technical business owner configures and changes
  the system.
- Use plain business language. Do not expose workflow, API, schema, prompt, JSON,
  model, or rule-engine configuration in the default experience.
- The full Chat is for long discovery and solution-building. `Спросить Mary` is
  a contextual action available from every operational page.
- Operational pages are read-first and action-focused. Complex edits happen
  conversationally through Mary.
- Important, external, destructive, permission-changing, or mass actions require
  an impact preview and explicit confirmation.
- Keep clients, conversations, orders, tasks, calendar entries, automations,
  runs, sources, people, AI agents, and integrations as shared entities rather
  than page-local copies.
- A calendar deadline references the same task entity.
- A client, task, event, team member, metric, or run opens in a right-side
  context drawer instead of a separate profile page unless the specification
  explicitly says otherwise.
- Preserve search, filters, sorting, pagination, selection, and scroll position
  when drawers, modals, or Mary open.
- Distinguish people, Mary, and AI agents in both UI and audit history.

## Visual direction

- Continue the existing Mary visual system: light surfaces, charcoal type, thin
  dividers, restrained radii, compact outline icons, and minimal elevation.
- Use semantic tokens and existing components before introducing new values or
  patterns.
- Keep buttons and fields rounded, but avoid decorative card grids and excessive
  empty space.
- Avoid gradients, glassmorphism, neon, emoji icons, decorative dashboards, and
  color as the only status signal.
- Workflow canvases use the documented freeform graph: charcoal trigger nodes,
  blue Mary/AI steps, orange employee steps, neutral decision nodes, visible
  ports, thin connectors, and `Да`/`Нет` branch labels.

## Repository constraints

- This is a React 19 + Vite frontend with a Node + Express backend.
- Inspect `package.json`, `backend/package.json`, and `.github/workflows` before
  choosing checks.
- Reuse current source structure and components. Do not move or delete broad
  parts of the project, replace libraries, change routing, or redesign the
  architecture without explicit approval.
- The worktree may contain user changes. Never revert, overwrite, or include
  unrelated modifications.
- Do not expose secrets from `.env`, `.env.production`, or `backend/.env`.
- Do not run `deploy.sh` unless the user explicitly requests a deployment:
  it commits, pushes, uploads, restarts production, and sends notifications.
- Do not patch generated `dist/` output as the source of truth when source files
  exist.

## Required implementation workflow

1. Read the mandatory product documents.
2. Inspect the relevant code, shared components, data shape, and tests.
3. State the affected entities and neighboring flows.
4. Implement the smallest coherent cross-page change.
5. Cover default, loading, empty, no-results, error, offline, and no-access
   states where relevant.
6. Check mobile, tablet, desktop, keyboard focus, and reduced motion.
7. Run the relevant local tests from the repository, never production deploy.
8. Report changed behavior, verification, and remaining risks.
