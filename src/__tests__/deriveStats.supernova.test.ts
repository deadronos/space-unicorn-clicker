import { describe, it, expect } from 'vitest';
import { createFreshGameState, deriveStats } from '../logic';

describe('deriveStats - Supernova Core', () => {
    it('applies the advertised DPS and click bonuses per level', () => {
        const base = createFreshGameState();
        base.upgrades.supernova = { id: 'supernova', level: 2 };

        const derived = deriveStats(base);

        expect(derived.dps).toBeCloseTo(4);
        expect(derived.clickDamage).toBeCloseTo(3);
    });
});