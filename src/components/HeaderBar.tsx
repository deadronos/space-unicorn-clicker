import React from "react";
import type { GameSnapshot } from "../types";
import { fmt } from "../utils";

interface HeaderBarProps {
  derived: GameSnapshot;
}

export function HeaderBar({ derived }: HeaderBarProps) {
  return (
    <header className="p-4 flex justify-between items-center bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div>
        <h1 className="text-2xl font-bold bg-linear-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
          Space Unicorn Clicker
        </h1>
        <div className="text-xs text-slate-400 font-mono mt-1">
          Zone {derived.zone} • Level {derived.ship.level}
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg">
          Stardust: <span className="font-bold">{fmt(derived.stardust)}</span>
        </div>
        <div className="text-sm text-slate-300">
          DPS: {derived.dps.toFixed(1)} • Click: {derived.clickDamage.toFixed(1)} {derived.critChance > 0 ? `• Crit ${Math.round(derived.critChance * 100)}% x${derived.critMult.toFixed(1)}` : ""}
        </div>
        <div className="text-sm text-slate-400">Total Earned: {fmt(derived.totalEarned)}</div>
        <div className="text-xs text-purple-400 mt-1">
          🦄 Unicorns: {derived.unicornCount} {derived.comboCount > 1 ? `• Combo: ${derived.comboCount}x` : ""}
        </div>
      </div>
    </header>
  );
}
