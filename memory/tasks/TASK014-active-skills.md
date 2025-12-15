# TASK014 - Active Skills (Command Bridge)

**Status:** In Progress
**Added:** 2025-11-24
**Updated:** 2025-11-24

## Original Request
Implement Feature Idea 3: Active Skills ("Command Bridge").
"A set of cooldown-based active abilities that the player can trigger for strategic bursts of power."

## Implementation Plan
1. **Data Model**:
   - Define `SkillDef` in `src/types.ts`.
   - Update `GameSnapshot` to include `skills: Record<string, SkillState>` where `SkillState` is `{ cooldown: number, active: number }`.
2. **Logic Implementation**:
   - Add `SKILL_DEFS` in `src/skills.ts` (new file) or `src/logic.ts`.
   - Implement `tickSkills(game, delta)` in `src/logic.ts` to reduce cooldowns and active durations.
   - Implement `activateSkill(game, skillId)` in `src/logic.ts`.
   - Update `deriveStats` to apply skill effects (e.g. 2x DPS).
3. **UI Implementation**:
   - Create `src/components/SkillBar.tsx`.
   - Display skills with cooldown overlays and "Active" effects.
   - Integrate into `App.tsx` (bottom of screen?).
4. **Tests**:
   - Unit tests for `activateSkill` and `tickSkills`.
   - Verify stat application.

## Progress Log
- [ ] Created task file.
