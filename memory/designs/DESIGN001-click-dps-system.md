# DESIGN001 - Click & DPS System

**Status:** Draft
**Author:** Agent — 2025-10-22

## Overview

Defines the core game loop and how player upgrades modify derived stats (click damage, DPS, loot multiplier, crit chance).

## Components

- Game Snapshot: central state persisted to `localStorage` (see `STORAGE_KEY` in `src/App.tsx`).
- Upgrade Definitions: data-driven `UPGRADE_DEFS` list that apply mutative functions to a derived snapshot.
- Derivation: `deriveStats()` recalculates transient stats from base snapshot + upgrades.
- Tick Loop: setInterval-based tick that applies DPS, awards rewards, autosaves state, and spawns visuals.

## Interfaces

- GameSnapshot (see code in `src/App.tsx`) — includes stardust, totalEarned, clickDamage, dps, lootMultiplier, critChance, critMult, ship, upgrades, autoBuy, lastTick.

## Acceptance Criteria

- deriveStats correctly applies upgrades to produce expected clickDamage, dps, and lootMultiplier.
- Offline progress correctly applies DPS for up to 8 hours on load.
- Auto-buy purchases upgrades while affordable when enabled.

## Risks

- Keeping game logic inside the UI file may complicate unit testing — extract to a module if complexity grows.

## Next steps

- Add unit tests for `deriveStats`, `costOf`, and `loadState`/`saveState` behaviors.
- Create a task to extract game logic into `src/game/` module for testability.
