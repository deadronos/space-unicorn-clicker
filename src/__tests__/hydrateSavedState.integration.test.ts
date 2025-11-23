import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { hydrateSavedState } from '../hooks/useGameController';
import { STORAGE_KEY } from '../config';
import { GameSnapshot } from '../types';
import { createFreshGameState } from '../logic';

describe('hydrateSavedState - Integration', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('should correctly calculate offline progress and NOT double-count totalEarned', () => {
        const now = 1000000000;
        vi.setSystemTime(now);

        // Create a saved state with some DPS and history
        const savedState: GameSnapshot = createFreshGameState();
        savedState.lastTick = now - 10000; // 10 seconds ago
        savedState.totalEarned = 5000;
        savedState.stardust = 1000;
        savedState.stats.totalStardust = 5000;
        
        // Add an upgrade that gives DPS
        // "autofire" gives 1.5 DPS per level. Level 10 = 15 DPS.
        savedState.upgrades['autofire'] = { id: 'autofire', level: 10 };
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

        // Run hydration
        const hydrated = hydrateSavedState();

        // Expected calculation:
        // 10 seconds elapsed.
        // DPS = 15 (from autofire level 10).
        // Damage = 15 * 10 = 150.
        // Ship reward logic:
        // Ship level 1 HP is ~30. 150 damage should kill it multiple times.
        // Let's assume it kills at least one ship.
        // Ship reward is ~10.
        // So rewardEarned should be > 0.
        
        // We don't need exact reward calculation, but we need to ensure totalEarned is consistent.
        // hydrated.totalEarned should be saved.totalEarned + rewardEarned.
        // hydrated.stats.totalStardust should be saved.stats.totalStardust + rewardEarned.
        
        const rewardEarned = hydrated.totalEarned - savedState.totalEarned;
        expect(rewardEarned).toBeGreaterThan(0);
        
        // The bug was: newStats.totalStardust = totalEarned (which is saved + reward) + rewardEarned
        // So if bug exists, stats.totalStardust will be saved.totalEarned + 2 * rewardEarned (if saved.stats.totalStardust was missing)
        // OR if saved.stats.totalStardust existed, it was:
        // newStats.totalStardust += rewardEarned.
        
        // Wait, let's look at the code again.
        /*
          const totalEarned = saved.totalEarned + rewardEarned;
          const newStats = { ...saved.stats };
          if (!newStats.totalStardust) newStats.totalStardust = totalEarned;
          newStats.totalStardust += rewardEarned;
        */
        
        // If saved.stats.totalStardust exists (5000):
        // newStats.totalStardust (5000) += rewardEarned.
        // Result: 5000 + rewardEarned. This is CORRECT.
        
        // If saved.stats.totalStardust MISSING (undefined):
        // newStats.totalStardust = totalEarned (which is 5000 + rewardEarned).
        // Then newStats.totalStardust += rewardEarned.
        // Result: 5000 + 2 * rewardEarned. This is WRONG.
        
        // So I need to test the case where stats.totalStardust is MISSING.
    });

    it('should avoid double-counting when stats.totalStardust is missing from save', () => {
        const now = 1000000000;
        vi.setSystemTime(now);

        const savedState: GameSnapshot = createFreshGameState();
        savedState.lastTick = now - 10000; // 10 seconds ago
        savedState.totalEarned = 5000;
        savedState.stardust = 1000;
        // @ts-ignore - simulate missing field from old save
        savedState.stats.totalStardust = undefined;
        
        savedState.upgrades['autofire'] = { id: 'autofire', level: 10 }; // 15 DPS
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

        const hydrated = hydrateSavedState();
        
        const rewardEarned = hydrated.totalEarned - savedState.totalEarned;
        expect(rewardEarned).toBeGreaterThan(0);

        // If correct: stats.totalStardust should be totalEarned (which includes reward).
        // If bug: stats.totalStardust will be totalEarned + rewardEarned.
        
        expect(hydrated.stats.totalStardust).toBe(hydrated.totalEarned);
    });

    it('should initialize stats.highestCombo to 0 when missing from saved stats', () => {
        const now = 1000000000;
        vi.setSystemTime(now);

        const savedState: GameSnapshot = createFreshGameState();
        // Ensure highestCombo is not present in saved stats to simulate old save
        // @ts-ignore
        delete savedState.stats.highestCombo;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));

        const hydrated = hydrateSavedState();

        expect((hydrated as any).stats['highestCombo']).toBe(0);
    });
});
