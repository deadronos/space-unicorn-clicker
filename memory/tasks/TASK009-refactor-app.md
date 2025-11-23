# [TASK009] - Refactor App.tsx into smaller components

**Status:** Completed  
**Added:** 2025-11-21  
**Updated:** 2025-11-21

## Original Request

Refactor `App.tsx` into distinct files/components to simplify structure.

## Thought Process / Design Reference

- No existing design doc for this refactor. Goal is to decompose monolithic UI and game control code into focused hooks/components while keeping behavior identical and tests green.

## Implementation Plan

- Extract game orchestration (state init, loops, handlers) into a dedicated hook to shrink `App.tsx`.
- Split UI into domain-focused components (header/stats, upgrade list, game view/click zone, prestige/artifacts, achievement toasts) fed by the hook.
- Wire callbacks for upgrades, artifacts, attacks, and prestige through props to keep state updates centralized.
- Verify lint/type/tests still pass; adjust tests only if structural changes require it.

## Progress Log

- 2025-11-21: Created task, captured plan, and prepared to split `App.tsx`.
- 2025-11-21: Refactored `App` into a controller hook plus `HeaderBar`, `UpgradePanel`, `GameView`, `PrestigePanel`, and `AchievementToasts`; cleaned state orchestration and kept Pixi refs in the hook. Tests now passing (`npm test`).

## Acceptance Criteria & Tests

- `App.tsx` delegates most logic/UI to new hook/components with clearer structure and no feature regressions.
- Existing behavior for clicking, crit/unicorn spawning, upgrades, DPS loop, prestige, and artifacts remains unchanged.
- Automated suite continues to pass (`npm run test`, `npm run typecheck`); update snapshots/tests only if necessary.
