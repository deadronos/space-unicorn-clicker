# TASK001 - Create tests for deriveStats and costOf

**Status:** In Progress  
**Added:** 2025-10-22  
**Updated:** 2025-10-22

## Original Request
Create unit tests for `deriveStats()` and `costOf()` to ensure upgrade application logic and cost progression are correct.

## Thought Process
- These two functions are pure and easy to unit test. Adding tests will give quick confidence and serve as an initial test harness for the repo.

## Implementation Plan
- Add `vitest` and `@testing-library/react` as dev dependencies (or use `vitest` only for now).
- Create `test/deriveStats.test.ts` verifying base derived values and after applying upgrades.
- Create `test/costOf.test.ts` verifying cost progression for upgrade definitions.

## Progress Log
### 2025-10-22
- Task created. Implementation planned. Waiting to add test framework and create files.

## Acceptance Criteria
- `deriveStats` test validates clickDamage, dps, critChance, and lootMultiplier after applying a few levels of upgrades.
- `costOf` test validates the exponential cost formula for a selection of levels.
