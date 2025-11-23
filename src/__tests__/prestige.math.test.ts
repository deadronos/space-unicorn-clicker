import { describe, it, expect } from 'vitest';
import { calculatePrestigeGems, getGemMultiplier } from '../logic';

describe('Prestige Math', () => {
    describe('calculatePrestigeGems', () => {
        // Formula: floor(sqrt(totalEarned / 500000))
        
        it('should return 0 for values below threshold', () => {
            expect(calculatePrestigeGems(0)).toBe(0);
            expect(calculatePrestigeGems(499999)).toBe(0);
        });

        it('should return 1 for values at or just above threshold', () => {
            expect(calculatePrestigeGems(500000)).toBe(1);
            expect(calculatePrestigeGems(500001)).toBe(1);
            // Next threshold: sqrt(x/500000) = 2 => x/500000 = 4 => x = 2,000,000
            expect(calculatePrestigeGems(1999999)).toBe(1);
        });

        it('should return correct gems for higher values', () => {
            expect(calculatePrestigeGems(2000000)).toBe(2); // sqrt(4) = 2
            expect(calculatePrestigeGems(4500000)).toBe(3); // sqrt(9) = 3
            expect(calculatePrestigeGems(50000000)).toBe(10); // sqrt(100) = 10
        });

        it('should apply rank bonus correctly', () => {
            // Base gems = 10 (from 50,000,000)
            // Rank 100 => +10% bonus (100 * 0.001 = 0.1)
            // Total = floor(10 * 1.1) = 11
            expect(calculatePrestigeGems(50000000, 100)).toBe(11);

            // Rank 1000 => +100% bonus (1000 * 0.001 = 1.0)
            // Total = floor(10 * 2.0) = 20
            expect(calculatePrestigeGems(50000000, 1000)).toBe(20);
        });
    });

    describe('getGemMultiplier', () => {
        // Formula: 1 + (gems * (0.02 + polishLevel * 0.005))
        
        it('should return 1 with 0 gems', () => {
            expect(getGemMultiplier(0, 0)).toBe(1);
            expect(getGemMultiplier(0, 10)).toBe(1);
        });

        it('should calculate base multiplier correctly (no polish)', () => {
            // 0.02 per gem
            expect(getGemMultiplier(100, 0)).toBeCloseTo(3); // 1 + 100 * 0.02 = 3
            expect(getGemMultiplier(50, 0)).toBeCloseTo(2); // 1 + 50 * 0.02 = 2
        });

        it('should calculate multiplier with polish levels', () => {
            // Polish level 1: 0.02 + 0.005 = 0.025 per gem
            expect(getGemMultiplier(100, 1)).toBeCloseTo(3.5); // 1 + 100 * 0.025 = 3.5
            
            // Polish level 4: 0.02 + 4 * 0.005 = 0.04 per gem
            expect(getGemMultiplier(100, 4)).toBeCloseTo(5); // 1 + 100 * 0.04 = 5
        });
    });
});
