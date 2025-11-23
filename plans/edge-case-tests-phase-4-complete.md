## Phase 4 Complete: Run suite, fix flaky tests, document & finalize

Executed the full test suite, identified and fixed flaky tests, and verified overall system stability.

**Files created/changed:**
- `vitest.config.ts`
- `src/pixi/__tests__/pixistage.unmount.test.tsx`
- `src/pixi/impact.test.ts`

**Functions created/changed:**
- Updated `vitest.config.ts` to include setup files.
- Updated `PixiStage` tests to use `act` for React state updates.
- Updated `ImpactParticles` tests to account for randomized particle duration.

**Tests created/changed:**
- `ImpactParticles > reuses particle instances` (Fixed timing issue)
- `PixiStage > should clean up app and listeners on unmount` (Fixed act warnings)

**Review Status:** APPROVED

**Git Commit Message:**
test: stabilize test suite and fix flakes

- Fix ImpactParticles test timing for randomized duration
- Add act() wrappers to PixiStage tests
- Configure vitest setup files
