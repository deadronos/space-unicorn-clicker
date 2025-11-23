## Phase 2 Complete: Combo Bonuses in deriveStats

Implemented combo-driven crit scaling and DPS momentum applied in `deriveStats`.

**Files created/changed:**
- `src/logic.ts` (added combo helper functions and applied combo bonuses in `deriveStats`)
- `src/types.ts` (added optional derived fields: `comboActive`, `comboDpsMult`, `comboCritChanceBonus`, `comboCritMultBonus`)
- `src/__tests__/deriveStats.combo.test.ts` (new tests for active vs expired combos)

**Functions created/changed:**
- `isComboActive` — determines whether a combo is currently active
- `computeComboCritChanceBonus` — returns crit chance bonus per stack
- `computeComboCritMultBonus` — returns crit multiplier bonus per tier
- `computeComboDpsMultiplier` — returns DPS multiplier from combo
- `deriveStats` — now applies combo bonuses when active and exposes derived metadata

**Tests created/changed:**
- `src/__tests__/deriveStats.combo.test.ts` — tests for expired vs active combo behavior (uses fake timers)

**Review Status:** APPROVED

**Git Commit Message:**
feat(combo): apply combo crit & DPS bonuses in deriveStats
