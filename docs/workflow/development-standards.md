# Development Standards

## Commits & Pull Requests

- **Small Commits**: Prefer atomic commits that do one thing.
- **ID References**: Always include the Task ID (e.g., `TASK001`) in the commit message or body.
- **PR Template**: Goal, Key Changes, Validation. Reference affected memory files.

## Validation & Testing

- Use the project's existing framework (Vitest).
- If no framework exists, the first task should be to propose and set one up.
- Record test commands and outcomes in the task's Progress Log.

## Failure Modes & Recovery

- **Blocked Tasks**: Mark as `Blocked` in the index and add a note in the task file explaining why.
- **Inconsistent Memory Bank**: If IDs collide or indexes are missing, stop work. Document the issue in `memory/progress.md` and create a high-priority repair task.
