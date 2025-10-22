# System Patterns

This project follows a small, familiar frontend pattern:

- Single-page React application using Vite dev server and Rollup-based build.
- Component-driven UI with local state derived and memoized for rendering.
- Persistence via localStorage with periodic autosave.
- Game logic kept in UI layer for simplicity; refactor to a separate game engine when complexity grows.

Conventions

- Use zero-padded IDs for designs and tasks (e.g., `TASK001`, `DESIGN001`).
- Keep UI components small and pure where possible; side effects (timers, localStorage) should be contained in `useEffect` hooks.
- Use `memory/` as source-of-truth for requirements, designs, and tasks.
