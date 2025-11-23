## Plan: Research missing tests for edge cases and create more tests

Add prioritized edge-case tests starting with core game logic and persistence, then hooks/UI, then Pixi pools & cleanup. Follow TDD: write failing tests first, implement minimal fixes, then stabilize and document.

**Phases 4**
1. **Phase 1: High-priority unit tests (Core logic & persistence)**
    - **Objective:** Catch logic regressions that affect game state and progression (damage routing, saved-state hydration, prestige math).
    - **Files/Functions to Modify/Create:** `src/logic.ts`, `src/prestige.ts`, `src/utils.ts`, `src/hooks/useGameController.ts` (tests created under `src/__tests__/` or `src/hooks/__tests__/`).
    - **Tests to Write:**
        - `applyDamageToShip — generator spillover` (unit) — `src/__tests__/logic.applyDamage.edge.test.ts`
        - `hydrateSavedState — avoid double-counting` (integration/hook) — `src/__tests__/hydrateSavedState.integration.test.ts`
        - `prestige math — threshold/rounding boundaries` (unit) — `src/__tests__/prestige.math.test.ts`
    - **Steps:**
        1. Add tests (TDD: tests first) for the above cases.
        2. Run tests — observe failures.
        3. Implement minimal, focused fixes in production code if a real bug appears.
        4. Re-run and refactor until green; add assertions for edge inputs.

2. **Phase 2: Integration & hook tests (events, throttling, UI affordances)**
    - **Objective:** Validate event timing, rapid clicks, targeting, persistence interactions, and exact-affordability UI behavior.
    - **Files/Functions to Modify/Create:** `src/hooks/useGameController.ts`, `src/components/UpgradePanel.tsx`, `src/components/PrestigePanel.tsx`, `src/components/GameView.tsx`.
    - **Tests to Write:**
        - `handleAttack — throttle & targeting` (integration/hook) — `src/hooks/__tests__/handleAttack.throttle.test.ts`
        - `UpgradePanel — exact-affordability/button disabled` (render) — `src/components/__tests__/UpgradePanel.affordability.test.ts`
        - `doPrestige — reset and preserve artifacts` (integration) — `src/components/__tests__/PrestigePanel.reset.test.ts`
    - **Steps:**
        1. Write tests using `renderHook` / React Testing Library and fake timers where needed.
        2. Run tests (they should fail if code is buggy).
        3. Apply minimal controlled fixes; avoid broad refactors.
        4. Verify behavior across edge inputs (zero, exact funds, rapid clicks).

3. **Phase 3: Pixi & pooling edge-case tests**
    - **Objective:** Ensure pools (BeamPool, DamageNumberPool, CompanionPool) and `PixiStage` cleanup are robust under burst and unmount.
    - **Files/Functions to Modify/Create:** `src/pixi/effects/*`, `src/pixi/display/*`, `src/pixi/PixiStage.tsx`.
    - **Tests to Write:**
        - `BeamPool reuse and exhaustion under bursts` — `src/pixi/__tests__/beam-pool-load.test.ts`
        - `DamageNumberPool reuse and release correctness` — `src/pixi/__tests__/damageNumbers.pool.test.ts`
        - `PixiStage unmount cleans listeners/ticker/destroys app` — `src/pixi/__tests__/pixistage.unmount.test.ts`
    - **Steps:**
        1. Add fast, deterministic unit tests (mock PIXI where needed).
        2. Use fake timers / spies to ensure release/destroy paths run.
        3. Fix pooling leaks or missing destroys minimally.
        4. Re-run suite and stabilize.

4. **Phase 4: Run suite, fix flaky tests, document & finalize**
    - **Objective:** Run the full `vitest` suite, remediate flaky tests (restore mocks, isolate timers), update `memory/tasks`, and prepare commits/PR.
    - **Files/Functions to Modify/Create:** test files added above; small focused fixes in `src/*` only if tests reveal real issues.
    - **Tests to Write:** any remaining lower-priority tests (utils formatting, achievements detection, edge UI states).
    - **Steps:**
        1. Run full suite and CI (if available).
        2. Address failing tests with minimal code changes or test adjustments if tests are incorrect.
        3. Add notes about any remaining technical debt (flaky patterns) to `memory/tasks`/`progress.md`.
        4. Prepare commits/PRs grouped by phase.

**Open Questions**
1. Proceed to implement Phase 1 tests now? (I will run an implement-subagent to add tests and run them.)
2. Preferred branch name for commits? (suggest `tests/edgecases` or `test/edgecases/{phase}`)
3. Policy for failing tests that indicate design ambiguity: fix the code or open issues and leave tests skipped? (Default: fix true bugs, open issues for ambiguous behavior.)
4. Run full `vitest` locally or rely on CI? (Local run recommended during work.)
