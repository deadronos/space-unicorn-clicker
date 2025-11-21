import { GameSnapshot } from "./types";

export interface ArtifactDef {
    id: string;
    name: string;
    description: string;
    baseCost: number;
    costMult: number;
    maxLevel?: number;
    apply: (g: GameSnapshot, level: number) => void;
}

export const ARTIFACT_DEFS: ArtifactDef[] = [
    {
        id: "gem_polish",
        name: "Gem Polish",
        description: "Increases the bonus of each unspent Prestige Gem by +0.5%.",
        baseCost: 10,
        costMult: 1.5,
        apply: (g, level) => {
            // Handled in getGemMultiplier logic directly usually, or we set a modifier in state
            // For now, let's say we store a 'gemBonus' multiplier in state?
            // Or we just read this artifact level in logic.ts
        }
    },
    {
        id: "warp_drive",
        name: "Warp Drive",
        description: "Start at a higher zone after prestige (+5 zones per level).",
        baseCost: 50,
        costMult: 2.0,
        apply: (g, level) => {
            // Handled in createFreshGameState or prestige logic
        }
    },
    {
        id: "essence_reaver",
        name: "Essence Reaver",
        description: "Enemies drop +10% more Stardust per level.",
        baseCost: 25,
        costMult: 1.4,
        apply: (g, level) => {
            g.lootMultiplier *= (1 + 0.1 * level);
        }
    },
    {
        id: "chrono_battery",
        name: "Chrono Battery",
        description: "Auto-DPS is 10% more effective.",
        baseCost: 100,
        costMult: 1.6,
        apply: (g, level) => {
            g.dps *= (1 + 0.1 * level);
        }
    }
];
