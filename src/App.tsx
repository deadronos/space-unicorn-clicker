import React, { useCallback } from "react";
import PixiStage from "./pixi/PixiStage";
import { useGameController } from "./hooks/useGameController";
import { HeaderBar } from "./components/HeaderBar";
import { UpgradePanel } from "./components/UpgradePanel";
import { GameView } from "./components/GameView";
import { PrestigePanel } from "./components/PrestigePanel";
import { AchievementToasts } from "./components/AchievementToasts";
import type { UpgradeDef } from "./types";
import type { ArtifactDef } from "./prestige";
import { artifactCost, costOf } from "./logic";

export default function App() {
  const {
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
  } = useGameController();

  const handleToggleAutoBuy = useCallback((enabled: boolean) => {
    setGame((g) => ({ ...g, autoBuy: enabled }));
  }, [setGame]);

  const handleUpgradePurchase = useCallback((def: UpgradeDef) => {
    setGame((prev) => {
      const level = prev.upgrades[def.id]?.level ?? 0;
      const price = costOf(def, level);
      if (prev.stardust < price) return prev;
      const nextUps = { ...prev.upgrades, [def.id]: { id: def.id, level: level + 1 } };
      return { ...prev, stardust: prev.stardust - price, upgrades: nextUps };
    });
  }, [setGame]);

  const handleArtifactPurchase = useCallback((def: ArtifactDef) => {
    setGame(prev => {
      const level = prev.artifacts?.[def.id] || 0;
      const price = artifactCost(def, level);
      if (prev.prestigeGems < price) return prev;
      return {
        ...prev,
        prestigeGems: prev.prestigeGems - price,
        artifacts: {
          ...prev.artifacts,
          [def.id]: level + 1
        }
      };
    });
  }, [setGame]);

  return (
    <div className="relative w-full h-screen bg-slate-950 text-slate-100 overflow-hidden select-none font-sans">
      <PixiStage ref={pixiRef} className="absolute inset-0 z-0" zone={derived.zone} companionCount={derived.companionCount} />

      <AchievementToasts notifications={achievementNotifs} />

      <div className="relative z-10 flex flex-col h-full">
        <HeaderBar derived={derived} />
        <div className="flex-1 flex flex-wrap lg:flex-nowrap overflow-y-auto lg:overflow-hidden">
          <UpgradePanel game={game} onToggleAutoBuy={handleToggleAutoBuy} onPurchase={handleUpgradePurchase} />
          <GameView
            game={game}
            derived={derived}
            beams={beams}
            clickZoneRef={clickZoneRef}
            unicornRefs={unicornRefs}
            onAttack={handleAttack}
          />
          <PrestigePanel game={game} derived={derived} onPrestige={doPrestige} onBuyArtifact={handleArtifactPurchase} />
        </div>
      </div>
    </div>
  );
}
