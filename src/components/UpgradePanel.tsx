import React from "react";
import type { GameSnapshot, UpgradeDef } from "../types";
import { UPGRADE_DEFS } from "../config";
import { costOf } from "../logic";
import { ItemCard } from "./ItemCard";

interface UpgradePanelProps {
  game: GameSnapshot;
  onToggleAutoBuy: (enabled: boolean) => void;
  onPurchase: (def: UpgradeDef) => void;
}

export function UpgradePanel({ game, onToggleAutoBuy, onPurchase }: UpgradePanelProps) {
  return (
    <div className="order-2 lg:order-1 w-full md:w-1/2 lg:w-80 bg-slate-900/90 backdrop-blur-sm border-r border-slate-800 flex flex-col shadow-xl h-96 lg:h-auto">
      <div className="p-4 border-b border-slate-800 bg-slate-800/50">
        <h2 className="font-bold text-slate-200 flex items-center gap-2">
          <span>🚀</span> Upgrades
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <label className="text-xs flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={game.autoBuy}
              onChange={e => onToggleAutoBuy(e.target.checked)}
              className="rounded bg-slate-700 border-slate-600 text-purple-500 focus:ring-purple-500"
            />
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
            <ItemCard
              key={def.id}
              id={def.id}
              name={def.name}
              level={level}
              description={def.desc}
              cost={cost}
              canAfford={canAfford}
              currencyIcon="💎"
              onClick={() => onPurchase(def)}
            />
          );
        })}
      </div>
    </div>
  );
}
