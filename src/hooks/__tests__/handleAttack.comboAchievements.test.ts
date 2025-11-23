import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameController } from '../useGameController';
import { createFreshGameState } from '../../logic';
import { COMBO_DURATION_MS } from '../../config';

describe('useGameController - combo achievements', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('unlocks combo_3 and grants reward when reaching 3x combo', () => {
        const now = 1_600_000_000;
        vi.setSystemTime(now);

        const { result } = renderHook(() => useGameController());

        // Seed state as if player already has a 2x combo active
        act(() => {
            result.current.setGame(prev => {
                const s = createFreshGameState();
                s.stats.highestCombo = 2;
                s.comboCount = 2;
                s.comboExpiry = Date.now() + COMBO_DURATION_MS;
                return s;
            });
        });

        const mockEvent = {
            currentTarget: {
                getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 })
            },
            clientX: 50,
            clientY: 50,
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
        } as unknown as React.MouseEvent<HTMLButtonElement>;

        act(() => {
            result.current.handleAttack(mockEvent);
        });

        // Achievement should be awarded
        expect(result.current.game.achievements).toContain('combo_3');

        // Reward applied to stardust / stats
        expect(result.current.game.stats.totalStardust).toBeGreaterThanOrEqual(25);
    });
});
