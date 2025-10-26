# TASK002 - Implement Prestige System

**Status:** Pending  
**Added:** 2025-10-26  
**Updated:** 2025-10-26

## Original Request

Add prestige/ascension mechanic to the game where players can reset progress for permanent bonuses (cosmic gems that provide multipliers).

## Thought Process

Based on DESIGN002, we need to:
1. Add prestige currency (cosmic gems) calculation
2. Extend GameSnapshot with prestige fields
3. Create prestige UI component
4. Implement prestige reset logic that preserves gems
5. Apply gem multiplier to all stardust earnings

The prestige system should feel rewarding and provide meaningful progression after the initial game loop is mastered.

## Implementation Plan

1. Add prestige fields to GameSnapshot interface
2. Create prestige calculation functions
3. Update deriveStats to apply gem multiplier
4. Add prestige UI panel with gem display and prestige button
5. Implement prestige() function that resets game with gem reward
6. Update save/load to handle prestige data
7. Add visual feedback for prestige action

## Progress Tracking

**Overall Status:** Pending - 0%

### Subtasks

| ID | Description | Status | Updated | Notes |
|----|-------------|--------|---------|-------|
| 2.1 | Extend GameSnapshot interface | Not Started | - | Add prestigeGems, totalPrestiges |
| 2.2 | Create prestige calculation functions | Not Started | - | calculatePrestigeGems, getGemMultiplier |
| 2.3 | Update deriveStats for gem multiplier | Not Started | - | Apply to lootMultiplier |
| 2.4 | Add prestige UI component | Not Started | - | Button, gem display, next prestige info |
| 2.5 | Implement prestige reset logic | Not Started | - | Reset game, award gems, confirm dialog |
| 2.6 | Test prestige saves/loads | Not Started | - | Verify localStorage persistence |

## Progress Log

### 2025-10-26
- Task created based on DESIGN002-prestige-system.md
