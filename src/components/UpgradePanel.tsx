import React from "react";
import { Rocket, Zap, ChevronRight } from "lucide-react";
import type { GameSnapshot, UpgradeDef } from "../types";
import { UPGRADE_DEFS } from "../config";
import { costOf } from "../logic";
import { ItemCard } from "./ItemCard";
import { Checkbox } from "./ui/checkbox";

interface UpgradePanelProps {
  game: GameSnapshot;
  onToggleAutoBuy: (enabled: boolean) => void;
  onPurchase: (def: UpgradeDef) => void;
}

export function UpgradePanel({ game, onToggleAutoBuy, onPurchase }: UpgradePanelProps) {
  return (
    <div className="flex flex-col h-full bg-background/40">
      <div className="p-4 border-b bg-muted/30 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-purple-400 flex items-center gap-2 tracking-tight uppercase">
            <Rocket className="w-5 h-5 text-primary" />
            Upgrades
          </h2>
          <div className="flex items-center gap-2 bg-secondary/50 px-2 py-1 rounded-md border border-primary/20">
            <Checkbox 
                id="auto-buy" 
                checked={game.autoBuy} 
                onCheckedChange={(checked) => onToggleAutoBuy(checked === true)}
                className="border-primary/50 data-[state=checked]:bg-primary"
            />
            <label htmlFor="auto-buy" className="text-[10px] font-black uppercase tracking-widest cursor-pointer select-none text-primary/80">
              Auto
            </label>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-1">
            Enhance your interstellar capabilities
            <ChevronRight className="w-3 h-3" />
        </p>
      </div>

      <div className="flex-1 p-3 space-y-3">
        {UPGRADE_DEFS.map((def) => {
          const level = game.upgrades[def.id]?.level || 0;
          const cost = costOf(def, level);
          const canAfford = game.stardust >= cost;
          const progress = game.stardust / cost;

          return (
            <ItemCard
              key={def.id}
              id={def.id}
              name={def.name}
              level={level}
              description={def.desc}
              cost={cost}
              canAfford={canAfford}
              progress={progress}
              currencyIcon={<Zap className="w-3 h-3 fill-current" />}
              onClick={() => onPurchase(def)}
            />
          );
        })}
      </div>
    </div>
  );
}
