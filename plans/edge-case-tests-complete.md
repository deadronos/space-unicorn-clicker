## Plan Complete: Research missing tests for edge cases and create more tests

Successfully implemented a comprehensive suite of edge-case tests covering core game logic, UI interactions, and Pixi.js rendering/pooling. Identified and fixed a critical bug in save hydration (double-counting stardust) and stabilized the test environment.

**Phases Completed:** 4 of 4
1. ✅ Phase 1: High-priority unit tests (Core logic & persistence)
2. ✅ Phase 2: Integration & hook tests (events, throttling, UI affordances)
3. ✅ Phase 3: Pixi & pooling edge-case tests
4. ✅ Phase 4: Run suite, fix flaky tests, document & finalize

**All Files Created/Modified:**
- `src/__tests__/logic.applyDamage.edge.test.ts`
- `src/__tests__/hydrateSavedState.integration.test.ts`
- `src/__tests__/prestige.math.test.ts`
- `src/hooks/__tests__/handleAttack.throttle.test.ts`
- `src/components/__tests__/UpgradePanel.affordability.test.tsx`
- `src/hooks/__tests__/useGameController.prestige.test.ts`
- `src/pixi/__tests__/beam-pool-load.test.ts`
- `src/pixi/__tests__/damageNumbers.pool.test.ts`
- `src/pixi/__tests__/pixistage.unmount.test.tsx`
- `src/pixi/impact.test.ts`
- `vitest.config.ts`
- `src/logic.ts`
- `src/pixi/PixiStage.tsx`

**Key Functions/Classes Added:**
- Comprehensive test suites for `applyDamage`, `hydrateSavedState`, `calculatePrestige`, `handleAttack`, `UpgradePanel`, `BeamPool`, `DamageNumberPool`, and `PixiStage`.
- Enhanced Pixi.js mocks for robust unit testing of graphics components.

**Test Coverage:**
- Total tests written: 38
- All tests passing: ✅

**Recommendations for Next Steps:**
- Integrate these tests into a CI/CD pipeline.
- Continue to expand test coverage as new features are added, specifically focusing on new Pixi.js visual effects.
- Monitor `ImpactParticles` tests for potential flakiness due to `Math.random()` usage (mitigated by increased timer advance).
