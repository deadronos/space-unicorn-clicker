import { GameSnapshot, Ship, UpgradeDef, UpgradeState } from "./types";
import { UPGRADE_DEFS, STORAGE_KEY, COMBO_CRIT_CHANCE_PER_STACK, COMBO_CRIT_MULT_PER_TIER, COMBO_CRIT_TIER_SIZE, COMBO_DPS_PER_STACK, COMBO_MAX_DPS_MULT, PRESTIGE_RANK_DAMAGE_BONUS, PRESTIGE_RANK_CRIT_MULT_BONUS, PRESTIGE_RANK_GEM_BONUS } from "./config";
import { clamp, fmt } from "./utils";
import { ACHIEVEMENT_DEFS } from "./achievements";
import { ARTIFACT_DEFS, ArtifactDef } from "./prestige";
import { SKILL_DEFS } from "./skills";

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
        const genHp = Math.ceil(hp * 0.25);
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

export function calculatePrestigeGems(totalEarned: number, totalPrestiges: number = 0): number {
    const base = Math.floor(Math.sqrt(totalEarned / 500000));
    const bonus = 1 + (totalPrestiges * PRESTIGE_RANK_GEM_BONUS);
    return Math.floor(base * bonus);
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

export function isComboActive(s: GameSnapshot, now: number = Date.now()): boolean {
    return (s.comboCount ?? 0) > 0 && (s.comboExpiry ?? 0) > now;
}

export function computeComboCritChanceBonus(comboCount: number): number {
    const count = Math.max(0, comboCount || 0);
    return count * COMBO_CRIT_CHANCE_PER_STACK;
}

export function computeComboCritMultBonus(comboCount: number): number {
    const count = Math.max(0, comboCount || 0);
    const tiers = Math.floor(count / COMBO_CRIT_TIER_SIZE);
    return tiers * COMBO_CRIT_MULT_PER_TIER;
}

export function computeComboDpsMultiplier(comboCount: number): number {
    const count = Math.max(0, comboCount || 0);
    const mult = 1 + count * COMBO_DPS_PER_STACK;
    return Math.min(mult, COMBO_MAX_DPS_MULT);
}

export function tickSkills(game: GameSnapshot, delta: number): GameSnapshot {
    let changed = false;
    const newSkills = { ...(game.skills || {}) };

    // Ensure all skills exist in state
    for (const def of SKILL_DEFS) {
        if (!newSkills[def.id]) {
            newSkills[def.id] = { id: def.id, cooldownRemaining: 0, activeRemaining: 0 };
            changed = true;
        }
    }

    for (const key in newSkills) {
        const skill = { ...newSkills[key] };
        let skillChanged = false;

        if (skill.activeRemaining > 0) {
            skill.activeRemaining = Math.max(0, skill.activeRemaining - delta);
            skillChanged = true;
        }

        if (skill.cooldownRemaining > 0) {
            skill.cooldownRemaining = Math.max(0, skill.cooldownRemaining - delta);
            skillChanged = true;
        }

        if (skillChanged) {
            newSkills[key] = skill;
            changed = true;
        }
    }

    if (!changed) return game;
    return { ...game, skills: newSkills };
}

export function activateSkill(game: GameSnapshot, skillId: string): GameSnapshot {
    const def = SKILL_DEFS.find(s => s.id === skillId);
    if (!def) return game;

    const skill = game.skills?.[skillId] || { id: skillId, cooldownRemaining: 0, activeRemaining: 0 };
    if (skill.cooldownRemaining > 0) return game; // On cooldown
    if (skill.activeRemaining > 0) return game; // Already active

    return {
        ...game,
        skills: {
            ...game.skills,
            [skillId]: {
                id: skillId,
                cooldownRemaining: def.cooldown,
                activeRemaining: def.duration
            }
        }
    };
}

export function deriveStats(base: GameSnapshot): GameSnapshot {
    const g: GameSnapshot = { ...base, clickDamage: 1, dps: 0, lootMultiplier: 1, critChance: 0.02, critMult: 3, companionCount: base.companionCount ?? 0, bossDamageMult: 1 };

    // Apply upgrades
    for (const def of UPGRADE_DEFS) def.apply(g);

    // Apply artifacts
    const artifacts = base.artifacts || {};
    for (const def of ARTIFACT_DEFS) {
        const level = artifacts[def.id] || 0;
        if (level > 0) def.apply(g, level);
    }

    // Prestige Rank Bonuses (Permanent)
    const prestiges = base.totalPrestiges || 0;
    if (prestiges > 0) {
        const dmgBonus = 1 + (prestiges * PRESTIGE_RANK_DAMAGE_BONUS);
        g.dps *= dmgBonus;
        g.clickDamage *= dmgBonus;
        g.critMult += prestiges * PRESTIGE_RANK_CRIT_MULT_BONUS;
    }

    // Combo bonuses
    const now = Date.now();
    if (isComboActive(base, now)) {
        const comboCount = base.comboCount ?? 0;
        const critChanceBonus = computeComboCritChanceBonus(comboCount);
        const critMultBonus = computeComboCritMultBonus(comboCount);
        const dpsMultiplier = computeComboDpsMultiplier(comboCount);

        g.critChance += critChanceBonus;
        g.critMult += critMultBonus;
        g.dps *= dpsMultiplier;

        (g as any).comboActive = true;
        (g as any).comboDpsMult = dpsMultiplier;
        (g as any).comboCritChanceBonus = critChanceBonus;
        (g as any).comboCritMultBonus = critMultBonus;
    }

    // Skills
    if (g.skills) {
        if (g.skills['overcharge']?.activeRemaining > 0) {
            g.clickDamage *= 2;
        }
        if (g.skills['super_turret']?.activeRemaining > 0) {
            g.dps *= 3;
        }
        if (g.skills['lucky_star']?.activeRemaining > 0) {
            g.critChance += 0.5;
        }
    }

    g.critChance = clamp(g.critChance, 0, 0.8);

    // Gem multiplier
    const polishLevel = artifacts["gem_polish"] || 0;
    const gemMult = getGemMultiplier(g.prestigeGems, polishLevel);
    g.lootMultiplier *= gemMult;
    g.dps *= gemMult;
    g.clickDamage *= gemMult;

    // Void Siphon
    const siphonLevel = artifacts["void_siphon"] || 0;
    if (siphonLevel > 0) {
        g.passiveStardustPerSecond = g.ship.reward * g.lootMultiplier * (siphonLevel * 0.001);
    } else {
        g.passiveStardustPerSecond = 0;
    }

    return g;
}

export function applyDamageToShip(
    ship: Ship,
    damage: number,
    lootMultiplier: number,
    currentZone: number,
    targetGeneratorId?: number,
    bossDamageMult: number = 1,
    isClick: boolean = false
): { ship: Ship; rewardEarned: number; newZone: number; damageDealt: number; hitShield: boolean } {
    let currentShip = { ...ship, generators: ship.generators?.map(g => ({ ...g })) ?? [] };
    let totalReward = 0;
    let remaining = damage;
    let newZone = currentZone;
    let damageDealt = 0;
    let hitShield = false;

    const activeGenerators = currentShip.generators.filter(g => g.hp > 0);
    const hasShields = activeGenerators.length > 0;

    if (hasShields) {
        hitShield = true;
        let targetGen = targetGeneratorId ? currentShip.generators.find(g => g.id === targetGeneratorId && g.hp > 0) : null;

        if (!targetGen && !targetGeneratorId) {
            targetGen = activeGenerators[0];
        }

        if (targetGen) {
            let finalDamage = damage;
            if (ship.isBoss) {
                finalDamage *= bossDamageMult;
                if (isClick) {
                    finalDamage *= 5;
                }
            }

            const dealt = Math.min(targetGen.hp, finalDamage);
            targetGen.hp -= dealt;
            remaining -= dealt;
            damageDealt += dealt;
        } else {
            damageDealt = 0;
        }
    } else {
        while (remaining > 0) {
            let finalDamage = remaining;
            if (ship.isBoss) {
                finalDamage *= bossDamageMult;
            }

            const dealt = Math.min(currentShip.hp, finalDamage);
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

export function applyAchievementRewards(s: GameSnapshot, ids: string[]) {
    if (!ids || ids.length === 0) return s;
    for (const id of ids) {
        const def = ACHIEVEMENT_DEFS.find(d => d.id === id);
        if (!def || !def.reward) continue;
        const r = def.reward;
        if (r.type === 'stardust') {
            s.stardust = (s.stardust || 0) + r.amount;
            s.totalEarned = (s.totalEarned || 0) + r.amount;
            if (!s.stats) s.stats = { totalStardust: 0, totalClicks: 0, highestCombo: 0, highestZone: 0, totalUnicorns: 0 } as any;
            s.stats.totalStardust = (s.stats.totalStardust || 0) + r.amount;
        }
    }
    return s;
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
        bossDamageMult: 1,
        ship: shipForLevel(1),
        upgrades: createEmptyUpgrades(),
        skills: {},
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
            highestCombo: 0,
            highestZone: 0,
            totalUnicorns: 1
        }
    };
}

export function performPrestige(prev: GameSnapshot): GameSnapshot | null {
    const gems = calculatePrestigeGems(prev.totalEarned, prev.totalPrestiges);
    if (gems <= 0) return null;

    const fresh = createFreshGameState();
    fresh.prestigeGems = (prev.prestigeGems || 0) + gems;
    fresh.totalPrestiges = (prev.totalPrestiges || 0) + 1;
    fresh.stats = { ...prev.stats };
    fresh.achievements = [...(prev.achievements || [])];
    fresh.artifacts = { ...prev.artifacts };

    const warpLevel = fresh.artifacts["warp_drive"] || 0;
    if (warpLevel > 0) {
        fresh.zone = warpLevel * 5;
        const startLevel = fresh.zone * 10;
        fresh.ship = shipForLevel(startLevel);
    }

    return fresh;
}
