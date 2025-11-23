import { UpgradeDef } from "./types";

export const UNICORN_IMG = (import.meta as any).env?.BASE_URL ? `${(import.meta as any).env.BASE_URL}unicorn.jpg` : "/unicorn.jpg";

export const STORAGE_KEY = "space-unicorn-clicker-v2";

export const UPGRADE_DEFS: UpgradeDef[] = [
    {
        id: "horn", name: "🔥 Horn Laser", desc: "+1 click damage (scales)", baseCost: 10, costMult: 1.15,
        apply: (g) => { const lvl = g.upgrades.horn?.level ?? 0; g.clickDamage = 1 + lvl * 1.5; }
    },
    {
        id: "autofire", name: "⚡ Auto-Fire", desc: "+1 DPS per level", baseCost: 25, costMult: 1.15,
        apply: (g) => { const lvl = g.upgrades.autofire?.level ?? 0; g.dps += lvl * 1.5; }
    },
    {
        id: "mane", name: "✨ Plasma Mane", desc: "+10% loot per level", baseCost: 50, costMult: 1.18,
        apply: (g) => { const lvl = g.upgrades.mane?.level ?? 0; g.lootMultiplier *= 1 + 0.1 * lvl; }
    },
    {
        id: "core", name: "⭐ Star Core", desc: "+0.5 DPS and +0.5 click per level", baseCost: 100, costMult: 1.2,
        apply: (g) => { const lvl = g.upgrades.core?.level ?? 0; g.dps += 1 * lvl; g.clickDamage += 1 * lvl; }
    },
    {
        id: "crit", name: "💫 Quasar Focus", desc: "+1% crit chance per level (3x)", baseCost: 150, costMult: 1.22,
        apply: (g) => { const lvl = g.upgrades.crit?.level ?? 0; g.critChance += 0.01 * lvl; }
    },
    {
        id: "burst", name: "💥 Burst Fire", desc: "+0.3 click damage per level", baseCost: 250, costMult: 1.25,
        apply: (g) => { const lvl = g.upgrades.burst?.level ?? 0; g.clickDamage += 0.3 * lvl; }
    },
    {
        id: "turret", name: "🎯 Auto-Turrets", desc: "+0.8 DPS per level", baseCost: 500, costMult: 1.28,
        apply: (g) => { const lvl = g.upgrades.turret?.level ?? 0; g.dps += 0.8 * lvl; }
    },
    {
        id: "chain", name: "⚡ Chain Lightning", desc: "+0.2% crit chance, +0.1 crit mult", baseCost: 800, costMult: 1.3,
        apply: (g) => { const lvl = g.upgrades.chain?.level ?? 0; g.critChance += 0.002 * lvl; g.critMult += 0.1 * lvl; }
    },
    {
        id: "momentum", name: "🚀 Momentum", desc: "+5% click and DPS per level", baseCost: 1500, costMult: 1.35,
        apply: (g) => { const lvl = g.upgrades.momentum?.level ?? 0; g.clickDamage *= 1 + 0.05 * lvl; g.dps *= 1 + 0.05 * lvl; }
    },
    {
        id: "supernova", name: "🌟 Supernova Core", desc: "+2 DPS and +1 click per level", baseCost: 3000, costMult: 1.4,
        apply: (g) => { const lvl = g.upgrades.supernova?.level ?? 0; g.dps += 4 * lvl; g.clickDamage += 2 * lvl; }
    },
    {
        id: "drones", name: "🤖 Companion Drones", desc: "+1 companion drone that auto-fires", baseCost: 5000, costMult: 1.45,
        apply: (g) => {
            const lvl = g.upgrades.drones?.level ?? 0;
            if (lvl > 0) {
                g.companionCount = lvl;
            }
        }
    },
    {
        id: "titan", name: "⚔️ Titan Bane", desc: "+10% damage to bosses per level", baseCost: 1000, costMult: 1.4,
        apply: (g) => { const lvl = g.upgrades.titan?.level ?? 0; g.bossDamageMult += 0.1 * lvl; }
    },
];

export const UNICORN_CARD_LAYOUT = Array.from({ length: 5 }, (_, i) => ({
    left: 4 + i * 12,
    bottom: 6 + (i % 2) * 10,
    rotate: (i - 2) * 5,
}));

export const BEAM_COLORS = [
    { start: '#a5b4fc', mid: '#60a5fa', end: '#ffffff' }, // Blue
    { start: '#c084fc', mid: '#a855f7', end: '#ffffff' }, // Purple
    { start: '#fb923c', mid: '#f97316', end: '#ffffff' }, // Orange
    { start: '#34d399', mid: '#10b981', end: '#ffffff' }, // Green
    { start: '#fbbf24', mid: '#f97316', end: '#ffffff' }, // Yellow
];
