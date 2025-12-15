# Feature Ideas

Based on an analysis of the repository state (as of Nov 2025), here are 3 feature ideas that fit the "minimal/incremental" theme and React/Vite/Pixi tech stack.

## 1. Achievement Gallery & Statistics

**Concept:**
A dedicated modal or panel where players can view all unlocked and locked achievements, along with a detailed statistics tab.

**Why:**
Currently, achievements are only shown as fleeting toasts (implemented in `AchievementToasts.tsx`). A gallery allows players to see their progress, understand what goals to chase next, and view lifetime stats (total clicks, prestige count, max combo), which is crucial for player retention in idle games.

**Implementation Plan:**
- Create `src/components/AchievementGallery.tsx` (Modal UI).
- Add a "Stats & Achievements" button to the `HeaderBar`.
- Use the existing `ACHIEVEMENT_DEFS` in `src/achievements.ts` to populate the list.
- Display stats from `GameSnapshot.stats`.

## 2. Synthesized Audio System (Retro SFX)

**Concept:**
A robust, asset-free audio system using the Web Audio API to generate procedural sound effects (e.g., laser blasts, UI clicks, level-up chimes) and potentially a low-fi ambient hum.

**Why:**
The previous audio system was removed due to persistent 404/loading errors with external assets. A synthesized approach eliminates external dependencies, ensures 100% reliability, and perfectly matches the "retro space" aesthetic.

**Implementation Plan:**
- Create `src/audio/synth.ts` using `AudioContext` oscillators.
- Implement helper functions like `playLaser()`, `playExplosion()`, `playChime()`.
- Hook into game events in `useGameController.ts` (e.g., inside `handleAttack` or `doPrestige`).
- Add a mute toggle in the UI (likely in `HeaderBar` or a settings modal).

## 3. "Command Bridge" Active Skills

**Concept:**
A set of cooldown-based active abilities that the player can trigger for strategic bursts of power.

**Examples:**
- **Overcharge:** +100% Attack Speed (or Click Damage) for 10 seconds.
- **Stardust Magnet:** Collects all pending loot instantly + 20% bonus.
- **Emergency Shields:** Prevents combo reset on miss for 30 seconds.

**Why:**
Adds a layer of active strategy beyond simple clicking and buying passive upgrades, making boss fights and progression more engaging.

**Implementation Plan:**
- Update `GameSnapshot` in `src/types.ts` to track skill cooldowns and active states.
- Add `tickSkills` logic in `src/logic.ts` to handle cooldown reduction and effect duration.
- Create a `SkillBar` component to display skill buttons and cooldown overlays.
