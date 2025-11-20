export type Currency = number;

export interface ShieldGenerator {
    id: number;
    maxHp: number;
    hp: number;
    x: number;
    y: number;
}

export interface Ship {
    level: number;
    hp: number;
    maxHp: number;
    reward: Currency;
    isBoss: boolean;
    variant: 'standard' | 'armored' | 'speed';
    generators: ShieldGenerator[];
}

export interface UpgradeDef {
    id: string;
    name: string;
    desc: string;
    baseCost: number;
    costMult: number;
    apply: (state: GameSnapshot) => void;
}

export interface UpgradeState { id: string; level: number; }

export interface GameSnapshot {
    stardust: Currency;
    totalEarned: Currency;
    clickDamage: number;
    dps: number;
    lootMultiplier: number;
    critChance: number;
    critMult: number;
    ship: Ship;
    upgrades: Record<string, UpgradeState>;
    autoBuy: boolean;
    lastTick: number;
    prestigeGems: number;
    totalPrestiges: number;
    comboCount: number;
    comboExpiry: number;
    unicornCount: number;
    companionCount: number;
    zone: number;
}

export interface BeamState {
    id: number;
    start: number;
    duration: number;
    crit?: boolean;
    unicornIndex?: number;
    startX: number;
    startY: number;
}
