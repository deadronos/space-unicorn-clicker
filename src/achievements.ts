import { GameSnapshot } from "./types";

export interface Achievement {
    id: string;
    name: string;
    description: string;
    condition: (g: GameSnapshot) => boolean;
    // Optional one-time reward applied when the achievement is unlocked
    reward?: { type: 'stardust'; amount: number };
}

export const ACHIEVEMENT_DEFS: Achievement[] = [
    {
        id: "first_click",
        name: "First Contact",
        description: "Click for the first time.",
        condition: (g) => g.stats.totalClicks >= 1,
    },
    {
        id: "stardust_collector",
        name: "Stardust Collector",
        description: "Earn 1,000 total Stardust.",
        condition: (g) => g.stats.totalStardust >= 1000,
    },
    {
        id: "unicorn_army",
        name: "Unicorn Army",
        description: "Have 10 Unicorns.",
        condition: (g) => g.unicornCount >= 10,
    },
    {
        id: "combo_3",
        name: "Combo Novice",
        description: "Reach a 3x combo.",
        condition: (g) => (g.stats?.highestCombo || g.comboCount || 0) >= 3,
        reward: { type: 'stardust', amount: 25 }
    },
    {
        id: "combo_10",
        name: "Combo Adept",
        description: "Reach a 10x combo.",
        condition: (g) => (g.stats?.highestCombo || g.comboCount || 0) >= 10,
        reward: { type: 'stardust', amount: 150 }
    },
    {
        id: "combo_25",
        name: "Combo Master",
        description: "Reach a 25x combo.",
        condition: (g) => (g.stats?.highestCombo || g.comboCount || 0) >= 25,
        reward: { type: 'stardust', amount: 1000 }
    },
    {
        id: "combo_50",
        name: "Combo Legend",
        description: "Reach a 50x combo.",
        condition: (g) => (g.stats?.highestCombo || g.comboCount || 0) >= 50,
        reward: { type: 'stardust', amount: 5000 }
    },
    {
        id: "zone_explorer",
        name: "Zone Explorer",
        description: "Reach Zone 5.",
        condition: (g) => (g.zone || 0) >= 5,
    },
    {
        id: "big_spender",
        name: "Big Spender",
        description: "Buy your first upgrade.",
        condition: (g) => Object.values(g.upgrades).some(u => u.level > 0),
    },
    {
        id: "prestige_novice",
        name: "Rebirth",
        description: "Prestige for the first time.",
        condition: (g) => (g.totalPrestiges || 0) >= 1,
    }
];
