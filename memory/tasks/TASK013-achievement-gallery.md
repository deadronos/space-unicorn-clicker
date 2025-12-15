# TASK013 - Achievement Gallery

**Status:** In Progress
**Added:** 2025-11-24
**Updated:** 2025-11-24

## Original Request
Implement Feature Idea 1: Achievement Gallery & Statistics.
"A dedicated modal or panel where players can view all unlocked and locked achievements, along with a detailed statistics tab."

## Implementation Plan
1. **Component Creation**: Create `src/components/AchievementGallery.tsx` which accepts `game` and `derived` state.
   - It should have two tabs: "Achievements" and "Statistics".
   - Achievements tab: List all achievements from `ACHIEVEMENT_DEFS`. Show visual distinction for locked/unlocked.
   - Statistics tab: Display `game.stats` (total clicks, stardust, etc).
2. **Integration**:
   - Add state `showAchievements` to `App.tsx` (or `HeaderBar` internal state if it opens a modal).
   - Add a button "Stats & Achievements" (or similar icon) to `HeaderBar.tsx`.
3. **Tests**:
   - Unit test for the component (render, tab switching).

## Progress Log
- [ ] Created task file.
