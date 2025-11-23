## Phase 3 Complete: Pixi & Pools Edge Cases

Implemented comprehensive tests for Pixi.js object pooling and component lifecycle management.

**Files created/changed:**
- `src/pixi/__tests__/beam-pool-load.test.ts`
- `src/pixi/__tests__/damageNumbers.pool.test.ts`
- `src/pixi/__tests__/pixistage.unmount.test.tsx`

**Functions created/changed:**
- Added `BeamPool` load tests (reuse, growth)
- Added `DamageNumberPool` lifecycle tests
- Added `PixiStage` unmount cleanup tests
- Enhanced Pixi.js mocks to support `Graphics` and `Container` instantiation

**Tests created/changed:**
- `BeamPool > should reuse beams and handle exhaustion under bursts`
- `BeamPool > should grow pool if demand exceeds supply`
- `DamageNumberPool > should reuse damage numbers`
- `DamageNumberPool > should handle pool exhaustion`
- `PixiStage > should clean up app and listeners on unmount`

**Review Status:** APPROVED

**Git Commit Message:**
test: add Pixi pool and lifecycle edge case tests

- Add BeamPool load tests for reuse and growth
- Add DamageNumberPool lifecycle tests
- Add PixiStage unmount cleanup tests
- Update Pixi mocks to support class instantiation
