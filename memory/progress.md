# Progress Log

## 2025-11-24

### Prestige & Artifact Enhancements (TASK002 Follow-up)

- **Audio Removal:** Removed audio system completely due to persistent 404/NotSupported errors.
- **Lucky Prestige Gems:** Implemented RNG mechanic where critical hits have a chance to drop prestige gems directly.
- **Prestige Rank Bonuses:** Added permanent bonuses based on total prestige count (Damage, Crit Mult, Gem Bonus).
- **Void Siphon Artifact:** Implemented "Void Siphon" artifact for passive stardust generation (0.1% of ship reward/sec/level).
  - **Fix:** Corrected offline progress calculation to include passive stardust.
  - **UX:** Improved number formatting (`fmt`) to show decimals for small numbers (<1000), making slow passive generation visible.
- **Verification:** Added unit tests for `deriveStats` passive generation logic and verified fix.

## 2025-11-23

### Edge Case Tests (TASK010)

- Implemented a comprehensive suite of edge-case tests to ensure system robustness.
- **Core Logic:** Added tests for `applyDamage` spillover, `calculatePrestige` math, and `hydrateSavedState`.
  - **Bug Fix:** Identified and fixed a critical bug in `hydrateSavedState` where `totalEarned` was being added to `currentStardust`, causing double-counting on load.
- **UI & Hooks:** Added tests for `handleAttack` throttling, `UpgradePanel` exact affordability, and `PrestigePanel` reset logic.
- **Pixi.js:** Added tests for `BeamPool` reuse/growth, `DamageNumberPool` lifecycle, and `PixiStage` unmount cleanup.
  - **Mocking:** Enhanced `pixi.js` mocks to support class instantiation (`new PIXI.Container()`) for better unit testing.
- **Stability:** Stabilized the test suite, fixing flaky tests in `ImpactParticles` and ensuring all 38 tests pass reliably.

## 2025-11-23

### Gem Fortune Artifact (TASK011)

- Implemented "Gem Fortune" artifact.
- **Logic:** When a Lucky Gem drops (from critical hits), the amount is now a random roll between 1 and `max(1, artifactLevel)`.
- **Cost:** Base 500, Multiplier 2.0.
- **Verification:** Tests passed (no regressions).

## 2025-11-21

### App refactor (TASK009)

- Split monolithic `App.tsx` into `useGameController` hook plus `HeaderBar`, `UpgradePanel`, `GameView`, `PrestigePanel`, and `AchievementToasts` components for clearer structure.
- Preserved game loop, attack/crit/unicorn spawning, prestige, and artifact behaviors while keeping Pixi refs in the hook.
- Tests passing after refactor (`npm test`).

### PixiJS v8 API Migration (TASK008 Continued)

- Fixed remaining PixiJS v8 deprecation warnings that were causing console noise during tests
- Migrated two files from deprecated v7 API to modern v8 API:
  - `ParticleGraphic.ts`: Updated circle drawing to use `circle()` + `fill()` pattern
  - `Companion.ts`: Updated circle drawing to use `circle()` + `fill()` pattern
- Removed deprecated API calls:
  - `beginFill()` → Define shape first with `circle()`, then call `fill()`
  - `drawCircle()` → Use `circle()` instead
  - `endFill()` → No longer needed in v8, shape is filled when `fill()` is called
- **Results:**
  - All 11 tests passing with zero deprecation warnings
  - TypeScript typecheck passing
  - Build successful
  - No behavior changes, purely API modernization

## 2025-10-27

### Unicorn Horn Beams (TASK006)

- Documented TASK006 and refreshed `memory/tasks/_index.md` before making code changes.
- Reworked the beam rendering logic to compute each unicorn's horn location and reuse those positions for manual and auto-fired beams.
- Ensured the starfield background/pseudo layers sit behind the beam layer and gave the lasers their own z-order so the horns-to-ship beams are visible again.
- `npm run build` now succeeds locally (tsc + Vite build) after ensuring no clipping layers block the beam SVG surfaces.
- Added a dedicated beam overlay (`pointer-events-none` + `z-40`) so beams, sparks, and damage feedback render on top of the background, guaranteeing the lasers are visible even when text overlays appear.

## 2025-10-26

### Unicorn Squadron Feature ✅ (TASK005)

Successfully implemented unicorn spawning upgrade system with dynamic mechanics:

**Core Implementation**
- Added `unicornCount` field to GameSnapshot (default: 1)
- Created new upgrade "🦄 Unicorn Squadron" (11th upgrade)
  - Base cost: 5,000 stardust
  - Cost multiplier: 1.45
  - Each level adds 1 unicorn and +1.5 DPS per extra unicorn
- Fixed upgrade loading to merge saved state with new upgrade definitions

**Critical Hit Spawning**
- Critical hits now have 5% chance to permanently increase unicorn count
- Implemented in handleAttack function
- Spawned unicorns persist through prestige

**Visual Features**
- Multiple unicorns render on screen (up to 5 shown)
- Staggered positioning with decreasing opacity and scale
- "🦄 X Unicorns in Squadron" display in stats (when count > 1)
- "🦄 NEW UNICORN! 🦄" notification animation (2s duration)
- Added unicornSpawn CSS animation

**Testing**
- Verified with screenshots showing 3 unicorns in squadron
- All type checks pass
- Build succeeds
- Feature fully functional

### Implementation Complete ✅

Successfully implemented all three major enhancements:

**Prestige System (TASK002)**
- Added prestigeGems and totalPrestiges to GameSnapshot
- Implemented calculatePrestigeGems() and getGemMultiplier() functions
- Prestige button appears when totalEarned >= 1,000,000
- Each gem provides +2% permanent earnings multiplier
- Gems and prestige count persist across resets
- Updated STORAGE_KEY to v2 for new save format

**Enhanced Visuals (TASK003)**
- Implemented damage numbers that float up on each hit
- Added explosion particle effect when ships are destroyed
- Created 3 ship variants: standard, armored (🛡️), speed (⚡)
- Implemented combo counter system (shows "🔥 Nx COMBO!" for 3+ rapid clicks)
- Added CSS animations: damageFloat, explosion, comboPulse
- Enhanced BattleshipVisual component with variant-specific colors and designs
- Boss ships now show with red hull and gold accents (⚔️)

**Advanced Upgrades (TASK004)**
- Added 5 new upgrade types (total now 10):
  - 💥 Burst Fire: +0.3 click damage per level
  - 🎯 Auto-Turrets: +0.8 DPS per level
  - ⚡ Chain Lightning: +0.2% crit chance, +0.1 crit mult per level
  - 🚀 Momentum: +5% click and DPS per level (multiplicative)
  - 🌟 Supernova Core: +2 DPS and +1 click per level
- Added emoji icons to all upgrade names for better visual appeal
- Ship variants appear at different intervals (speed every 3, armored every 5, boss every 10)

**Code Quality**
- All changes pass TypeScript strict type checking
- Build completes successfully with no errors
- Game tested and verified functional
- Visual effects perform smoothly

### Next Steps
- Monitor player feedback on balance
- Consider adding more prestige-unlocked content
- Potential future: sound effects, more particle types, additional ship variants

### Enhancement Planning
- Created comprehensive design documents for game enhancements:
  - DESIGN002: Prestige System with cosmic gems and multipliers
  - DESIGN003: Enhanced Visuals with particles, damage numbers, ship varieties
  - DESIGN004: Advanced Upgrades with burst fire, chains, turrets
- Created task files TASK002, TASK003, TASK004 for implementation
- Updated requirements.md with 11 new EARS-style requirements
- Updated design and task indices

## 2025-10-22

- Initialized Memory Bank and added core documents: `projectbrief.md`, `productContext.md`, `activeContext.md`, `systemPatterns.md`, `techContext.md`.
- Added `AGENTS.md` to repository root to instruct agents on Memory Bank use and spec-driven workflow.
- Next: add `memory/designs/_index.md` and an example `DESIGN001-*.md`, plus `memory/tasks/_index.md` and example `TASK001-*.md`.
