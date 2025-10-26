# DESIGN004 - Advanced Upgrade Types and Shooting Mechanisms

**Status:** Draft  
**Author:** AI Agent — 2025-10-26

## Overview

Expand the upgrade system with new mechanics beyond simple stat boosts. Add specialized shooting modes, auto-clicker variations, and synergistic upgrade combinations.

## New Upgrade Categories

### Offensive Upgrades
- **Burst Fire**: Click once to fire 3 rapid shots (unlocked at prestige 1)
- **Chain Lightning**: Shots have a chance to hit multiple times
- **Piercing Rounds**: Damage continues through destroyed ships to next enemy
- **Charge Shot**: Hold click to charge up a mega-blast

### Defensive/Utility Upgrades
- **Plasma Shield**: Reduces effective enemy HP by percentage
- **Time Dilation**: Slows down ship progression, increasing DPS effectiveness
- **Stardust Magnet**: Increases loot multiplier exponentially

### Auto-Shooter Variations
- **Auto-Turrets**: Additional independent auto-fire sources
- **Drone Squadron**: Each drone adds flat DPS with unique visual
- **Orbital Cannons**: Periodic massive damage bursts
- **Repair Bots**: Passively generate small amounts of stardust over time

### Combo Upgrades
- **Critical Mass**: Crit chance increases with consecutive hits
- **Momentum**: Click damage increases for each click within 2 seconds
- **Overcharge**: DPS increases when not clicking (idle bonus)
- **Synchronize**: Auto-fire and manual clicks synergize for bonus damage

## Upgrade System Enhancements

### Tier System
- Tier 1: Basic upgrades (available from start)
- Tier 2: Advanced upgrades (unlocked at level 20)
- Tier 3: Elite upgrades (unlocked at level 50)
- Prestige Tier: Special upgrades (unlocked after first prestige)

### Upgrade Dependencies
```typescript
interface UpgradeDef {
  id: string;
  name: string;
  desc: string;
  baseCost: number;
  costMult: number;
  tier: number;
  requires?: string[]; // IDs of prerequisite upgrades
  prestigeRequired?: number;
  apply: (state: GameSnapshot) => void;
}
```

### Visual Indicators
- Lock icon for unavailable upgrades
- Glow effect for unlocked but unpurchased upgrades
- Different colors by tier (gray, blue, purple, gold)
- Tooltip showing requirements

## New Mechanics

### Burst Fire System
```typescript
interface BurstState {
  active: boolean;
  shotsRemaining: number;
  interval: number;
}
```

When player clicks with burst fire:
1. Queue N shots
2. Fire shots at interval (e.g., 100ms)
3. Each shot applies full click damage
4. Visual effect shows burst pattern

### Chain Lightning
- Each shot has X% chance to chain
- Chains deal reduced damage (e.g., 50% of original)
- Visual: lightning arc effect
- Max chain depth configurable

### Charge Shot
- Hold mouse down to charge
- Visual charge indicator (growing glow)
- Release to fire charged shot
- Damage multiplier based on charge time (1x to 5x)

### Auto-Turret System
```typescript
interface Turret {
  id: number;
  dps: number;
  fireRate: number;
  lastFire: number;
  position: { x: number; y: number };
}
```

## Data Model Updates

Add to GameSnapshot:
```typescript
burstLevel: number;
chainLevel: number;
turretCount: number;
activeEffects: Map<string, EffectState>;
```

## Interfaces

```typescript
interface ShootingMechanic {
  type: 'single' | 'burst' | 'charge' | 'chain';
  execute: (damage: number, state: GameSnapshot) => ShotResult;
}

interface ShotResult {
  damage: number;
  effects: VisualEffect[];
  chains?: number;
}
```

## Acceptance Criteria

- At least 8 new upgrade types implemented
- Burst fire works correctly (fires multiple shots)
- Chain lightning has visual feedback
- Auto-turrets fire independently from main DPS
- Upgrades have proper tier restrictions
- All new mechanics save/load correctly
- Performance remains smooth with multiple mechanics active

## Balance Considerations

- Burst fire: 3 shots, costs 3x as much as horn laser
- Chain: 20% chance at level 1, +5% per level, max 3 chains
- Turrets: 1 DPS per turret, costs scale exponentially
- Charge: 1 second = 2x, 2 seconds = 3x, 3 seconds = 5x max

## Visual Design

- Each upgrade type has unique icon/emoji
- Burst fire: triple laser effect
- Chain: lightning arcs between shots
- Turrets: small satellites around unicorn
- Charge: growing circle indicator

## Next Steps

1. Define complete UPGRADE_DEFS list with new upgrades
2. Implement burst fire shooting system
3. Add chain lightning effect and calculation
4. Create turret system with independent firing
5. Add charge shot mechanic with hold-to-charge
6. Implement tier unlock system
7. Add visual effects for each new mechanic
8. Balance test all new upgrades
