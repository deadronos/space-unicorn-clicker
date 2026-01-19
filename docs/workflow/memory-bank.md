# Memory Bank Management

The Memory Bank is the canonical source of truth for the project's state. It lives in the `/memory` folder.

## Folder Structure

- `/memory`
  - `projectbrief.md`: Core project brief and goals.
  - `productContext.md`: Product context and user stories.
  - `activeContext.md`: Current focus and active work.
  - `systemPatterns.md`: Architectural patterns and tech stack decisions.
  - `techContext.md`: Technical context and dependencies.
  - `progress.md`: Change logs and high-level progress.
  - `requirements.md`: (Optional) System requirements in EARS format.
  - `/memory/designs/`: Design documents and `_index.md`.
  - `/memory/tasks/`: Task plan files and `_index.md`.

## Index Management

`_index.md` files in `designs/` and `tasks/` must be kept current.

- Add a one-line summary: ID, title, status, and date.
- Group entries by status (In Progress, Pending, Completed, Abandoned).
- Update both the artifact file and the `_index.md` entry when status changes.

## IDs & Uniqueness

- Use numeric zero-padded IDs (e.g., `TASK001`, `DESIGN001`).
- ALWAYS check both active and (optional) `COMPLETED` directories before choosing a new ID to avoid collisions.
