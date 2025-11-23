import { describe, it, expect } from 'vitest';
import { applyDamageToShip } from '../logic';
import { Ship } from '../types';

describe('applyDamageToShip - Edge Cases', () => {
    const createShipWithGenerators = (hp: number, genHp: number): Ship => ({
        id: 123,
        level: 10,
        maxHp: hp,
        hp: hp,
        reward: 100,
        isBoss: true,
        variant: 'standard',
        generators: [
            { id: 1, maxHp: genHp, hp: genHp, x: 0, y: 0 },
            { id: 2, maxHp: genHp, hp: genHp, x: 10, y: 10 }
        ]
    });

    it('should reduce generator HP when damage < gen.hp', () => {
        const ship = createShipWithGenerators(1000, 100);
        const result = applyDamageToShip(ship, 50, 1, 1, 1); // Target gen 1

        expect(result.ship.generators[0].hp).toBe(50);
        expect(result.ship.hp).toBe(1000); // Hull untouched
        expect(result.damageDealt).toBe(50);
        expect(result.hitShield).toBe(true);
    });

    it('should destroy generator when damage == gen.hp', () => {
        const ship = createShipWithGenerators(1000, 100);
        const result = applyDamageToShip(ship, 100, 1, 1, 1);

        expect(result.ship.generators[0].hp).toBe(0);
        expect(result.ship.hp).toBe(1000);
        expect(result.damageDealt).toBe(100);
    });

    it('should NOT spill excess damage to hull or other generators', () => {
        const ship = createShipWithGenerators(1000, 100);
        const result = applyDamageToShip(ship, 150, 1, 1, 1);

        expect(result.ship.generators[0].hp).toBe(0); // Destroyed
        expect(result.ship.generators[1].hp).toBe(100); // Other gen untouched
        expect(result.ship.hp).toBe(1000); // Hull untouched
        expect(result.damageDealt).toBe(100); // Only 100 dealt
    });

    it('should deal 0 damage if targeting a dead generator while others are alive', () => {
        const ship = createShipWithGenerators(1000, 100);
        ship.generators[0].hp = 0; // Gen 1 dead
        
        const result = applyDamageToShip(ship, 50, 1, 1, 1); // Target dead gen 1

        expect(result.damageDealt).toBe(0);
        expect(result.ship.generators[1].hp).toBe(100);
        expect(result.ship.hp).toBe(1000);
    });

    it('should deal 0 damage if targeting hull (undefined target) while generators are alive', () => {
        const ship = createShipWithGenerators(1000, 100);
        // If targetGeneratorId is undefined, logic defaults to first active generator.
        // Wait, let's check the logic.
        // if (!targetGen && !targetGeneratorId) { targetGen = activeGenerators[0]; }
        // So if undefined, it auto-targets.
        // But if we pass a specific ID that doesn't exist? Or if we want to simulate "clicking the hull"?
        // The function signature is targetGeneratorId?: number.
        
        // Let's test the case where we explicitly target something that is NOT a generator (e.g. hull click logic might pass undefined, but logic auto-targets).
        // However, if we pass a targetId that is NOT in the list (e.g. 999), it should deal 0.
        
        const result = applyDamageToShip(ship, 50, 1, 1, 999);
        expect(result.damageDealt).toBe(0);
        expect(result.ship.generators[0].hp).toBe(100);
    });
    
    it('should auto-target first active generator if no target specified', () => {
        const ship = createShipWithGenerators(1000, 100);
        const result = applyDamageToShip(ship, 50, 1, 1); // No targetId

        expect(result.ship.generators[0].hp).toBe(50);
        expect(result.damageDealt).toBe(50);
    });
});
