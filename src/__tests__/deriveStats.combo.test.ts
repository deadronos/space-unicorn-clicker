import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createFreshGameState, deriveStats, computeComboCritChanceBonus, computeComboCritMultBonus, computeComboDpsMultiplier } from '../logic';
import { COMBO_DURATION_MS } from '../config';

describe('deriveStats - combo bonuses', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('applies no combo bonuses when combo expired', () => {
        const now = 1000000000;
        vi.setSystemTime(now);

        const s = createFreshGameState();
        s.upgrades['autofire'] = { id: 'autofire', level: 10 };
        s.comboCount = 5;
        s.comboExpiry = now - 1000;

        const derived = deriveStats(s);

        // autofire level 10 => 1.5 * 10 = 15 DPS
        expect(derived.dps).toBeCloseTo(15);
        expect(derived.critChance).toBeCloseTo(0.02);
        expect((derived as any).comboActive).not.toBeTruthy();
    });

    it('applies combo crit and dps bonuses when combo active', () => {
        const now = 2000000000;
        vi.setSystemTime(now);

        const s = createFreshGameState();
        s.upgrades['autofire'] = { id: 'autofire', level: 10 };

        const comboCount = 15;
        s.comboCount = comboCount;
        s.comboExpiry = now + COMBO_DURATION_MS;

        const baseline = deriveStats({ ...s, comboCount: 0, comboExpiry: 0 } as any);

        const expectedDpsMult = computeComboDpsMultiplier(comboCount);
        const expectedCritBonus = computeComboCritChanceBonus(comboCount);
        const expectedCritMultBonus = computeComboCritMultBonus(comboCount);

        const derived = deriveStats(s as any);

        expect(derived.dps).toBeCloseTo(baseline.dps * expectedDpsMult);
        expect(derived.critChance).toBeCloseTo(Math.min(0.8, baseline.critChance + expectedCritBonus));
        expect(derived.critMult).toBeCloseTo(baseline.critMult + expectedCritMultBonus);

        expect((derived as any).comboActive).toBe(true);
        expect((derived as any).comboDpsMult).toBe(expectedDpsMult);
        expect((derived as any).comboCritChanceBonus).toBe(expectedCritBonus);
        expect((derived as any).comboCritMultBonus).toBe(expectedCritMultBonus);
    });
});
