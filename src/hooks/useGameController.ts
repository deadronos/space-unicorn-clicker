import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImpactParticles } from "../pixi/effects/ImpactParticles";
import { DamageNumberPool } from "../pixi/effects/DamageNumbers";
import type { BeamState, GameSnapshot } from "../types";
import { COMBO_DURATION_MS } from "../config";
import { ACHIEVEMENT_DEFS } from "../achievements";
import {
  applyDamageToShip,
  calculatePrestigeGems,
  checkAchievements,
  applyAchievementRewards,
  costOf,
  createEmptyUpgrades,
  createFreshGameState,
  deriveStats,
  loadState,
  saveState
} from "../logic";
import { UNICORN_CARD_LAYOUT, UPGRADE_DEFS } from "../config";
import { clamp } from "../utils";

type AttackEvent = React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>;

export function hydrateSavedState(): GameSnapshot {
  const saved = loadState();
  if (!saved) return createFreshGameState();

  const now = Date.now();
  const allUpgrades = createEmptyUpgrades();
  const mergedUpgrades = { ...allUpgrades, ...saved.upgrades };
  const savedWithUpgrades = { ...saved, upgrades: mergedUpgrades, companionCount: saved.upgrades.drones?.level ?? 0, zone: saved.zone ?? 0 };
  const seconds = clamp((now - (saved.lastTick || now)) / 1000, 0, 60 * 60 * 8);
  const derived = deriveStats(savedWithUpgrades);
  const dmg = derived.dps * seconds;
  const { ship, rewardEarned, newZone } = applyDamageToShip(saved.ship, dmg, derived.lootMultiplier, saved.zone ?? 0, undefined, derived.bossDamageMult, false);
  const stardust = saved.stardust + rewardEarned;
  const totalEarned = saved.totalEarned + rewardEarned;

  const newStats = { ...(saved.stats || {}) };
  // Ensure highestCombo exists on older saves (fallback to saved.comboCount)
  newStats.highestCombo = saved.stats?.highestCombo ?? saved.comboCount ?? 0;
  if (newStats.totalStardust === undefined) newStats.totalStardust = saved.totalEarned;
  newStats.totalStardust += rewardEarned;
  if (newZone > newStats.highestZone) newStats.highestZone = newZone;

  const newState: GameSnapshot = {
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

  const unlocked = checkAchievements(newState);
  if (unlocked.length > 0) {
    applyAchievementRewards(newState, unlocked);
    newState.achievements = [...(newState.achievements || []), ...unlocked];
  }

  return newState;
}

export function useGameController() {
  const [beams, setBeams] = useState<BeamState[]>([]);
  const [, setSparks] = useState<Array<{ id: number; start: number; duration: number }>>([]);
  const [, setUnicornSpawnNotifications] = useState<{ id: number; start: number }[]>([]);
  const [achievementNotifs, setAchievementNotifs] = useState<{ id: string; name: string }[]>([]);

  const beamId = useRef(0);
  const sparkId = useRef(0);
  const unicornNotificationId = useRef(0);
  const clickZoneRef = useRef<HTMLButtonElement | null>(null);
  const unicornRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastClickTime = useRef<number>(0);
  const pixiRef = useRef<any>(null);
  const impactPoolRef = useRef<ImpactParticles | null>(null);
  const damagePoolRef = useRef<DamageNumberPool | null>(null);

  useEffect(() => {
    impactPoolRef.current = new ImpactParticles();
    damagePoolRef.current = new DamageNumberPool();
  }, []);

  const [game, setGame] = useState<GameSnapshot>(hydrateSavedState);
  const derived = useMemo(() => deriveStats(game), [game]);

  const spawnHornBeams = useCallback((crit: boolean, count: number) => {
    const safeCount = Math.min(Math.max(Math.floor(count), 0), UNICORN_CARD_LAYOUT.length);
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
        startY = cardRect.top + cardRect.height * 0.3;
      } else {
        startX = tx;
        startY = ty + 200;
      }

      const duration = crit ? 320 : 200;

      setBeams((prev) => [
        ...prev,
        { id: ++beamId.current, start: now, duration, crit, unicornIndex: i, startX, startY },
      ]);
      setSparks((prev) => [...prev, { id: ++sparkId.current, start: now, duration }]);

      try {
        if (pixiRef.current) {
          pixiRef.current.spawnBeam({
            x0: startX, y0: startY, x1: tx, y1: ty,
            color: crit ? '#fbbf24' : '#60a5fa',
            width: crit ? 4 : 2,
            duration: 150
          });
        }
      } catch (e) { }
    }
  }, []);

  const handleAttack = useCallback((e: AttackEvent) => {
    const now = Date.now();
    if (now - lastClickTime.current < 40) return;
    lastClickTime.current = now;

    let clientX, clientY;
    if ("touches" in e) {
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
      const derivedStats = deriveStats(prev);
      const isCrit = Math.random() < derivedStats.critChance;
      const damage = derivedStats.clickDamage * (isCrit ? derivedStats.critMult : 1);

      let newUnicornCount = prev.unicornCount;
      if (isCrit && Math.random() < 0.05) {
        newUnicornCount++;
        const notifId = ++unicornNotificationId.current;
        setUnicornSpawnNotifications((curr) => [...curr, { id: notifId, start: now }]);
      }

      let targetGeneratorId: number | undefined;
      if (prev.ship.generators) {
        for (const gen of prev.ship.generators) {
          if (gen.hp <= 0) continue;
          const dx = xPct - gen.x;
          const dy = yPct - gen.y;
          if (Math.sqrt(dx * dx + dy * dy) < 6) {
            targetGeneratorId = gen.id;
            break;
          }
        }
      }



      const { ship: newShip, rewardEarned, newZone, damageDealt, hitShield } = applyDamageToShip(
        prev.ship,
        damage,
        derivedStats.lootMultiplier,
        prev.zone ?? 0,
        targetGeneratorId,
        derivedStats.bossDamageMult,
        true // isClick
      );
      const reward = rewardEarned;

      spawnHornBeams(isCrit, prev.unicornCount);

      if (damagePoolRef.current && pixiRef.current) {
        const val = hitShield && damageDealt === 0 ? "SHIELDED" : damageDealt;
        damagePoolRef.current.spawn(val as any, 800, {
          app: pixiRef.current.app,
          pixiOpts: {
            x: clientX,
            y: clientY,
            style: isCrit
              ? { fill: 0xfbbf24, fontSize: 36, fontWeight: 'bold', stroke: 0x000000, strokeThickness: 4, dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 2 }
              : { fill: 0xffffff, fontSize: 24, fontWeight: 'bold', stroke: 0x000000, strokeThickness: 3 }
          }
        });
      }

      try {
        if (pixiRef.current) {
          pixiRef.current.spawnImpact({
            x: clientX, y: clientY,
            color: isCrit ? 0xfbbf24 : 0x60a5fa,
            radius: isCrit ? 15 : 8,
            count: isCrit ? 8 : 4
          });
        }
      } catch (e) { }

      if (impactPoolRef.current) {
        impactPoolRef.current.spawn(clientX, clientY, isCrit ? 2 : 1, 300, { app: pixiRef.current?.app, pixiOpts: { color: isCrit ? 0xfbbf24 : 0x60a5fa, r: isCrit ? 4 : 2 } });
      }

      if (newShip.id !== prev.ship.id) {
        try {
          if (pixiRef.current && clickZoneRef.current) {
            const clickRect = clickZoneRef.current.getBoundingClientRect();
            const cx = clickRect.left + clickRect.width * 0.5;
            const cy = clickRect.top + clickRect.height * 0.5;
            pixiRef.current.spawnExplosion(cx, cy);
          }
        } catch (e) { }
      }

      let newCombo = prev.comboCount + 1;
      if (now > prev.comboExpiry) newCombo = 1;

      const newStats = { ...prev.stats };
      newStats.totalClicks = (newStats.totalClicks || 0) + 1;
      // Track highest combo reached
      newStats.highestCombo = Math.max(newStats.highestCombo || 0, newCombo);

      // Play a subtle combo chime and spawn a small combo visual when combo increments
      if (newCombo > prev.comboCount) {
        try { new Audio('/sfx/combo_chime.mp3')?.play(); } catch (e) { }
        try {
          if (pixiRef.current) {
            pixiRef.current.spawnImpact({ x: clientX, y: clientY, color: 0x06b6d4, radius: 6, count: 3 });
            try { pixiRef.current.spawnComboBurst(clientX, clientY, { count: 8, colors: [0x06b6d4, 0x60a5fa], maxLife: 360 }); } catch (e) { }
          }
        } catch (e) { }
      }

      const nextState: GameSnapshot = {
        ...prev,
        stardust: prev.stardust + reward,
        totalEarned: prev.totalEarned + reward,
        ship: newShip,
        zone: newZone,
        comboCount: newCombo,
        comboExpiry: Date.now() + COMBO_DURATION_MS,
        stats: newStats,
        unicornCount: newUnicornCount
      };

      const unlocked = checkAchievements(nextState);
      if (unlocked.length > 0) {
        applyAchievementRewards(nextState, unlocked);
        nextState.achievements = [...(nextState.achievements || []), ...unlocked];
        const newNotifs = unlocked.map(id => {
          const def = ACHIEVEMENT_DEFS.find(d => d.id === id);
          return { id, name: def?.name || "Unknown" };
        });
        setAchievementNotifs(curr => [...curr, ...newNotifs]);
        setTimeout(() => {
          setAchievementNotifs(curr => curr.filter(n => !newNotifs.includes(n)));
        }, 4000);
        try { if (pixiRef.current && clickZoneRef.current) {
          const clickRect = clickZoneRef.current.getBoundingClientRect();
          const cx = clickRect.left + clickRect.width * 0.5;
          const cy = clickRect.top + clickRect.height * 0.5;
          pixiRef.current.spawnExplosion(cx, cy);
        } } catch (e) { }
        try { new Audio('/sfx/achievement_unlock.mp3')?.play(); } catch (e) { }
      }

      return nextState;
    });
  }, [spawnHornBeams]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGame((prev) => {
        const now = Date.now();
        const derivedStats = deriveStats(prev);

        let nextUpgrades = prev.upgrades;
        let nextStardust = prev.stardust;

        if (prev.autoBuy) {
          const affordable = UPGRADE_DEFS.filter(def => {
            const currentLevel = prev.upgrades[def.id]?.level ?? 0;
            const cost = costOf(def, currentLevel);
            return nextStardust >= cost;
          });

          if (affordable.length > 0) {
            const pick = affordable[Math.floor(Math.random() * affordable.length)];
            const currentLevel = prev.upgrades[pick.id]?.level ?? 0;
            const cost = costOf(pick, currentLevel);

            nextStardust -= cost;
            nextUpgrades = {
              ...nextUpgrades,
              [pick.id]: { id: pick.id, level: currentLevel + 1 }
            };
          }
        }

        const dt = (now - prev.lastTick) / 1000;
        if (dt < 0.05) return prev;

        const damage = derivedStats.dps * dt;
        const { ship: newShip, rewardEarned, newZone } = applyDamageToShip(
          prev.ship,
          damage,
          derivedStats.lootMultiplier,
          prev.zone ?? 0,
          undefined,
          derivedStats.bossDamageMult,
          false // isClick
        );

        const newStats = { ...prev.stats };
        if (!newStats.totalStardust) newStats.totalStardust = prev.totalEarned;
        newStats.totalStardust += rewardEarned;
        if (newZone > newStats.highestZone) newStats.highestZone = newZone;

        const nextState: GameSnapshot = {
          ...prev,
          upgrades: nextUpgrades,
          stardust: nextStardust + rewardEarned,
          totalEarned: prev.totalEarned + rewardEarned,
          ship: newShip,
          zone: newZone,
          lastTick: now,
          unicornCount: prev.unicornCount,
          stats: newStats
        };

        const unlocked = checkAchievements(nextState);
        if (unlocked.length > 0) {
          applyAchievementRewards(nextState, unlocked);
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

        saveState(nextState);
        return nextState;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setBeams((b) => b.filter((x) => now - x.start < x.duration));
      setSparks((s) => s.filter((x) => now - x.start < x.duration));
      setUnicornSpawnNotifications((u) => u.filter((x) => now - x.start < 2000));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const doPrestige = useCallback(() => {
    setGame(prev => {
      const gems = calculatePrestigeGems(prev.totalEarned);
      if (gems <= 0) return prev;

      const fresh = createFreshGameState();
      fresh.prestigeGems = (prev.prestigeGems || 0) + gems;
      fresh.totalPrestiges = (prev.totalPrestiges || 0) + 1;
      fresh.stats = { ...prev.stats };
      fresh.achievements = [...(prev.achievements || [])];
      fresh.artifacts = { ...prev.artifacts };

      saveState(fresh);
      return fresh;
    });
  }, []);

  return {
    game,
    setGame,
    derived,
    beams,
    achievementNotifs,
    clickZoneRef,
    unicornRefs,
    pixiRef,
    handleAttack,
    doPrestige,
  };
}
