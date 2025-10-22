
import React, { useEffect, useMemo, useRef, useState } from "react";

const UNICORN_IMG = (import.meta as any).env?.BASE_URL ? `${(import.meta as any).env.BASE_URL}unicorn.jpg` : "/unicorn.jpg";

type Currency = number;

interface Ship {
  level: number;
  hp: number;
  maxHp: number;
  reward: Currency;
  isBoss: boolean;
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
  const base = 30;
  const hp = Math.floor(base * Math.pow(1.18, level) * (isBoss ? 8 : 1));
  const reward = Math.floor(10 * Math.pow(1.16, level) * (isBoss ? 5 : 1));
  return { level, maxHp: hp, hp, reward, isBoss };
}

const STORAGE_KEY = "space-unicorn-clicker-v1";

function loadState(): GameSnapshot | null {
  try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return null; return JSON.parse(raw) as GameSnapshot; } catch { return null; }
}
function saveState(s: GameSnapshot) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {} }

const UPGRADE_DEFS: UpgradeDef[] = [
  { id: "horn", name: "Horn Laser", desc: "+1 click damage (scales)", baseCost: 10, costMult: 1.15,
    apply: (g) => { const lvl = g.upgrades.horn?.level ?? 0; g.clickDamage = 1 + lvl * 1; } },
  { id: "autofire", name: "Auto-Fire", desc: "+1 DPS per level", baseCost: 25, costMult: 1.15,
    apply: (g) => { const lvl = g.upgrades.autofire?.level ?? 0; g.dps += lvl * 1; } },
  { id: "mane", name: "Plasma Mane", desc: "+10% loot per level", baseCost: 50, costMult: 1.18,
    apply: (g) => { const lvl = g.upgrades.mane?.level ?? 0; g.lootMultiplier *= 1 + 0.1 * lvl; } },
  { id: "core", name: "Star Core", desc: "+0.5 DPS and +0.5 click per level", baseCost: 100, costMult: 1.2,
    apply: (g) => { const lvl = g.upgrades.core?.level ?? 0; g.dps += 0.5 * lvl; g.clickDamage += 0.5 * lvl; } },
  { id: "crit", name: "Quasar Focus", desc: "+1% crit chance per level (3x)", baseCost: 150, costMult: 1.22,
    apply: (g) => { const lvl = g.upgrades.crit?.level ?? 0; g.critChance += 0.01 * lvl; } },
];

function costOf(def: UpgradeDef, level: number) { return Math.floor(def.baseCost * Math.pow(def.costMult, level)); }

function deriveStats(base: GameSnapshot): GameSnapshot {
  const g: GameSnapshot = { ...base, clickDamage: 1, dps: 0, lootMultiplier: 1, critChance: 0.02, critMult: 3 };
  for (const def of UPGRADE_DEFS) def.apply(g);
  g.critChance = clamp(g.critChance, 0, 0.8);
  return g;
}

export default function App() {
  const [beams, setBeams] = useState<{ id: number; start: number; duration: number; crit?: boolean }[]>([]);
  const [sparks, setSparks] = useState<{ id: number; start: number; duration: number }[]>([]);
  const beamId = useRef(0);
  const sparkId = useRef(0);
  const lastAutoBeam = useRef<number>(Date.now());

  const [game, setGame] = useState<GameSnapshot>(() => {
    const saved = loadState();
    if (saved) {
      const now = Date.now();
      const seconds = clamp((now - (saved.lastTick || now)) / 1000, 0, 60 * 60 * 8);
      const derived = deriveStats(saved);
      const dmg = derived.dps * seconds;
      let ship = { ...saved.ship };
      let stardust = saved.stardust;
      let totalEarned = saved.totalEarned;
      let remaining = dmg;
      while (remaining > 0) {
        const dealt = Math.min(ship.hp, remaining);
        ship.hp -= dealt;
        remaining -= dealt;
        if (ship.hp <= 0) {
          const reward = Math.floor(ship.reward * derived.lootMultiplier);
          stardust += reward; totalEarned += reward; ship = shipForLevel(ship.level + 1);
        }
      }
      return { ...saved, stardust, totalEarned, ship, lastTick: now };
    }
    return {
      stardust: 0, totalEarned: 0, clickDamage: 1, dps: 0, lootMultiplier: 1, critChance: 0.02, critMult: 3,
      ship: shipForLevel(1), upgrades: Object.fromEntries(UPGRADE_DEFS.map((u) => [u.id, { id: u.id, level: 0 }])), autoBuy: true, lastTick: Date.now(),
    };
  });

  const derived = useMemo(() => deriveStats(game), [game]);

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setBeams((bs) => bs.filter((b) => now - b.start < b.duration));
      setSparks((ss) => ss.filter((s) => now - s.start < s.duration));
    }, 100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setGame((prev) => {
        let g = { ...prev };
        g.lastTick = Date.now();
        let ship = { ...g.ship };
        let stardust = g.stardust;
        let totalEarned = g.totalEarned;
        let dpsPerTick = derived.dps / 20;
        let remaining = dpsPerTick;
        while (remaining > 0) {
          const dealt = Math.min(ship.hp, remaining);
          ship.hp -= dealt; remaining -= dealt;
          if (ship.hp <= 0) {
            const reward = Math.floor(ship.reward * derived.lootMultiplier);
            stardust += reward; totalEarned += reward; ship = shipForLevel(ship.level + 1);
          }
        }
        g.ship = ship; g.stardust = stardust; g.totalEarned = totalEarned;
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
        setBeams((bs) => [...bs, { id: ++beamId.current, start: now, duration: 420 }]);
        setSparks((ss) => [...ss, { id: ++sparkId.current, start: now, duration: 420 }]);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [derived.dps, derived.lootMultiplier]);

  useEffect(() => { const id = setInterval(() => saveState(game), 2000); return () => clearInterval(id); }, [game]);

  function spawnBeam(crit = false) {
    const now = Date.now();
    setBeams((bs) => [...bs, { id: ++beamId.current, start: now, duration: crit ? 560 : 400, crit }]);
    setSparks((ss) => [...ss, { id: ++sparkId.current, start: now, duration: crit ? 560 : 400 }]);
  }

  function handleAttack(e: React.MouseEvent) {
    e.preventDefault();
    setGame((prev) => {
      const g = { ...prev };
      const isCrit = Math.random() < derived.critChance;
      const dmg = isCrit ? derived.clickDamage * derived.critMult : derived.clickDamage;
      let ship = { ...g.ship };
      ship.hp -= dmg;
      let stardust = g.stardust;
      let totalEarned = g.totalEarned;
      if (ship.hp <= 0) {
        const reward = Math.floor(ship.reward * derived.lootMultiplier);
        stardust += reward; totalEarned += reward; ship = shipForLevel(ship.level + 1);
      }
      g.ship = ship; g.stardust = stardust; g.totalEarned = totalEarned;
      return g;
    });
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
    const fresh = { stardust: 0, totalEarned: 0, clickDamage: 1, dps: 0, lootMultiplier: 1, critChance: 0.02, critMult: 3,
      ship: shipForLevel(1), upgrades: Object.fromEntries(UPGRADE_DEFS.map((u) => [u.id, { id: u.id, level: 0 }])), autoBuy: true, lastTick: Date.now() } as GameSnapshot;
    setGame(fresh); saveState(fresh);
  }

  const shipPct = (derived.ship.hp / derived.ship.maxHp) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-slate-900 to-black text-slate-100 p-4">
      <style>{`
        @keyframes beamFade {
          0% { opacity: 0; transform: translateY(0) scaleX(0.2) skewY(-1deg); filter: saturate(120%); }
          12% { opacity: 1; transform: translateY(0) scaleX(1) skewY(0); }
          45% { filter: saturate(160%); }
          100% { opacity: 0; transform: translateY(0) scaleX(1.2); filter: saturate(110%); }
        }
        @keyframes impactFlash { 0% { opacity: .95; } 100% { opacity: 0; } }
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
      `}</style>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-3 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">🦄 Space Unicorn Clicker</h1>
            <p className="text-slate-300">Raid ironclad battleships with your cosmic horn. Earn Stardust. Auto-upgrade. Profit.</p>
          </div>
          <div className="text-right">
            <div className="text-lg">Stardust: <span className="font-bold">{fmt(derived.stardust)}</span></div>
            <div className="text-sm text-slate-300">DPS: {derived.dps.toFixed(1)} • Click: {derived.clickDamage.toFixed(1)} {derived.critChance>0?`• Crit ${Math.round(derived.critChance*100)}% x${derived.critMult}`:""}</div>
            <div className="text-sm text-slate-400">Total Earned: {fmt(derived.totalEarned)}</div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-800/60 rounded-2xl p-4 shadow-xl border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xl font-semibold">{derived.ship.isBoss ? "BOSS" : "Enemy"} Battleship — L{derived.ship.level}</div>
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
              <div className="absolute inset-0 starfield">
                <img src={UNICORN_IMG} alt="Space Unicorn" className="absolute left-2 bottom-2 h-40 w-auto object-contain select-none drop-shadow-[0_0_12px_rgba(99,102,241,.6)]"
                  onError={(e)=>{(e.currentTarget as HTMLImageElement).style.display='none';}} />
                <div className="absolute left-4 bottom-6 text-5xl select-none">🦄</div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-44 h-24">
                  <BattleshipVisual shake={beams.length>0} />
                </div>
                {beams.map((b) => (<BeamVisual key={b.id} crit={!!b.crit} />))}
                {sparks.map((s) => (<ImpactSparks key={s.id} duration={s.duration} />))}
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
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <button className="underline" onClick={resetProgress}>Reset Progress</button>
              <div>Loot Mult: x{derived.lootMultiplier.toFixed(2)}</div>
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

function BeamVisual({ crit }: { crit: boolean }) {
  return (
    <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.95" />
          <stop offset="70%" stopColor="#60a5fa" stopOpacity="1" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path d="M10 78 Q 40 65 85 50" stroke="url(#beamGrad)" strokeWidth={crit ? 4.2 : 2.8} filter="url(#glow)" style={{ opacity: 0, transformOrigin: "10% 78%", animation: `beamFade ${crit ? 560 : 400}ms cubic-bezier(.2,.6,.2,1) forwards` }} />
      <path d="M10 78 Q 40 65 85 50" stroke="#eef2ff" strokeWidth={crit ? 2.2 : 1.4} style={{ opacity: 0, animation: `beamFade ${crit ? 560 : 400}ms ease-out forwards` }} />
      <circle cx="10" cy="78" r={crit ? 2.5 : 1.8} fill="#fff" style={{ opacity: .9, filter: "url(#glow)", animation: `impactFlash ${crit ? 560 : 400}ms ease-out forwards` }} />
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

function BattleshipVisual({ shake }: { shake: boolean }) {
  return (
    <svg className={`w-full h-full ${shake ? 'animate-[shake_220ms_ease-out]' : ''}`} viewBox="0 0 160 80">
      <defs>
        <linearGradient id="hull" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0b1220" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <radialGradient id="engine" cx="0.1" cy="0.5" r="0.8">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="1" />
          <stop offset="100%" stopColor="#93c5fd" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M10 50 L70 30 L150 40 L100 60 L20 60 Z" fill="url(#hull)" stroke="#64748b" strokeWidth="1.5" />
      <rect x="70" y="24" width="16" height="10" rx="2" fill="#1f2937" stroke="#94a3b8" />
      {new Array(5).fill(0).map((_,i)=> (<rect key={i} x={78 + i*8} y={44} width="3" height="2" fill="#cbd5e1" opacity={0.8 - i*0.1} />))}
      <circle cx="18" cy="55" r="10" fill="url(#engine)" />
      <circle cx="18" cy="55" r="2.5" fill="#e2e8f0" />
      <line x1="86" y1="24" x2="90" y2="16" stroke="#94a3b8" strokeWidth="1" />
      <line x1="90" y1="24" x2="95" y2="18" stroke="#94a3b8" strokeWidth="1" />
    </svg>
  );
}
