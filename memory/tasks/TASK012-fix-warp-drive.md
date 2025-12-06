---
# TASK012 - Fix Warp Drive Artifact
**Status:** Completed
**Added:** 2025-11-23
**Updated:** 2025-11-23
---

## Original Request
Find and fix a single, verifiable bug. The bug identified was that the "Warp Drive" artifact, which promises "Start at a higher zone after prestige", had no effect.

## Thought Process
- Identified that `doPrestige` in `useGameController.ts` created a fresh state but did not apply any logic for the Warp Drive artifact.
- The logic for prestige was embedded in a React hook, making it hard to test.
- Decided to extract prestige logic to `performPrestige` in `logic.ts` to make it testable and fix the bug cleanly.

## Implementation Plan
1. Create a reproduction test `src/__tests__/bug_warp_drive.test.ts`.
2. Extract prestige logic to `performPrestige` in `logic.ts` and implement Warp Drive effect.
3. Update `useGameController.ts` to use `performPrestige`.
4. Verify fix with the test.

## Progress Log
- 2025-11-23: Created reproduction test. Confirmed failure (Zone remained 0).
- 2025-11-23: Implemented `performPrestige` in `logic.ts` with Warp Drive logic (`fresh.zone = warpLevel * 5`).
- 2025-11-23: Updated `useGameController.ts` to use `performPrestige`.
- 2025-11-23: Verified fix with `src/__tests__/bug_warp_drive.test.ts` (Passed).
- 2025-11-23: Ran full test suite. All tests passed.

## Acceptance Criteria & Tests
- `src/__tests__/bug_warp_drive.test.ts`: Checks that a prestige with `warp_drive` level 1 results in Zone 5 and Ship Level 50.
