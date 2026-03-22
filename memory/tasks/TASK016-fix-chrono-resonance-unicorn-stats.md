# TASK016 - Fix Chrono Resonance and Unicorn Stats

**Status:** Completed  
**Added:** 2026-03-22  
**Updated:** 2026-03-22

## Original Request

Review feedback requested fixes for two correctness issues:

- `Chrono Resonance` should actually reduce active skill cooldowns.
- The unicorn lifetime stat should update when new unicorns spawn.
- Remove stray patch artifact files left in `src/`.

## Thought Process

The branch already computes a cooldown multiplier in derived stats, but the live skill activation path still reads from the raw game snapshot, so the artifact has no gameplay effect. The unicorn lifetime stat is surfaced in the achievement gallery, but the attack path never updates it when unicorns are added. Both issues should be addressed with small, focused changes and backed by regression tests.

## Implementation Plan

- Add a shared helper for skill cooldown multipliers and use it in both skill activation and UI display.
- Update unicorn spawn handling to advance the lifetime unicorn record.
- Remove accidental `.orig` / `.rej` files from `src/`.
- Add regression tests for cooldown reduction and unicorn stat updates.
- Run the test suite and typecheck.

## Progress Tracking

**Overall Status:** Completed - 100%

### Subtasks

| ID | Description | Status | Updated | Notes |
| --- | --- | --- | --- | --- |
| 1.1 | Create task record | Complete | 2026-03-22 | Added task file and linked it in the task index. |
| 1.2 | Patch skill cooldown logic | Complete | 2026-03-22 | Shared helper now drives both skill activation and the SkillBar cooldown display. |
| 1.3 | Patch unicorn lifetime stat | Complete | 2026-03-22 | The lifetime record now updates when a new unicorn spawns. |
| 1.4 | Remove patch artifacts | Complete | 2026-03-22 | Deleted `logic.ts.orig` and `logic.ts.rej`. |
| 1.5 | Add regression tests | Complete | 2026-03-22 | Added tests for Chrono Resonance cooldown reduction and unicorn stat tracking. |

## Progress Log

### 2026-03-22

- Created task file for the review follow-up work.
- Identified the root cause for Chrono Resonance being a no-op: the live activation path ignores the derived cooldown multiplier.
- Identified that `totalUnicorns` is never updated when a new unicorn spawns, so the gallery stat remains stale.
- Implemented a shared cooldown multiplier helper and wired it through skill activation and the SkillBar display.
- Updated unicorn spawn handling to preserve the highest squad size in `totalUnicorns`.
- Removed stray `.orig` / `.rej` patch artifacts from `src/`.
- Added regression tests and verified `npm test` and `npm run typecheck` both pass.
