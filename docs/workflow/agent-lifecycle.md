# Agent Lifecycle

Follow this lifecycle for every task to ensure continuity and quality.

## 1. Start-up

- Read `memory/activeContext.md` and `memory/progress.md`.
- Review `memory/tasks/_index.md` and `memory/designs/_index.md`.
- (Optional) Review `memory/requirements.md` if it exists.

## 2. Plan

- Create or update a task file in `memory/tasks/`.
- Add an entry to `memory/tasks/_index.md`.
- For complex changes, create a design doc in `memory/designs/`.

## 3. Implement

- Make small, focused commits.
- Reference task and design IDs in commit messages (e.g., `TASK012: implement click handler`).
- Include tests where applicable.

## 4. Validate

- Run the relevant test suites.
- Update the task's Progress Log with results.
- Record significant outcomes in `memory/progress.md`.

## 5. Reflect

- Update design docs if implementation diverged from the plan.
- Add a summary entry to `memory/progress.md`.

## 6. Handoff

- Mark the task as `Completed` in `memory/tasks/_index.md`.
- (Optional) Move task/design files to `COMPLETED/` subdirectories.
