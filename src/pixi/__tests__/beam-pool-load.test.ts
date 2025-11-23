import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BeamPool } from '../effects/BeamPool';

describe('BeamPool', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('should reuse beams and handle exhaustion under bursts', () => {
        const pool = new BeamPool();
        const duration = 100;
        const burstSize = 50;

        // Spawn a burst of beams
        for (let i = 0; i < burstSize; i++) {
            pool.spawn(duration);
        }

        expect(pool.getActiveCount()).toBe(burstSize);
        expect(pool.getPoolLength()).toBe(0); // All active

        // Advance time to finish all beams
        vi.advanceTimersByTime(duration + 10);

        expect(pool.getActiveCount()).toBe(0);
        expect(pool.getPoolLength()).toBe(burstSize); // All returned to pool

        // Spawn another burst
        const beams = [];
        for (let i = 0; i < burstSize; i++) {
            beams.push(pool.spawn(duration));
        }

        expect(pool.getActiveCount()).toBe(burstSize);
        expect(pool.getPoolLength()).toBe(0); // Reused all

        // Verify reuse (check if IDs are from the first batch, or just that we didn't create new ones if pool was sufficient)
        // Since we don't expose IDs easily without peeking, we rely on pool length behavior.
        // If pool length is 0 after spawning burstSize, and we started with burstSize in pool, we reused them.
    });

    it('should grow pool if demand exceeds supply', () => {
        const pool = new BeamPool();
        const duration = 100;

        // Spawn 10
        for (let i = 0; i < 10; i++) pool.spawn(duration);
        expect(pool.getActiveCount()).toBe(10);

        // Spawn 10 more while first 10 are active
        for (let i = 0; i < 10; i++) pool.spawn(duration);
        expect(pool.getActiveCount()).toBe(20);

        // Finish all
        vi.advanceTimersByTime(duration + 10);
        expect(pool.getPoolLength()).toBe(20);
    });
});
