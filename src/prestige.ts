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
            // Handled in getGemMultiplier logic directly
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
    },
    {
        id: "void_siphon",
        name: "Void Siphon",
        description: "Gain 0.1% of current enemy drop value per second.",
        baseCost: 100,
        costMult: 1.5,
        apply: (g, level) => {
            // Handled in deriveStats
        }
    },
    {
        id: "gem_fortune",
        name: "Gem Fortune",
        description: "Lucky Gem drops yield 1 to [Level] gems.",
        baseCost: 100,
        costMult: 2.0,
        apply: (g, level) => {
            // Handled in handleAttack
        }
    },
    {
        id: "chrono_resonance",
        name: "Chrono Resonance",
        description: "Reduces active skill cooldowns by 10% per level.",
        baseCost: 150,
        costMult: 1.8,
        apply: (g, level) => {
            // Handled in deriveStats and activateSkill
        }
    },
    {
        id: "cosmic_lens",
        name: "Cosmic Lens",
        description: "Increases Crit Multiplier by 0.01x per combo stack per level.",
        baseCost: 200,
        costMult: 1.8,
        apply: (g, level) => {
            // Handled in deriveStats
        }
    }
];
