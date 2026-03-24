import { describe, it, expect } from 'vitest';
import { createFreshGameState, canPurchaseUpgrade, isUpgradeAtMaxLevel } from '../logic';
import { UPGRADE_DEFS } from '../config';

describe('upgrade caps', () => {
    it('blocks capped upgrades at their max level', () => {
        const def = UPGRADE_DEFS.find((upgrade) => upgrade.id === 'crit');
        expect(def).toBeTruthy();

        const maxLevel = def?.maxLevel ?? 0;
        expect(isUpgradeAtMaxLevel(def!, maxLevel)).toBe(true);
        expect(canPurchaseUpgrade(def!, maxLevel)).toBe(false);
    });

    it('allows uncapped upgrades to continue purchasing below the cap', () => {
        const game = createFreshGameState();
        const def = UPGRADE_DEFS.find((upgrade) => upgrade.id === 'burst');
        expect(def).toBeTruthy();

        const level = game.upgrades[def!.id]?.level ?? 0;
        expect(isUpgradeAtMaxLevel(def!, level)).toBe(false);
        expect(canPurchaseUpgrade(def!, level)).toBe(true);
    });
});