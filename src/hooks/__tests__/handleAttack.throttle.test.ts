import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameController } from '../useGameController';
import { createFreshGameState } from '../../logic';

// Mock logic functions if needed, but we want to test integration so maybe not.
// But we might want to spy on applyDamageToShip to verify targeting?
// Or just check the game state change.

describe('useGameController - handleAttack', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        localStorage.clear();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('should throttle attacks faster than 40ms', () => {
        const { result } = renderHook(() => useGameController());
        
        // Mock event
        const mockEvent = {
            currentTarget: {
                getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 })
            },
            clientX: 50,
            clientY: 50,
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
        } as unknown as React.MouseEvent<HTMLButtonElement>;

        // First click
        act(() => {
            result.current.handleAttack(mockEvent);
        });

        const clicksAfterFirst = result.current.game.stats.totalClicks;
        expect(clicksAfterFirst).toBe(1);

        // Advance time by 20ms (less than 40ms throttle)
        vi.advanceTimersByTime(20);

        // Second click
        act(() => {
            result.current.handleAttack(mockEvent);
        });

        const clicksAfterSecond = result.current.game.stats.totalClicks;
        expect(clicksAfterSecond).toBe(1); // Should be ignored

        // Advance time by 30ms (total 50ms > 40ms)
        vi.advanceTimersByTime(30);

        // Third click
        act(() => {
            result.current.handleAttack(mockEvent);
        });

        const clicksAfterThird = result.current.game.stats.totalClicks;
        expect(clicksAfterThird).toBe(2); // Should be accepted
    });

    it('should target generator when clicking near it', () => {
        const { result } = renderHook(() => useGameController());
        
        // Setup a ship with a generator
        // We need to modify the state to have a ship with generators.
        // shipForLevel(10) gives a boss with generators.
        act(() => {
            result.current.setGame(prev => {
                const newState = createFreshGameState();
                // Mock a ship with a generator at 50, 50 (center)
                newState.ship = {
                    ...newState.ship,
                    generators: [
                        { id: 99, maxHp: 100, hp: 100, x: 50, y: 50 }
                    ]
                };
                return newState;
            });
        });

        // Click at 50, 50 (center of 100x100 rect)
        // Generator is at x=50, y=50 (percentage).
        // Click at clientX=50, clientY=50 relative to rect(0,0,100,100) is 50%, 50%.
        // Distance should be 0.
        
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

        // Check if generator took damage
        const gen = result.current.game.ship.generators?.[0];
        expect(gen?.hp).toBeLessThan(100);
        // Hull should be full (assuming damage < genHp)
        expect(result.current.game.ship.hp).toBe(result.current.game.ship.maxHp);
    });

    it('should handle touch events', () => {
        const { result } = renderHook(() => useGameController());
        
        const mockTouchEvent = {
            currentTarget: {
                getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 })
            },
            touches: [{ clientX: 50, clientY: 50 }],
            preventDefault: vi.fn(),
            stopPropagation: vi.fn(),
        } as unknown as React.TouchEvent<HTMLButtonElement>;

        act(() => {
            result.current.handleAttack(mockTouchEvent);
        });

        expect(result.current.game.stats.totalClicks).toBe(1);
    });
});
