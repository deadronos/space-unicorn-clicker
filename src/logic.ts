import { GameSnapshot, Ship, UpgradeDef, UpgradeState } from "./types";
import { UPGRADE_DEFS, STORAGE_KEY } from "./config";
import { clamp, fmt } from "./utils";

export function shipForLevel(level: number): Ship {
    const isBoss = level % 10 === 0;
    const isArmored = !isBoss && level % 5 === 0;
    const isSpeed = !isBoss && !isArmored && level % 3 === 0;
    const variant = isBoss ? 'standard' : isArmored ? 'armored' : isSpeed ? 'speed' : 'standard';

    const base = 30;
    let hpMult = 1;
    if (isBoss) hpMult = 8;
    else if (isArmored) hpMult = 1.5;
    else if (isSpeed) hpMult = 0.7;

    const hp = Math.floor(base * Math.pow(1.18, level) * hpMult);
    const reward = Math.floor(10 * Math.pow(1.16, level) * (isBoss ? 5 : isArmored ? 1.3 : isSpeed ? 0.9 : 1));
    return { level, maxHp: hp, hp, reward, isBoss, variant };
}

export function loadState(): GameSnapshot | null {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return null; return JSON.parse(raw) as GameSnapshot; } catch { return null; }
}

export function saveState(s: GameSnapshot) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { } }

export function calculatePrestigeGems(totalEarned: number): number {
    return Math.floor(Math.sqrt(totalEarned / 1000000));
}

export function getGemMultiplier(gems: number): number {
    return 1 + (gems * 0.02);
}

export function costOf(def: UpgradeDef, level: number) { return Math.floor(def.baseCost * Math.pow(def.costMult, level)); }

export function createEmptyUpgrades(): Record<string, UpgradeState> {
    return Object.fromEntries(UPGRADE_DEFS.map((u) => [u.id, { id: u.id, level: 0 }]));
}

export function deriveStats(base: GameSnapshot): GameSnapshot {
    const g: GameSnapshot = { ...base, clickDamage: 1, dps: 0, lootMultiplier: 1, critChance: 0.02, critMult: 3, companionCount: base.companionCount ?? 0 };
    for (const def of UPGRADE_DEFS) def.apply(g);
    g.critChance = clamp(g.critChance, 0, 0.8);
    g.lootMultiplier *= getGemMultiplier(g.prestigeGems);
    return g;
}

export function applyDamageToShip(
    ship: Ship,
    damage: number,
    lootMultiplier: number,
    currentZone: number
): { ship: Ship; rewardEarned: number; newZone: number } {
    let currentShip = { ...ship };
    let totalReward = 0;
    let remaining = damage;
    let newZone = currentZone;

    while (remaining > 0) {
        const dealt = Math.min(currentShip.hp, remaining);
        currentShip.hp -= dealt;
        remaining -= dealt;

        if (currentShip.hp <= 0) {
            const reward = Math.floor(currentShip.reward * lootMultiplier);
            totalReward += reward;
            const newLevel = currentShip.level + 1;
            if (newLevel % 10 === 0) {
                newZone = newZone + 1;
            }
            currentShip = shipForLevel(newLevel);
        }
    }

    return { ship: currentShip, rewardEarned: totalReward, newZone };
}

export function createFreshGameState(): GameSnapshot {
    return {
        stardust: 0,
        totalEarned: 0,
        clickDamage: 1,
        dps: 0,
        lootMultiplier: 1,
        critChance: 0.02,
        critMult: 3,
        ship: shipForLevel(1),
        upgrades: createEmptyUpgrades(),
        autoBuy: true,
        lastTick: Date.now(),
        prestigeGems: 0,
        totalPrestiges: 0,
        comboCount: 0,
        comboExpiry: 0,
        unicornCount: 1,
        companionCount: 0,
        zone: 0,
    };
}
