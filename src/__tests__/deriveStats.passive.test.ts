
import { describe, it, expect } from 'vitest';
import { deriveStats, createFreshGameState } from '../logic';
import { GameSnapshot } from '../types';

describe('Passive Stardust Generation', () => {
    it('should calculate passive stardust correctly with Void Siphon', () => {
        const game = createFreshGameState();
        game.artifacts = { "void_siphon": 1 }; // Level 1
        game.ship.reward = 1000;
        game.lootMultiplier = 1;

        const derived = deriveStats(game);
        
        // 0.1% of 1000 = 1 per second
        expect(derived.passiveStardustPerSecond).toBe(1);
    });

    it('should scale with loot multiplier', () => {
        const game = createFreshGameState();
        game.artifacts = { "void_siphon": 10 }; // Level 10 -> 1%
        game.ship.reward = 1000;
        
        // Use prestige gems to increase loot multiplier
        // Base multiplier is 1.
        // Gem bonus is 1 + (gems * 0.02)
        // We want 10x multiplier, so 1 + (gems * 0.02) = 10 => gems * 0.02 = 9 => gems = 450
        game.prestigeGems = 450;

        const derived = deriveStats(game);
        
        // Verify loot multiplier is 10
        expect(derived.lootMultiplier).toBe(10);

        // 1% of 1000 * 10 = 100 per second
        expect(derived.passiveStardustPerSecond).toBe(100);
    });

    it('should scale with artifact level', () => {
        const game = createFreshGameState();
        game.artifacts = { "void_siphon": 10 }; // Level 10
        game.ship.reward = 1000;
        game.lootMultiplier = 1;

        const derived = deriveStats(game);
        
        // 1% of 1000 = 10 per second
        expect(derived.passiveStardustPerSecond).toBe(10);
    });
});
