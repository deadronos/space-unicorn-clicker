# Active Context

Current focus: Upgrading dependencies and ensuring stability (TASK015).

Recent changes

- **Dependency Upgrades (TASK015):**
  - Upgraded all dependencies to their latest versions, including `vite`, `vitest`, `pixi.js`, `tailwindcss`, `react`, and `lucide-react`.
  - Resolved peer dependency conflicts between `vite` 8 and `@vitejs/plugin-react` 6 using `--legacy-peer-deps`.
  - Fixed test environment issues by installing `@testing-library/dom` and various `@pixi/*` subpackages required by `@pixi/filter-glow`.
- **Prestige & Artifacts:**
  - Removed audio system.
  - Added Lucky Prestige Gems (RNG drops).
  - Added Prestige Rank Bonuses.
  - Added Void Siphon artifact (Passive Stardust).
  - Added Gem Fortune artifact (Boosts Lucky Gem drops).
  - Fixed passive stardust offline progress and visibility.
- Implemented comprehensive edge-case tests (TASK010) covering:
  - Core logic (damage, prestige math)
  - Persistence (save hydration bug fix)
  - UI interactions (throttling, affordability)
  - Pixi.js resource management (pooling, cleanup)
- Stabilized test suite (38 tests passing)
- Refactored App.tsx into smaller components (TASK009)
- Implemented Unicorn Squadron upgrade (11th upgrade type)

Completed Tasks

- TASK010: Edge Case Tests - Completed 2025-11-23
- TASK009: Refactor App.tsx - Completed 2025-11-21
- TASK005: Unicorn Spawning Upgrade - Completed 2025-10-26
- TASK002: Prestige System - Completed 2025-10-26
- TASK003: Enhanced Visual Effects - Completed 2025-10-26
- TASK004: Advanced Upgrade Types - Completed 2025-10-26

Next steps

- Monitor for any bugs or balance issues with unicorn spawning
- Consider future enhancements based on user feedback
- Potential additions: more particle types, additional mechanics

Notes

- Passive Stardust: Visible now with 1 decimal place for small numbers.
- Unicorn Squadron upgrade: baseCost 5000, costMult 1.45
- Crit-based spawn chance is 5% per critical hit
- Visual rendering supports up to 5 unicorns with staggered positioning
- Unicorn count persists through prestige
- All type checks pass, build succeeds
- Performance remains smooth with all effects
