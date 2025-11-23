import { describe, it, expect } from 'vitest';
import { applyDamageToShip, shipForLevel } from '../logic';

describe('Boss Damage Logic', () => {
    it('applies boss damage multiplier to hull damage', () => {
        const bossShip = shipForLevel(10); // Level 10 is a boss
        expect(bossShip.isBoss).toBe(true);

        const initialHp = bossShip.hp;
        const baseDamage = 10;
        const mult = 2.0;

        const result = applyDamageToShip(bossShip, baseDamage, 1, 0, undefined, mult, false);

        // Damage should be baseDamage * mult
        const expectedDamage = baseDamage * mult;
        expect(result.damageDealt).toBe(expectedDamage);
        // Boss has shields, so damage goes to generator, not hull
        expect(result.ship.hp).toBe(initialHp);
        expect(result.ship.generators[0].hp).toBeLessThan(result.ship.generators[0].maxHp);
    });

    it('does not apply boss damage multiplier to non-boss ships', () => {
        const normalShip = shipForLevel(1);
        expect(normalShip.isBoss).toBe(false);

        const initialHp = normalShip.hp;
        const baseDamage = 10;
        const mult = 2.0;

        const result = applyDamageToShip(normalShip, baseDamage, 1, 0, undefined, mult, false);

        // Damage should be just baseDamage
        expect(result.damageDealt).toBe(baseDamage);
        expect(result.ship.hp).toBe(initialHp - baseDamage);
    });

    it('applies 5x bonus when clicking a generator on a boss', () => {
        const bossShip = shipForLevel(10);
        expect(bossShip.generators.length).toBeGreaterThan(0);
        const genId = bossShip.generators[0].id;
        const genInitialHp = bossShip.generators[0].hp;

        const baseDamage = 10;
        const mult = 1.0;

        const result = applyDamageToShip(bossShip, baseDamage, 1, 0, genId, mult, true); // isClick = true

        // Damage should be baseDamage * 5
        const expectedDamage = baseDamage * 5;
        expect(result.damageDealt).toBe(expectedDamage);
        expect(result.ship.generators[0].hp).toBe(genInitialHp - expectedDamage);
    });

    it('applies both boss damage multiplier and 5x click bonus on generator', () => {
        const bossShip = shipForLevel(10);
        const genId = bossShip.generators[0].id;
        const genInitialHp = bossShip.generators[0].hp;

        const baseDamage = 10;
        const mult = 2.0;

        const result = applyDamageToShip(bossShip, baseDamage, 1, 0, genId, mult, true);

        // Damage should be baseDamage * mult * 5
        const expectedDamage = baseDamage * mult * 5;
        expect(result.damageDealt).toBe(expectedDamage);
        expect(result.ship.generators[0].hp).toBe(genInitialHp - expectedDamage);
    });

    it('does not apply 5x bonus when not clicking (DPS) on generator', () => {
        const bossShip = shipForLevel(10);
        const genId = bossShip.generators[0].id;
        const genInitialHp = bossShip.generators[0].hp;

        const baseDamage = 10;
        const mult = 1.0;

        const result = applyDamageToShip(bossShip, baseDamage, 1, 0, genId, mult, false); // isClick = false

        // Damage should be just baseDamage (assuming boss mult is 1)
        expect(result.damageDealt).toBe(baseDamage);
        expect(result.ship.generators[0].hp).toBe(genInitialHp - baseDamage);
    });
});
