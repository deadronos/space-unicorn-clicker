import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DamageNumberPool } from '../effects/DamageNumbers';

describe('DamageNumberPool', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('should reuse damage numbers and release correctly', () => {
        const pool = new DamageNumberPool();
        const duration = 300;

        // Spawn one
        const d1 = pool.spawn(100, duration);
        expect(pool.getActiveCount()).toBe(1);
        expect(pool.getPoolLength()).toBe(1);

        // Wait for finish
        vi.advanceTimersByTime(duration + 10);

        expect(pool.getActiveCount()).toBe(0);
        expect(pool.getPoolLength()).toBe(1); // Still in pool, but inactive

        // Spawn again
        const d2 = pool.spawn(200, duration);
        expect(d2).toBe(d1); // Should reuse the same instance
        expect(pool.getActiveCount()).toBe(1);
        expect(pool.getPoolLength()).toBe(1);
    });

    it('should handle missing app/pixiOpts gracefully', () => {
        const pool = new DamageNumberPool();
        // Should not throw
        expect(() => pool.spawn(100, 300)).not.toThrow();
        expect(() => pool.spawn(100, 300, { app: null })).not.toThrow();
    });
});
