import { describe, it, expect } from 'vitest';
import { createFreshGameState, deriveStats } from '../logic';
import { PRESTIGE_RANK_DAMAGE_BONUS, PRESTIGE_RANK_CRIT_MULT_BONUS } from '../config';

describe('deriveStats - prestige rank bonuses', () => {
    it('applies no rank bonuses when totalPrestiges is 0', () => {
        const s = createFreshGameState();
        s.totalPrestiges = 0;
        
        const derived = deriveStats(s);
        
        // Defaults
        expect(derived.dps).toBe(0);
        expect(derived.clickDamage).toBe(1);
        expect(derived.critMult).toBe(3);
    });

    it('applies rank bonuses when totalPrestiges > 0', () => {
        const s = createFreshGameState();
        s.totalPrestiges = 5;
        s.upgrades['autofire'] = { id: 'autofire', level: 10 }; // 15 DPS base
        
        const derived = deriveStats(s);
        
        // Damage Bonus: 1 + 5 * 0.10 = 1.5x
        const dmgMult = 1 + 5 * PRESTIGE_RANK_DAMAGE_BONUS;
        
        expect(derived.dps).toBeCloseTo(15 * dmgMult);
        expect(derived.clickDamage).toBeCloseTo(1 * dmgMult);
        
        // Crit Mult: 3 + 5 * 0.10 = 3.5
        expect(derived.critMult).toBeCloseTo(3 + 5 * PRESTIGE_RANK_CRIT_MULT_BONUS);
    });
});
