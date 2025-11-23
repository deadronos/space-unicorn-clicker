import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameController } from '../useGameController';
import { createFreshGameState } from '../../logic';

describe('useGameController - doPrestige', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('should reset game state and award gems on prestige', () => {
        const { result } = renderHook(() => useGameController());

        // Setup state ready for prestige
        // 500,000 totalEarned = 1 gem
        act(() => {
            result.current.setGame(prev => ({
                ...prev,
                totalEarned: 500000,
                stardust: 500000,
                upgrades: { 'horn': { id: 'horn', level: 10 } }, // Should be wiped
                artifacts: { 'gem_polish': 1 }, // Should be kept
                achievements: ['first_click'], // Should be kept
                stats: { ...prev.stats, totalClicks: 100 } // Should be kept? Logic says fresh.stats = { ...prev.stats }
            }));
        });

        // Verify setup
        expect(result.current.game.totalEarned).toBe(500000);
        expect(result.current.game.upgrades['horn'].level).toBe(10);

        // Perform prestige
        act(() => {
            result.current.doPrestige();
        });

        const newGame = result.current.game;

        // Assertions
        expect(newGame.prestigeGems).toBe(1); // 0 + 1
        expect(newGame.totalPrestiges).toBe(1);
        expect(newGame.totalEarned).toBe(0); // Reset
        expect(newGame.stardust).toBe(0); // Reset
        expect(newGame.upgrades['horn'].level).toBe(0); // Reset
        
        // Preserved items
        expect(newGame.artifacts['gem_polish']).toBe(1);
        expect(newGame.achievements).toContain('first_click');
        expect(newGame.stats.totalClicks).toBe(100);
    });

    it('should do nothing if potential gems are 0', () => {
        const { result } = renderHook(() => useGameController());

        // Setup state NOT ready for prestige
        act(() => {
            result.current.setGame(prev => ({
                ...prev,
                totalEarned: 100,
                upgrades: { 'horn': { id: 'horn', level: 5 } }
            }));
        });

        act(() => {
            result.current.doPrestige();
        });

        const newGame = result.current.game;

        // Should be unchanged
        expect(newGame.totalEarned).toBe(100);
        expect(newGame.upgrades['horn'].level).toBe(5);
        expect(newGame.totalPrestiges).toBe(0);
    });
});
