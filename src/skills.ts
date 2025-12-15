export interface SkillDef {
    id: string;
    name: string;
    description: string;
    cooldown: number; // ms
    duration: number; // ms
    icon: string;
}

export const SKILL_DEFS: SkillDef[] = [
    {
        id: "overcharge",
        name: "Overcharge",
        description: "+100% Click Damage for 10s",
        cooldown: 60000,
        duration: 10000,
        icon: "⚡"
    },
    {
        id: "super_turret",
        name: "Super Turret",
        description: "+200% DPS for 10s",
        cooldown: 120000,
        duration: 10000,
        icon: "🏰"
    },
    {
        id: "lucky_star",
        name: "Lucky Star",
        description: "+50% Crit Chance for 5s",
        cooldown: 90000,
        duration: 5000,
        icon: "🌟"
    }
];
