# Requirements (EARS-style)

## Core Mechanics

1. WHEN a player clicks the unicorn, THE SYSTEM SHALL decrement the enemy ship's HP by the player's click damage and award the appropriate rewards if the ship dies. [Acceptance: unit test simulating click and verifying HP and rewards update]

2. WHEN the game runs while the player is away, THE SYSTEM SHALL apply offline DPS for up to 8 hours and award accumulated rewards on next load. [Acceptance: simulate lastTick difference and verify stardust increase]

3. WHEN the player purchases an upgrade, THE SYSTEM SHALL deduct stardust, increase the upgrade level, and reflect derived stat changes in DPS/click/loot. [Acceptance: unit test for buy() and deriveStats() functions]

4. WHEN auto-buy is enabled, THE SYSTEM SHALL attempt to purchase affordable upgrades automatically without user intervention. [Acceptance: integration test toggling autoBuy and asserting upgrades increment over time if funds suffice]

5. WHEN the user resets progress, THE SYSTEM SHALL clear persistent state and reinitialize the game to level 1. [Acceptance: simulate resetProgress and check localStorage and UI state]

## Prestige System

6. WHEN a player has earned at least 1 million total Stardust, THE SYSTEM SHALL allow the player to prestige and award cosmic gems based on total earnings. [Acceptance: verify prestige button appears and gem calculation is correct]

7. WHEN a player performs prestige, THE SYSTEM SHALL reset ship level, upgrades, and current stardust while preserving cosmic gems. [Acceptance: test prestige() function preserves only gems and prestige count]

8. WHEN cosmic gems are present, THE SYSTEM SHALL apply a multiplier bonus to all Stardust earnings. [Acceptance: verify gem multiplier is correctly applied in deriveStats]

## Enhanced Visuals

9. WHEN damage is dealt to a ship, THE SYSTEM SHALL display a floating damage number at the impact point. [Acceptance: verify DamageNumber component appears and animates on hit]

10. WHEN a ship is destroyed, THE SYSTEM SHALL show an explosion particle effect. [Acceptance: verify explosion animation plays on ship HP reaching zero]

11. WHEN the player performs rapid clicks (3+ within 2 seconds), THE SYSTEM SHALL display a combo counter. [Acceptance: test combo detection and UI update]

12. WHEN different ship levels are reached, THE SYSTEM SHALL display varied ship visuals (standard, armored, speed, boss). [Acceptance: verify ship appearance changes based on level]

## Advanced Upgrades

13. WHEN a player has burst fire upgrade and clicks, THE SYSTEM SHALL fire multiple shots in rapid succession. [Acceptance: verify multiple beam animations and damage applications]

14. WHEN chain lightning is active and shots hit, THE SYSTEM SHALL have a chance to deal additional chained damage. [Acceptance: test chain probability and recursive damage calculation]

15. WHEN auto-turrets are purchased, THE SYSTEM SHALL fire independent shots separate from main DPS. [Acceptance: verify turret firing rate and damage application]

16. WHEN upgrade tier requirements are met, THE SYSTEM SHALL unlock higher tier upgrades. [Acceptance: test upgrade visibility based on level and prestige]
