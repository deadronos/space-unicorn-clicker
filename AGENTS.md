# AGENTS — Memory Bank & Spec-Driven Workflow Guide

This document tells autonomous agents how to work inside this repository using the project Memory Bank and the Spec-Driven Workflow (v1). Follow these rules and conventions to preserve continuity, make reviews easy, and keep design & task artifacts discoverable.

## Quick principles

- Always read the Memory Bank before making changes. The canonical memory lives in the `/memory` folder.
- Record decisions, progress, and tasks in `/memory` consistently — this repository relies on the Memory Bank for continuity between runs.
- Prefer small, testable commits and update memory artifacts as you go.
- Keep file names, IDs and indexes consistent and machine-friendly.

## Folder layout (required)

- `/memory`
  - `projectbrief.md` (core project brief)
  - `productContext.md`
  - `activeContext.md`
  - `systemPatterns.md`
  - `techContext.md`
  - `progress.md`
  - `requirements.md` (optional but recommended)
  - `/memory/designs/` — design docs and `_index.md`
  - `/memory/tasks/` — task plan files and `_index.md`

Notes:
- Keep high-level artifacts at the top of `/memory` and change logs in `progress.md`.
- When in doubt, add a short entry to `progress.md` describing why you changed files.

## Designs (`/memory/designs`)

- Each design should be a single Markdown file: `DESIGNNN-short-name.md`.
- Create or update `memory/designs/_index.md` whenever a design is added, updated, or archived.
- A design file should include:
  - Title, ID, Status (Draft/Approved/Archived)
  - Short diagram or ASCII/mermaid flow
  - Interfaces & contracts (APIs, events, data models)
  - Acceptance criteria
  - Risks & trade-offs
  - Author and date

- Archival: move completed designs to `memory/designs/COMPLETED/` (or mark Status: Archived in file) and update `_index.md`.

## Tasks (`/memory/tasks`)

- Task files are Markdown and follow: `TASKNNN-short-name.md`.
- Always check both `memory/tasks/` and `memory/tasks/COMPLETED/` for ID collisions before creating a new task ID.
- Update `memory/tasks/_index.md` to reflect status changes (Pending, In Progress, Completed, Blocked).
- Task template (required sections):
  - Metadata: ID, Title, Status, Added, Updated
  - Original Request
  - Thought Process / Design reference (link to `/memory/designs/DESIGNNN-*.md`)
  - Implementation Plan (step-by-step)
  - Progress Log (dated entries)
  - Acceptance Criteria & Tests

## Requirements & EARS format

- Write requirements in `memory/requirements.md` using EARS style — example:

  WHEN a player clicks the unicorn, THE SYSTEM SHALL increment the score by 1. [Acceptance: unit test that simulates click increments count]

- Each requirement must include an acceptance test (unit/integration) and a confident success criterion.

## Work process (agent lifecycle)

1. Start-up: open and read `memory/activeContext.md`, `memory/progress.md`, `memory/tasks/_index.md`, `memory/designs/_index.md`, and `memory/requirements.md`.
2. Plan: create or update a task file in `memory/tasks/` and add an entry to `_index.md` before implementing. Use small, focused tasks.
3. Implement: make small commits, include tests where applicable, and reference the task & design files in commit message (e.g. `TASK012: implement click handler — refs memory/tasks/TASK012-click-handler.md`).
4. Validate: run tests, update the task's Progress Log with results, add coverage or output to `memory/progress.md` when useful.
5. Reflect: update design if the implementation changed assumptions; add a short entry to `progress.md`.
6. Handoff: mark the task Completed in `memory/tasks/_index.md` and move task file to `COMPLETED/` if the project conventions require it.

## Index management rules

- `_index.md` files must be kept current. When adding an item:
  - Add a one-line summary entry containing ID, title, status, and date.
  - Keep entries grouped by status (In Progress, Pending, Completed, Abandoned).
- When marking Completed, update both the task/design file and `_index.md` entry.

## IDs and uniqueness

- Use numeric zero-padded IDs (e.g. `TASK001`, `DESIGN001`) to make sorting and searching reliable.
- ALWAYS check both the active and the `COMPLETED` directories before choosing a new ID.

## Commit & PR guidance

- Commits should be small and reference the task ID in the message body.
- Include a short PR summary referencing the affected `memory` files and tests. Use the spec-driven PR template: Goal, Key changes, Validation.
- Attach decision records to `/memory` when you make non-trivial trade-offs.

## Templates & Examples

- Minimal Task header:

  ---
  # TASK012 - Add click counter
  **Status:** In Progress  
  **Added:** 2025-10-22  
  **Updated:** 2025-10-22
  ---

- Minimal Design header:

  ---
  # DESIGN001 - Click Scoring System
  **Status:** Draft  
  **Author:** Name — 2025-10-22
  ---

## Validation & tests

- Tests must be runnable using existing project test setup. If the repo doesn't have a test framework, propose one in `memory/tasks/TASKnnn-setup-tests.md` and add it as a task.
- Record test commands and outcomes in the task's Progress Log and `memory/progress.md`.

## Failure modes & recovery

- If a task is blocked, mark it Blocked in `memory/tasks/_index.md` and add a short blocking note in the task file.
- If the Memory Bank becomes inconsistent (missing `_index.md`, duplicate IDs), stop, document the inconsistency in `memory/progress.md`, and open a high-priority task to repair the bank.

## Agent responsibilities checklist (brief)

- [ ] Read `memory` on start
- [ ] Create/update `memory/tasks/TASK*.md` for any implemented work
- [ ] Update `memory/designs/_index.md` and `memory/tasks/_index.md` when adding or changing files
- [ ] Write acceptance criteria and link tests
- [ ] Keep commits small and reference task IDs
- [ ] Add progress log entries and update `progress.md`

---

If you want, I can also generate starter `_index.md` templates for `/memory/designs` and `/memory/tasks`, or create the `/memory` folder structure and a few example files. Which would you like next?