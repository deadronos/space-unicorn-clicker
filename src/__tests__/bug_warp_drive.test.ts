import { describe, it, expect } from 'vitest';
import { createFreshGameState, performPrestige } from '../logic';
import { GameSnapshot } from '../types';

describe('Warp Drive Bug', () => {
    it('should start at higher zone when Warp Drive artifact is present', () => {
        const prevState = createFreshGameState();
        prevState.totalEarned = 5000000; // Enough for gems (around 10)
        prevState.artifacts = { 'warp_drive': 1 }; // Level 1 Warp Drive

        const nextState = performPrestige(prevState);

        expect(nextState).not.toBeNull();
        if (!nextState) return;

        // Warp Drive Level 1 should give +5 zones.
        // Base zone is 0. So expected zone is 5.
        expect(nextState.zone).toBe(5);

        // Check ship level. Zone 5 should start around level 50.
        // Zone 5 corresponds to levels 50-59.
        expect(nextState.ship.level).toBe(50);

        // Also check preserving artifacts
        expect(nextState.artifacts['warp_drive']).toBe(1);

        // Check gems were added
        expect(nextState.prestigeGems).toBeGreaterThan(0);
    });
});
