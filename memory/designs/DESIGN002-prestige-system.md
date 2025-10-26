# DESIGN002 - Prestige System

**Status:** Draft  
**Author:** AI Agent — 2025-10-26

## Overview

Add a prestige/ascension mechanic that allows players to reset progress in exchange for permanent bonuses, extending gameplay depth and providing long-term progression goals.

## Components

### Prestige Currency: Cosmic Gems
- Earned based on total Stardust earned (not current balance)
- Formula: `Math.floor(Math.sqrt(totalEarned / 1000000))` gems on prestige
- Must have earned at least 1 million total Stardust to prestige

### Prestige Bonuses
- **Gem Multiplier**: Each gem provides +2% bonus to all Stardust earnings
- **Starting Boost**: Start each prestige with some free upgrades based on gem count
- **New Upgrades**: Unlock special upgrades only available after first prestige

### Prestige Interface
- Display current gem count and potential gems on next prestige
- Show prestige multiplier effect
- Confirmation dialog before prestiging
- Visual indication of prestige tier (color themes, badges)

## Data Model Changes

Add to GameSnapshot:
```typescript
prestigeGems: number;
totalPrestiges: number;
```

## Interfaces

```typescript
interface PrestigeState {
  gems: number;
  totalPrestiges: number;
  nextPrestigeGems: number;
  gemMultiplier: number;
  canPrestige: boolean;
}

function calculatePrestigeGems(totalEarned: number): number;
function getGemMultiplier(gems: number): number;
function performPrestige(state: GameSnapshot): GameSnapshot;
```

## Acceptance Criteria

- Player can prestige when totalEarned >= 1,000,000
- Prestige resets ship level, upgrades, and stardust
- Cosmic gems are correctly calculated and persist across prestiges
- Gem multiplier applies to all Stardust rewards
- Prestige count is tracked and displayed

## Risks & Trade-offs

- Balance: initial prestige threshold must feel achievable but not trivial
- May need to adjust upgrade costs/scaling after prestige implementation
- Must ensure gems persist in localStorage correctly

## Visual Design

- Add prestige button/panel near upgrades section
- Show gem count prominently with gem icon 💎
- Use gradient effect for prestige tier indication
- Animate prestige action with special effect

## Next Steps

1. Implement prestige calculation functions
2. Add UI for prestige button and display
3. Update game loop to apply gem multiplier
4. Add prestige confirmation dialog
5. Test prestige saves/loads correctly
