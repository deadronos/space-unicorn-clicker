import { describe, it, expect } from 'vitest';
import { deriveStats, createFreshGameState } from '../logic';
import { COMBO_DURATION_MS } from '../config';

describe('Cosmic Lens Artifact', () => {
    it('should increase crit multiplier based on combo count and artifact level', () => {
        const base = createFreshGameState();
        base.comboCount = 10;
        base.comboExpiry = Date.now() + COMBO_DURATION_MS;
        base.artifacts = { cosmic_lens: 1 };

        const derived = deriveStats(base);

        expect(derived.critMult).toBeCloseTo(3.2);
    });

    it('should scale with artifact level', () => {
        const base = createFreshGameState();
        base.comboCount = 10;
        base.comboExpiry = Date.now() + COMBO_DURATION_MS;
        base.artifacts = { cosmic_lens: 5 };

        const derived = deriveStats(base);

        expect(derived.critMult).toBeCloseTo(3.6);
    });

    it('should not apply if combo is not active', () => {
        const base = createFreshGameState();
        base.comboCount = 10;
        base.comboExpiry = Date.now() - 1000; // Expired
        base.artifacts = { cosmic_lens: 1 };

        const derived = deriveStats(base);

        expect(derived.critMult).toBe(3);
    });
});
