# TASK015: Upgrade Dependencies and Ensure Stability

## Status
- **Status:** In Progress
- **Started:** 2026-03-19
- **Owner:** Jules

## Objective
Upgrade all project dependencies to their latest versions to ensure the project uses the most recent features, security patches, and performance improvements. Verify that the system remains stable, all tests pass, and the application builds and runs correctly.

## Requirements
- [x] Identify outdated dependencies using `npm outdated`.
- [x] Upgrade dependencies to their latest versions.
- [x] Resolve any breaking changes or peer dependency conflicts.
- [x] Ensure `npm run typecheck` passes.
- [x] Ensure `npm test` passes.
- [x] Ensure `npm run build` succeeds.
- [x] Visually verify the application using a frontend verification script.

## Progress Log

### 2026-03-19
- Initial assessment: several packages are outdated, including `vite`, `vitest`, `pixi.js`, `tailwindcss`, and `react` related types.
- Upgraded all dependencies using `npm install` with `@latest` tags and `--legacy-peer-deps` to handle `vite` 8 vs `@vitejs/plugin-react` 6 peer dependency issues.
- Fixed `Module '"@testing-library/react"' has no exported member 'fireEvent'` and `screen` by installing `@testing-library/dom`.
- Fixed `Cannot find package '@pixi/core'` error in tests by installing `@pixi/core`, `@pixi/constants`, `@pixi/math`, `@pixi/settings`, and `@pixi/utils`. This was required by `@pixi/filter-glow`.
- Verified that `npm run typecheck`, `npm test`, and `npm run build` all pass.
- **Frontend Verification:** Ran the application and captured a screenshot with Playwright. UI renders correctly and appears functional after upgrades.
