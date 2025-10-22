# Requirements (EARS-style)

1. WHEN a player clicks the unicorn, THE SYSTEM SHALL decrement the enemy ship's HP by the player's click damage and award the appropriate rewards if the ship dies. [Acceptance: unit test simulating click and verifying HP and rewards update]

2. WHEN the game runs while the player is away, THE SYSTEM SHALL apply offline DPS for up to 8 hours and award accumulated rewards on next load. [Acceptance: simulate lastTick difference and verify stardust increase]

3. WHEN the player purchases an upgrade, THE SYSTEM SHALL deduct stardust, increase the upgrade level, and reflect derived stat changes in DPS/click/loot. [Acceptance: unit test for buy() and deriveStats() functions]

4. WHEN auto-buy is enabled, THE SYSTEM SHALL attempt to purchase affordable upgrades automatically without user intervention. [Acceptance: integration test toggling autoBuy and asserting upgrades increment over time if funds suffice]

5. WHEN the user resets progress, THE SYSTEM SHALL clear persistent state and reinitialize the game to level 1. [Acceptance: simulate resetProgress and check localStorage and UI state]
