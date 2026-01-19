import React, { useCallback } from "react";
import PixiStage from "./pixi/PixiStage";
import { useGameController } from "./hooks/useGameController";
import { HeaderBar } from "./components/HeaderBar";
import { UpgradePanel } from "./components/UpgradePanel";
import { GameView } from "./components/GameView";
import { PrestigePanel } from "./components/PrestigePanel";
import { SkillBar } from "./components/SkillBar";
import { AchievementToasts } from "./components/AchievementToasts";
import { AchievementGallery } from "./components/AchievementGallery";
import type { UpgradeDef } from "./types";
import type { ArtifactDef } from "./prestige";
import { artifactCost, costOf } from "./logic";
import { ScrollArea } from "./components/ui/scroll-area";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./components/ui/accordion";
import { TooltipProvider } from "./components/ui/tooltip";
import { ToastProvider, ToastViewport } from "./components/ui/toast";



export default function App() {
  const [showGallery, setShowGallery] = React.useState(false);

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
    handleActivateSkill,
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
    <ToastProvider>
    <TooltipProvider>
    <div className="relative w-full h-screen bg-background text-foreground overflow-hidden select-none font-sans flex flex-col">
      <PixiStage ref={pixiRef} className="absolute inset-0 z-0" zone={derived.zone} companionCount={derived.companionCount} />

      <AchievementToasts notifications={achievementNotifs} />

      {showGallery && <AchievementGallery game={game} onClose={() => setShowGallery(false)} />}

      <HeaderBar game={game} derived={derived} onImport={setGame} onOpenGallery={() => setShowGallery(true)} className="relative z-20" />

      <div className="relative z-10 flex-1 flex overflow-hidden">
        {/* Left Panel: Upgrades */}
        <aside className="w-80 h-full border-r bg-background/80 backdrop-blur-sm hidden lg:flex flex-col">
          <ScrollArea className="flex-1">
            <UpgradePanel game={game} onToggleAutoBuy={handleToggleAutoBuy} onPurchase={handleUpgradePurchase} />
          </ScrollArea>
        </aside>

        {/* Center: Game View */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <div className="flex-1 relative">
            <GameView
              game={game}
              derived={derived}
              beams={beams}
              clickZoneRef={clickZoneRef}
              unicornRefs={unicornRefs}
              onAttack={handleAttack}
            />
          </div>
          <div className="p-4 bg-background/50 backdrop-blur-sm border-t">
            <SkillBar game={game} onActivate={handleActivateSkill} />
          </div>
        </main>

        {/* Right Panel: Prestige */}
        <aside className="w-80 h-full border-l bg-background/80 backdrop-blur-sm hidden lg:flex flex-col">
          <ScrollArea className="flex-1">
            <PrestigePanel game={game} derived={derived} onPrestige={doPrestige} onBuyArtifact={handleArtifactPurchase} />
          </ScrollArea>
        </aside>
      </div>

      {/* Mobile/Collapsed Accordion for Small Screens */}
      <div className="lg:hidden relative z-10 bg-background/90 backdrop-blur-sm border-t">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="upgrades">
            <AccordionTrigger className="px-4">Upgrades</AccordionTrigger>
            <AccordionContent>
              <div className="max-h-[50vh] overflow-y-auto">
                <UpgradePanel game={game} onToggleAutoBuy={handleToggleAutoBuy} onPurchase={handleUpgradePurchase} />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="prestige">
            <AccordionTrigger className="px-4">Prestige</AccordionTrigger>
            <AccordionContent>
              <div className="max-h-[50vh] overflow-y-auto">
                <PrestigePanel game={game} derived={derived} onPrestige={doPrestige} onBuyArtifact={handleArtifactPurchase} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
    </TooltipProvider>
    <ToastViewport />
    </ToastProvider>
  );
}
