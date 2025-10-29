
import React, { useEffect, useMemo, useRef, useState } from "react";

const UNICORN_IMG = (import.meta as any).env?.BASE_URL ? `${(import.meta as any).env.BASE_URL}unicorn.jpg` : "/unicorn.jpg";

type Currency = number;

interface Ship {
  level: number;
  hp: number;
  maxHp: number;
  reward: Currency;
  isBoss: boolean;
  variant: 'standard' | 'armored' | 'speed';
}

interface UpgradeDef {
  id: string;
  name: string;
  desc: string;
  baseCost: number;
  costMult: number;
  apply: (state: GameSnapshot) => void;
}

interface UpgradeState { id: string; level: number; }

interface GameSnapshot {
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
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(n, max));
const fmt = (n: number) =>
  n >= 1e12 ? (n / 1e12).toFixed(2) + "T" :
  n >= 1e9 ? (n / 1e9).toFixed(2) + "B" :
  n >= 1e6 ? (n / 1e6).toFixed(2) + "M" :
  n >= 1e3 ? (n / 1e3).toFixed(2) + "K" :
  Math.floor(n).toString();

function shipForLevel(level: number): Ship {
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

const STORAGE_KEY = "space-unicorn-clicker-v2";

function loadState(): GameSnapshot | null {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return null; return JSON.parse(raw) as GameSnapshot; } catch { return null; }
}
function saveState(s: GameSnapshot) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {} }

function calculatePrestigeGems(totalEarned: number): number {
  return Math.floor(Math.sqrt(totalEarned / 1000000));
}

function getGemMultiplier(gems: number): number {
  return 1 + (gems * 0.02);
}

const UPGRADE_DEFS: UpgradeDef[] = [
  { id: "horn", name: "🔥 Horn Laser", desc: "+1 click damage (scales)", baseCost: 10, costMult: 1.15,
    apply: (g) => { const lvl = g.upgrades.horn?.level ?? 0; g.clickDamage = 1 + lvl * 1; } },
  { id: "autofire", name: "⚡ Auto-Fire", desc: "+1 DPS per level", baseCost: 25, costMult: 1.15,
    apply: (g) => { const lvl = g.upgrades.autofire?.level ?? 0; g.dps += lvl * 1; } },
  { id: "mane", name: "✨ Plasma Mane", desc: "+10% loot per level", baseCost: 50, costMult: 1.18,
    apply: (g) => { const lvl = g.upgrades.mane?.level ?? 0; g.lootMultiplier *= 1 + 0.1 * lvl; } },
  { id: "core", name: "⭐ Star Core", desc: "+0.5 DPS and +0.5 click per level", baseCost: 100, costMult: 1.2,
    apply: (g) => { const lvl = g.upgrades.core?.level ?? 0; g.dps += 0.5 * lvl; g.clickDamage += 0.5 * lvl; } },
  { id: "crit", name: "💫 Quasar Focus", desc: "+1% crit chance per level (3x)", baseCost: 150, costMult: 1.22,
    apply: (g) => { const lvl = g.upgrades.crit?.level ?? 0; g.critChance += 0.01 * lvl; } },
  { id: "burst", name: "💥 Burst Fire", desc: "+0.3 click damage per level", baseCost: 250, costMult: 1.25,
    apply: (g) => { const lvl = g.upgrades.burst?.level ?? 0; g.clickDamage += 0.3 * lvl; } },
  { id: "turret", name: "🎯 Auto-Turrets", desc: "+0.8 DPS per level", baseCost: 500, costMult: 1.28,
    apply: (g) => { const lvl = g.upgrades.turret?.level ?? 0; g.dps += 0.8 * lvl; } },
  { id: "chain", name: "⚡ Chain Lightning", desc: "+0.2% crit chance, +0.1 crit mult", baseCost: 800, costMult: 1.3,
    apply: (g) => { const lvl = g.upgrades.chain?.level ?? 0; g.critChance += 0.002 * lvl; g.critMult += 0.1 * lvl; } },
  { id: "momentum", name: "🚀 Momentum", desc: "+5% click and DPS per level", baseCost: 1500, costMult: 1.35,
    apply: (g) => { const lvl = g.upgrades.momentum?.level ?? 0; g.clickDamage *= 1 + 0.05 * lvl; g.dps *= 1 + 0.05 * lvl; } },
  { id: "supernova", name: "🌟 Supernova Core", desc: "+2 DPS and +1 click per level", baseCost: 3000, costMult: 1.4,
    apply: (g) => { const lvl = g.upgrades.supernova?.level ?? 0; g.dps += 2 * lvl; g.clickDamage += 1 * lvl; } },
  { id: "squadron", name: "🦄 Unicorn Squadron", desc: "+1 unicorn, each adds +1.5 DPS", baseCost: 5000, costMult: 1.45,
    apply: (g) => { const lvl = g.upgrades.squadron?.level ?? 0; g.unicornCount = 1 + lvl; g.dps += lvl * 1.5; } },
];

function costOf(def: UpgradeDef, level: number) { return Math.floor(def.baseCost * Math.pow(def.costMult, level)); }

function createEmptyUpgrades(): Record<string, UpgradeState> {
  return Object.fromEntries(UPGRADE_DEFS.map((u) => [u.id, { id: u.id, level: 0 }]));
}

function deriveStats(base: GameSnapshot): GameSnapshot {
  const g: GameSnapshot = { ...base, clickDamage: 1, dps: 0, lootMultiplier: 1, critChance: 0.02, critMult: 3, unicornCount: 1 };
  for (const def of UPGRADE_DEFS) def.apply(g);
  g.critChance = clamp(g.critChance, 0, 0.8);
  g.lootMultiplier *= getGemMultiplier(g.prestigeGems);
  return g;
}

function applyDamageToShip(
  ship: Ship,
  damage: number,
  lootMultiplier: number
): { ship: Ship; rewardEarned: number } {
  let currentShip = { ...ship };
  let totalReward = 0;
  let remaining = damage;
  
  while (remaining > 0) {
    const dealt = Math.min(currentShip.hp, remaining);
    currentShip.hp -= dealt;
    remaining -= dealt;
    
    if (currentShip.hp <= 0) {
      const reward = Math.floor(currentShip.reward * lootMultiplier);
      totalReward += reward;
      currentShip = shipForLevel(currentShip.level + 1);
    }
  }
  
  return { ship: currentShip, rewardEarned: totalReward };
}

function createFreshGameState(): GameSnapshot {
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
  };
}

export default function App() {
  const [beams, setBeams] = useState<{ id: number; start: number; duration: number; crit?: boolean; unicornIndex?: number }[]>([]);
  const [sparks, setSparks] = useState<{ id: number; start: number; duration: number }[]>([]);
  const [damageNumbers, setDamageNumbers] = useState<{ id: number; value: number; x: number; y: number; start: number; crit: boolean }[]>([]);
  const [explosions, setExplosions] = useState<{ id: number; start: number }[]>([]);
  const [unicornSpawnNotifications, setUnicornSpawnNotifications] = useState<{ id: number; start: number }[]>([]);
  const beamId = useRef(0);
  const sparkId = useRef(0);
  const damageId = useRef(0);
  const explosionId = useRef(0);
  const unicornNotificationId = useRef(0);
  const lastAutoBeam = useRef<number>(Date.now());
  const lastClickTime = useRef<number>(0);

  const [game, setGame] = useState<GameSnapshot>(() => {
    const saved = loadState();
    if (saved) {
      const now = Date.now();
      const allUpgrades = createEmptyUpgrades();
      const mergedUpgrades = { ...allUpgrades, ...saved.upgrades };
      const savedWithUpgrades = { ...saved, upgrades: mergedUpgrades };
      const seconds = clamp((now - (saved.lastTick || now)) / 1000, 0, 60 * 60 * 8);
      const derived = deriveStats(savedWithUpgrades);
      const dmg = derived.dps * seconds;
      const { ship, rewardEarned } = applyDamageToShip(saved.ship, dmg, derived.lootMultiplier);
      const stardust = saved.stardust + rewardEarned;
      const totalEarned = saved.totalEarned + rewardEarned;
      return { ...savedWithUpgrades, stardust, totalEarned, ship, lastTick: now, prestigeGems: saved.prestigeGems ?? 0, totalPrestiges: saved.totalPrestiges ?? 0, comboCount: 0, comboExpiry: 0, unicornCount: saved.unicornCount ?? 1 };
    }
    return createFreshGameState();
  });

  const derived = useMemo(() => deriveStats(game), [game]);

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setBeams((bs) => bs.filter((b) => now - b.start < b.duration));
      setSparks((ss) => ss.filter((s) => now - s.start < s.duration));
      setDamageNumbers((dns) => dns.filter((dn) => now - dn.start < 1000));
      setExplosions((exs) => exs.filter((ex) => now - ex.start < 800));
      setUnicornSpawnNotifications((usns) => usns.filter((usn) => now - usn.start < 2000));
      setGame((prev) => {
        if (prev.comboExpiry > 0 && now > prev.comboExpiry) {
          return { ...prev, comboCount: 0, comboExpiry: 0 };
        }
        return prev;
      });
    }, 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setGame((prev) => {
        let g = { ...prev };
        g.lastTick = Date.now();
        const dpsPerTick = derived.dps / 20;
        const { ship, rewardEarned } = applyDamageToShip(g.ship, dpsPerTick, derived.lootMultiplier);
        g.ship = ship;
        g.stardust += rewardEarned;
        g.totalEarned += rewardEarned;
        if (g.autoBuy) {
          let bought = false;
          while (true) {
            bought = false;
            for (const def of UPGRADE_DEFS) {
              const state = g.upgrades[def.id];
              const cost = costOf(def, state.level);
              if (g.stardust >= cost) { g.stardust -= cost; state.level += 1; bought = true; }
            }
            if (!bought) break;
          }
        }
        return g;
      });
      const now = Date.now();
      const intervalMs = Math.max(120, 800 / Math.max(1, derived.dps));
      if (derived.dps > 0 && now - lastAutoBeam.current > intervalMs) {
        lastAutoBeam.current = now;
        // Spawn beams from all unicorns in the squadron
        const unicornCount = Math.min(derived.unicornCount, 5);
        for (let i = 0; i < unicornCount; i++) {
          setBeams((bs) => [...bs, { id: ++beamId.current, start: now, duration: 600, unicornIndex: i }]);
        }
        setSparks((ss) => [...ss, { id: ++sparkId.current, start: now, duration: 600 }]);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [derived.dps, derived.lootMultiplier]);

  useEffect(() => { const id = setInterval(() => saveState(game), 2000); return () => clearInterval(id); }, [game]);

  function spawnBeam(crit = false, unicornIndex = 0) {
    const now = Date.now();
    setBeams((bs) => [...bs, { id: ++beamId.current, start: now, duration: crit ? 700 : 600, crit, unicornIndex }]);
    setSparks((ss) => [...ss, { id: ++sparkId.current, start: now, duration: crit ? 700 : 600 }]);
  }

  function handleAttack(e: React.MouseEvent) {
    e.preventDefault();
    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setGame((prev) => {
      const g = { ...prev };
      const timeSinceLastClick = now - lastClickTime.current;
      
      if (timeSinceLastClick < 2000 && g.comboCount > 0) {
        g.comboCount += 1;
        g.comboExpiry = now + 2000;
      } else if (timeSinceLastClick < 2000) {
        g.comboCount = 2;
        g.comboExpiry = now + 2000;
      } else {
        g.comboCount = 0;
        g.comboExpiry = 0;
      }
      
      const isCrit = Math.random() < derived.critChance;
      const dmg = isCrit ? derived.clickDamage * derived.critMult : derived.clickDamage;
      const shipDestroyed = g.ship.hp <= dmg;
      const { ship, rewardEarned } = applyDamageToShip(g.ship, dmg, derived.lootMultiplier);
      g.ship = ship;
      g.stardust += rewardEarned;
      g.totalEarned += rewardEarned;
      
      if (isCrit && Math.random() < 0.05) {
        g.unicornCount += 1;
        setUnicornSpawnNotifications((usns) => [...usns, { id: ++unicornNotificationId.current, start: now }]);
      }
      
      setDamageNumbers((dns) => [...dns, { id: ++damageId.current, value: dmg, x, y, start: now, crit: isCrit }]);
      if (shipDestroyed) {
        setExplosions((exs) => [...exs, { id: ++explosionId.current, start: now }]);
      }
      
      return g;
    });
    
    lastClickTime.current = now;
    spawnBeam(false);
  }

  function buy(def: UpgradeDef) {
    setGame((prev) => {
      const g = { ...prev };
      const u = g.upgrades[def.id];
      const cost = costOf(def, u.level);
      if (g.stardust >= cost) { g.stardust -= cost; u.level += 1; }
      return g;
    });
  }

  function resetProgress() {
    if (!confirm("Reset all progress?")) return;
    const fresh = createFreshGameState();
    setGame(fresh);
    saveState(fresh);
  }

  function performPrestige() {
    const gemsToAward = calculatePrestigeGems(game.totalEarned);
    if (gemsToAward === 0 || game.totalEarned < 1000000) {
      alert("You need at least 1,000,000 total Stardust earned to prestige!");
      return;
    }
    if (!confirm(`Prestige and reset progress to gain ${gemsToAward} Cosmic Gem${gemsToAward > 1 ? 's' : ''}? This will reset your ship, upgrades, and stardust, but keep your gems for a permanent ${(gemsToAward * 2)}% earnings bonus!`)) return;
    
    const prestiged = {
      ...createFreshGameState(),
      prestigeGems: game.prestigeGems + gemsToAward,
      totalPrestiges: game.totalPrestiges + 1,
      unicornCount: game.unicornCount
    };
    setGame(prestiged); 
    saveState(prestiged);
  }

  const shipPct = (derived.ship.hp / derived.ship.maxHp) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-slate-900 to-black text-slate-100 p-4">
      <style>{`
        @keyframes beamFade {
          0% { opacity: 0; transform: scaleX(0.3); filter: saturate(150%); }
          15% { opacity: 1; transform: scaleX(1); }
          50% { opacity: 1; filter: saturate(180%); }
          100% { opacity: 0; transform: scaleX(1.1); filter: saturate(120%); }
        }
        @keyframes impactFlash { 0% { opacity: 1; } 50% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes shake {
          0% { transform: translate(0,0) rotate(0); }
          20% { transform: translate(1px,-1px) rotate(-.15deg); }
          40% { transform: translate(-1px,1px) rotate(.15deg); }
          60% { transform: translate(1px,1px) rotate(-.15deg); }
          80% { transform: translate(-1px,-1px) rotate(.15deg); }
          100% { transform: translate(0,0) rotate(0); }
        }
        .starfield::before, .starfield::after {
          content: ""; position:absolute; inset:0; pointer-events:none; background-repeat:repeat; background-size:512px 512px; opacity:.35;
        }
        .starfield::before { background-image: radial-gradient(white 1px, transparent 1px); animation: drift1 60s linear infinite; }
        .starfield::after  { background-image: radial-gradient(#93c5fd 1px, transparent 1px); animation: drift2 120s linear infinite; opacity:.25; }
        @keyframes drift1 { from { background-position:0 0; } to { background-position:512px 512px; } }
        @keyframes drift2 { from { background-position:0 0; } to { background-position:-512px -512px; } }
        @keyframes damageFloat {
          0% { transform: translateY(0) scale(0.8); opacity: 0; }
          20% { opacity: 1; transform: translateY(-10px) scale(1.2); }
          100% { transform: translateY(-50px) scale(1); opacity: 0; }
        }
        @keyframes explosion {
          0% { transform: scale(0.5); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes comboPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes unicornSpawn {
          0% { transform: scale(0.5); opacity: 0; }
          20% { transform: scale(1.3); opacity: 1; }
          80% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0; }
        }
      `}</style>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-3 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">🦄 Space Unicorn Clicker</h1>
            <p className="text-slate-300">Raid ironclad battleships with your cosmic horn. Earn Stardust. Auto-upgrade. Profit.</p>
            {game.prestigeGems > 0 && (
              <div className="text-yellow-400 text-sm mt-1">💎 {game.prestigeGems} Cosmic Gem{game.prestigeGems > 1 ? 's' : ''} (+{Math.round((getGemMultiplier(game.prestigeGems) - 1) * 100)}% earnings)</div>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg">Stardust: <span className="font-bold">{fmt(derived.stardust)}</span></div>
            <div className="text-sm text-slate-300">DPS: {derived.dps.toFixed(1)} • Click: {derived.clickDamage.toFixed(1)} {derived.critChance>0?`• Crit ${Math.round(derived.critChance*100)}% x${derived.critMult.toFixed(1)}`:""}</div>
            <div className="text-sm text-slate-400">Total Earned: {fmt(derived.totalEarned)}</div>
            {derived.unicornCount > 1 && (
              <div className="text-purple-400 text-sm mt-1">🦄 {derived.unicornCount} Unicorns in Squadron</div>
            )}
            {game.comboCount >= 3 && (
              <div className="text-amber-400 font-bold text-lg mt-1" style={{ animation: 'comboPulse 0.5s ease-in-out infinite' }}>
                🔥 {game.comboCount}x COMBO!
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-800/60 rounded-2xl p-4 shadow-xl border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xl font-semibold">
                {derived.ship.isBoss ? "⚔️ BOSS" : derived.ship.variant === 'armored' ? "🛡️ ARMORED" : derived.ship.variant === 'speed' ? "⚡ SPEED" : "Enemy"} Battleship — L{derived.ship.level}
              </div>
              <div className="text-sm text-slate-300">HP {fmt(Math.max(0, Math.ceil(derived.ship.hp)))} / {fmt(derived.ship.maxHp)} • Reward {fmt(Math.floor(derived.ship.reward * derived.lootMultiplier))}</div>
            </div>
            <div className="h-3 w-full bg-slate-700 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-indigo-400" style={{ width: `${clamp(shipPct,0,100)}%` }} />
            </div>

            <button
              onClick={handleAttack}
              className="relative w-full aspect-[16/7] overflow-hidden rounded-xl border border-indigo-500/50 bg-[radial-gradient(circle_at_top,rgba(99,102,241,.35),rgba(15,23,42,.6))] flex items-center justify-center hover:scale-[1.01] active:scale-[0.99] transition"
              title="Click to fire your horn laser!"
            >
              <div className="absolute inset-0 starfield z-20">
                {/* Render unicorn cards - each with their own image */}
                {Array.from({ length: Math.min(derived.unicornCount, 5) }).map((_, i) => (
                  <div 
                    key={i}
                    className="absolute bg-slate-800/40 rounded-lg p-2 border border-indigo-400/50 backdrop-blur-sm" 
                    style={{ 
                      left: `${4 + i * 12}%`, 
                      bottom: `${6 + (i % 2) * 10}%`,
                      width: '80px',
                      height: '100px',
                      opacity: 0.9 - i * 0.08,
                      transform: `scale(${1 - i * 0.08})`,
                      boxShadow: '0 0 12px rgba(99,102,241,0.4)'
                    }}
                  >
                    <img 
                      src={UNICORN_IMG} 
                      alt={`Unicorn ${i + 1}`} 
                      className="w-full h-full object-cover rounded select-none"
                      onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display='none';}} 
                    />
                    <div className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {i + 1}
                    </div>
                  </div>
                ))}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-44 h-24">
                  <BattleshipVisual shake={beams.length>0} variant={derived.ship.variant} isBoss={derived.ship.isBoss} />
                </div>
                {beams.map((b) => (<BeamVisual key={b.id} crit={!!b.crit} unicornIndex={b.unicornIndex ?? 0} unicornCount={Math.min(derived.unicornCount, 5)} />))}
                {sparks.map((s) => (<ImpactSparks key={s.id} duration={s.duration} />))}
                {damageNumbers.map((dn) => (
                  <div key={dn.id} className="absolute pointer-events-none font-bold text-2xl" 
                    style={{ 
                      left: `${dn.x}%`, 
                      top: `${dn.y}%`, 
                      color: dn.crit ? '#fbbf24' : '#60a5fa',
                      textShadow: '0 0 8px rgba(0,0,0,0.8)',
                      animation: 'damageFloat 1s ease-out forwards'
                    }}>
                    {dn.crit ? 'CRIT! ' : ''}{fmt(dn.value)}
                  </div>
                ))}
                {explosions.map((ex) => (
                  <div key={ex.id} className="absolute right-4 top-1/2 -translate-y-1/2 w-44 h-24 pointer-events-none">
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 opacity-80" 
                      style={{ animation: 'explosion 0.8s ease-out forwards' }} />
                  </div>
                ))}
                {unicornSpawnNotifications.map((usn) => (
                  <div key={usn.id} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="text-4xl font-bold text-purple-400" 
                      style={{ 
                        textShadow: '0 0 20px rgba(192,132,252,0.8), 0 0 40px rgba(192,132,252,0.5)',
                        animation: 'unicornSpawn 2s ease-out forwards'
                      }}>
                      🦄 NEW UNICORN! 🦄
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center relative z-10">
                <div className="text-5xl">⚡️🦄⚡️</div>
                <div className="text-slate-300">Click to fire your Horn Laser</div>
                <div className="text-xs text-slate-400">(Auto-DPS also fires beams)</div>
              </div>
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-slate-800/60 rounded-2xl p-4 shadow-xl border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Upgrades</h2>
              <label className="text-sm flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={game.autoBuy} onChange={() => setGame({ ...game, autoBuy: !game.autoBuy })} />
                Auto-buy
              </label>
            </div>
            <div className="space-y-2">
              {UPGRADE_DEFS.map((def) => {
                const state = game.upgrades[def.id];
                const cost = costOf(def, state.level);
                const affordable = derived.stardust >= cost;
                return (
                  <div key={def.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{def.name} <span className="text-slate-400">Lv.{state.level}</span></div>
                      <div className="text-xs text-slate-400">{def.desc}</div>
                    </div>
                    <button
                      onClick={() => buy(def)}
                      className={`px-3 py-1 rounded-lg text-sm font-semibold border ${affordable ? "bg-indigo-500/80 border-indigo-400" : "bg-slate-700 border-slate-600 opacity-60"}`}
                      disabled={!affordable}
                    >
                      Buy {fmt(cost)}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 space-y-2">
              {game.totalEarned >= 1000000 && (
                <button 
                  onClick={performPrestige} 
                  className="w-full px-4 py-2 rounded-lg font-bold text-sm bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-900 border-2 border-yellow-400 hover:from-yellow-400 hover:to-amber-500 transition"
                >
                  💎 PRESTIGE ({calculatePrestigeGems(game.totalEarned)} Gems)
                </button>
              )}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <button className="underline" onClick={resetProgress}>Reset Progress</button>
                <div>Loot Mult: x{derived.lootMultiplier.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 text-center text-slate-400 text-xs">
          Tip: Toggle Auto-buy to let the unicorn invest your Stardust automatically while you idle.
        </div>
      </div>
    </div>
  );
}

const BEAM_COLORS = [
  { start: '#a5b4fc', mid: '#60a5fa', end: '#ffffff' }, // Blue
  { start: '#c084fc', mid: '#a855f7', end: '#ffffff' }, // Purple
  { start: '#fb923c', mid: '#f97316', end: '#ffffff' }, // Orange
  { start: '#34d399', mid: '#10b981', end: '#ffffff' }, // Green
  { start: '#fbbf24', mid: '#f59e0b', end: '#ffffff' }, // Yellow
];

function BeamVisual({ crit, unicornIndex = 0, unicornCount = 1 }: { crit: boolean; unicornIndex?: number; unicornCount?: number }) {
  const startX = 4 + unicornIndex * 12 + 4;
  const startY = 100 - (6 + (unicornIndex % 2) * 10 + 6);
  
  const colorScheme = BEAM_COLORS[unicornIndex % BEAM_COLORS.length];
  const uniqueId = `${unicornIndex}-${Date.now()}-${Math.random()}`;
  const duration = crit ? 700 : 600;
  const endX = "85";
  const endY = "50";
  
  const BeamLine = ({ stroke, strokeWidth, strokeOpacity, animation }: { stroke: string; strokeWidth: number; strokeOpacity?: number; animation: string }) => (
    <line
      x1={startX}
      y1={startY}
      x2={endX}
      y2={endY}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeOpacity={strokeOpacity}
      filter={strokeOpacity ? `url(#glow-${uniqueId})` : undefined}
      style={{ opacity: 0, animation }}
    />
  );
  
  return (
    <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`beamGrad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colorScheme.start} stopOpacity="1" />
          <stop offset="50%" stopColor={colorScheme.mid} stopOpacity="1" />
          <stop offset="100%" stopColor={colorScheme.end} stopOpacity="1" />
        </linearGradient>
        <filter id={`glow-${uniqueId}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <BeamLine 
        stroke={colorScheme.mid}
        strokeWidth={crit ? 12 : 10}
        strokeOpacity={0.4}
        animation={`beamFade ${duration}ms cubic-bezier(.1,.5,.1,1) forwards`}
      />
      <BeamLine 
        stroke={`url(#beamGrad-${uniqueId})`}
        strokeWidth={crit ? 6 : 5}
        strokeOpacity={1}
        animation={`beamFade ${duration}ms cubic-bezier(.1,.5,.1,1) forwards`}
      />
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke="#ffffff"
        strokeWidth={crit ? 3 : 2.5}
        style={{ opacity: 0, animation: `beamFade ${duration}ms ease-out forwards` }}
      />
      <circle 
        cx={startX} 
        cy={startY} 
        r={crit ? 4 : 3} 
        fill={colorScheme.start}
        filter={`url(#glow-${uniqueId})`}
        style={{ opacity: .95, animation: `impactFlash ${duration}ms ease-out forwards` }} 
      />
    </svg>
  );
}

function ImpactSparks({ duration }: { duration: number }) {
  const dots = new Array(8).fill(0).map((_, i) => ({ angle: (i / 8) * Math.PI * 2, dist: 8 + (i % 3) * 4 }));
  return (
    <svg className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none" width="64" height="64" viewBox="0 0 64 64">
      {dots.map((d, i) => (
        <circle key={i} cx={48} cy={32} r={1.4} fill="#a5b4fc" style={{ transformOrigin: "48px 32px", transform: `translate(0,0)`, animation: `spark${i} ${Math.max(200, duration - 120)}ms ease-out forwards`, filter: "drop-shadow(0 0 6px rgba(99,102,241,.9))" }} />
      ))}
      <style>{dots.map((d,i)=>`@keyframes spark${i}{0%{transform:translate(0,0);opacity:1}100%{transform:translate(${Math.cos(d.angle)*d.dist}px,${Math.sin(d.angle)*d.dist}px);opacity:0}}`).join("\n")}</style>
    </svg>
  );
}

function BattleshipVisual({ shake, variant, isBoss }: { shake: boolean; variant: 'standard' | 'armored' | 'speed'; isBoss: boolean }) {
  const hullColor = isBoss ? '#dc2626' : variant === 'armored' ? '#1e293b' : variant === 'speed' ? '#334155' : '#0b1220';
  const hullColor2 = isBoss ? '#991b1b' : variant === 'armored' ? '#0f172a' : variant === 'speed' ? '#1e293b' : '#334155';
  const accentColor = isBoss ? '#fbbf24' : variant === 'armored' ? '#475569' : variant === 'speed' ? '#60a5fa' : '#64748b';
  
  return (
    <svg className={`w-full h-full ${shake ? 'animate-[shake_220ms_ease-out]' : ''}`} viewBox="0 0 160 80">
      <defs>
        <linearGradient id={`hull-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={hullColor} />
          <stop offset="100%" stopColor={hullColor2} />
        </linearGradient>
        <radialGradient id={`engine-${variant}`} cx="0.1" cy="0.5" r="0.8">
          <stop offset="0%" stopColor={variant === 'speed' ? '#60a5fa' : '#93c5fd'} stopOpacity="1" />
          <stop offset="100%" stopColor={variant === 'speed' ? '#60a5fa' : '#93c5fd'} stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M10 50 L70 30 L150 40 L100 60 L20 60 Z" fill={`url(#hull-${variant})`} stroke={accentColor} strokeWidth={isBoss ? "2.5" : "1.5"} />
      {variant === 'armored' && (
        <>
          <rect x="60" y="35" width="30" height="20" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1.5" opacity="0.8" />
          <rect x="90" y="38" width="25" height="15" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.5" opacity="0.8" />
        </>
      )}
      <rect x="70" y="24" width={variant === 'speed' ? "12" : "16"} height="10" rx="2" fill="#1f2937" stroke="#94a3b8" />
      {new Array(variant === 'speed' ? 3 : 5).fill(0).map((_,i)=> (<rect key={i} x={78 + i*8} y={44} width="3" height="2" fill="#cbd5e1" opacity={0.8 - i*0.1} />))}
      <circle cx="18" cy="55" r={variant === 'speed' ? "12" : "10"} fill={`url(#engine-${variant})`} />
      <circle cx="18" cy="55" r={variant === 'speed' ? "3" : "2.5"} fill="#e2e8f0" />
      {isBoss && (
        <>
          <rect x="75" y="18" width="8" height="6" fill="#fbbf24" opacity="0.8" />
          <rect x="88" y="18" width="8" height="6" fill="#fbbf24" opacity="0.8" />
        </>
      )}
      <line x1="86" y1="24" x2="90" y2="16" stroke="#94a3b8" strokeWidth="1" />
      <line x1="90" y1="24" x2="95" y2="18" stroke="#94a3b8" strokeWidth="1" />
    </svg>
  );
}
