import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameController } from '../useGameController';
import { createFreshGameState } from '../../logic';
import { COMBO_DURATION_MS } from '../../config';

describe('useGameController - combo chime', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        // Ensure global Audio mock cleaned
        try { delete (globalThis as any).Audio; } catch (e) { }
    });

    it('plays combo chime when combo increments', () => {
        const playMock = vi.fn();
        (globalThis as any).Audio = function () { return { play: playMock }; } as any;

        const { result } = renderHook(() => useGameController());

        act(() => {
            result.current.setGame(prev => {
                const s = createFreshGameState();
                s.comboCount = 1;
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

        expect(playMock).toHaveBeenCalled();
    });
});
