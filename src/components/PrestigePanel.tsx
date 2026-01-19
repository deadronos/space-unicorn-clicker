import React from "react";
import { 
  Sparkles, 
  Dna, 
  History, 
  TrendingUp, 
  Zap,
  Lock,
  ArrowRightCircle,
  Gem
} from "lucide-react";
import type { GameSnapshot } from "../types";
import { artifactCost, calculatePrestigeGems, getGemMultiplier } from "../logic";
import { fmt, cn } from "../utils";
import { ARTIFACT_DEFS } from "../prestige";
import type { ArtifactDef } from "../prestige";
import { ItemCard } from "./ItemCard";
import { PRESTIGE_RANK_DAMAGE_BONUS, PRESTIGE_RANK_CRIT_MULT_BONUS, PRESTIGE_RANK_GEM_BONUS } from "../config";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Separator } from "./ui/separator";

interface PrestigePanelProps {
  game: GameSnapshot;
  derived: GameSnapshot;
  onPrestige: () => void;
  onBuyArtifact: (def: ArtifactDef) => void;
}

export function PrestigePanel({ game, derived, onPrestige, onBuyArtifact }: PrestigePanelProps) {
  const potentialGems = calculatePrestigeGems(derived.totalEarned, game.totalPrestiges);
  const gemBonusPercent = Math.round((getGemMultiplier(derived.prestigeGems, derived.artifacts?.["gem_polish"] || 0) - 1) * 100);

  return (
    <div className="flex flex-col h-full bg-background/40">
      <div className="p-4 border-b bg-muted/30 sticky top-0 z-10 backdrop-blur-md">
        <h2 className="font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-purple-400 flex items-center gap-2 tracking-tight uppercase">
          <History className="w-5 h-5 text-primary" />
          Prestige
        </h2>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-1">
            Ascend beyond the stars
            <ArrowRightCircle className="w-3 h-3" />
        </p>
      </div>

      <div className="flex-1 p-4 overflow-hidden flex flex-col gap-4">
        {/* Prestige Currency / Stats Overview */}
        <div className="bg-secondary/30 rounded-2xl border p-4 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <Gem className="w-8 h-8 text-primary/40 absolute -top-1 -right-1 rotate-12" />
            
            <div className="text-4xl font-black tracking-tighter text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                {fmt(derived.prestigeGems)}
            </div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1">Prestige Gems</div>
            
            <Separator className="my-3 opacity-50" />
            
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-teal-400">
                <TrendingUp className="w-4 h-4" />
                <span>Global Bonus: +{gemBonusPercent}%</span>
            </div>
        </div>

        <Tabs defaultValue="artifacts" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-secondary/50 p-1">
            <TabsTrigger value="artifacts" className="font-bold uppercase text-[10px] tracking-widest gap-2">
                <Sparkles className="w-3 h-3" /> Artifacts
            </TabsTrigger>
            <TabsTrigger value="ascension" className="font-bold uppercase text-[10px] tracking-widest gap-2">
                <Dna className="w-3 h-3" /> Ascension
            </TabsTrigger>
          </TabsList>

          <TabsContent value="artifacts" className="flex-1 overflow-y-auto pr-1 -mr-1 custom-scrollbar space-y-3">
             {ARTIFACT_DEFS.map(def => {
                const level = game.artifacts?.[def.id] || 0;
                const cost = artifactCost(def, level);
                const canAfford = game.prestigeGems >= cost;
                const progress = game.prestigeGems / cost;

                return (
                    <ItemCard
                    key={def.id}
                    id={def.id}
                    name={def.name}
                    level={level}
                    description={def.description}
                    cost={cost}
                    canAfford={canAfford}
                    progress={progress}
                    currencyIcon={<Gem className="w-3 h-3 fill-current" />}
                    onClick={() => onBuyArtifact(def)}
                    compact={true}
                    />
                );
            })}
          </TabsContent>

          <TabsContent value="ascension" className="flex-1 flex flex-col gap-4">
            <div className="bg-background/60 p-4 rounded-xl border border-destructive/20 space-y-4">
                <div className="text-center space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Next Cycle Harvest</div>
                    <div className="text-2xl font-black text-primary">+{potentialGems} GEMS</div>
                </div>

                <Button 
                    variant="destructive" 
                    className="w-full font-black uppercase tracking-widest h-12 shadow-lg shadow-destructive/20 group relative overflow-hidden" 
                    disabled={potentialGems <= 0}
                    onClick={onPrestige}
                >
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                    Ascend Now
                </Button>

                <p className="text-[9px] text-center text-muted-foreground leading-relaxed px-4">
                    Resets your stardust and upgrades to harness potential gems and permanent power.
                </p>
            </div>

            {game.totalPrestiges > 0 && (
                <div className="p-3 bg-secondary/20 rounded-xl border border-primary/10">
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60 mb-3 ml-1">Rank {game.totalPrestiges} Legacy</div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1 p-2 bg-background/40 rounded-lg border">
                            <div className="text-[8px] font-bold text-muted-foreground uppercase opacity-70">Damage</div>
                            <div className="text-xs font-black text-orange-400">+{Math.round(game.totalPrestiges * PRESTIGE_RANK_DAMAGE_BONUS * 100)}%</div>
                        </div>
                        <div className="space-y-1 p-2 bg-background/40 rounded-lg border">
                            <div className="text-[8px] font-bold text-muted-foreground uppercase opacity-70">Critical</div>
                            <div className="text-xs font-black text-blue-400">+{fmt(game.totalPrestiges * PRESTIGE_RANK_CRIT_MULT_BONUS)}x</div>
                        </div>
                        <div className="space-y-1 p-2 bg-background/40 rounded-lg border col-span-2">
                            <div className="text-[8px] font-bold text-muted-foreground uppercase opacity-70">Gem Yield</div>
                            <div className="text-xs font-black text-purple-400">+{fmt(game.totalPrestiges * PRESTIGE_RANK_GEM_BONUS * 100)}%</div>
                        </div>
                    </div>
                </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
