## Phase 2 Complete: PixiStage wrapper and mount

Phase 2 implemented a minimal Pixi rendering mount and verified it via Vitest.

**TL;DR:** Created `PixiStage` (React wrapper that mounts a canvas via `createPixiApp`) and `PixiMountPoint` container; added tests that assert a canvas is attached and that the imperative ref exposes `spawnBeam` and `spawnImpact`.

**Files created/changed:**
- `src/pixi/PixiStage.tsx`
- `src/components/PixiMountPoint.tsx`
- `src/pixi/pixi-stage.test.ts`

**Functions created/changed:**
- `PixiStage` React component (forwardRef, useImperativeHandle) - mount/teardown and API: `spawnBeam`, `spawnImpact`, `app`

**Tests created/changed:**
- `src/pixi/pixi-stage.test.ts` — asserts canvas mount and ref API

**Review Status:** APPROVED

**Test Results:**
- Ran: `npx vitest --run`
- Passed: 3
- Failed: 0

**Notes & Caveats:**
- jsdom does not implement `HTMLCanvasElement.getContext()`; tests guard against this, but for richer drawing tests consider adding `canvas` (node-canvas) as a dev dependency.
- The project's `tsconfig.json` currently leads to ambient type errors during `tsc --noEmit`. Recommend adding `"lib": ["ES2015", "DOM"]`, enabling `esModuleInterop`, and setting `jsx` to `react-jsx` or similar.

**Git Commit Message:**
```
feat: add PixiStage wrapper and tests

- Add `src/pixi/PixiStage.tsx` mounting the Pixi app and exposing an imperative API
- Add `src/components/PixiMountPoint.tsx` wrapper container
- Add `src/pixi/pixi-stage.test.ts` with Vitest to verify canvas mount and API
- Tests: 3 passing (jsdom environment)
```

***

**Next:** Phase 3 (Beam system & pooling) — implement pooled Beam objects and lifecycle tests. 

