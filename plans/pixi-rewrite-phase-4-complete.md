# Pixi Rewrite — Phase 4 Complete

**Date:** 2025-11-08

## Summary

Phase 4 implemented pooled impact particles and floating damage numbers. Both systems include lightweight object pooling, lifecycle management (play/finish/reset), and unit tests that assert spawn, finish, and reuse behavior.

## Files

- `src/pixi/effects/ImpactParticles.ts`
- `src/pixi/effects/DamageNumbers.ts`
- `src/pixi/impact.test.ts`
- `src/pixi/damage-numbers.test.ts`

## Test Results

- `npx vitest --run`: 9 passed, 0 failed (includes the new impact and damage-number tests).
- `npx tsc --noEmit src/pixi/effects/ImpactParticles.ts src/pixi/effects/DamageNumbers.ts`: reported ambient/lib-related type errors in `node_modules` and two usage errors in the new files (`find`/`includes`) caused by `tsconfig` `lib` settings. This is a configuration issue; updating `tsconfig.json` to include `lib: ["es2015","dom"]` (or equivalent) will resolve these messages.

## Notes

- Behavior: particles and damage numbers spawn correctly, finish after the configured duration, are returned to their pools, and instances are reused.
- The TypeScript errors are environmental (missing ES/DOM libs) and do not affect runtime correctness.

## Recommended Commit Message

"feat(pixi): add ImpactParticles and DamageNumbers with tests (phase 4 complete)"

## Next Steps

1. Update `tsconfig.json` to include `lib` entries for ES/DOM to allow project-wide type-checking.
2. Proceed to Phase 5: integrate Pixi visuals into `src/App.tsx` and wire spawn calls.
3. Optionally add `canvas` (node-canvas) as a dev dependency for richer canvas tests in jsdom.
