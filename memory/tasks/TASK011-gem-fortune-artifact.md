# TASK011 - Gem Fortune Artifact

**Status:** In Progress
**Added:** 2025-11-23
**Updated:** 2025-11-23

## Original Request

"make another artifact prestige buyable to increase number of gems "luck_gem_chance" can give > make this another roll, it should earn (when it triggers): between 1 and the level of that upgrade"

## Thought Process

The user wants to enhance the "Lucky Prestige Gems" mechanic (where critical hits have a chance to drop gems) by adding a new artifact.
This artifact, "Gem Fortune", will increase the *amount* of gems dropped per trigger.
Instead of a fixed 1 gem, it will roll a random number between 1 and the artifact's level.

## Implementation Plan

1.  **Define Artifact:** Add `gem_fortune` to `src/prestige.ts`.
    *   Name: "Gem Fortune"
    *   Description: "Lucky Gem drops yield 1 to [Level] gems."
    *   Base Cost: 500 (High value)
    *   Cost Mult: 2.0 (Steep scaling)
2.  **Update Logic:** Modify `src/hooks/useGameController.ts` in the `handleAttack` function.
    *   Retrieve `gem_fortune` level.
    *   When `LUCK_GEM_CHANCE` triggers:
        *   Calculate `maxDrop = Math.max(1, level)`.
        *   Roll `amount = Math.floor(Math.random() * maxDrop) + 1`.
        *   Add `amount` to `gemsFound`.

## Progress Log

### 2025-11-23
- Created task file.
- Planning implementation.
