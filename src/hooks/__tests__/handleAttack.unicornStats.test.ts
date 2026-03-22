import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameController } from '../useGameController';

describe('handleAttack - unicorn stats', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('tracks the highest unicorn squad size when a new unicorn spawns', () => {
        const { result } = renderHook(() => useGameController());
        const randomSpy = vi.spyOn(Math, 'random')
            .mockImplementationOnce(() => 0)
            .mockImplementationOnce(() => 0)
            .mockImplementationOnce(() => 0.99);

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

        expect(randomSpy).toHaveBeenCalled();
        expect(result.current.game.unicornCount).toBe(2);
        expect(result.current.game.stats.totalUnicorns).toBe(2);
    });
});
