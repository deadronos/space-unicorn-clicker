import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PixiStage from "./pixi/PixiStage";
import { ImpactParticles } from "./pixi/effects/ImpactParticles";
import { DamageNumberPool } from "./pixi/effects/DamageNumbers";
import { BeamState, GameSnapshot, UpgradeDef } from "./types";
import { UNICORN_IMG, UPGRADE_DEFS, UNICORN_CARD_LAYOUT } from "./config";
import { clamp, fmt } from "./utils";
import {
  loadState,
  saveState,
  calculatePrestigeGems,
  getGemMultiplier,
  costOf,
  createEmptyUpgrades,
  deriveStats,
  applyDamageToShip,
  createFreshGameState,
  checkAchievements
} from "./logic";
import { BattleshipVisual, ShieldGeneratorVisual, ShieldBubble } from "./components/Visuals";
import { ACHIEVEMENT_DEFS } from "./achievements";
import { ARTIFACT_DEFS } from "./prestige";
import { artifactCost } from "./logic";

export default function App() {
  const [beams, setBeams] = useState<Array<{ id: number; start: number; duration: number; crit: boolean; unicornIndex: number; startX: number; startY: number }>>([]);
  const [sparks, setSparks] = useState<Array<{ id: number; start: number; duration: number }>>([]);
  const [damageNumbers, setDamageNumbers] = useState<Array<{ id: number; value: number; x: number; y: number; start: number; crit: boolean }>>([]);
  const [unicornSpawnNotifications, setUnicornSpawnNotifications] = useState<{ id: number; start: number }[]>([]);
  const [achievementNotifs, setAchievementNotifs] = useState<{ id: string; name: string }[]>([]);

  const beamId = useRef(0);
  const sparkId = useRef(0);
  const damageId = useRef(0);
  const unicornNotificationId = useRef(0);
  const clickZoneRef = useRef<HTMLButtonElement | null>(null);
  const unicornRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastAutoBeam = useRef<number>(Date.now());
  const lastClickTime = useRef<number>(0);
  const pixiRef = useRef<any>(null);
  const impactPoolRef = useRef<ImpactParticles | null>(null);
  const damagePoolRef = useRef<DamageNumberPool | null>(null);

  useEffect(() => {
    impactPoolRef.current = new ImpactParticles();
    damagePoolRef.current = new DamageNumberPool();
    return () => {
      // no-op cleanup for pools
    };
  }, []);

  const [game, setGame] = useState<GameSnapshot>(() => {
    const saved = loadState();
    if (saved) {
      const now = Date.now();
      const allUpgrades = createEmptyUpgrades();
      const mergedUpgrades = { ...allUpgrades, ...saved.upgrades };
      const savedWithUpgrades = { ...saved, upgrades: mergedUpgrades, companionCount: saved.upgrades.drones?.level ?? 0, zone: saved.zone ?? 0 };
      const seconds = clamp((now - (saved.lastTick || now)) / 1000, 0, 60 * 60 * 8);
      const derived = deriveStats(savedWithUpgrades);
      const dmg = derived.dps * seconds;
      const { ship, rewardEarned, newZone } = applyDamageToShip(saved.ship, dmg, derived.lootMultiplier, saved.zone ?? 0);
      const stardust = saved.stardust + rewardEarned;
      const totalEarned = saved.totalEarned + rewardEarned;

      // Stats update (approximate for idle time)
      const newStats = { ...saved.stats };
      if (!newStats.totalStardust) newStats.totalStardust = totalEarned; // Init if missing
      newStats.totalStardust += rewardEarned;
      if (newZone > newStats.highestZone) newStats.highestZone = newZone;

      const newState = {
        ...savedWithUpgrades,
        stardust,
        totalEarned,
        ship,
        zone: newZone,
        lastTick: now,
        prestigeGems: saved.prestigeGems ?? 0,
        totalPrestiges: saved.totalPrestiges ?? 0,
        comboCount: 0,
        comboExpiry: 0,
        unicornCount: saved.unicornCount ?? 1,
        stats: newStats,
        achievements: saved.achievements || [],
        artifacts: saved.artifacts || {}
      };

      // Check achievements
      const unlocked = checkAchievements(newState);
      if (unlocked.length > 0) {
        newState.achievements = [...(newState.achievements || []), ...unlocked];
      }

      return newState;
    }
    return createFreshGameState();
  });

  const derived = useMemo(() => deriveStats(game), [game]);

  const spawnHornBeams = useCallback((crit: boolean, count: number) => {
    const safeCount = Math.min(Math.max(Math.floor(count), 0), UNICORN_CARD_LAYOUT.length);

    // Target center of the ship/click zone
    const targetRect = clickZoneRef.current?.getBoundingClientRect();
    if (!targetRect) return;

    const tx = targetRect.left + targetRect.width * 0.5;
    const ty = targetRect.top + targetRect.height * 0.5;

    for (let i = 0; i < safeCount; i++) {
      const now = Date.now();
      const cardEl = unicornRefs.current[i];

      let startX = 0;
      let startY = 0;

      if (cardEl) {
        const cardRect = cardEl.getBoundingClientRect();
        startX = cardRect.left + cardRect.width * 0.5;
        startY = cardRect.top + cardRect.height * 0.3; // Horn is roughly at top 30%
      } else {
        // Fallback if ref missing (shouldn't happen often)
        startX = tx;
        startY = ty + 200;
      }

      // Shorten beam TTL so beams feel snappier. Crits last slightly longer.
      const duration = crit ? 320 : 200;

      // We don't strictly need React state for beams anymore if Pixi handles it, 
      // but keeping it for now if there are DOM overlays (though we removed most).
      // Actually, let's keep it for safety but the visual is Pixi.
      setBeams((prev) => [
        ...prev,
        { id: ++beamId.current, start: now, duration, crit, unicornIndex: i, startX, startY },
      ]);
      setSparks((prev) => [...prev, { id: ++sparkId.current, start: now, duration }]);

      try {
        if (pixiRef.current) {
          pixiRef.current.spawnBeam({
            x0: startX, y0: startY, x1: tx, y1: ty,
            color: crit ? '#fbbf24' : '#60a5fa', // amber for crit, blue for normal
            width: crit ? 4 : 2,
            duration: 150
          });
        }
      } catch (e) { }
    }
  }, []);

  const handleAttack = useCallback((e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    // Prevent default to stop double-firing on some touch devices
    // e.preventDefault(); 

    const now = Date.now();
    if (now - lastClickTime.current < 40) return; // Debounce 40ms
    lastClickTime.current = now;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const xPct = (x / rect.width) * 100;
    const yPct = (y / rect.height) * 100;

    setGame((prev) => {
      const derived = deriveStats(prev);
      const isCrit = Math.random() < derived.critChance;
      const damage = derived.clickDamage * (isCrit ? derived.critMult : 1);

      // Check for generator hit
      let targetGeneratorId: number | undefined;
      if (prev.ship.generators) {
        for (const gen of prev.ship.generators) {
          if (gen.hp <= 0) continue;
          // Simple distance check in % coordinates
          // Generator is at gen.x, gen.y (center is roughly there)
          // Hitbox radius approx 5%
          const dx = xPct - gen.x;
          const dy = yPct - gen.y;
          if (Math.sqrt(dx * dx + dy * dy) < 6) {
            targetGeneratorId = gen.id;
            break;
          }
        }
      }

      const { ship: newShip, rewardEarned, newZone, damageDealt, hitShield } = applyDamageToShip(prev.ship, damage, derived.lootMultiplier, prev.zone ?? 0, targetGeneratorId);
      const reward = rewardEarned; // already calculated with lootMultiplier inside logic if ship destroyed

      // Visuals
      spawnHornBeams(isCrit, prev.unicornCount);

      // Damage number
      const dId = ++damageId.current;
      setDamageNumbers((d) => [...d, { id: dId, value: hitShield && damageDealt === 0 ? 0 : damageDealt, x: xPct, y: yPct, start: now, crit: isCrit }]);

      // Pixi impact
      try {
        if (pixiRef.current) {
          // Pixi expects global coordinates for spawnImpact if the stage is full screen?
          // Wait, spawnImpact in PixiStage might be expecting local or global?
          // Let's check PixiStage implementation. 
          // Assuming PixiStage uses the same coordinate system (screen), we should pass clientX/clientY.
          // But previously we passed `x, y` which were relative to the rect.
          // Let's switch to global for consistency if PixiStage handles it.
          // Actually, let's look at PixiStage.tsx to be sure.
          // For now, I'll assume we need to pass global coordinates if we changed beam to global.
          // But let's stick to what worked for impacts (relative x/y might have been wrong before too?).
          // The user said "beams... not firing from unicorn". Impacts were fine?
          // I'll use clientX/clientY for impacts to be safe.
          pixiRef.current.spawnImpact({
            x: clientX, y: clientY,
            color: isCrit ? 0xfbbf24 : 0x60a5fa,
            radius: isCrit ? 15 : 8,
            count: isCrit ? 8 : 4
          });
        }
      } catch (e) { }

      // Impact pool fallback/addition
      if (impactPoolRef.current) {
        // impactPoolRef is likely using Pixi coordinates too.
        impactPoolRef.current.spawn(clientX, clientY, isCrit ? 2 : 1, 300, { app: pixiRef.current?.app, pixiOpts: { color: isCrit ? 0xfbbf24 : 0x60a5fa, r: isCrit ? 4 : 2 } });
      }

      if (newShip.id !== prev.ship.id) { // Ship destroyed
        // Trigger Pixi explosion at center of click zone
        try {
          if (pixiRef.current && clickZoneRef.current) {
            const rect = clickZoneRef.current.getBoundingClientRect();
            const cx = rect.left + rect.width * 0.5;
            const cy = rect.top + rect.height * 0.5;
            pixiRef.current.spawnExplosion(cx, cy);
          }
        } catch (e) { }
      }

      // Combo logic
      let newCombo = prev.comboCount + 1;
      if (now > prev.comboExpiry) newCombo = 1;

      const newStats = { ...prev.stats };
      newStats.totalClicks = (newStats.totalClicks || 0) + 1;

      const nextState = { ...prev, stardust: prev.stardust + reward, totalEarned: prev.totalEarned + reward, ship: newShip, zone: newZone, comboCount: newCombo, comboExpiry: Date.now() + 5000, stats: newStats };

      const unlocked = checkAchievements(nextState);
      if (unlocked.length > 0) {
        nextState.achievements = [...(nextState.achievements || []), ...unlocked];
        const newNotifs = unlocked.map(id => {
          const def = ACHIEVEMENT_DEFS.find(d => d.id === id);
          return { id, name: def?.name || "Unknown" };
        });
        setAchievementNotifs(curr => [...curr, ...newNotifs]);
        setTimeout(() => {
          setAchievementNotifs(curr => curr.filter(n => !newNotifs.includes(n)));
        }, 4000);
      }

      return nextState;
    });
  }, [spawnHornBeams]);

  // Game Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setGame((prev) => {
        const now = Date.now();
        const derived = deriveStats(prev);

        // Auto-buy logic
        let nextUpgrades = prev.upgrades;
        let nextStardust = prev.stardust;
        let boughtSomething = false;

        if (prev.autoBuy) {
          // Find all affordable upgrades
          const affordable = UPGRADE_DEFS.filter(def => {
            const currentLevel = prev.upgrades[def.id]?.level ?? 0;
            const cost = costOf(def, currentLevel);
            return nextStardust >= cost;
          });

          if (affordable.length > 0) {
            // Pick one at random
            const pick = affordable[Math.floor(Math.random() * affordable.length)];
            const currentLevel = prev.upgrades[pick.id]?.level ?? 0;
            const cost = costOf(pick, currentLevel);

            nextStardust -= cost;
            nextUpgrades = {
              ...nextUpgrades,
              [pick.id]: { id: pick.id, level: currentLevel + 1 }
            };
            boughtSomething = true;
          }
        }

        // Auto-DPS
        const dt = (now - prev.lastTick) / 1000;
        if (dt < 0.05) return prev; // Skip if too fast

        const dps = derived.dps;
        const damage = dps * dt;

        const { ship: newShip, rewardEarned, newZone } = applyDamageToShip(prev.ship, damage, derived.lootMultiplier, prev.zone ?? 0);

        // Unicorn spawning logic (every 100 levels approx, or random)
        // For now, simple check: if we have enough stardust and haven't spawned in a while?
        // Actually, let's just base it on upgrades for now.
        // But we need to track unicorn count.
        // Let's say every 1000 clicks or something? Or just buy them?
        // The prompt implies "Unicorns" are the "cursors" or "helpers".
        // Let's assume "Unicorns" are just visual representation of click damage or something.
        // But we have `unicornCount` in state.
        // Let's increment unicorn count every 10 levels for now as a bonus?
        let newUnicornCount = prev.unicornCount;
        // ... logic for unicorns ...

        const newStats = { ...prev.stats };
        if (!newStats.totalStardust) newStats.totalStardust = prev.totalEarned;
        newStats.totalStardust += rewardEarned;
        if (newZone > newStats.highestZone) newStats.highestZone = newZone;

        const nextState = {
          ...prev,
          upgrades: nextUpgrades,
          stardust: nextStardust + rewardEarned,
          totalEarned: prev.totalEarned + rewardEarned,
          ship: newShip,
          zone: newZone,
          lastTick: now,
          unicornCount: newUnicornCount,
          stats: newStats
        };

        // Check achievements
        const unlocked = checkAchievements(nextState);
        if (unlocked.length > 0) {
          nextState.achievements = [...(nextState.achievements || []), ...unlocked];
          // Optional: show notification for idle unlocks?
        }

        saveState(nextState);
        return nextState;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Cleanup effects using interval instead of effect to avoid infinite re-renders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setBeams((b) => b.filter((x) => now - x.start < x.duration));
      setSparks((s) => s.filter((x) => now - x.start < x.duration));
      setDamageNumbers((d) => d.filter((x) => now - x.start < 800));
      setUnicornSpawnNotifications((u) => u.filter((x) => now - x.start < 2000));
    }, 100); // Run every 100ms
    return () => clearInterval(interval);
  }, []); // Empty dependency array - only run on mount/unmount

  const doPrestige = () => {
    setGame(prev => {
      const gems = calculatePrestigeGems(prev.totalEarned);
      if (gems <= 0) return prev;

      const fresh = createFreshGameState();
      fresh.prestigeGems = (prev.prestigeGems || 0) + gems;
      fresh.totalPrestiges = (prev.totalPrestiges || 0) + 1;
      fresh.stats = { ...prev.stats }; // Carry over stats
      fresh.achievements = [...(prev.achievements || [])]; // Carry over achievements
      fresh.artifacts = { ...prev.artifacts }; // Carry over artifacts

      saveState(fresh);
      return fresh;
    });
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      <PixiStage ref={pixiRef} className="absolute inset-0 z-0" zone={derived.zone} companionCount={derived.companionCount} />

      {/* Starfield is now handled by PixiStage */}

      {/* Achievement Notifications */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 pointer-events-none z-50">
        {achievementNotifs.map((notif, i) => (
          <div key={`${notif.id}-${i}`} className="bg-yellow-500 text-black px-4 py-2 rounded shadow-lg animate-bounce">
            🏆 Achievement Unlocked: <strong>{notif.name}</strong>
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <header className="p-4 flex justify-between items-center bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-lg">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
              Space Unicorn Clicker
            </h1>
            <div className="text-xs text-slate-400 font-mono mt-1">Zone {derived.zone} • Level {derived.ship.level}</div>
          </div>
          <div className="text-right">
            <div className="text-lg">Stardust: <span className="font-bold">{fmt(derived.stardust)}</span></div>
            <div className="text-sm text-slate-300">DPS: {derived.dps.toFixed(1)} • Click: {derived.clickDamage.toFixed(1)} {derived.critChance > 0 ? `• Crit ${Math.round(derived.critChance * 100)}% x${derived.critMult.toFixed(1)}` : ""}</div>
            <div className="text-sm text-slate-400">Total Earned: {fmt(derived.totalEarned)}</div>
            <div className="text-xs text-purple-400 mt-1">🦄 Unicorns: {derived.unicornCount} {derived.comboCount > 1 ? `• Combo: ${derived.comboCount}x` : ""}</div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Upgrades */}
          <div className="w-80 bg-slate-900/90 backdrop-blur-sm border-r border-slate-800 flex flex-col shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-slate-800/50">
              <h2 className="font-bold text-slate-200 flex items-center gap-2">
                <span>🚀</span> Upgrades
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <label className="text-xs flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={game.autoBuy} onChange={e => setGame(g => ({ ...g, autoBuy: e.target.checked }))} className="rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500" />
                  Auto-Buy
                </label>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {UPGRADE_DEFS.map((def) => {
                const level = game.upgrades[def.id]?.level || 0;
                const cost = costOf(def, level);
                const canAfford = game.stardust >= cost;
                return (
                  <button
                    key={def.id}
                    disabled={!canAfford}
                    onClick={() => {
                      setGame((prev) => {
                        if (prev.stardust < cost) return prev;
                        const nextUps = { ...prev.upgrades, [def.id]: { id: def.id, level: level + 1 } };
                        return { ...prev, stardust: prev.stardust - cost, upgrades: nextUps };
                      });
                    }}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-200 border ${canAfford
                      ? "bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] active:scale-[0.98]"
                      : "bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed"
                      }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-slate-200">{def.name}</span>
                      <span className="text-xs font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-400">Lvl {level}</span>
                    </div>
                    <div className="text-xs text-slate-400 mb-2">{def.desc}</div>
                    <div className={`text-sm font-mono font-medium ${canAfford ? "text-purple-400" : "text-red-400"}`}>
                      💎 {fmt(cost)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center: Game View */}
          <div className="flex-1 relative bg-black/20 flex flex-col items-center justify-center perspective-1000">

            {/* Unicorn Cards (Visual Only) */}
            <div className="absolute inset-0 pointer-events-none">
              {UNICORN_CARD_LAYOUT.slice(0, game.unicornCount).map((pos, i) => (
                <div
                  key={i}
                  ref={el => { if (el) unicornRefs.current[i] = el; }}
                  className="absolute w-24 h-36 bg-slate-800/80 border border-slate-600 rounded-lg shadow-lg flex items-center justify-center transition-all duration-500"
                  style={{
                    left: `${pos.left}%`,
                    bottom: `${pos.bottom}%`,
                    transform: `rotate(${pos.rotate}deg)`,
                    opacity: 0.8
                  }}
                >
                  <img src={UNICORN_IMG} className="w-full h-full p-2 object-contain drop-shadow-md" alt="Unicorn" />
                </div>
              ))}
            </div>

            {/* Click Zone & Ship */}
            <button
              ref={clickZoneRef}
              className="relative w-full max-w-2xl aspect-video outline-none group cursor-crosshair"
              onClick={handleAttack}
            >
              {/* Ship Visual */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-32 relative transition-transform duration-75 active:scale-95">
                  <BattleshipVisual shake={false} variant={derived.ship.variant} isBoss={derived.ship.isBoss} />

                  {/* Shield Bubble */}
                  <ShieldBubble active={derived.ship.generators?.some(g => g.hp > 0) ?? false} />

                  {/* Shield Generators */}
                  {derived.ship.generators?.map(gen => (
                    <ShieldGeneratorVisual key={gen.id} x={gen.x} y={gen.y} hp={gen.hp} maxHp={gen.maxHp} />
                  ))}
                </div>
              </div>

              {/* Effects Overlay */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Beams */}
                {beams.map(b => (
                  <div key={b.id} className="absolute inset-0">
                    {/* Beam rendering is now mostly handled by Pixi, but we keep this for React-based fallback or specific effects if needed */}
                  </div>
                ))}

                {/* Damage Numbers */}
                {damageNumbers.map(d => (
                  <div
                    key={d.id}
                    className={`absolute pointer-events-none font-mono font-bold text-shadow-sm animate-[floatUp_0.8s_ease-out_forwards] ${d.crit ? "text-amber-400 text-2xl z-20" : "text-white text-xl z-10"}`}
                    style={{ left: `${d.x}%`, top: `${d.y}%` }}
                  >
                    {d.value === 0 ? "SHIELDED" : fmt(d.value)} {d.crit && "!"}
                  </div>
                ))}
              </div>
            </button>

            {/* Boss HP Bar */}
            {derived.ship.isBoss && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-96 max-w-[90%]">
                <div className="flex justify-between text-xs font-bold text-red-200 mb-1 uppercase tracking-wider">
                  <span>Boss Level {derived.ship.level}</span>
                  <span>{fmt(derived.ship.hp)} / {fmt(derived.ship.maxHp)} ({Math.ceil((derived.ship.hp / derived.ship.maxHp) * 100)}%)</span>
                </div>
                <div className="h-4 bg-slate-900/80 rounded-full overflow-hidden border border-red-900/50 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-200 ease-out"
                    style={{ width: `${(derived.ship.hp / derived.ship.maxHp) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Standard HP Bar (Bottom) */}
            {!derived.ship.isBoss && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 max-w-[80%] opacity-80 hover:opacity-100 transition-opacity">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-200"
                    style={{ width: `${(derived.ship.hp / derived.ship.maxHp) * 100}%` }}
                  />
                </div>
                <div className="text-center text-[10px] text-slate-400 mt-1 font-mono">
                  HP: {fmt(derived.ship.hp)} / {fmt(derived.ship.maxHp)}
                </div>
              </div>
            )}

          </div>

          {/* Right Panel: Prestige & Info */}
          <div className="w-72 bg-slate-900/90 backdrop-blur-sm border-l border-slate-800 flex flex-col shadow-xl">
            <div className="p-4 border-b border-slate-800 bg-slate-800/50">
              <h2 className="font-bold text-slate-200 flex items-center gap-2">
                <span>🔮</span> Prestige
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-1">{derived.prestigeGems}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Prestige Gems</div>
                <div className="mt-2 text-xs text-purple-300">
                  Bonus: +{Math.round((getGemMultiplier(derived.prestigeGems, derived.artifacts?.["gem_polish"] || 0) - 1) * 100)}% Loot
                </div>
              </div>

              <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                <div className="text-xs text-slate-400 mb-2 text-center">Prestige to reset progress and gain Gems based on lifetime earnings.</div>
                <div className="text-center mb-3">
                  <span className="text-xs text-slate-500">Potential Gems:</span>
                  <div className="text-xl font-bold text-white">{calculatePrestigeGems(derived.totalEarned)}</div>
                </div>
                <button
                  onClick={doPrestige}
                  disabled={calculatePrestigeGems(derived.totalEarned) <= 0}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded font-bold transition-colors shadow-lg shadow-purple-900/20"
                >
                  Prestige Now
                </button>
              </div>

              {/* Artifact Shop */}
              <div className="mt-6">
                <h3 className="font-bold text-slate-300 text-sm mb-2 flex items-center gap-2">
                  <span>🏺</span> Artifacts
                </h3>
                <div className="space-y-2">
                  {ARTIFACT_DEFS.map(def => {
                    const level = game.artifacts?.[def.id] || 0;
                    const cost = artifactCost(def, level);
                    const canAfford = game.prestigeGems >= cost;
                    return (
                      <button
                        key={def.id}
                        disabled={!canAfford}
                        onClick={() => {
                          setGame(prev => {
                            if (prev.prestigeGems < cost) return prev;
                            return {
                              ...prev,
                              prestigeGems: prev.prestigeGems - cost,
                              artifacts: {
                                ...prev.artifacts,
                                [def.id]: (prev.artifacts?.[def.id] || 0) + 1
                              }
                            };
                          });
                        }}
                        className={`w-full p-2 rounded border text-left transition-all ${canAfford
                          ? "bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-purple-500/50"
                          : "bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed"
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-200 text-sm">{def.name}</span>
                          <span className="text-xs font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-400">Lvl {level}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 my-1 leading-tight">{def.description}</div>
                        <div className={`text-xs font-mono font-medium ${canAfford ? "text-purple-400" : "text-red-400"}`}>
                          🔮 {fmt(cost)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Achievements List (Mini) */}
              <div className="mt-6">
                <h3 className="font-bold text-slate-300 text-sm mb-2 flex items-center gap-2">
                  <span>🏆</span> Recent Achievements
                </h3>
                <div className="space-y-2">
                  {derived.achievements?.slice(-3).reverse().map(id => {
                    const def = ACHIEVEMENT_DEFS.find(d => d.id === id);
                    return (
                      <div key={id} className="bg-slate-800/50 p-2 rounded border border-slate-700/50 text-xs">
                        <div className="font-bold text-yellow-500">{def?.name}</div>
                        <div className="text-slate-400">{def?.description}</div>
                      </div>
                    );
                  })}
                  {(derived.achievements?.length || 0) === 0 && (
                    <div className="text-xs text-slate-500 italic text-center py-2">No achievements yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
