import { describe, it, expect } from 'vitest';
import { createFreshGameState, deriveStats, getGemMultiplier } from '../logic';

describe('deriveStats - prestige bonuses', () => {
    it('applies prestige gem multiplier to loot, dps, and click damage', () => {
        const s = createFreshGameState();
        s.prestigeGems = 100;
        // Base multiplier for 100 gems is 1 + 100 * 0.02 = 3x
        
        // Set some base stats via upgrades or just assume defaults
        // Default clickDamage is 1
        // Default dps is 0, let's add an upgrade to have non-zero DPS
        s.upgrades['autofire'] = { id: 'autofire', level: 10 }; // 15 DPS base
        
        const derived = deriveStats(s);
        
        const expectedMult = getGemMultiplier(100, 0); // 3
        
        expect(derived.lootMultiplier).toBe(expectedMult);
        expect(derived.clickDamage).toBe(1 * expectedMult);
        expect(derived.dps).toBe(15 * expectedMult);
    });

    it('applies prestige gem multiplier with polish artifact', () => {
        const s = createFreshGameState();
        s.prestigeGems = 100;
        s.artifacts = { 'gem_polish': 2 };
        // Multiplier: 1 + 100 * (0.02 + 2 * 0.005) = 1 + 100 * 0.03 = 4x
        
        s.upgrades['autofire'] = { id: 'autofire', level: 10 }; // 15 DPS base
        
        const derived = deriveStats(s);
        
        const expectedMult = getGemMultiplier(100, 2); // 4
        
        expect(derived.lootMultiplier).toBe(expectedMult);
        expect(derived.clickDamage).toBe(1 * expectedMult);
        expect(derived.dps).toBe(15 * expectedMult);
    });
});
