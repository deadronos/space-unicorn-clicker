import { GameSnapshot, Ship, UpgradeDef, UpgradeState } from "./types";
import { UPGRADE_DEFS, STORAGE_KEY } from "./config";
import { clamp, fmt } from "./utils";
import { ACHIEVEMENT_DEFS } from "./achievements";
import { ARTIFACT_DEFS, ArtifactDef } from "./prestige";

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

    const hp = Math.floor(base * Math.pow(1.15, level) * hpMult);
    const reward = Math.floor(10 * Math.pow(1.16, level) * (isBoss ? 5 : isArmored ? 1.3 : isSpeed ? 0.9 : 1));

    let generators: any[] = [];
    if (isBoss) {
        // Spawn 4 generators at corners
        const genHp = Math.ceil(hp * 0.25); // Total generator HP = 100% of boss HP (4 * 25%)
        generators = [
            { id: 1, maxHp: genHp, hp: genHp, x: 10, y: 10 },
            { id: 2, maxHp: genHp, hp: genHp, x: 90, y: 10 },
            { id: 3, maxHp: genHp, hp: genHp, x: 10, y: 90 },
            { id: 4, maxHp: genHp, hp: genHp, x: 90, y: 90 },
        ];
    }

    return { id: Date.now(), level, maxHp: hp, hp, reward, isBoss, variant, generators };
}

export function loadState(): GameSnapshot | null {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return null; return JSON.parse(raw) as GameSnapshot; } catch { return null; }
}

export function saveState(s: GameSnapshot) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { } }

export function calculatePrestigeGems(totalEarned: number): number {
    return Math.floor(Math.sqrt(totalEarned / 500000));
}

export function getGemMultiplier(gems: number, polishLevel: number = 0): number {
    const bonusPerGem = 0.02 + (polishLevel * 0.005);
    return 1 + (gems * bonusPerGem);
}

export function costOf(def: UpgradeDef, level: number) { return Math.floor(def.baseCost * Math.pow(def.costMult, level)); }

export function artifactCost(def: ArtifactDef, level: number) { return Math.floor(def.baseCost * Math.pow(def.costMult, level)); }

export function createEmptyUpgrades(): Record<string, UpgradeState> {
    return Object.fromEntries(UPGRADE_DEFS.map((u) => [u.id, { id: u.id, level: 0 }]));
}

export function deriveStats(base: GameSnapshot): GameSnapshot {
    const g: GameSnapshot = { ...base, clickDamage: 1, dps: 0, lootMultiplier: 1, critChance: 0.02, critMult: 3, companionCount: base.companionCount ?? 0 };

    // Apply upgrades
    for (const def of UPGRADE_DEFS) def.apply(g);

    // Apply artifacts
    const artifacts = base.artifacts || {};
    for (const def of ARTIFACT_DEFS) {
        const level = artifacts[def.id] || 0;
        if (level > 0) def.apply(g, level);
    }

    g.critChance = clamp(g.critChance, 0, 0.8);

    // Gem multiplier (using Gem Polish artifact if present)
    const polishLevel = artifacts["gem_polish"] || 0;
    g.lootMultiplier *= getGemMultiplier(g.prestigeGems, polishLevel);

    return g;
}

export function applyDamageToShip(
    ship: Ship,
    damage: number,
    lootMultiplier: number,
    currentZone: number,
    targetGeneratorId?: number // Optional: specific generator to target
): { ship: Ship; rewardEarned: number; newZone: number; damageDealt: number; hitShield: boolean } {
    let currentShip = { ...ship, generators: ship.generators?.map(g => ({ ...g })) ?? [] };
    let totalReward = 0;
    let remaining = damage;
    let newZone = currentZone;
    let damageDealt = 0;
    let hitShield = false;

    // Check for active generators
    const activeGenerators = currentShip.generators.filter(g => g.hp > 0);
    const hasShields = activeGenerators.length > 0;

    if (hasShields) {
        hitShield = true;
        // If a specific generator is targeted and exists/active
        let targetGen = targetGeneratorId ? currentShip.generators.find(g => g.id === targetGeneratorId && g.hp > 0) : null;

        // If no specific target (e.g. auto-dps), pick the first active one
        if (!targetGen && !targetGeneratorId) {
            targetGen = activeGenerators[0];
        }

        if (targetGen) {
            const dealt = Math.min(targetGen.hp, remaining);
            targetGen.hp -= dealt;
            remaining -= dealt; // Excess damage is lost (doesn't spill over to hull or other gens)
            damageDealt += dealt;
        } else {
            // Targeted hull or dead generator while shields are up -> 0 damage
            damageDealt = 0;
        }
    } else {
        // No shields, damage hull
        while (remaining > 0) {
            const dealt = Math.min(currentShip.hp, remaining);
            currentShip.hp -= dealt;
            remaining -= dealt;
            damageDealt += dealt;

            if (currentShip.hp <= 0) {
                const reward = Math.floor(currentShip.reward * lootMultiplier);
                totalReward += reward;
                const newLevel = currentShip.level + 1;
                if (newLevel % 10 === 0) {
                    newZone = newZone + 1;
                }
                currentShip = shipForLevel(newLevel);
                // Break loop as we have a new ship
                remaining = 0;
            }
        }
    }

    return { ship: currentShip, rewardEarned: totalReward, newZone, damageDealt, hitShield };
}

export function checkAchievements(g: GameSnapshot): string[] {
    const newUnlocks: string[] = [];
    for (const def of ACHIEVEMENT_DEFS) {
        if (!g.achievements.includes(def.id)) {
            if (def.condition(g)) {
                newUnlocks.push(def.id);
            }
        }
    }
    return newUnlocks;
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
        achievements: [],
        artifacts: {},
        stats: {
            totalStardust: 0,
            totalClicks: 0,
            highestZone: 0,
            totalUnicorns: 1
        }
    };
}
